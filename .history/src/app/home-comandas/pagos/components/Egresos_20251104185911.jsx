"use client";
import React, { useState } from "react";
import RetirarEfectivoModal from "./RetirarEfectivoModal";
import GastoVirtualModal from "./GastoVirtualModal";
import PagarEmpleadoModal from "./PagarEmpleadoModal";
import HistorialGastosModal from "./HistorialGastosModal";

function Egresos({ 
  onToggle, 
  isExpanded, 
  data, 
  loading, 
  error, 
  fetchAllPagosData, 
  formatDinero, 
  getTotalEgresos 
}) {
  const [showRetirarEfectivoModal, setShowRetirarEfectivoModal] = useState(false);
  const [showGastoVirtualModal, setShowGastoVirtualModal] = useState(false);
  const [showPagarEmpleadoModal, setShowPagarEmpleadoModal] = useState(false);
  const [showHistorialGastosModal, setShowHistorialGastosModal] = useState(false);

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-slate-900/50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-slate-900/50">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error al cargar datos: {error}</p>
          <button
            onClick={() => fetchAllPagosData(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 sm:p-6 shadow-2xl shadow-slate-900/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/25">
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
                d="M20 12H4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Egresos</h2>
        </div>
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

      {/* Content - Conditionally visible */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Total de Egresos */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium">Total de Egresos</span>
              </div>
              <span className="text-xl font-bold text-white">
                {formatDinero(getTotalEgresos())}
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Retirar Efectivo */}
            <button
              onClick={() => setShowRetirarEfectivoModal(true)}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25 flex items-center justify-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Retirar Efectivo</span>
            </button>

            {/* Gasto Virtual */}
            <button
              onClick={() => setShowGastoVirtualModal(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2"
            >
              <svg
                className="w-5 h-5"
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
              <span>Gasto Virtual</span>
            </button>

            {/* Pagar Empleado */}
            <button
              onClick={() => setShowPagarEmpleadoModal(true)}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-yellow-700 hover:to-yellow-800 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/25 flex items-center justify-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Pagar Empleado</span>
            </button>

            {/* Historial de Gastos */}
            <button
              onClick={() => setShowHistorialGastosModal(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2"
            >
              <svg
                className="w-5 h-5"
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
              <span>Historial de Gastos</span>
            </button>
          </div>
        </div>
      )}

      {/* Modales */}
      <RetirarEfectivoModal
        isOpen={showRetirarEfectivoModal}
        onClose={() => setShowRetirarEfectivoModal(false)}
        onSuccess={() => {
          console.log("✅ Retiro de efectivo registrado exitosamente");
          fetchAllPagosData(true);
        }}
        data={data}
        formatDinero={formatDinero}
      />

      <GastoVirtualModal
        isOpen={showGastoVirtualModal}
        onClose={() => setShowGastoVirtualModal(false)}
        onSuccess={() => {
          console.log("✅ Gasto virtual registrado exitosamente");
          fetchAllPagosData(true);
        }}
        data={data}
        formatDinero={formatDinero}
      />

      <PagarEmpleadoModal
        isOpen={showPagarEmpleadoModal}
        onClose={() => setShowPagarEmpleadoModal(false)}
        onSuccess={() => {
          console.log("✅ Pago a empleado registrado exitosamente");
          fetchAllPagosData(true);
        }}
        data={data}
        formatDinero={formatDinero}
      />

      <HistorialGastosModal
        isOpen={showHistorialGastosModal}
        onClose={() => setShowHistorialGastosModal(false)}
        data={data}
        formatDinero={formatDinero}
      />
    </div>
  );
}

export default Egresos;