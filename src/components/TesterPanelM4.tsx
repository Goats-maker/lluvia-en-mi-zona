/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bug,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
  AlertOctagon,
  FileSpreadsheet,
} from 'lucide-react';
import { CasoPruebaM4 } from '../types.ts';
import { obtenerFechaConOffset } from '../utils/dateUtils.ts';

interface TesterPanelM4Props {
  onProbarCaso: (fecha: string, mmTexto: string) => void;
}

export const CASOS_PRUEBA_M4: CasoPruebaM4[] = [
  {
    id: 1,
    nombre: 'Campo de mm vacío',
    descripcion: 'Tocar «Guardar lluvia del día» sin escribir nada en el campo de milímetros.',
    quePasabaAntes: 'Guardaba NaN o 0 silenciosamente en la base de datos sin advertir al usuario.',
    quePasaAhora: 'Bloquea el guardado y muestra en rojo: «Por favor ingresá la cantidad de milímetros de lluvia».',
    valorPrueba: { fecha: obtenerFechaConOffset(0), mmTexto: '' },
  },
  {
    id: 2,
    nombre: 'Texto donde va número ("mucho")',
    descripcion: 'Escribir letras o palabras como "mucho", "bastante" o símbolos en el campo de mm.',
    quePasabaAntes: 'Provocaba NumberFormatException o NaN en el contador del acumulado de 72 horas.',
    quePasaAhora: 'Se valida con isNaN(num) y se rechaza: «El valor debe ser un número válido (ejemplo: 25 o 12.5)».',
    valorPrueba: { fecha: obtenerFechaConOffset(0), mmTexto: 'mucho' },
  },
  {
    id: 3,
    nombre: 'Milímetros negativos (-15 mm)',
    descripcion: 'Ingresar números con signo negativo en la medición.',
    quePasabaAntes: 'Restaba milímetros del acumulado de 72 horas, falseando la alerta de la quebrada.',
    quePasaAhora: 'Se comprueba num < 0 y bloquea: «Los milímetros no pueden ser negativos (mínimo 0 mm)».',
    valorPrueba: { fecha: obtenerFechaConOffset(0), mmTexto: '-15' },
  },
  {
    id: 4,
    nombre: 'Valor absurdo (99999 mm)',
    descripcion: 'Ingresar un valor físico imposible para un solo día (ej. 99999 mm o mayor a 500 mm).',
    quePasabaAntes: 'El contador se disparaba a 100,000 mm deformando la interfaz y generando pánico injustificado.',
    quePasaAhora: 'Se evalúa num > 500 mm y advierte: «Un valor mayor a 500 mm en un solo día supera registros históricos».',
    valorPrueba: { fecha: obtenerFechaConOffset(0), mmTexto: '99999' },
  },
  {
    id: 5,
    nombre: 'Fecha futura (Año 2030)',
    descripcion: 'Seleccionar una fecha posterior al día de hoy para registrar lluvia por adelantado.',
    quePasabaAntes: 'Guardaba lluvia futura corrompiendo la cronología y cálculos temporales de la ventana.',
    quePasaAhora: 'El input tiene max="hoy" y el validador rechaza: «No se pueden registrar lluvias de fechas futuras».',
    valorPrueba: { fecha: '2030-01-01', mmTexto: '40' },
  },
  {
    id: 6,
    nombre: 'Texto gigante de 500 caracteres',
    descripcion: 'Pegar un texto kilométrico en el campo numérico.',
    quePasabaAntes: 'Desbordamiento visual del input y posible bloqueo por parseo.',
    quePasaAhora: 'Input limitado a maxLength={7} y filtrado contra números válidos.',
    valorPrueba: { fecha: obtenerFechaConOffset(0), mmTexto: '99999999999999999999999999999' },
  },
  {
    id: 7,
    nombre: 'Doble toque rápido en «Guardar»',
    descripcion: 'Pulsar dos o tres veces rápidamente el botón de guardar en el celular.',
    quePasabaAntes: 'Disparaba dos escrituras concurrentes que podían provocar condiciones de carrera.',
    quePasaAhora: 'Variable de estado guardando=true deshabilita el botón durante el ciclo y previene re-ejecución.',
    valorPrueba: { fecha: obtenerFechaConOffset(0), mmTexto: '15' },
  },
  {
    id: 8,
    nombre: 'Registrar 2 veces la misma fecha',
    descripcion: 'Ingresar dos mediciones diferentes para el mismo día (ej. hoy 20 mm y luego hoy 35 mm).',
    quePasabaAntes: 'Duplicaba la fecha en la lista sumando dos veces el mismo día en las 72 horas.',
    quePasaAhora: 'Comportamiento Room (clave primaria fecha): sobrescribe el registro y avisa al usuario.',
    valorPrueba: { fecha: obtenerFechaConOffset(0), mmTexto: '35' },
  },
  {
    id: 9,
    nombre: 'Coma decimal en vez de punto ("30,5")',
    descripcion: 'Escribir decimales con el teclado numérico latino que usa coma.',
    quePasabaAntes: 'JavaScript / Kotlin fallaban al parsear "30,5" dando NaN.',
    quePasaAhora: 'Normalización automática: .replace(",", ".") antes del parseo.',
    valorPrueba: { fecha: obtenerFechaConOffset(0), mmTexto: '30,5' },
  },
  {
    id: 10,
    nombre: 'Rotación de pantalla a mitad de carga',
    descripcion: 'Girar el móvil mientras se completa el formulario.',
    quePasabaAntes: 'Destrucción de Activity en Android perdiendo lo tipeado en memoria.',
    quePasaAhora: 'Estado preservado reactivamente y persistido en almacenamiento local.',
    valorPrueba: { fecha: obtenerFechaConOffset(0), mmTexto: '28' },
  },
];

