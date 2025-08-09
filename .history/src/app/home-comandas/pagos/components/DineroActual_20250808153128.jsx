"use client";
import React from "react";
import { useDineroActual } from "../../../../hooks/useDineroActual";

export default function DineroActual() {
  const {
    dineroActual,
    loading,
    error,
    fetchDineroActual,
    formatDinero,
    getEfectivoTotal,
    getVirtualTotal,
    getTotalCajas,
  } = useDineroActual();

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-slate-900/50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="ml-3 text-slate-400">Cargando dinero actual...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-slate-900/50">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-white mb-2">Error</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchDineroActual}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-slate-900/50">
      {/* Content */}
      <div className="space-y-4">
        {/* Efectivo */}
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
            <span className="text-white text-sm font-medium">Efectivo</span>
          </div>
          <span className="text-lg font-bold text-green-400">
            {formatDinero(getEfectivoTotal())}
          </span>
        </div>

        {/* Tarjetas */}
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
            <span className="text-white text-sm font-medium">Tarjetas</span>
          </div>
          <span className="text-lg font-bold text-white">
            {formatDinero(getVirtualTotal())}
          </span>
        </div>
      </div>
    </div>
  );

      {/* Debug Info (solo en desarrollo) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-600/50">
          <p className="text-xs text-slate-400">
            Debug: {getTotalCajas()} cajas | Efectivo:{" "}
            {formatDinero(getEfectivoTotal())} | Virtual:{" "}
            {formatDinero(getVirtualTotal())} | Última actualización:{" "}
            {dineroActual.ultimaActualizacion
              ? new Date(
                  dineroActual.ultimaActualizacion.seconds * 1000
                ).toLocaleString()
              : "N/A"}
          </p>
        </div>
      )}
    </div>
  );
}
