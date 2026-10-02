/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CloudRain,
  Shield,
  BookOpen,
  Sparkles,
  HelpCircle,
  Smartphone,
  Info,
} from 'lucide-react';
import { RegistroLluvia } from './types.ts';
import {
  cargarRegistros,
  guardarRegistro,
  eliminarRegistro,
  limpiarTodosLosRegistros,
  cargarRegistrosEjemploCriterio,
  calcularAcumulado72Horas,
  UMBRAL_ALERTA_MM,
} from './utils/storage.ts';
import { AcumuladoCard } from './components/AcumuladoCard.tsx';
import { FormularioRegistro } from './components/FormularioRegistro.tsx';
import { HistoricoLista } from './components/HistoricoLista.tsx';
import { AnalisisGeminiCard } from './components/AnalisisGeminiCard.tsx';
import { TesterPanelM4 } from './components/TesterPanelM4.tsx';
import { GuiaEscaleraModal } from './components/GuiaEscaleraModal.tsx';
import { PWAInstallBanner } from './components/PWAInstallBanner.tsx';
import { AndroidInstallModal } from './components/AndroidInstallModal.tsx';

export default function App() {
  const [registros, setRegistros] = useState<RegistroLluvia[]>([]);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [modalGuiaAbierto, setModalGuiaAbierto] = useState<boolean>(false);
  const [modalAndroidAbierto, setModalAndroidAbierto] = useState<boolean>(false);

  // Inicialización de datos persistidos localmente (M2)
  useEffect(() => {
    const guardados = cargarRegistros();
    // Si es la primera vez que abre la app, podemos arrancar vacío para que se aprecie el estado vacío (M3),
    // o el usuario puede presionar "Cargar 85 mm (P0)" para verificar de inmediato.
    setRegistros(guardados);
  }, []);

  // Cálculo reactivo del acumulado de las últimas 72 horas (P0 / M1)
  const { acumuladoTotal, detallePorDia } = useMemo(() => {
    return calcularAcumulado72Horas(registros);
  }, [registros]);

  // Manejador para guardar o actualizar un registro
  const handleGuardarLluvia = (fecha: string, mm: number) => {
    const { registros: actualizados, fueSobrescrito } = guardarRegistro(fecha, mm);
    setRegistros(actualizados);

    if (fueSobrescrito) {
      setMensajeExito(`Registro del ${fecha} actualizado exitosamente a ${mm} mm.`);
    } else {
      setMensajeExito(`Lluvia de ${mm} mm guardada correctamente para el ${fecha}.`);
    }

    // Auto-ocultar mensaje de éxito tras 4 segundos
    setTimeout(() => {
      setMensajeExito(null);
    }, 4000);
  };

  // Manejador para eliminar un registro
  const handleEliminarRegistro = (fecha: string) => {
    const confirmacion = window.confirm(`¿Seguro que deseás eliminar el registro del ${fecha}?`);
    if (confirmacion) {
      const actualizados = eliminarRegistro(fecha);
      setRegistros(actualizados);
      setMensajeExito(`Registro del ${fecha} eliminado.`);
      setTimeout(() => setMensajeExito(null), 3000);
    }
  };

  // Cargar los 3 registros del Criterio de Aceptación (P0: 30 mm hoy, 30 mm ayer, 25 mm anteayer = 85 mm)
  const handleCargarCriterioP0 = () => {
    const ejemplos = cargarRegistrosEjemploCriterio();
    setRegistros(ejemplos);
    setMensajeExito('Cargados datos de prueba: Hoy 30 mm, Ayer 30 mm, Anteayer 25 mm. Total: 85 mm.');
    setTimeout(() => setMensajeExito(null), 4000);
  };

  // Vaciar todos los registros
  const handleLimpiarTodo = () => {
    const confirmacion = window.confirm('¿Deseás borrar todo el historial? Esta acción no se puede deshacer.');
    if (confirmacion) {
      const vacio = limpiarTodosLosRegistros();
      setRegistros(vacio);
      setMensajeExito('Se han borrado todos los registros de lluvia.');
      setTimeout(() => setMensajeExito(null), 3000);
    }
  };

  // Manejador para inyectar caso de prueba de Tester M4
  const handleProbarCasoM4 = (fecha: string, mmTexto: string) => {
    // Buscar input y forzar el evento para que el tester lo pruebe inmediatamente
    const inputMm = document.getElementById('mm-input') as HTMLInputElement | null;
    const inputFecha = document.getElementById('fecha-input') as HTMLInputElement | null;
    if (inputFecha) {
      inputFecha.value = fecha;
      inputFecha.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (inputMm) {
      inputMm.value = mmTexto;
      inputMm.dispatchEvent(new Event('input', { bubbles: true }));
      inputMm.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-white">
      {/* BARRA SUPERIOR (M3: Contraste alto, legible al sol, adaptada desde 320dp) */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b-2 border-slate-800 px-4 py-3 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <CloudRain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase leading-none">
                Lluvia en mi Zona
              </h1>
              <p className="text-xs text-cyan-400 font-bold mt-0.5">
                Alerta comunitaria de quebrada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setModalAndroidAbierto(true)}
              title="Descargar app para Android y repositorio GitHub"
              className="p-2 sm:px-3 sm:py-1.5 bg-emerald-950/80 hover:bg-emerald-900 active:bg-emerald-950 text-emerald-200 font-bold text-xs rounded-xl border border-emerald-600/70 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Instalar Android</span>
            </button>

            <button
              type="button"
              onClick={() => setModalGuiaAbierto(true)}
              title="Ver guía de la escalera y respuestas técnicas P0 a M5"
              className="p-2 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-cyan-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Guía P0 a M5</span>
            </button>

            <button
              type="button"
              onClick={handleCargarCriterioP0}
              title="Cargar rápidamente la prueba de 85 mm con alerta roja (P0)"
              className="p-2 sm:px-3 sm:py-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 font-bold text-xs rounded-xl border border-red-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Probar 85 mm</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL MOBILE-FIRST (≥ 320 DP DE ANCHO) */}
      <main className="flex-1 w-full max-w-xl mx-auto p-4 sm:p-5 space-y-5">
        {/* BANNER DE INSTALACIÓN ANDROID PWA */}
        <PWAInstallBanner
          onAbrirModalAndroid={() => setModalAndroidAbierto(true)}
        />

        {/* 1. CONTADOR GRANDE Y BANNER DE ALERTA (P0: Requisito 2 y 3) */}
        <AcumuladoCard
          acumuladoTotal={acumuladoTotal}
          detallePorDia={detallePorDia}
        />

        {/* 2. FORMULARIO PARA REGISTRAR LA LLUVIA DEL DÍA (P0: Requisito 1 / M3 / M4) */}
        <FormularioRegistro
          onGuardar={handleGuardarLluvia}
          registrosExistentes={registros}
          mensajeExito={mensajeExito}
          setMensajeExito={setMensajeExito}
        />

        {/* 3. ANÁLISIS INTELIGENTE CON GEMINI (M5: Salida estructurada, WhatsApp y fallback) */}
        <AnalisisGeminiCard
          acumulado72h={acumuladoTotal}
          registros={registros}
        />

        {/* 4. PANEL DE PRUEBAS DE RESISTENCIA Y TESTER (M4: 10 Casos y tabla QA) */}
        <TesterPanelM4 onProbarCaso={handleProbarCasoM4} />

        {/* 5. HISTÓRICO DE MEDICIONES PERSISTENTES Y EXPORTACIÓN JSON (M2 / M3) */}
        <HistoricoLista
          registros={registros}
          onEliminar={handleEliminarRegistro}
          onCargarEjemplosCriterio={handleCargarCriterioP0}
          onActualizarRegistros={setRegistros}
          onLimpiarTodo={handleLimpiarTodo}
        />
      </main>

      {/* PIE DE PÁGINA INFORMATIVO Y PREVENTIVO */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4 text-center text-xs text-slate-400">
        <div className="max-w-xl mx-auto space-y-1.5">
          <p className="flex items-center justify-center gap-1 text-slate-300 font-semibold">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Sistema Comunitario de Alerta Temprana • Umbral: {UMBRAL_ALERTA_MM} mm</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Los datos se guardan localmente en el dispositivo sin enviar información personal a servidores externos.
          </p>
        </div>
      </footer>

      {/* MODAL DE LA GUÍA TÉCNICA (P0 - M5, Room, BuildConfig, Preguntas) */}
      <GuiaEscaleraModal
        abierto={modalGuiaAbierto}
        onCerrar={() => setModalGuiaAbierto(false)}
      />

      {/* MODAL DE INSTALACIÓN ANDROID, GITHUB Y DESCARGA ZIP */}
      <AndroidInstallModal
        abierto={modalAndroidAbierto}
        onCerrar={() => setModalAndroidAbierto(false)}
      />
    </div>
  );
}
