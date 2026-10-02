import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Inicialización de Google Gen AI con headers requeridos
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface RegistroLluvia {
  fecha: string;
  mm: number;
}

interface AnalisisRequest {
  acumulado72h: number;
  umbral: number;
  ultimosRegistros: RegistroLluvia[];
  simularFalla?: boolean;
}

// Plantilla local honesta para cuando no hay conexión, timeout o falla de API
function generarPlantillaLocal(acumulado: number, umbral: number) {
  const superado = acumulado >= umbral;
  const riesgo = superado ? 'alto' : acumulado >= umbral * 0.5 ? 'medio' : 'bajo';

  if (riesgo === 'alto') {
    return {
      nivel_riesgo: 'alto',
      explicacion: `El acumulado de 72 horas (${acumulado.toFixed(1)} mm) superó el umbral crítico de ${umbral} mm. La cuenca de la quebrada se encuentra saturada y el riesgo de crecida súbita es inminente. El suelo no tiene más capacidad de absorción hídrica.`,
      mensaje_aviso: `🚨 ALERTA COMUNITARIA: Acumulado de lluvia en 72h alcanzó ${acumulado.toFixed(1)} mm (superó umbral de ${umbral} mm).\n⚠️ Riesgo inminente de desborde en la quebrada.\n🏃 Poner en resguardo a niños, adultos mayores y documentos.\n📍 Despejar accesos y estar atentos a silbatos de emergencia.`,
      acciones: [
        'Evacuar o alejarse de las márgenes de la quebrada inmediatamente.',
        'Guardar documentos en bolsas plásticas herméticas y elevar pertenencias.',
        'Activar la red de comunicación comunitaria y no cruzar vados ni puentes bajos.'
      ],
      es_plantilla: true,
      mensaje_origen: 'No pude consultar a la IA; este aviso es una plantilla local de seguridad.'
    };
  } else if (riesgo === 'medio') {
    return {
      nivel_riesgo: 'medio',
      explicacion: `El acumulado de 72 horas es de ${acumulado.toFixed(1)} mm, acercándose al umbral de ${umbral} mm. Las precipitaciones continuas mantienen húmeda la cuenca alta. Se requiere vigilancia preventiva de las márgenes.`,
      mensaje_aviso: `⚠️ AVISO PREVENTIVO: Lluvia acumulada en 72h: ${acumulado.toFixed(1)} mm (umbral: ${umbral} mm).\n🌧️ La quebrada mantiene caudal elevado con tendencia a subir si continúa lloviendo.\n👀 Vecinos cercanos al cauce mantener guardia visual.\n📱 Celulares con carga y linternas a mano.`,
      acciones: [
        'Monitorear visualmente el nivel y turbidez del agua en la quebrada.',
        'Revisar que desagües y alcantarillas del barrio no estén tapados con ramas o basura.',
        'Tener preparada la mochila de emergencia con radio, linterna y botiquín.'
      ],
      es_plantilla: true,
      mensaje_origen: 'No pude consultar a la IA; este aviso es una plantilla local de seguridad.'
    };
  } else {
    return {
      nivel_riesgo: 'bajo',
      explicacion: `El acumulado de 72 horas es de ${acumulado.toFixed(1)} mm, manteniéndose por debajo del umbral de ${umbral} mm. Las condiciones actuales no presentan riesgo de desborde inmediato. El caudal de la quebrada es manejable.`,
      mensaje_aviso: `ℹ️ REPORTE VECINAL: Lluvia acumulada 72h: ${acumulado.toFixed(1)} mm (umbral de seguridad: ${umbral} mm).\n✅ Situación normal en la quebrada sin indicios de desborde.\n🌧️ Seguiremos registrando cada día para mantener actualizado el monitoreo.`,
      acciones: [
        'Continuar con el registro diario de lluvia con el pluviómetro.',
        'Mantener limpios los canales de agua pluvial frente a las viviendas.',
        'Revisar pronósticos meteorológicos de las próximas 24 horas.'
      ],
      es_plantilla: true,
      mensaje_origen: 'No pude consultar a la IA; este aviso es una plantilla local de seguridad.'
    };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Endpoint de análisis de riesgo con Gemini API (M5)
  app.post('/api/analizar-riesgo', async (req: Request, res: Response) => {
    const { acumulado72h = 0, umbral = 80, ultimosRegistros = [], simularFalla = false }: AnalisisRequest = req.body;

    // Si se activa simulación de falla (Modo Avión / Prueba de robustez M5)
    if (simularFalla) {
      console.log('Simulando falla de red para M5...');
      const fallback = generarPlantillaLocal(acumulado72h, umbral);
      return res.json(fallback);
    }

    // Si no hay API key configurada, retornar plantilla honesta
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY no encontrada. Devolviendo plantilla local honesta.');
      const fallback = generarPlantillaLocal(acumulado72h, umbral);
      return res.json(fallback);
    }

    try {
      // Timeout estricto de 15 segundos como exige el peldaño M5
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const promptTexto = `Eres un experto hidrólogo y analista de protección civil comunitaria. 
Los vecinos de una zona con riesgo de inundación por crecida súbita de una quebrada llevan un pluviómetro comunitario.

DATOS ACTUALES:
- Acumulado de lluvia en las últimas 72 horas: ${acumulado72h.toFixed(1)} mm
- Umbral crítico de alerta: ${umbral} mm
- Registros recientes disponibles:
${ultimosRegistros.map((r) => `  * ${r.fecha}: ${r.mm} mm`).join('\n') || '  (Sin registros detallados previos)'}

INSTRUCCIONES:
1. Evalúa el nivel de riesgo estrictamente como "bajo", "medio" o "alto" (si el acumulado es >= ${umbral} mm, debe ser "alto").
2. Brinda una explicación concisa de máximo 3 frases en lenguaje sencillo y claro para personas de la comunidad sobre la saturación del suelo y comportamiento de la quebrada.
3. Redacta un mensaje de aviso de máximo 6 líneas listo para reenviar al grupo de WhatsApp del vecindario con emojis útiles, datos clave y tono solidario/preventivo.
4. Entrega exactamente 3 acciones preventivas concretas e inmediatas que deben tomar los vecinos según este nivel.`;

      const responsePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptTexto,
        config: {
          systemInstruction: 'Responde exclusivamente en formato JSON estructurado según el esquema solicitado. Sé directo, empático, claro y prudente en la gestión del riesgo comunitario.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nivel_riesgo: {
                type: Type.STRING,
                description: "Nivel de riesgo: 'bajo', 'medio' o 'alto'",
              },
              explicacion: {
                type: Type.STRING,
                description: 'Máximo 3 frases en lenguaje claro sobre la situación de la quebrada y el suelo.',
              },
              mensaje_aviso: {
                type: Type.STRING,
                description: 'Máximo 6 líneas para el grupo de WhatsApp de los vecinos.',
              },
              acciones: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: 'Lista de 3 acciones concretas e inmediatas.',
              },
            },
            required: ['nivel_riesgo', 'explicacion', 'mensaje_aviso', 'acciones'],
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error('TIMEOUT_15S'));
        });
      });

      const response = await Promise.race([responsePromise, timeoutPromise]);
      clearTimeout(timeoutId);

      const rawText = response.text ? response.text.trim() : '';
      if (!rawText) {
        throw new Error('Respuesta vacía de Gemini');
      }

      const parsed = JSON.parse(rawText);

      // Validar campos mínimos
      if (!parsed.nivel_riesgo || !parsed.explicacion || !parsed.mensaje_aviso || !Array.isArray(parsed.acciones)) {
        throw new Error('JSON no cumple con el esquema requerido');
      }

      return res.json({
        ...parsed,
        es_plantilla: false,
        mensaje_origen: 'Generado con Inteligencia Artificial (Gemini 3.8 Flash)'
      });

    } catch (err: any) {
      console.error('Error al consultar Gemini o timeout:', err?.message || err);
      // Cumplimiento estricto del peldaño M5:
      // "Manejo de fallo: qué se muestra si no hay conexión, si la IA responde lento (timeout de 15 s) o devuelve algo que no cumple el esquema. En esos casos usar un mensaje local según el nivel de alerta y avisar con honestidad: «No pude consultar a la IA; este aviso es una plantilla»."
      const fallback = generarPlantillaLocal(acumulado72h, umbral);
      return res.json(fallback);
    }
  });

  // Endpoint para descargar el proyecto completo empaquetado (ZIP)
  app.get('/api/descargar-proyecto', (_req: Request, res: Response) => {
    const zipPath = path.resolve(__dirname, 'public', 'lluvia-en-mi-zona.zip');
    if (fs.existsSync(zipPath)) {
      const stat = fs.statSync(zipPath);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="lluvia-en-mi-zona.zip"');
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      const stream = fs.createReadStream(zipPath);
      stream.pipe(res);
    } else {
      res.status(404).send('Archivo ZIP no encontrado.');
    }
  });

  // Endpoint alternativo TAR.GZ
  app.get('/api/descargar-tar', (_req: Request, res: Response) => {
    const tarPath = path.resolve(__dirname, 'public', 'lluvia-en-mi-zona.tar.gz');
    if (fs.existsSync(tarPath)) {
      const stat = fs.statSync(tarPath);
      res.setHeader('Content-Type', 'application/gzip');
      res.setHeader('Content-Disposition', 'attachment; filename="lluvia-en-mi-zona.tar.gz"');
      res.setHeader('Content-Length', stat.size);
      const stream = fs.createReadStream(tarPath);
      stream.pipe(res);
    } else {
      res.status(404).send('Archivo TAR no encontrado.');
    }
  });

  // Configuración de Vite o archivos estáticos
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Lluvia en mi Zona escuchando en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error fatal al iniciar servidor:', err);
  process.exit(1);
});
