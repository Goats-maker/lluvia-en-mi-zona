/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Retorna la fecha local en formato estándar YYYY-MM-DD.
 * NOTA CRÍTICA: No usar Date.toISOString() directamente porque convierte a UTC,
 * lo que puede cambiar el día si son las últimas horas de la noche en la zona horaria del usuario.
 */
export function obtenerFechaHoyISO(): string {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Obtiene una fecha con desplazamiento de días relativo a hoy en formato YYYY-MM-DD.
 * @param offset -0 para hoy, -1 para ayer, -2 para anteayer
 */
export function obtenerFechaConOffset(offset: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + offset);
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * CALCULO CLAVE DE LAS ÚLTIMAS 72 HORAS (P0 / M1):
 * --------------------------------------------------
 * En la hidrología comunitaria de quebradas, la ventana de 72 horas se cuenta como
 * el día de hoy (últimas 24h) y los dos días calendario inmediatamente anteriores (-24h y -48h).
 * 
 * ¿Por qué alguien se equivoca aquí?
 * 1. Error común A: Restar simplemente 72 horas en milisegundos sin considerar días calendario,
 *    descartando lluvias caídas a primera hora del día anteayer.
 * 2. Error común B: Tomar los últimos 3 registros de la base de datos sin mirar la fecha.
 *    Si el último registro fue de hace una semana, ¡no pertenece a las últimas 72 horas!
 * 3. Error común C: Duplicar registros de la misma fecha en vez de sobreescribir.
 * 
 * Por eso, esta función genera explícitamente el conjunto de las 3 fechas válidas:
 * [Hoy, Ayer, Anteayer] y suma únicamente los registros cuyas fechas pertenezcan a este conjunto.
 */
export function obtenerFechasVentana72Horas(): string[] {
  return [
    obtenerFechaConOffset(0),  // Hoy (0h a 24h)
    obtenerFechaConOffset(-1), // Ayer (-24h a -48h)
    obtenerFechaConOffset(-2), // Anteayer (-48h a -72h)
  ];
}

/**
 * Determina si una fecha específica cae dentro de la ventana de las últimas 72h.
 */
export function estaEnVentana72Horas(fechaISO: string): boolean {
  const fechas72h = obtenerFechasVentana72Horas();
  return fechas72h.includes(fechaISO);
}

/**
 * Comprueba si una fecha es futura (posterior al día de hoy).
 */
export function esFechaFutura(fechaISO: string): boolean {
  const hoy = obtenerFechaHoyISO();
  return fechaISO > hoy;
}

/**
 * Formatea una fecha YYYY-MM-DD para lectura humana en español.
 * Ej: "Hoy (02/10)", "Ayer (01/10)", "Anteayer (30/09)" o "28 de sep."
 */
export function formatearFechaEspanol(fechaISO: string): { etiqueta: string; detalle: string } {
  const hoy = obtenerFechaHoyISO();
  const ayer = obtenerFechaConOffset(-1);
  const anteayer = obtenerFechaConOffset(-2);

  const partes = fechaISO.split('-');
  if (partes.length !== 3) {
    return { etiqueta: fechaISO, detalle: '' };
  }

  const [, mesStr, diaStr] = partes;
  const fechaObj = new Date(parseInt(partes[0]), parseInt(mesStr) - 1, parseInt(diaStr));

  const meses = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ];
  const nombreMes = meses[fechaObj.getMonth()] || mesStr;
  const fechaCorta = `${parseInt(diaStr)} de ${nombreMes}`;

  if (fechaISO === hoy) {
    return { etiqueta: 'Hoy', detalle: fechaCorta };
  } else if (fechaISO === ayer) {
    return { etiqueta: 'Ayer', detalle: fechaCorta };
  } else if (fechaISO === anteayer) {
    return { etiqueta: 'Anteayer', detalle: fechaCorta };
  } else {
    return { etiqueta: fechaCorta, detalle: partes[0] };
  }
}
