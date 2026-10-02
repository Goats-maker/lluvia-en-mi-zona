/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RegistroLluvia } from '../types.ts';
import {
  obtenerFechaConOffset,
  obtenerFechasVentana72Horas,
} from './dateUtils.ts';

/**
 * UMBRAL DE ALERTA COMUNITARIA (P0 / M1 / M5):
 * Constante definida en 80 mm.
 * Si el acumulado de las últimas 72 horas es >= 80 mm, el banner es ROJO (Alerta).
 * Si está por debajo de 80 mm, el banner es VERDE (Seguro).
 */
export const UMBRAL_ALERTA_MM = 80.0;

const STORAGE_KEY = 'lluvia_en_mi_zona_registros_v1';

/**
 * Carga todos los registros almacenados localmente.
 * Ordenados cronológicamente del más reciente al más antiguo.
 */
export function cargarRegistros(): RegistroLluvia[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Validar y ordenar por fecha descendente (más reciente primero)
    return parsed
      .filter((r) => r && typeof r.fecha === 'string' && typeof r.mm === 'number')
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  } catch (error) {
    console.error('Error al leer registros de almacenamiento local:', error);
    return [];
  }
}

/**
 * Guarda o actualiza un registro.
 * REGLA ROOM (M2): La clave primaria es `fecha` (YYYY-MM-DD).
 * Si ya existe un registro para esa fecha, se sobrescribe con el nuevo valor.
 */
export function guardarRegistro(fecha: string, mm: number): {
  registros: RegistroLluvia[];
  fueSobrescrito: boolean;
} {
  const actuales = cargarRegistros();
  const indiceExistente = actuales.findIndex((r) => r.fecha === fecha);
  let fueSobrescrito = false;

  const nuevoRegistro: RegistroLluvia = {
    fecha,
    mm: Math.round(mm * 10) / 10, // Precisión de 1 decimal
    creadoEn: Date.now(),
  };

  let actualizados: RegistroLluvia[];

  if (indiceExistente >= 0) {
    // Sobrescribir registro existente
    actualizados = [...actuales];
    actualizados[indiceExistente] = nuevoRegistro;
    fueSobrescrito = true;
  } else {
    // Insertar nuevo registro
    actualizados = [nuevoRegistro, ...actuales];
  }

  // Ordenar siempre del más reciente al más antiguo
  actualizados.sort((a, b) => b.fecha.localeCompare(a.fecha));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
  return { registros: actualizados, fueSobrescrito };
}

/**
 * Elimina un registro por su clave primaria (fecha).
 */
export function eliminarRegistro(fecha: string): RegistroLluvia[] {
  const actuales = cargarRegistros();
  const filtrados = actuales.filter((r) => r.fecha !== fecha);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados));
  return filtrados;
}

/**
 * Borra todos los registros (vaciado completo de la tabla).
 */
export function limpiarTodosLosRegistros(): RegistroLluvia[] {
  localStorage.removeItem(STORAGE_KEY);
  return [];
}

/**
 * Carga los 3 registros del Criterio de Aceptación (P0 / M2):
 * - Hoy: 30 mm
 * - Ayer: 30 mm
 * - Anteayer: 25 mm
 * Acumulado resultante: 85 mm (supera el umbral de 80 mm -> ALERTA ROJA).
 */
export function cargarRegistrosEjemploCriterio(): RegistroLluvia[] {
  const hoy = obtenerFechaConOffset(0);
  const ayer = obtenerFechaConOffset(-1);
  const anteayer = obtenerFechaConOffset(-2);

  const ejemplos: RegistroLluvia[] = [
    { fecha: hoy, mm: 30.0, creadoEn: Date.now() },
    { fecha: ayer, mm: 30.0, creadoEn: Date.now() - 1000 },
    { fecha: anteayer, mm: 25.0, creadoEn: Date.now() - 2000 },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(ejemplos));
  return ejemplos;
}

/**
 * CÁLCULO DEL ACUMULADO DE LAS ÚLTIMAS 72 HORAS (P0 / M1):
 * Suma los milímetros únicamente de los registros que correspondan
 * a hoy, ayer y anteayer.
 */
export function calcularAcumulado72Horas(registros: RegistroLluvia[]): {
  acumuladoTotal: number;
  detallePorDia: { fecha: string; mm: number; etiqueta: string }[];
} {
  const fechas72h = obtenerFechasVentana72Horas(); // [Hoy, Ayer, Anteayer]
  const etiquetas = ['Hoy', 'Ayer', 'Anteayer'];

  let acumuladoTotal = 0;
  const detallePorDia = fechas72h.map((fecha, idx) => {
    const registro = registros.find((r) => r.fecha === fecha);
    const mm = registro ? registro.mm : 0;
    acumuladoTotal += mm;
    return {
      fecha,
      mm,
      etiqueta: etiquetas[idx],
    };
  });

  return {
    acumuladoTotal: Math.round(acumuladoTotal * 10) / 10,
    detallePorDia,
  };
}

/**
 * Exporta el histórico completo a un archivo JSON descargable (M2).
 */
export function exportarHistoricoJSON(registros: RegistroLluvia[]): void {
  const datosParaExportar = {
    app: 'LLUVIA EN MI ZONA',
    version: '1.0.0',
    fechaExportacion: new Date().toISOString(),
    umbralAlertaMm: UMBRAL_ALERTA_MM,
    totalRegistros: registros.length,
    registros,
  };

  const blob = new Blob([JSON.stringify(datosParaExportar, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lluvia_zona_historico_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Importa registros desde un archivo JSON respaldado (M2).
 */
export function importarHistoricoJSON(contenidoJSON: string): RegistroLluvia[] {
  const parsed = JSON.parse(contenidoJSON);
  const lista: any[] = Array.isArray(parsed) ? parsed : parsed.registros || [];

  const actuales = cargarRegistros();
  const mapa = new Map<string, RegistroLluvia>();

  // Mantener los actuales
  for (const item of actuales) {
    mapa.set(item.fecha, item);
  }

  // Sobrescribir o añadir con los importados válidos
  for (const item of lista) {
    if (item && typeof item.fecha === 'string' && typeof item.mm === 'number' && item.mm >= 0) {
      mapa.set(item.fecha, {
        fecha: item.fecha,
        mm: Math.round(item.mm * 10) / 10,
        creadoEn: item.creadoEn || Date.now(),
      });
    }
  }

  const combinados = Array.from(mapa.values()).sort((a, b) => b.fecha.localeCompare(a.fecha));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(combinados));
  return combinados;
}
