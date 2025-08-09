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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-400"
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
          <h2 className="text-2xl font-bold text-white">Dinero Actual</h2>
        </div>
        <button
          onClick={fetchDineroActual}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          title="Actualizar"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Efectivo */}
        <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-400"
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
              <span className="text-white font-medium">Efectivo</span>
            </div>
            <span className="text-2xl font-bold text-green-400">
              {formatDinero(getEfectivoTotal())}
            </span>
          </div>
        </div>

        {/* Tarjetas */}
        <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-400"
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
              <span className="text-white font-medium">Tarjetas</span>
            </div>
            <span className="text-2xl font-bold text-blue-400">
              {formatDinero(getVirtualTotal())}
            </span>
          </div>
        </div>

        {/* Admin Total */}
        <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-400"
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
              <span className="text-white font-medium">admin</span>
            </div>
            <span className="text-2xl font-bold text-purple-400">
              {formatDinero(getEfectivoTotal() + getVirtualTotal())}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <button className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl px-4 py-3 font-medium flex items-center justify-center space-x-2 transition-colors">
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Modificar caja</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center space-x-2 transition-colors">
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <span>Ver saldos por caja</span>
          </button>
          <button className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center space-x-2 transition-colors">
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
            <span>Historial</span>
          </button>
        </div>
      </div>

      {/* Debug Info (solo en desarrollo) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-600/50">
          <p className="text-xs text-slate-400">
            Debug: {getTotalCajas()} cajas | Última actualización:{" "}
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
