"use client";
import React, { useMemo, memo } from "react";
import { useDineroActual } from "../../../../hooks/useDineroActual";
import { useInversionTotal } from "../../../../hooks/useInversionTotal";
import { useAlivios } from "../../../../hooks/useAlivios";
import { useIngresos } from "../../../../hooks/useIngresos";

function Rendimiento({ onToggle, isExpanded }) {
  const { formatDinero, getEfectivoTotal, getVirtualTotal } = useDineroActual();
  const { getInversionTotal } = useInversionTotal();
  const { getTotalAlivios } = useAlivios();
  const { getTotalIngresos } = useIngresos();

  // Memoizar valores para evitar recálculos
  const totalAlivios = useMemo(() => getTotalAlivios || 0, [getTotalAlivios]);
  const totalInversion = useMemo(() => getInversionTotal || 0, [getInversionTotal]);
  const totalIngresos = useMemo(() => getTotalIngresos || 0, [getTotalIngresos]);
  const efectivoTotal = useMemo(() => getEfectivoTotal || 0, [getEfectivoTotal]);
  const virtualTotal = useMemo(() => getVirtualTotal || 0, [getVirtualTotal]);

  // Calcular egresos totales (Alivios + Compras)
  const egresosTotales = useMemo(() => totalAlivios + totalInversion, [totalAlivios, totalInversion]);

  // Calcular ingresos totales (Admin + Ingresos Totales)
  const ingresosTotales = useMemo(() => efectivoTotal + virtualTotal + totalIngresos, [efectivoTotal, virtualTotal, totalIngresos]);

  // Calcular rendimiento (Ingresos - Egresos)
  const rendimiento = useMemo(() => ingresosTotales - egresosTotales, [ingresosTotales, egresosTotales]);

  // Determinar si es ganancia o pérdida
  const esGanancia = rendimiento >= 0;
  const rendimientoColor = esGanancia ? "text-green-400" : "text-red-400";
  const rendimientoBgColor = esGanancia ? "bg-green-500/20" : "bg-red-500/20";
  const rendimientoIconColor = esGanancia ? "text-green-400" : "text-red-400";

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 shadow-2xl shadow-slate-900/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
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
          <h2 className="text-xl font-bold text-white"> Rendimiento</h2>
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
        <>
          {/* Egresos Totales */}
          <div className="flex items-center justify-between mb-4">
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
          <div className="text-xs text-slate-400 mb-4">Alivios + Compras</div>

          {/* Ingresos Totales */}
          <div className="flex items-center justify-between mb-4">
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
          <div className="text-xs text-slate-400 mb-4">Admin + Ingresos</div>

          {/* Rendimiento (Ganancia/Pérdida) */}
          <div className="flex items-center justify-between mb-4">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">Ganancia</span>
            </div>
            <span className="text-xl font-bold text-green-400">
              {formatDinero(Math.abs(rendimiento))}
            </span>
          </div>
          <div className="text-xs text-slate-400 mb-4">Ingresos - Egresos</div>

          {/* Breakdown */}
          <div className="text-xs text-slate-400 mb-2">Desglose:</div>

          {/* Egresos Breakdown */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">• Alivios:</span>
              <span className="text-red-400 font-medium">
                {formatDinero(totalAlivios)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">• Compras:</span>
              <span className="text-red-400 font-medium">
                {formatDinero(totalInversion)}
              </span>
            </div>
          </div>

          {/* Ingresos Breakdown */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">• Admin:</span>
              <span className="text-green-400 font-medium">
                {formatDinero(efectivoTotal + virtualTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">• Ingresos:</span>
              <span className="text-green-400 font-medium">
                {formatDinero(totalIngresos)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Rendimiento;
