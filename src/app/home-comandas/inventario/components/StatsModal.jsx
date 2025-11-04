import React from "react";
import { FaChartBar, FaTimes } from "react-icons/fa";

const StatsModal = ({ isOpen, onClose, stats, formatCurrency }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">
            Estadísticas del Inventario
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-4">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaChartBar className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300">Valor en Stock</span>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(stats.valorEnStock)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Cantidad × Precio de venta
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaChartBar className="w-4 h-4 text-orange-400" />
              <span className="text-slate-300">Costo Stock</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">
              {formatCurrency(stats.costoStock)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Cantidad × Costo</p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaChartBar className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">Ganancia</span>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(stats.ganancia)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Valor - Costo</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-slate-300">Stock Bajo</span>
              </div>
              <p className="text-2xl font-bold text-orange-400">
                {stats.stockBajo}
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-slate-300">Sin Stock</span>
              </div>
              <p className="text-2xl font-bold text-red-400">
                {stats.sinStock}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
