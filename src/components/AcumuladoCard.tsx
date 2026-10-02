/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, CheckCircle2, CloudRain, Droplets, Info } from 'lucide-react';
import { UMBRAL_ALERTA_MM } from '../utils/storage.ts';

interface AcumuladoCardProps {
  acumuladoTotal: number;
  detallePorDia: { fecha: string; mm: number; etiqueta: string }[];
}

export const AcumuladoCard: React.FC<AcumuladoCardProps> = ({
  acumuladoTotal,
  detallePorDia,
}) => {
  const superaUmbral = acumuladoTotal >= UMBRAL_ALERTA_MM;
  const porcentaje = Math.min(Math.round((acumuladoTotal / UMBRAL_ALERTA_MM) * 100), 100);

  return (
    <section
      aria-label="Acumulado de lluvia en 72 horas y alerta"
      className="rounded-2xl border-2 transition-all duration-300 shadow-xl overflow-hidden bg-slate-900 border-slate-700"
    >
      {/* BANNER DE ALERTA VISIBLE (P0 / M1: Rojo si >= 80mm, Verde si < 80mm) */}
      <div
        className={`px-4 py-3.5 flex items-center justify-between transition-colors ${
          superaUmbral
            ? 'bg-red-600 text-white shadow-inner animate-pulse'
            : 'bg-emerald-600 text-white'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {superaUmbral ? (
            <AlertTriangle className="w-7 h-7 shrink-0 text-amber-200" />
          ) : (
            <CheckCircle2 className="w-7 h-7 shrink-0 text-emerald-100" />
          )}
          <div>
            <span className="text-xs uppercase tracking-wider font-extrabold block">
              {superaUmbral ? 'PELIGRO DE DESBORDE' : 'NIVEL DE LLUVIA NORMAL'}
            </span>
            <p className="text-sm font-bold leading-tight">
              {superaUmbral
                ? `¡ALERTA ROJA! Acumulado superó los ${UMBRAL_ALERTA_MM} mm`
                : `BAJO CONTROL: Acumulado menor al umbral de ${UMBRAL_ALERTA_MM} mm`}
            </p>
          </div>
        </div>

        <span className="text-xs bg-black/30 font-black px-2.5 py-1 rounded-full uppercase border border-white/20 shrink-0">
          Umbral: {UMBRAL_ALERTA_MM} mm
        </span>
      </div>

      {/* CONTADOR GRANDE (P0 / M3: Texto grande, legible al sol) */}
      <div className="p-5 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-300 mb-1">
          <CloudRain className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold uppercase tracking-wide">
            Acumulado últimas 72 horas
          </h2>
        </div>

        {/* NÚMERO GIGANTE */}
        <div className="my-2 flex items-baseline justify-center gap-2">
          <span
            className={`font-black tracking-tight transition-colors text-6xl sm:text-7xl ${
              superaUmbral ? 'text-red-400 drop-shadow-[0_2px_12px_rgba(239,68,68,0.4)]' : 'text-emerald-400 drop-shadow-[0_2px_12px_rgba(34,197,94,0.3)]'
            }`}
          >
            {acumuladoTotal.toFixed(1)}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-300">
            mm
          </span>
        </div>

        {/* BARRA DE PROGRESO HACIA EL UMBRAL */}
        <div className="w-full bg-slate-800 rounded-full h-3.5 my-3 overflow-hidden border border-slate-700">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              superaUmbral ? 'bg-red-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${superaUmbral ? 100 : porcentaje}%` }}
          />
        </div>

        <p className="text-sm text-slate-300 font-medium">
          {superaUmbral ? (
            <span className="text-red-300 font-bold">
              Excedido por {(acumuladoTotal - UMBRAL_ALERTA_MM).toFixed(1)} mm. Riesgo alto de crecida en la quebrada.
            </span>
          ) : (
            <span className="text-slate-300">
              Faltan {(UMBRAL_ALERTA_MM - acumuladoTotal).toFixed(1)} mm para alcanzar el nivel de alerta ({porcentaje}% alcanzado).
            </span>
          )}
        </p>

        {/* DESGLOSE DE LOS 3 DÍAS (Hoy, Ayer, Anteayer) */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2">
          {detallePorDia.map((dia) => (
            <div
              key={dia.fecha}
              className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex flex-col items-center text-center"
            >
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {dia.etiqueta}
              </span>
              <span className="text-lg font-black text-slate-100 my-0.5">
                {dia.mm.toFixed(1)} <span className="text-xs font-normal text-slate-400">mm</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {dia.fecha.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
