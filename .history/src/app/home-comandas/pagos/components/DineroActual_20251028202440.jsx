"use client";
import React, { useState } from "react";
import VentasModal from "./VentasModal";
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
  getVentasVirtual 
}) {
  // Estados para los modales
  const [showVentasModal, setShowVentasModal] = useState(false);
  const [showHistorialIngresosModal, setShowHistorialIngresosModal] = useState(false);

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
          {/* Efectivo Total (Dinero Actual + Ventas) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500/20 rounded-md flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-medium">Efectivo Total</span>
                <span className="text-xs text-slate-400">
                  Caja: {formatDinero(data.dineroActual.efectivo)} + Ventas: {formatDinero(getVentasEfectivo())}
                </span>
              </div>
            </div>
            <span className="text-lg font-bold text-green-400">
              {formatDinero(getEfectivoTotal())}
            </span>
          </div>

          {/* Virtual Total (Dinero Actual + Ventas) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-medium">Pago Virtual Total</span>
                <span className="text-xs text-slate-400">
                  Virtual: {formatDinero(data.dineroActual.virtual)} + Ventas: {formatDinero(getVentasVirtual())}
                </span>
              </div>
            </div>
            <span className="text-lg font-bold text-blue-400">
              {formatDinero(getVirtualTotal())}
            </span>
          </div>

       

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-slate-700/50 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowVentasModal(true)}
                className="bg-blue-500 text-white font-medium py-2 px-3 rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center space-x-2"
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="text-sm">Ventas</span>
              </button>
              
              <button
                onClick={() => setShowHistorialIngresosModal(true)}
                className="bg-slate-600 text-white font-medium py-2 px-3 rounded-lg hover:bg-slate-700 transition-all duration-300 flex items-center justify-center space-x-2"
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
      <VentasModal
        isOpen={showVentasModal}
        onClose={() => setShowVentasModal(false)}
      />

      <HistorialIngresosModal
        isOpen={showHistorialIngresosModal}
        onClose={() => setShowHistorialIngresosModal(false)}
      />
    </div>
  );
}
