"use client";
import React, { useState, useMemo } from "react";
import { useIngresos } from "@/hooks/useIngresos";
import HistorialIngresosModal from "./HistorialIngresosModal";

export default function DineroActual({ 
  onToggle, 
  isExpanded, 
  data, 
  loading, 
  error, 
  fetchAllPagosData, 
  formatDinero, 
  getEfectivoTotal, 
  getVirtualTotal, 
  getVentasEfectivo, 
  getVentasVirtual,
  getEgresosEfectivo,
  getEgresosVirtual
}) {
  // Estados para los modales
  const [showHistorialIngresosModal, setShowHistorialIngresosModal] = useState(false);
  
  // Hook para obtener ingresos
  const { getIngresos, ingresos } = useIngresos();
  
  // Calcular ingresos por tipo (efectivo/virtual) - NETOS (ingresos menos egresos)
  const resumenIngresos = useMemo(() => {
    try {
      let ingresoEfectivo = 0;
      let ingresoVirtual = 0;

      // Obtener todos los ingresos registrados
      const todosLosIngresos = getIngresos();

      // Calcular ingresos por tipo según la forma de ingreso registrada
      todosLosIngresos.forEach((ingreso) => {
        const monto = parseFloat(ingreso.monto) || 0;
        
        // Normalizar formaIngreso para comparación
        const formaIngreso = (ingreso.formaIngreso || "").toLowerCase();

        if (
          ingreso.formaIngreso === "Efectivo" ||
          ingreso.opcionPago === "caja"
        ) {
          ingresoEfectivo += monto;
        } else if (
          formaIngreso === "mercadopago" ||
          formaIngreso === "mercado pago" ||
          formaIngreso === "tarjeta" ||
          formaIngreso === "transferencia" ||
          ingreso.opcionPago === "cuenta_restaurante"
        ) {
          ingresoVirtual += monto;
        }
      });

      // Obtener egresos
      const egresosEfectivo = getEgresosEfectivo ? getEgresosEfectivo() : 0;
      const egresosVirtual = getEgresosVirtual ? getEgresosVirtual() : 0;

      // Calcular valores netos (ingresos - egresos)
      const ingresoEfectivoNeto = ingresoEfectivo - egresosEfectivo;
      const ingresoVirtualNeto = ingresoVirtual - egresosVirtual;

      return { 
        ingresoEfectivo: ingresoEfectivoNeto, 
        ingresoVirtual: ingresoVirtualNeto 
      };
    } catch (error) {
      console.error("❌ Error calculando resumen de ingresos:", error);
      return { ingresoEfectivo: 0, ingresoVirtual: 0 };
    }
  }, [getIngresos, ingresos?.totalIngresos, ingresos?.ingresos?.length, getEgresosEfectivo, getEgresosVirtual]);

  // Función para obtener el total de cajas
  const getTotalCajas = () => {
    return data?.dineroActual?.totalCajas || 0;
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-slate-900/50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="ml-3 text-slate-400">Cargando dinero actual...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-slate-900/50">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-white mb-2">Error</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => fetchAllPagosData(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-slate-900/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white"> Dinero Actual</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchAllPagosData(true)}
            className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
            title="Actualizar datos"
            disabled={loading}
          >
            <svg
              className={`w-4 h-4 text-white transition-transform duration-300 ${
                loading ? "animate-spin" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button
            onClick={onToggle}
            className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
            title={isExpanded ? "Ocultar sección" : "Mostrar sección"}
          >
            <svg
              className={`w-5 h-5 text-white transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content - Conditionally visible */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Ingresos en Efectivo */}
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="text-sm font-medium">Ingreso Efectivo</span>
              </div>
              <span className="text-sm font-bold text-green-400">
                {formatDinero(resumenIngresos.ingresoEfectivo)}
              </span>
            </div>
          </div>

          {/* Ingresos Virtuales */}
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-blue-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="text-sm font-medium">Ingreso Virtual</span>
              </div>
              <span className="text-sm font-bold text-blue-400">
                {formatDinero(resumenIngresos.ingresoVirtual)}
              </span>
            </div>
          </div>

          {/* Total de Ingresos */}
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-purple-400 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <span className="text-base font-semibold">Total de Ingresos</span>
              </div>
              <span className="text-xl font-bold text-purple-400">
                {formatDinero(resumenIngresos.ingresoEfectivo + resumenIngresos.ingresoVirtual)}
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-slate-700/50 mt-4">
            <div className="flex justify-center">
              <button
                onClick={() => setShowHistorialIngresosModal(true)}
                className="bg-blue-500 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm">Historial de ingresos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      <HistorialIngresosModal
        isOpen={showHistorialIngresosModal}
        onClose={() => setShowHistorialIngresosModal(false)}
      />
    </div>
  );
}
