"use client";
import React from 'react';
import { FaDollarSign, FaChartLine, FaBoxes, FaExclamationTriangle } from 'react-icons/fa';

export default function FinancialStats({ stats }) {
  const {
    valorEnStock,
    costoStock,
    ganancia,
    gananciaPorcentual,
    totalItems,
    itemsConStock,
    itemsSinStock,
  } = stats;

  return (
    <div className="bg-slate-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <FaDollarSign className="mr-2" />
        Estadísticas Financieras
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Valor en Stock */}
        <div className="bg-slate-800 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FaBoxes className="text-blue-400" />
            <span className="text-xs text-slate-400">Valor</span>
          </div>
          <div className="text-white text-lg font-bold">
            ${valorEnStock.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">
            En inventario
          </div>
        </div>

        {/* Costo de Stock */}
        <div className="bg-slate-800 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FaDollarSign className="text-red-400" />
            <span className="text-xs text-slate-400">Costo</span>
          </div>
          <div className="text-white text-lg font-bold">
            ${costoStock.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">
            Inversión total
          </div>
        </div>

        {/* Ganancia */}
        <div className="bg-slate-800 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FaChartLine className="text-green-400" />
            <span className="text-xs text-slate-400">Ganancia</span>
          </div>
          <div className={`text-lg font-bold ${ganancia >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${ganancia.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">
            {gananciaPorcentual.toFixed(1)}% margen
          </div>
        </div>

        {/* Items con Stock */}
        <div className="bg-slate-800 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FaBoxes className="text-purple-400" />
            <span className="text-xs text-slate-400">Stock</span>
          </div>
          <div className="text-white text-lg font-bold">
            {itemsConStock}/{totalItems}
          </div>
          <div className="text-xs text-slate-400">
            Con inventario
          </div>
        </div>
      </div>

      {/* Detalles adicionales */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 p-3 rounded-lg">
          <h4 className="text-sm font-semibold text-white mb-2">Análisis de Rentabilidad</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Margen de ganancia:</span>
              <span className={`font-semibold ${gananciaPorcentual >= 20 ? 'text-green-400' : gananciaPorcentual >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                {gananciaPorcentual.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ROI estimado:</span>
              <span className={`font-semibold ${gananciaPorcentual >= 20 ? 'text-green-400' : gananciaPorcentual >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                {costoStock > 0 ? (ganancia / costoStock * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Valor promedio por item:</span>
              <span className="text-white font-semibold">
                ${totalItems > 0 ? (valorEnStock / totalItems).toFixed(2) : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Costo promedio por item:</span>
              <span className="text-white font-semibold">
                ${totalItems > 0 ? (costoStock / totalItems).toFixed(2) : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-3 rounded-lg">
          <h4 className="text-sm font-semibold text-white mb-2">Estado del Inventario</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Items con stock:</span>
              <span className="text-green-400 font-semibold">{itemsConStock}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Items sin stock:</span>
              <span className="text-red-400 font-semibold">{itemsSinStock}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tasa de disponibilidad:</span>
              <span className={`font-semibold ${(itemsConStock / totalItems * 100) >= 80 ? 'text-green-400' : (itemsConStock / totalItems * 100) >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {totalItems > 0 ? (itemsConStock / totalItems * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total de items:</span>
              <span className="text-white font-semibold">{totalItems}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas y recomendaciones */}
      <div className="mt-4 space-y-2">
        {gananciaPorcentual < 10 && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-400 mr-2" />
              <div>
                <div className="text-red-400 font-semibold text-sm">Margen de ganancia bajo</div>
                <div className="text-red-300 text-xs">Considera revisar precios o costos</div>
              </div>
            </div>
          </div>
        )}

        {itemsSinStock > totalItems * 0.2 && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-yellow-400 mr-2" />
              <div>
                <div className="text-yellow-400 font-semibold text-sm">Muchos items sin stock</div>
                <div className="text-yellow-300 text-xs">Considera reabastecer inventario</div>
              </div>
            </div>
          </div>
        )}

        {gananciaPorcentual >= 20 && itemsConStock > totalItems * 0.8 && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center">
              <FaChartLine className="text-green-400 mr-2" />
              <div>
                <div className="text-green-400 font-semibold text-sm">Inventario saludable</div>
                <div className="text-green-300 text-xs">Excelente margen y disponibilidad</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tips de optimización financiera */}
      <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 Tips de Optimización Financiera</h4>
        <ul className="text-xs text-slate-300 space-y-1">
          <li>• Mantén un margen de ganancia mínimo del 15%</li>
          <li>• Revisa regularmente los items sin stock</li>
          <li>• Optimiza precios basado en la demanda</li>
          <li>• Considera descuentos por volumen en compras</li>
        </ul>
      </div>
    </div>
  );
}
