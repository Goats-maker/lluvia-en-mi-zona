/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Smartphone, Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface PWAInstallBannerProps {
  onAbrirModalAndroid: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  onAbrirModalAndroid,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (isInstalled) {
    return (
      <div className="bg-emerald-950/60 border border-emerald-600/60 px-3.5 py-1.5 rounded-xl flex items-center justify-between text-xs text-emerald-200">
        <span className="flex items-center gap-1.5 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          App instalada en tu dispositivo (Modo Offline activo)
        </span>
        <button
          type="button"
          onClick={onAbrirModalAndroid}
          className="text-emerald-300 underline font-semibold hover:text-emerald-100 cursor-pointer"
        >
          Ver opciones
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Aviso de instalación móvil"
      className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border-2 border-emerald-500/70 p-3.5 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-white">
            ¿Querés tener la App en tu celular Android?
          </h4>
          <p className="text-xs text-slate-300">
            Instalala en tu pantalla de inicio con 1 toque o descargá el código ZIP.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isInstallable && (
          <button
            type="button"
            onClick={install}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Instalar Ahora</span>
          </button>
        )}

        <button
          type="button"
          onClick={onAbrirModalAndroid}
          className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-cyan-300 text-xs font-bold rounded-xl border border-slate-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Descargar e Info</span>
        </button>
      </div>
    </aside>
  );
};
