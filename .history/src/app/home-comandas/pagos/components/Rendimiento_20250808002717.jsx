"use client";
import React from "react";
import { useDineroActual } from "../../../../hooks/useDineroActual";
import { useInversionTotal } from "../../../../hooks/useInversionTotal";
import { useAlivios } from "../../../../hooks/useAlivios";
import { useIngresos } from "../../../../hooks/useIngresos";

function Rendimiento() {
  const { formatDinero, getEfectivoTotal, getVirtualTotal } = useDineroActual();
  const { getInversionTotal } = useInversionTotal();
  const { getTotalAlivios } = useAlivios();
  const { getTotalIngresos } = useIngresos();

  // Calcular egresos totales (Alivios + Compras)
  const egresosTotales = getTotalAlivios() + getInversionTotal();
  
  // Calcular ingresos totales (Admin + Ingresos Totales)
  const ingresosTotales = (getEfectivoTotal() + getVirtualTotal()) + getTotalIngresos();
  
  // Calcular rendimiento (Ingresos - Egresos)
  const rendimiento = ingresosTotales - egresosTotales;
  
  // Determinar si es ganancia o pérdida
  const esGanancia = rendimiento >= 0;
  const rendimientoColor = esGanancia ? "text-green-400" : "text-red-400";
  const rendimientoBgColor = esGanancia ? "bg-green-500/20" : "bg-red-500/20";
  const rendimientoIconColor = esGanancia ? "text-green-400" : "text-red-400";

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 shadow-2xl shadow-slate-900/50">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/25">
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Rendimiento</h2>
      </div>

      {/* Egresos Totales */}
      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500/20 rounded-md flex items-center justify-center">
              <svg
                className="w-4 h-4 text-red-400"
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
            <span className="text-white text-sm font-medium">
              Egresos Totales
            </span>
          </div>
          <span className="text-lg font-bold text-red-400">
            {formatDinero(egresosTotales)}
          </span>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Alivios + Compras
        </div>
      </div>

      {/* Ingresos Totales */}
      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50 mb-4">
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
            {formatDinero(ingresosTotales)}
          </span>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Admin + Ingresos
        </div>
      </div>

      {/* Rendimiento (Ganancia/Pérdida) */}
      <div className={`${rendimientoBgColor} rounded-lg p-3 border border-slate-600/50 mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 ${rendimientoBgColor} rounded-md flex items-center justify-center`}>
              <svg
                className={`w-4 h-4 ${rendimientoIconColor}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {esGanancia ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  />
                )}
              </svg>
            </div>
            <span className="text-white text-sm font-medium">
              {esGanancia ? "Ganancia" : "Pérdida"}
            </span>
          </div>
          <span className={`text-xl font-bold ${rendimientoColor}`}>
            {esGanancia ? "+" : "-"}{formatDinero(Math.abs(rendimiento))}
          </span>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Ingresos - Egresos
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
        <div className="text-xs text-slate-400 mb-2">Desglose:</div>
        
        {/* Egresos Breakdown */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">• Alivios:</span>
            <span className="text-red-400 font-medium">
              {formatDinero(getTotalAlivios())}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">• Compras:</span>
            <span className="text-red-400 font-medium">
              {formatDinero(getInversionTotal())}
            </span>
          </div>
        </div>

        {/* Ingresos Breakdown */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">• Admin:</span>
            <span className="text-green-400 font-medium">
              {formatDinero(getEfectivoTotal() + getVirtualTotal())}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">• Ingresos:</span>
            <span className="text-green-400 font-medium">
              {formatDinero(getTotalIngresos())}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rendimiento;
