/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import {
  History,
  Trash2,
  Download,
  Upload,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { RegistroLluvia } from '../types.ts';
import { formatearFechaEspanol, estaEnVentana72Horas } from '../utils/dateUtils.ts';
import {
  exportarHistoricoJSON,
  importarHistoricoJSON,
} from '../utils/storage.ts';

interface HistoricoListaProps {
  registros: RegistroLluvia[];
  onEliminar: (fecha: string) => void;
  onCargarEjemplosCriterio: () => void;
  onActualizarRegistros: (nuevos: RegistroLluvia[]) => void;
  onLimpiarTodo: () => void;
}

export const HistoricoLista: React.FC<HistoricoListaProps> = ({
  registros,
  onEliminar,
  onCargarEjemplosCriterio,
  onActualizarRegistros,
  onLimpiarTodo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportarJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const contenido = event.target?.result as string;
        const actualizados = importarHistoricoJSON(contenido);
        onActualizarRegistros(actualizados);
      } catch (err) {
        alert('El archivo no tiene un formato JSON válido.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <section
      aria-label="Historial de mediciones registradas"
      className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-lg space-y-4"
    >
      {/* CABECERA CON BOTONES SECUNDARIOS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
            Histórico de Lluvias ({registros.length})
          </h2>
        </div>

        {/* ACCIONES SECUNDARIAS (M2) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCargarEjemplosCriterio}
            title="Cargar los 3 registros de prueba del criterio: 30 mm hoy, 30 mm ayer, 25 mm anteayer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-lg border border-cyan-800/60 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cargar 85 mm (P0)</span>
          </button>

          <button
            type="button"
            onClick={() => exportarHistoricoJSON(registros)}
            disabled={registros.length === 0}
            title="Descargar copia de seguridad en archivo .json"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-bold rounded-lg border border-slate-600 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Restaurar copia desde archivo .json"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-600 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportarJSON}
            className="hidden"
          />

          {registros.length > 0 && (
            <button
              type="button"
              onClick={onLimpiarTodo}
              title="Borrar todos los registros"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar</span>
            </button>
          )}
        </div>
      </div>

      {/* ESTADO VACÍO (M3: Requisito explícito de frase que invite a la primera acción) */}
      {registros.length === 0 ? (
        <div className="py-8 px-4 text-center bg-slate-800/40 rounded-xl border border-dashed border-slate-700">
          <CalendarCheck className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-base sm:text-lg font-medium text-slate-300 max-w-md mx-auto leading-relaxed">
            Todavía no registraste lluvia. Anotá los milímetros de hoy para empezar a vigilar la quebrada.
          </p>
          <button
            type="button"
            onClick={onCargarEjemplosCriterio}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-sm font-bold rounded-xl border border-cyan-700/60 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Cargar datos de prueba (30 mm, 30 mm, 25 mm)
          </button>
        </div>
      ) : (
        /* LISTADO ORDENADO DEL MÁS RECIENTE AL MÁS ANTIGUO (M2) */
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {registros.map((registro) => {
            const { etiqueta, detalle } = formatearFechaEspanol(registro.fecha);
            const cuentaPara72h = estaEnVentana72Horas(registro.fecha);

            return (
              <div
                key={registro.fecha}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                  cuentaPara72h
                    ? 'bg-slate-800/90 border-cyan-800/80'
                    : 'bg-slate-800/40 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-slate-100">
                        {etiqueta}
                      </span>
                      {cuentaPara72h && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          Cuenta en 72h
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 block font-mono">
                      {registro.fecha} {detalle ? `• ${detalle}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-cyan-300">
                    {registro.mm.toFixed(1)}{' '}
                    <span className="text-xs font-semibold text-slate-400">mm</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => onEliminar(registro.fecha)}
                    title={`Eliminar registro del ${registro.fecha}`}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
