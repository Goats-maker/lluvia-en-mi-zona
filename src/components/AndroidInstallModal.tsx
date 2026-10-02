/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Github,
  X,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Code2,
  FolderArchive,
  Layers,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface AndroidInstallModalProps {
  abierto: boolean;
  onCerrar: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  abierto,
  onCerrar,
}) => {
  const { isInstallable, install } = usePWAInstall();
  const [copiadoComando, setCopiadoComando] = useState(false);
  const [tab, setTab] = useState<'android' | 'github' | 'zip'>('android');
  const [descargando, setDescargando] = useState(false);
  const [descargaExitosa, setDescargaExitosa] = useState(false);
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null);

  if (!abierto) return null;

  // Descargador binario robusto que evita que el navegador o el Service Worker guarden HTML de error
  const handleDescargarArchivo = async (formato: 'zip' | 'tar') => {
    setDescargando(true);
    setDescargaExitosa(false);
    setErrorDescarga(null);

    try {
      const endpoint = formato === 'zip' ? '/api/descargar-proyecto' : '/api/descargar-tar';
      const nombreArchivo = formato === 'zip' ? 'lluvia-en-mi-zona.zip' : 'lluvia-en-mi-zona.tar.gz';
      const tipoMime = formato === 'zip' ? 'application/zip' : 'application/gzip';

      const respuesta = await fetch(endpoint, { cache: 'no-store' });
      if (!respuesta.ok) {
        throw new Error(`Servidor devolvió código HTTP ${respuesta.status}`);
      }

      const blob = await respuesta.blob();

      // Validación crítica de tamaño y cabecera mágica (evita guardar index.html por error)
      if (blob.size < 5000 || blob.type.includes('text/html')) {
        throw new Error('La respuesta recibida no es un archivo comprimido válido.');
      }

      const url = window.URL.createObjectURL(new Blob([blob], { type: tipoMime }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDescargaExitosa(true);
      setTimeout(() => setDescargaExitosa(false), 3500);
    } catch (err: any) {
      console.error('Error en descarga:', err);
      setErrorDescarga('Hubo un problema con la descarga directa. Intentando enlace alternativo...');
      // Fallback a enlace directo nativo del navegador
      const enlaceAlternativo = formato === 'zip' ? '/api/descargar-proyecto' : '/api/descargar-tar';
      window.location.href = enlaceAlternativo;
    } finally {
      setDescargando(false);
    }
  };

  const comandoGit = `# 1. Crear nuevo repositorio en github.com y luego ejecutar en tu terminal:
git remote add origin https://github.com/TU_USUARIO/lluvia-en-mi-zona.git
git branch -M main
git push -u origin main`;

  const handleCopiarGit = () => {
    navigator.clipboard.writeText(comandoGit);
    setCopiadoComando(true);
    setTimeout(() => setCopiadoComando(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-2xl max-h-[92vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* CABECERA */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-100 uppercase tracking-wide">
                Instalar en Android & Repositorio GitHub
              </h3>
              <p className="text-xs text-slate-400">
                Opciones para llevar la app a tu celular y subirla a GitHub
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SELECTOR DE PESTAÑAS */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setTab('android')}
            className={`flex-1 py-2 px-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'android'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Instalar en Celular</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('zip')}
            className={`flex-1 py-2 px-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'zip'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Descargar ZIP</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('github')}
            className={`flex-1 py-2 px-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'github'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>Subir a GitHub</span>
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-300 leading-relaxed font-sans">
          {tab === 'android' && (
            <div className="space-y-4">
              {/* OPCIÓN 1: INSTALACIÓN INMEDIATA PWA/WEBAPK */}
              <div className="bg-emerald-950/40 border-2 border-emerald-600/70 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <h4>Opción 1: Instalar directamente en tu celular Android (Recomendada)</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-200">
                  La aplicación está configurada con <strong>Service Worker y Web App Manifest (PWA)</strong>. Al instalarse, el sistema Android genera un <strong>WebAPK</strong> que funciona como una aplicación nativa completa con ícono en tu pantalla de inicio, modo pantalla completa y guardado sin conexión.
                </p>

                {isInstallable ? (
                  <button
                    type="button"
                    onClick={() => {
                      install();
                      onCerrar();
                    }}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm sm:text-base rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Download className="w-5 h-5" />
                    <span>¡Instalar Ahora en este Dispositivo!</span>
                  </button>
                ) : (
                  <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-700 text-xs text-slate-300 space-y-2">
                    <p className="font-bold text-slate-100">
                      Cómo abrirla e instalarla en tu celular:
                    </p>
                    <ol className="list-decimal pl-5 space-y-1.5">
                      <li>
                        <strong>Activar el enlace público:</strong> En la barra superior derecha de Google AI Studio, hacé clic en el botón <strong>«Share» (Compartir)</strong>. Esto publica la app para que cualquier celular pueda entrar sin error 404 ni bloqueo de cuenta.
                      </li>
                      <li>
                        Abrí el enlace compartido en <strong>Google Chrome</strong> en tu celular Android.
                      </li>
                      <li>
                        Tocá los <strong>tres puntos (⋮)</strong> en Chrome y seleccioná <strong>«Instalar aplicación»</strong> o <strong>«Agregar a la pantalla principal»</strong>.
                      </li>
                    </ol>
                  </div>
                )}

                <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-semibold">¿Querés el código fuente completo ahora?</span>
                  <button
                    type="button"
                    onClick={() => handleDescargarArchivo('zip')}
                    disabled={descargando}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {descargando ? (
                      <span className="animate-spin text-cyan-200">⌛</span>
                    ) : descargaExitosa ? (
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{descargaExitosa ? '¡Descargado!' : 'Bajar ZIP (~1.3 MB)'}</span>
                  </button>
                </div>
              </div>

              {/* OPCIÓN 2: PROYECTO ANDROID NATIVO KOTLIN (ANDROID STUDIO) */}
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-base">
                  <Code2 className="w-5 h-5" />
                  <h4>Opción 2: Compilar el APK nativo con Android Studio</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Si estás en el curso de Android y necesitas el archivo <strong>.apk</strong> o el proyecto en <strong>Jetpack Compose y Room</strong>, ya dejamos el proyecto nativo completo creado dentro de la carpeta <code className="text-amber-300">android/</code>.
                </p>
                <div className="bg-slate-950 p-3 rounded-lg text-xs font-mono space-y-1 text-slate-300 border border-slate-800">
                  <p className="text-cyan-400 font-bold font-sans">Estructura incluida en el ZIP:</p>
                  <p>• android/app/src/main/java/com/vecinos/lluvia/MainActivity.kt</p>
                  <p>• android/app/src/main/java/com/vecinos/lluvia/data/LluviaDatabase.kt</p>
                  <p>• android/app/src/main/java/com/vecinos/lluvia/data/LluviaDao.kt</p>
                  <p>• android/app/build.gradle.kts (con Room y BuildConfig)</p>
                  <p>• android/README_ANDROID.md (instrucciones paso a paso)</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'zip' && (
            <div className="space-y-4">
              <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-base">
                  <FolderArchive className="w-5 h-5" />
                  <h4>Descargar Paquete Completo (.ZIP)</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Descarga todo el código fuente listo para usar, empaquetado con compresión estándar universal (compatible con Windows Explorer, Mac, Linux y Android):
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-300">
                  <li>La aplicación web PWA instalable en Android.</li>
                  <li>El proyecto nativo de Android en Kotlin y Jetpack Compose (`android/`).</li>
                  <li>El servidor backend con la integración de Gemini API y fallback honesto.</li>
                  <li>El archivo `PROMPTS.md` con los peldaños P0 a M5 completos.</li>
                  <li>El repositorio Git inicializado con los commits correspondientes.</li>
                </ul>

                {errorDescarga && (
                  <div className="p-2.5 bg-red-950/70 border border-red-500 rounded-lg text-xs text-red-200">
                    {errorDescarga}
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDescargarArchivo('zip')}
                    disabled={descargando}
                    className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {descargando ? (
                      <>
                        <span className="animate-spin text-lg">⌛</span>
                        <span>Descargando archivo binario...</span>
                      </>
                    ) : descargaExitosa ? (
                      <>
                        <Check className="w-5 h-5 text-emerald-300" />
                        <span>¡Descarga completa! lluvia-en-mi-zona.zip</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Descargar lluvia-en-mi-zona.zip (~1.3 MB)</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
                    <span>¿Tu descompresor no abre zip?</span>
                    <button
                      type="button"
                      onClick={() => handleDescargarArchivo('tar')}
                      className="text-cyan-400 underline font-bold hover:text-cyan-300 cursor-pointer"
                    >
                      Descargar en formato .tar.gz alternativo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'github' && (
            <div className="space-y-4">
              <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-base">
                  <Github className="w-5 h-5" />
                  <h4>Subir este repositorio a tu cuenta de GitHub</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  El repositorio Git local ya está completamente inicializado y cuenta con el commit inicial requerido:
                  <code className="block bg-slate-950 p-2 rounded my-1 text-xs text-amber-300 font-mono">
                    commit: &quot;P0: primera version generada con IA&quot;
                  </code>
                </p>

                <p className="text-xs font-bold text-slate-200">
                  Para vincularlo a tu cuenta de GitHub personal:
                </p>

                <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-300">
                  <li>Entra a <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">github.com/new <ExternalLink className="w-3 h-3" /></a> y crea un repositorio llamado <strong className="text-slate-100">lluvia-en-mi-zona</strong>.</li>
                  <li>Descarga el ZIP del proyecto o abre tu terminal en la carpeta del proyecto.</li>
                  <li>Ejecuta los siguientes comandos:</li>
                </ol>

                <div className="relative">
                  <pre className="bg-slate-950 p-3 rounded-lg text-xs font-mono text-cyan-200 overflow-x-auto border border-slate-800">
                    {comandoGit}
                  </pre>
                  <button
                    type="button"
                    onClick={handleCopiarGit}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded flex items-center gap-1 border border-slate-700 cursor-pointer"
                  >
                    {copiadoComando ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
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
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
