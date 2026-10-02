/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Share2,
  Check,
  AlertTriangle,
  Radio,
  FileCode2,
  RefreshCw,
  Send,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { AnalisisRiesgo, RegistroLluvia, NivelRiesgo } from '../types.ts';
import { UMBRAL_ALERTA_MM } from '../utils/storage.ts';

interface AnalisisGeminiCardProps {
  acumulado72h: number;
  registros: RegistroLluvia[];
}

// Ejemplo de JSON falso para pruebas de desarrollo (Requisito 5 de M5)
const EJEMPLO_MOCK_M5: AnalisisRiesgo = {
  nivel_riesgo: 'alto',
  explicacion:
    'El acumulado en 72 horas alcanzó 85.0 mm superando el umbral crítico de 80 mm. Los suelos de las laderas circundantes a la quebrada están totalmente saturados de humedad. Cualquier lluvia adicional escurrirá directamente al cauce con alto peligro de crecida súbita.',
  mensaje_aviso:
    '🚨 AVISO VECINAL QUEBRADA: Superamos el umbral crítico con 85.0 mm en 72h.\n⚠️ Riesgo alto de desborde si caen más lluvias hoy.\n🎒 Tener lista mochila de emergencia y documentos en bolsas.\n📢 Compartir este aviso con los vecinos del sector bajo.',
  acciones: [
    'Alejar vehículos y pertenencias de la zona inundable cercana al cauce.',
    'Verificar que las alcantarillas vecinales estén despejadas de basura.',
    'Mantener encendido el radio comunitario y vigilar el sonido del agua.',
  ],
  es_plantilla: false,
  mensaje_origen: 'JSON simulado de prueba local (desarrollo sin gastar API)',
};

