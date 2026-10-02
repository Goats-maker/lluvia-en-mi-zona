/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RegistroLluvia {
  /** Clave primaria: fecha en formato YYYY-MM-DD */
  fecha: string;
  /** Cantidad de precipitación en milímetros (Double) */
  mm: number;
  /** Timestamp de creación/actualización para ordenamiento secundario */
  creadoEn?: number;
}

export type NivelRiesgo = 'bajo' | 'medio' | 'alto';

export interface AnalisisRiesgo {
  nivel_riesgo: NivelRiesgo;
  explicacion: string;
  mensaje_aviso: string;
  acciones: string[];
  es_plantilla?: boolean;
  mensaje_origen?: string;
}

export interface CasoPruebaM4 {
  id: number;
  nombre: string;
  descripcion: string;
  quePasabaAntes: string;
  quePasaAhora: string;
  valorPrueba: {
    fecha: string;
    mmTexto: string;
  };
}
