import React from "react";
import { useRestaurantZones } from "../../../../hooks/useRestaurantZones";

function TableCard({ table, onEdit, onDelete, onLiberarMesa }) {
  const { zonesConfig, getCurrentConfig } = useRestaurantZones();

  // Obtener configuración actual de zonas
  const currentConfig = zonesConfig
    ? getCurrentConfig()
    : {
        zones: ["adentro", "afuera"],
        labels: { adentro: "Adentro", afuera: "Afuera" },
      };

  const getStatusColor = (estado) => {
    switch (estado) {
      case "libre":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "ocupado":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "servido":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "pagado":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case "libre":
        return "Libre";
      case "ocupado":
        return "Ocupado";
      case "servido":
        return "Servido";
      case "pagado":
        return "Pagado";
      default:
        return "Libre";
    }
  };

  const getStatusDot = (estado) => {
    switch (estado) {
      case "libre":
        return "bg-emerald-400 shadow-emerald-400/50";
      case "ocupado":
        return "bg-yellow-400 shadow-yellow-400/50";
      case "servido":
        return "bg-orange-400 shadow-orange-400/50";
      case "pagado":
        return "bg-green-400 shadow-green-400/50";
      default:
        return "bg-emerald-400 shadow-emerald-400/50";
    }
  };

  const getLocationColor = (lugar) => {
    // Colores diferenciados por zona
    if (lugar === "afuera") {
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    }
    if (lugar?.includes("planta_alta")) {
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    }
    if (lugar?.includes("planta_baja")) {
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
    if (lugar === "adentro" || lugar?.includes("adentro")) {
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
    return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  };

  const getLocationText = (lugar) => {
    return currentConfig.labels[lugar] || lugar || "Sin ubicación";
  };

  return (
    <div className="group relative bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-slate-900/50">
      {/* Content */}
      <div className="relative z-10">
        {/* Header - Mobile Optimized */}
        <div className="p-4 sm:p-6 border-b border-slate-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <span className="text-white font-bold text-lg sm:text-xl">
                    {table.numero}
                  </span>
                </div>
                <div
                  className={`absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full ${getStatusDot(
                    table.estado
                  )} shadow-lg animate-pulse`}
                ></div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Mesa {table.numero}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <div
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusColor(
                      table.estado
                    )}`}
                  >
                    {getStatusText(table.estado)}
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm ${getLocationColor(
                      table.lugar
                    )}`}
                  >
                    {getLocationText(table.lugar)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details - Mobile Optimized */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-slate-700/30 rounded-lg p-3">
              <span className="text-xs sm:text-sm text-slate-400 block mb-1">
                Cliente
              </span>
              <span className="text-sm sm:text-base text-white font-medium truncate block">
                {table.cliente || "Sin cliente"}
              </span>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <span className="text-xs sm:text-sm text-slate-400 block mb-1">
                Total
              </span>
              <span className="text-base sm:text-lg text-white font-bold block">
                ${table.total || 0}
              </span>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <span className="text-xs sm:text-sm text-slate-400 block mb-1">
                Productos
              </span>
              <span className="text-sm sm:text-base text-white font-medium block">
                {Object.keys(table.productos || {}).length} items
              </span>
            </div>
          </div>
        </div>

        {/* Actions - Mobile Optimized */}
        <div className="p-4 sm:p-6 bg-slate-900/30 border-t border-slate-700/50">
          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
            <button
              onClick={onEdit}
              className="col-span-1 relative inline-flex justify-center items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/30 hover:from-amber-500/30 hover:to-amber-600/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="hidden sm:inline">Editar</span>
            </button>

            {/* Botón Liberar Mesa Manual - Solo para mesas ocupadas */}
            {(table.estado === "ocupado" ||
              table.estado === "servido" ||
              table.estado === "pagado") && (
              <button
                onClick={() => onLiberarMesa(table)}
                className="col-span-1 relative inline-flex justify-center items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-400 border border-orange-500/30 hover:from-orange-500/30 hover:to-orange-600/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 text-sm sm:text-base"
              >
                <svg
                  className="w-4 h-4 sm:mr-2"
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
                <span className="hidden sm:inline">Liberar</span>
              </button>
            )}

            <button
              onClick={onDelete}
              className={`${
                table.estado === "ocupado" ||
                table.estado === "servido" ||
                table.estado === "pagado"
                  ? "col-span-2"
                  : "col-span-1"
              } relative inline-flex justify-center items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30 hover:from-red-500/30 hover:to-red-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 text-sm sm:text-base`}
            >
              <svg
                className="w-4 h-4 sm:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TableCard;