export const AnalisisGeminiCard: React.FC<AnalisisGeminiCardProps> = ({
  acumulado72h,
  registros,
}) => {
  const [analisis, setAnalisis] = useState<AnalisisRiesgo | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [modoFallaSimulada, setModoFallaSimulada] = useState<boolean>(false);
  const [copiado, setCopiado] = useState<boolean>(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Solicitar análisis a Gemini estructurado (M5)
  const consultarGemini = async (forzarFalla = false) => {
    setCargando(true);
    setErrorLocal(null);
    setCopiado(false);

    try {
      const payload = {
        acumulado72h,
        umbral: UMBRAL_ALERTA_MM,
        ultimosRegistros: registros.slice(0, 7),
        simularFalla: forzarFalla,
      };

      const res = await fetch('/api/analizar-riesgo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      const data: AnalisisRiesgo = await res.json();
      setAnalisis(data);
    } catch (err: any) {
      console.error('Error al solicitar análisis:', err);
      // Fallback local honesto en caso de que ni el servidor responda
      setAnalisis({
        nivel_riesgo: acumulado72h >= UMBRAL_ALERTA_MM ? 'alto' : 'bajo',
        explicacion: 'No se pudo contactar al servidor para el análisis automático de riesgo.',
        mensaje_aviso: `AVISO VECINAL: Acumulado 72h: ${acumulado72h.toFixed(1)} mm. Mantenerse informados en el grupo.`,
        acciones: ['Revisar el pluviómetro manualmente', 'Monitorear la quebrada'],
        es_plantilla: true,
        mensaje_origen: 'No pude consultar a la IA; este aviso es una plantilla.',
      });
    } finally {
      setCargando(false);
    }
  };

  const handleCopiarMensaje = async () => {
    if (!analisis?.mensaje_aviso) return;
    try {
      await navigator.clipboard.writeText(analisis.mensaje_aviso);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch (e) {
      // Fallback si clipboard API falla
      const textarea = document.createElement('textarea');
      textarea.value = analisis.mensaje_aviso;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  const handleCompartirWhatsApp = () => {
    if (!analisis?.mensaje_aviso) return;
    const textoCodificado = encodeURIComponent(analisis.mensaje_aviso);
    const urlWhatsApp = `https://api.whatsapp.com/send?text=${textoCodificado}`;

    if (navigator.share) {
      navigator
        .share({
          title: 'Alerta Comunitaria - Quebrada',
          text: analisis.mensaje_aviso,
        })
        .catch(() => {
          window.open(urlWhatsApp, '_blank');
        });
    } else {
      window.open(urlWhatsApp, '_blank');
    }
  };

  // Color del badge según nivel_riesgo
  const getBadgeClass = (nivel?: NivelRiesgo) => {
    switch (nivel) {
      case 'alto':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'medio':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'bajo':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
  };

  return (
    <section
      aria-label="Análisis de riesgo y aviso con Inteligencia Artificial"
      className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-lg space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
            Análisis con IA (Peldaño M5)
          </h2>
        </div>

        {/* CONTROLES DE PRUEBA M5 */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAnalisis(EJEMPLO_MOCK_M5)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-600 transition-colors"
            title="Cargar ejemplo JSON de prueba para no gastar llamadas a la API"
          >
            <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Ver JSON de prueba</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const nuevoEstado = !modoFallaSimulada;
              setModoFallaSimulada(nuevoEstado);
              if (nuevoEstado) {
                consultarGemini(true);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
              modoFallaSimulada
                ? 'bg-amber-950 text-amber-300 border-amber-600'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Simula modo avión / caída de red para probar la honestidad de la plantilla local"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{modoFallaSimulada ? 'Falla activa (Plantilla)' : 'Simular Modo Avión'}</span>
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-300">
        Gemini evalúa el acumulado de <strong className="text-slate-100">{acumulado72h.toFixed(1)} mm</strong>{' '}
        y redacta una alerta clara para el grupo de WhatsApp del barrio con un esquema JSON estricto.
      </p>

      {/* BOTÓN DE CONSULTA A GEMINI */}
      <button
        type="button"
        disabled={cargando}
        onClick={() => consultarGemini(modoFallaSimulada)}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 disabled:opacity-50 text-white font-extrabold text-base py-3.5 px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        {cargando ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Consultando a Gemini (timeout máx 15 s)...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Redactar aviso vecinal con IA</span>
          </>
        )}
      </button>

      {/* RESULTADO ESTRUCTURADO (M5: nivel_riesgo como etiqueta, explicacion en tarjeta, acciones como lista, mensaje_aviso con Copiar/Compartir) */}
      {analisis && (
        <div className="space-y-4 pt-2">
          {/* AVISO DE ORIGEN (HONESTIDAD REQUERIDA POR M5 SI ES PLANTILLA) */}
          {analisis.es_plantilla && (
            <div className="p-3 bg-amber-950/60 border border-amber-600/70 rounded-xl text-amber-200 text-xs font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{analisis.mensaje_origen || 'No pude consultar a la IA; este aviso es una plantilla.'}</span>
            </div>
          )}

          {/* CABECERA: NIVEL DE RIESGO COMO ETIQUETA DE COLOR */}
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold text-slate-400">
              Nivel de riesgo evaluado:
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getBadgeClass(
                analisis.nivel_riesgo
              )}`}
            >
              Riesgo {analisis.nivel_riesgo}
            </span>
          </div>

          {/* EXPLICACIÓN EN TARJETA (MÁXIMO 3 FRASES) */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Explicación técnica en lenguaje claro:
            </h4>
            <p className="text-base text-slate-200 font-medium leading-relaxed">
              {analisis.explicacion}
            </p>
          </div>

          {/* ACCIONES PREVENTIVAS COMO LISTA (3 ACCIONES) */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Acciones comunitarias inmediatas:
            </h4>
            <ul className="space-y-2">
              {analisis.acciones.map((accion, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-slate-200 font-medium"
                >
                  <span className="bg-cyan-900 text-cyan-300 text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{accion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* MENSAJE DE AVISO PARA WHATSAPP CON BOTONES «COPIAR» Y «COMPARTIR» */}
          <div className="bg-emerald-950/40 border-2 border-emerald-600/70 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-4 h-4" />
                Mensaje para el grupo de WhatsApp:
              </h4>
              <span className="text-[11px] font-mono text-emerald-300">
                Máximo 6 líneas
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-emerald-700/50 font-sans text-sm text-slate-100 whitespace-pre-line leading-relaxed selection:bg-emerald-600">
              {analisis.mensaje_aviso}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopiarMensaje}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-100 text-xs sm:text-sm font-bold rounded-lg border border-slate-600 transition-colors cursor-pointer"
              >
                {copiado ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar texto</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCompartirWhatsApp}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-lg shadow transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Enviar a WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
