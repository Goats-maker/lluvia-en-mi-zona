/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Droplet, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { obtenerFechaHoyISO, esFechaFutura } from '../utils/dateUtils.ts';
import { RegistroLluvia } from '../types.ts';

interface FormularioRegistroProps {
  onGuardar: (fecha: string, mm: number) => void;
  registrosExistentes: RegistroLluvia[];
  mensajeExito: string | null;
  setMensajeExito: (msg: string | null) => void;
}

export const FormularioRegistro: React.FC<FormularioRegistroProps> = ({
  onGuardar,
  registrosExistentes,
  mensajeExito,
  setMensajeExito,
}) => {
  const hoyISO = obtenerFechaHoyISO();
  const [fecha, setFecha] = useState<string>(hoyISO);
  const [mmInput, setMmInput] = useState<string>('');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  // Registro existente para la fecha seleccionada (aviso de sobreescritura M2/M4)
  const registroActualEnFecha = registrosExistentes.find((r) => r.fecha === fecha);

  // Sincronizar input cuando cambia la fecha si ya hay un valor guardado
  useEffect(() => {
    if (registroActualEnFecha && mmInput === '') {
      // Dejar campo limpio o dar la opción al usuario
    }
  }, [fecha, registroActualEnFecha]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guardando) return; // Prevención de doble toque (M4)

    setErrorValidacion(null);
    setMensajeExito(null);

    // 1. Validación de campo vacío (M4)
    const valorLimpio = mmInput.trim().replace(',', '.');
    if (!valorLimpio) {
      setErrorValidacion('Por favor ingresá la cantidad de milímetros de lluvia.');
      return;
    }

    // 2. Validación de texto o número inválido (M4)
    const num = Number(valorLimpio);
    if (isNaN(num)) {
      setErrorValidacion('El valor debe ser un número válido (ejemplo: 25 o 12.5).');
      return;
    }

    // 3. Validación de milímetros negativos (M4)
    if (num < 0) {
      setErrorValidacion('Los milímetros de lluvia no pueden ser negativos (mínimo 0 mm).');
      return;
    }

    // 4. Validación de valores absurdos / físicamente imposibles (M4)
    if (num > 500) {
      setErrorValidacion('Un valor mayor a 500 mm en un solo día supera cualquier registro histórico mundial. Verificá la medición de tu pluviómetro.');
      return;
    }

    // 5. Validación de fecha futura (M4)
    if (esFechaFutura(fecha)) {
      setErrorValidacion('No se pueden registrar lluvias de fechas futuras. La fecha máxima permitida es hoy.');
      return;
    }

    // Bloqueo de doble click mientras procesa
    setGuardando(true);
    try {
      onGuardar(fecha, num);
      setMmInput('');
    } finally {
      setTimeout(() => setGuardando(false), 400);
    }
  };

  return (
    <section
      aria-label="Registrar medición de lluvia"
      className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-4">
        <Droplet className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
          Registrar Lluvia
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* CAMPO FECHA CON ETIQUETA VISIBLE (M3) */}
        <div>
          <label
            htmlFor="fecha-input"
            className="flex items-center gap-2 text-base font-bold text-slate-200 mb-1.5"
          >
            <Calendar className="w-4 h-4 text-cyan-400" />
            Fecha de la medición:
          </label>
          <input
            id="fecha-input"
            type="date"
            value={fecha}
            max={hoyISO}
            onChange={(e) => {
              setFecha(e.target.value);
              setErrorValidacion(null);
            }}
            className="w-full bg-slate-800 border-2 border-slate-600 rounded-xl px-4 py-3 text-base text-slate-100 font-medium focus:border-cyan-400 focus:outline-none transition-colors"
          />
          {registroActualEnFecha && (
            <p className="mt-1 text-xs text-amber-300 font-semibold flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              Ya existe un registro de {registroActualEnFecha.mm} mm para esta fecha. Si guardás, se actualizará.
            </p>
          )}
        </div>

        {/* CAMPO MILÍMETROS CON ETIQUETA VISIBLE (M3) */}
        <div>
          <label
            htmlFor="mm-input"
            className="flex items-center justify-between text-base font-bold text-slate-200 mb-1.5"
          >
            <span className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-cyan-400" />
              Lluvia en milímetros (mm):
            </span>
            <span className="text-xs font-normal text-slate-400">
              1 mm = 1 litro/m²
            </span>
          </label>
          <div className="relative">
            <input
              id="mm-input"
              type="text"
              inputMode="decimal"
              placeholder="Ejemplo: 30"
              value={mmInput}
              onChange={(e) => {
                setMmInput(e.target.value);
                setErrorValidacion(null);
                setMensajeExito(null);
              }}
              maxLength={7}
              className="w-full bg-slate-800 border-2 border-slate-600 rounded-xl px-4 py-3.5 text-lg text-slate-100 font-bold placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors pr-14"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-extrabold text-slate-400 pointer-events-none">
              mm
            </span>
          </div>

          {/* BOTONES RÁPIDOS PARA FACILITAR USO CON UNA MANO (M3) */}
          <div className="flex flex-wrap gap-2 mt-2">
            {[0, 10, 25, 30, 40].map((valor) => (
              <button
                key={valor}
                type="button"
                onClick={() => {
                  setMmInput(valor.toString());
                  setErrorValidacion(null);
                }}
                className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-600 transition-colors"
              >
                {valor === 0 ? '0 mm (Sin lluvia)' : `+${valor} mm`}
              </button>
            ))}
          </div>
        </div>

        {/* MENSAJE DE ERROR VISIBLE EN ESPAÑOL (M3 / M4) */}
        {errorValidacion && (
          <div
            role="alert"
            className="p-3 bg-red-950/80 border-2 border-red-500 rounded-xl text-red-200 text-sm font-semibold flex items-start gap-2 animate-shake"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
            <span>{errorValidacion}</span>
          </div>
        )}

        {/* MENSAJE DE ÉXITO VISIBLE EN ESPAÑOL (M3) */}
        {mensajeExito && (
          <div
            role="status"
            className="p-3 bg-emerald-950/80 border-2 border-emerald-500 rounded-xl text-emerald-200 text-sm font-semibold flex items-center gap-2"
          >
            <Check className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* BOTÓN PRINCIPAL ÚNICO (P0: «Guardar lluvia del día» / M3: Un solo botón principal) */}
        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:opacity-50 text-white font-black text-lg py-4 px-6 rounded-xl shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Droplet className="w-5 h-5 fill-current" />
          <span>Guardar lluvia del día</span>
        </button>
      </form>
    </section>
  );
};
