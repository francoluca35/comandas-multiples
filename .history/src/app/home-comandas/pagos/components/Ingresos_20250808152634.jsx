"use client";
import React, { useState } from "react";
import { useDineroActual } from "../../../../hooks/useDineroActual";
import { useIngresos } from "../../../../hooks/useIngresos";
import IngresoModal from "./IngresoModal";
import VentasModal from "./VentasModal";
import OtrosModal from "./OtrosModal";
import DepositarModal from "./DepositarModal";

function Ingresos() {
  const { formatDinero, getEfectivoTotal, getVirtualTotal } = useDineroActual();
  const { getTotalIngresos, fetchIngresos } = useIngresos();

  const [showIngresoModal, setShowIngresoModal] = useState(false);
  const [showVentasModal, setShowVentasModal] = useState(false);
  const [showOtrosModal, setShowOtrosModal] = useState(false);
  const [showDepositarModal, setShowDepositarModal] = useState(false);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 shadow-2xl shadow-slate-900/50">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Ingresos</h2>
      </div>

      {/* Summary Cards */}
      <div className="space-y-2 mb-4">
        {/* Ingresos Totales */}
        <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">
                Ingresos Totales
              </span>
            </div>
            <span className="text-lg font-bold text-green-400">
              {formatDinero(getTotalIngresos())}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Total */}
      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-500/20 rounded-md flex items-center justify-center">
              <svg
                className="w-4 h-4 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">admin</span>
          </div>
          <span className="text-lg font-bold text-purple-400">
            {formatDinero(getEfectivoTotal() + getVirtualTotal())}
          </span>
        </div>

        {/* Caja y Virtual breakdown */}
        <div className="space-y-1">
          {/* Caja */}
          <div className="flex items-center justify-between bg-slate-600/30 rounded-md p-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-500/20 rounded-sm flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-green-400"
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
              <span className="text-slate-300 text-xs font-medium">caja</span>
            </div>
            <span className="text-sm font-bold text-green-400">
              {formatDinero(getEfectivoTotal())}
            </span>
          </div>

          {/* Virtual */}
          <div className="flex items-center justify-between bg-slate-600/30 rounded-md p-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-blue-500/20 rounded-sm flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-blue-400"
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
              <span className="text-slate-300 text-xs font-medium">
                virtual
              </span>
            </div>
            <span className="text-sm font-bold text-blue-400">
              {formatDinero(getVirtualTotal())}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={() => setShowIngresoModal(true)}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-4 rounded-xl mb-4 hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25 flex items-center justify-center space-x-2"
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <span>Ingresar</span>
      </button>

      {/* Secondary Action Buttons - First Row */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          onClick={() => setShowVentasModal(true)}
          className="bg-blue-500 text-white font-medium py-2 px-2 rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center space-x-1"
        >
          <svg
            className="w-3 h-3"
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
          <span className="text-xs">Ventas</span>
        </button>
        <button
          onClick={() => setShowOtrosModal(true)}
          className="bg-blue-500 text-white font-medium py-2 px-2 rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center space-x-1"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          <span className="text-xs">Otros</span>
        </button>
      </div>

      {/* Secondary Action Buttons - Second Row */}
      <div className="grid grid-cols-1 gap-2 mb-4">
        <button className="bg-blue-500 text-white font-medium py-2 px-2 rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center space-x-1">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="text-xs">Depositar</span>
        </button>
      </div>

      {/* View/Report Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button className="bg-slate-600 text-white font-medium py-2 px-3 rounded-lg hover:bg-slate-700 transition-all duration-300 flex items-center justify-center space-x-2">
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <span className="text-sm">Ver ingresos por cuenta</span>
        </button>
        <button className="bg-slate-600 text-white font-medium py-2 px-3 rounded-lg hover:bg-slate-700 transition-all duration-300 flex items-center justify-center space-x-2">
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

      {/* Modal de Ingreso */}
      <IngresoModal
        isOpen={showIngresoModal}
        onClose={() => setShowIngresoModal(false)}
        onSuccess={() => {
          console.log("✅ Ingreso creado exitosamente");
          fetchIngresos(); // Recargar datos después de crear un ingreso
        }}
      />
    </div>
  );
}

export default Ingresos;