export const TesterPanelM4: React.FC<TesterPanelM4Props> = ({ onProbarCaso }) => {
  const [abierto, setAbierto] = useState<boolean>(false);
  const [casoSeleccionado, setCasoSeleccionado] = useState<CasoPruebaM4 | null>(null);

  const ejecutarPrueba = (caso: CasoPruebaM4) => {
    setCasoSeleccionado(caso);
    onProbarCaso(caso.valorPrueba.fecha, caso.valorPrueba.mmTexto);
  };

  return (
    <section
      aria-label="Panel de pruebas de resistencia y validaciones M4"
      className="bg-slate-900 border-2 border-slate-700 rounded-2xl overflow-hidden shadow-lg transition-all"
    >
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Bug className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Panel de Tester M4: Que no se rompa</span>
              <span className="text-xs bg-amber-950 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-600/50">
                10 Casos QA
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Pruebas de estrés y tabla de validaciones antes/después
            </p>
          </div>
        </div>

        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
          {abierto ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {abierto && (
        <div className="p-5 pt-0 border-t border-slate-800 space-y-4">
          <p className="text-sm text-slate-300">
            Hacé clic en cualquiera de los 10 botones para cargar el caso de prueba directamente en el formulario y verificar cómo lo bloquea o maneja la aplicación:
          </p>

          {/* LISTADO DE LOS 10 CASOS CON BOTÓN PARA PROBAR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CASOS_PRUEBA_M4.map((caso) => (
              <div
                key={caso.id}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  casoSeleccionado?.id === caso.id
                    ? 'bg-amber-950/40 border-amber-500'
                    : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-black text-amber-400">
                      Caso #{caso.id}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                      Input: &quot;{caso.valorPrueba.mmTexto || '(vacío)'}&quot;
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 mb-1">
                    {caso.nombre}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {caso.descripcion}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => ejecutarPrueba(caso)}
                  className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-700 hover:bg-amber-600 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Probar este caso</span>
                </button>
              </div>
            ))}
          </div>

          {/* TABLA COMPARATIVA DE CINCO INTENTOS PARA EL README (M4) */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Tabla de Evidencias QA para el README (Antes vs. Después)
              </h4>
            </div>

            <div className="overflow-x-auto text-xs font-sans rounded-xl border border-slate-700 bg-slate-950">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-slate-200 border-b border-slate-700">
                    <th className="p-2.5 font-bold">Caso</th>
                    <th className="p-2.5 font-bold">Intento / Input</th>
                    <th className="p-2.5 font-bold text-red-400">Qué pasaba antes</th>
                    <th className="p-2.5 font-bold text-emerald-400">Qué pasa ahora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-100">1. Vacío</td>
                    <td className="p-2.5 font-mono text-amber-300">&quot;&quot;</td>
                    <td className="p-2.5 text-red-300">Guardaba 0 o NaN sin avisar</td>
                    <td className="p-2.5 text-emerald-300 font-medium">Bloquea con mensaje visible</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-100">2. Negativo</td>
                    <td className="p-2.5 font-mono text-amber-300">&quot;-15&quot;</td>
                    <td className="p-2.5 text-red-300">Restaba del acumulado 72h</td>
                    <td className="p-2.5 text-emerald-300 font-medium">Rechaza: &quot;mínimo 0 mm&quot;</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-100">3. Absurdo</td>
                    <td className="p-2.5 font-mono text-amber-300">&quot;99999&quot;</td>
                    <td className="p-2.5 text-red-300">Disparaba pánico infundado</td>
                    <td className="p-2.5 text-emerald-300 font-medium">Límite físico de 500 mm diario</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-100">4. Futuro</td>
                    <td className="p-2.5 font-mono text-amber-300">2030-01-01</td>
                    <td className="p-2.5 text-red-300">Corrompía cálculos cronológicos</td>
                    <td className="p-2.5 text-emerald-300 font-medium">max=&quot;hoy&quot; y bloqueo de fecha</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-100">5. Duplicado</td>
                    <td className="p-2.5 font-mono text-amber-300">Mismo día x2</td>
                    <td className="p-2.5 text-red-300">Duplicaba registros y sumaba doble</td>
                    <td className="p-2.5 text-emerald-300 font-medium">Sobrescribe clave primaria Room</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
