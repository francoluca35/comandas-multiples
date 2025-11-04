"use client";
import React, { useState, useEffect, memo } from "react";
import { useInventario } from "../../../../hooks/useInventario";

function InventarioStats({ onToggle, isExpanded, formatDinero }) {
  const { bebidas, materiaPrima, loading, error, getInventarioStats } =
    useInventario();

  const [stats, setStats] = useState({
    valorEnStock: 0,
    costoStock: 0,
    ganancia: 0,
    stockBajo: 0,
    sinStock: 0,
  });

  // Calcular estadísticas cuando cambien los datos
  useEffect(() => {
    if (bebidas.length > 0 || materiaPrima.length > 0) {
      const inventarioStats = getInventarioStats();
      setStats({
        valorEnStock: inventarioStats.valorEnStock,
        costoStock: inventarioStats.costoStock,
        ganancia: inventarioStats.ganancia,
        stockBajo: inventarioStats.stockBajo,
        sinStock: inventarioStats.sinStock,
      });
    }
  }, [bebidas, materiaPrima]);

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-slate-900/50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3 text-white">
            Cargando estadísticas de inventario...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-slate-900/50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-white">{error}</p>
        </div>
      </div>
    );
  }

  const metricas = [
    {
      id: "valorEnStock",
      titulo: "Valor en Stock",
      valor: stats.valorEnStock,
      color: "text-green-400",
      icono: "📊",
      descripcion: "Cantidad × Precio de venta",
    },
    {
      id: "costoStock",
      titulo: "Costo Stock",
      valor: stats.costoStock,
      color: "text-orange-400",
      icono: "📊",
      descripcion: "Cantidad × Costo",
    },
    {
      id: "ganancia",
      titulo: "Ganancia",
      valor: stats.ganancia,
      color: stats.ganancia >= 0 ? "text-green-400" : "text-red-400",
      icono: "📈",
      descripcion: "Valor - Costo",
    },
    {
      id: "stockBajo",
      titulo: "Stock Bajo",
      valor: stats.stockBajo,
      color: "text-orange-400",
      icono: "⚠️",
      descripcion: "Productos con stock bajo",
    },
    {
      id: "sinStock",
      titulo: "Sin Stock",
      valor: stats.sinStock,
      color: "text-red-400",
      icono: "❌",
      descripcion: "Productos sin stock",
    },
  ];

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 sm:p-6 shadow-2xl shadow-slate-900/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/25">
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
            <h2 className="text-xl font-bold text-white">
              Estadísticas de Inventario
            </h2>
          </div>
          <p className="text-sm text-white mt-2 ml-11">
            Ganancias estimadas en cuanto stock tengamos
          </p>
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

      {isExpanded && (
        <div className="space-y-4">
          {/* Lista de métricas */}
          <div className="space-y-3">
            {metricas.map((metrica) => (
              <div
                key={metrica.id}
                className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div className="flex items-start sm:items-center space-x-3">
                    <div className="text-2xl">{metrica.icono}</div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {metrica.titulo}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {metrica.descripcion}
                      </p>
                    </div>
                  </div>
                  <div className="text-right mt-3 sm:mt-0">
                    <div className={`text-2xl font-bold ${metrica.color}`}>
                      {metrica.id === "stockBajo" || metrica.id === "sinStock"
                        ? metrica.valor
                        : formatDinero(metrica.valor)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Información adicional */}
          <div className="pt-4 border-t border-slate-600/30">
            <div className="text-center text-slate-400 text-sm">
              <p>📊 Datos calculados en tiempo real desde el inventario</p>
              <p className="text-xs mt-1">
                Bebidas: {bebidas.length} | Materia Prima: {materiaPrima.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(InventarioStats);
