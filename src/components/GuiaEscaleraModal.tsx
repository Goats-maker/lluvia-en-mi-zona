/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Code2,
  Database,
  KeyRound,
  GitBranch,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface GuiaEscaleraModalProps {
  abierto: boolean;
  onCerrar: () => void;
}

export const GuiaEscaleraModal: React.FC<GuiaEscaleraModalProps> = ({
  abierto,
  onCerrar,
}) => {
  const [tab, setTab] = useState<'preguntas' | 'android' | 'escalera'>('preguntas');

  if (!abierto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-2xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* CABECERA */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-extrabold text-slate-100 uppercase tracking-wide">
              Respuestas Técnicas y Guía de la Escalera
            </h3>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVEGACIÓN DE PESTAÑAS */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 gap-1">
          <button
            type="button"
            onClick={() => setTab('preguntas')}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors ${
              tab === 'preguntas'
                ? 'bg-cyan-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Preguntas M2 (Room & JSON)
          </button>
          <button
            type="button"
            onClick={() => setTab('android')}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors ${
              tab === 'android'
                ? 'bg-cyan-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Android & API Key (M5)
          </button>
          <button
            type="button"
            onClick={() => setTab('escalera')}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors ${
              tab === 'escalera'
                ? 'bg-cyan-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Peldaños P0 a M5
          </button>
        </div>

        {/* CONTENIDO SCROLLEABLE */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-300 leading-relaxed font-sans">
          {tab === 'preguntas' && (
            <div className="space-y-4">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <h4 className="text-base font-bold text-cyan-300 mb-1 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  1. ¿Dónde queda guardada la información exactamente?
                </h4>
                <p>
                  <strong>En Android (Room/SQLite):</strong> En el almacenamiento privado interno del celular, en la ruta sandboxed:
                  <code className="block bg-slate-950 p-2 rounded my-1 text-xs text-amber-300 font-mono">
                    /data/data/&lt;paquete.de.la.app&gt;/databases/lluvia_db
                  </code>
                  Ninguna otra aplicación del teléfono puede leer este archivo sin permisos de root.
                </p>
                <p className="mt-2">
                  <strong>En esta versión Web (Vite/PWA):</strong> En el <code>localStorage</code> del navegador, asociado exclusivamente al origen de la aplicación, persistiendo aún si se recarga la pestaña o se cierra el navegador.
                </p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <h4 className="text-base font-bold text-cyan-300 mb-1 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  2. ¿Qué pasa si el usuario borra los datos de la app o cambia de teléfono?
                </h4>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Al borrar datos:</strong> El sistema operativo elimina completamente la carpeta de la base de datos interna. Todos los registros históricos se pierden.
                  </li>
                  <li>
                    <strong>Al cambiar de teléfono:</strong> Como la app opera <em>offline-first</em> sin login ni servidor central, los datos residen únicamente en el hardware físico anterior.
                  </li>
                  <li>
                    <strong>Solución comunitaria:</strong> Por eso implementamos el botón <strong>«Exportar JSON»</strong> (Peldaño M2), que permite enviar el respaldo por WhatsApp o guardarlo en Google Drive y restaurarlo con <strong>«Importar»</strong>.
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <h4 className="text-base font-bold text-cyan-300 mb-1 flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  3. ¿Cómo hago para exportar el histórico a un archivo JSON?
                </h4>
                <p>
                  La app genera un objeto con metadatos y la lista ordenada de registros:
                </p>
                <pre className="bg-slate-950 p-2.5 rounded text-xs text-cyan-200 font-mono overflow-x-auto">
{`{
  "app": "LLUVIA EN MI ZONA",
  "umbralAlertaMm": 80.0,
  "registros": [
    { "fecha": "2026-10-02", "mm": 30.0 },
    { "fecha": "2026-10-01", "mm": 30.0 },
    { "fecha": "2026-09-30", "mm": 25.0 }
  ]
}`}
                </pre>
              </div>
            </div>
          )}

          {tab === 'android' && (
            <div className="space-y-4">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <h4 className="text-base font-bold text-amber-300 mb-1 flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Configurar API Key en Android (local.properties y BuildConfig)
                </h4>
                <p className="mb-2">
                  Para que la API key nunca se suba a GitHub ni quede quemada en el código fuente:
                </p>

                <p className="font-bold text-slate-200 mt-2">Paso 1: Guardar en local.properties (local en tu máquina)</p>
                <code className="block bg-slate-950 p-2 rounded text-xs text-amber-300 font-mono my-1">
                  GEMINI_API_KEY=tu_clave_secreta_aqui
                </code>

                <p className="font-bold text-slate-200 mt-2">Paso 2: Exponer con BuildConfig en build.gradle.kts (módulo :app)</p>
                <pre className="bg-slate-950 p-2.5 rounded text-xs text-cyan-300 font-mono overflow-x-auto">
{`android {
    buildFeatures {
        buildConfig = true
    }
    defaultConfig {
        val properties = java.util.Properties()
        val localPropertiesFile = project.rootProject.file("local.properties")
        if (localPropertiesFile.exists()) {
            properties.load(localPropertiesFile.inputStream())
        }
        val apiKey = properties.getProperty("GEMINI_API_KEY") ?: ""
        buildConfigField("String", "GEMINI_API_KEY", "\"$apiKey\"")
    }
}`}
                </pre>

                <p className="font-bold text-slate-200 mt-2">Paso 3: Proteger en el .gitignore</p>
                <pre className="bg-slate-950 p-2.5 rounded text-xs text-red-300 font-mono overflow-x-auto">
{`# Archivos con secretos locales (NUNCA commitear)
local.properties
.env
*.keystore`}
                </pre>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <h4 className="text-base font-bold text-cyan-300 mb-1 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Esquema Room en Kotlin con reemplazo automático
                </h4>
                <pre className="bg-slate-950 p-2.5 rounded text-xs text-emerald-300 font-mono overflow-x-auto">
{`@Entity(tableName = "lluvia")
data class LluviaEntity(
    @PrimaryKey val fecha: String, // Clave primaria YYYY-MM-DD
    val mm: Double                // Milímetros de lluvia
)

@Dao
interface LluviaDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun guardarLluvia(lluvia: LluviaEntity)

    @Query("SELECT * FROM lluvia ORDER BY fecha DESC")
    fun obtenerTodas(): Flow<List<LluviaEntity>>

    @Query("DELETE FROM lluvia WHERE fecha = :fecha")
    suspend fun borrarPorFecha(fecha: String)
}`}
                </pre>
              </div>
            </div>
          )}

          {tab === 'escalera' && (
            <div className="space-y-3">
              {[
                {
                  peldaño: 'P0: Que exista',
                  commit: 'git commit -m "P0: primera version generada con IA"',
                  detalle: 'Registrar lluvia del día, contador 72h grande y alerta visible (verde < 80mm, rojo >= 80mm). Criterio: 30mm + 30mm + 25mm = 85mm con alerta roja.',
                },
                {
                  peldaño: 'M1: Que sirva',
                  commit: 'git commit -m "M1: alerta al pasar el umbral"',
                  detalle: 'Prueba manual de 3 pasos, cálculo exacto de días calendario (hoy, ayer, anteayer) sin errores de desfase.',
                },
                {
                  peldaño: 'M2: Que recuerde',
                  commit: 'git commit -m "M2: persistencia de datos"',
                  detalle: 'Persistencia local con sobreescritura en fecha duplicada, listado histórico ordenado, exportar e importar archivo JSON.',
                },
                {
                  peldaño: 'M3: Que se entienda',
                  commit: 'git commit -m "M3: experiencia de uso en celular"',
                  detalle: 'Diseño desde 320dp con una mano, tipografía >= 16sp legible al sol, un solo botón principal, estado vacío acogedor y mensajes claros en español.',
                },
                {
                  peldaño: 'M4: Que no se rompa',
                  commit: 'git commit -m "M4: validaciones y manejo de errores"',
                  detalle: 'Tester mode con las 10 formas de romper la app (vacío, negativo, absurdo >500mm, fechas futuras, doble clic debounced, sanitización de comas).',
                },
                {
                  peldaño: 'M5: Que piense',
                  commit: 'git commit -m "M5: inteligencia con salida estructurada"',
                  detalle: 'Gemini con responseSchema estricto (nivel_riesgo, explicacion, mensaje_aviso, acciones), botones Copiar/Compartir a WhatsApp y fallback honesto si falla la red.',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-cyan-300 text-sm">{item.peldaño}</span>
                    <span className="text-[11px] bg-slate-950 font-mono text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                      Peldaño {idx}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-1.5">{item.detalle}</p>
                  <code className="text-[11px] font-mono text-amber-300 block bg-slate-950 p-1.5 rounded">
                    {item.commit}
                  </code>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PIE */}
        <div className="p-3 bg-slate-800/90 border-t border-slate-700 flex justify-end">
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
