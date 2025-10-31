"use client";
import React, { useMemo, memo } from "react";
import { useIngresos } from "@/hooks/useIngresos";

function Rendimiento({ onToggle, isExpanded, data, formatDinero, getEfectivoTotal, getVirtualTotal, getTotalIngresos, getTotalEgresos, getVentasEfectivo, getVentasVirtual }) {

  // Hook para obtener ingresos
  const { getIngresos, ingresos } = useIngresos();

  // Calcular ingresos por tipo (efectivo/virtual)
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

      return { ingresoEfectivo, ingresoVirtual };
    } catch (error) {
      console.error("❌ Error calculando resumen de ingresos:", error);
      return { ingresoEfectivo: 0, ingresoVirtual: 0 };
    }
  }, [getIngresos, ingresos?.totalIngresos, ingresos?.ingresos?.length]);

  // Calcular valores usando los datos del hook optimizado
  const egresosTotales = getTotalEgresos();
  const ingresosRegistrados = getTotalIngresos();
  
  // Usar resumenIngresos en lugar de ventas
  const ingresoEfectivoTotal = resumenIngresos.ingresoEfectivo;
  const ingresoVirtualTotal = resumenIngresos.ingresoVirtual;
  const ingresosTotales = ingresoEfectivoTotal + ingresoVirtualTotal;
  
  // Mantener variables de ventas para compatibilidad
  const ventasEfectivo = getVentasEfectivo();
  const ventasVirtual = getVentasVirtual();
  const ventasTotales = ventasEfectivo + ventasVirtual;
  
  // El dinero actual ES la suma de las ventas (efectivo + virtual)
  const dineroActualTotal = ventasTotales;
  
  // Calcular ingresos totales reales (solo ingresos registrados, que ya incluyen las ventas)
  const ingresosReales = ingresosRegistrados;
  
  // Calcular rendimiento (ingresos reales - egresos)
  const rendimiento = ingresosReales - egresosTotales;

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
              {formatDinero(ingresosReales)}
            </span>
          </div>
          <div className="text-xs text-slate-400 mb-4">Ingresos Registrados (incluye ventas)</div>

          {/* Rendimiento (Ganancia/Pérdida) */}
          <div className="flex items-center justify-between mb-4">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
              </div>
              <span className="text-white text-sm font-medium">
                {esGanancia ? "Ganancia" : "Pérdida"}
              </span>
            </div>
            <span className={`text-xl font-bold ${rendimientoColor}`}>
              {formatDinero(Math.abs(rendimiento))}
            </span>
          </div>
          <div className="text-xs text-slate-400 mb-4">Ingresos Reales - Egresos</div>

          {/* Breakdown */}
          <div className="text-xs text-slate-400 mb-2">Desglose:</div>

          {/* Egresos Breakdown */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">• Egresos Totales:</span>
              <span className="text-red-400 font-medium">
                {formatDinero(egresosTotales)}
              </span>
            </div>
          </div>

          {/* Ingresos Breakdown */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">• Ingreso Efectivo:</span>
              <span className="text-green-400 font-medium">
                {formatDinero(ingresoEfectivoTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">• Ingreso Virtual:</span>
              <span className="text-green-400 font-medium">
                {formatDinero(ingresoVirtualTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-slate-600 pt-1 mt-1">
              <span className="text-slate-300 font-semibold">• Total Ingresos:</span>
              <span className="text-green-400 font-bold">
                {formatDinero(ingresosTotales)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default memo(Rendimiento);
