import React from "react";

function TableCard({ table, onEdit, onDelete }) {
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
        return "bg-red-400 shadow-red-400/50";
      default:
        return "bg-slate-400 shadow-slate-400/50";
    }
  };

  const getLocationColor = (lugar) => {
    switch (lugar) {
      case "adentro":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "afuera":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getLocationText = (lugar) => {
    switch (lugar) {
      case "adentro":
        return "Adentro";
      case "afuera":
        return "Afuera";
      default:
        return "Sin ubicación";
    }
  };

  return (
    <div className="group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-slate-900/50">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <span className="text-white font-bold text-xl">
                    {table.numero}
                  </span>
                </div>
                <div
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStatusDot(
                    table.estado
                  )} shadow-lg animate-pulse`}
                ></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Mesa {table.numero}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-slate-400">
                    {getStatusText(table.estado)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getStatusColor(
                  table.estado
                )}`}
              >
                {getStatusText(table.estado)}
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getLocationColor(
                  table.lugar
                )}`}
              >
                {getLocationText(table.lugar)}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-400">Cliente:</span>
            <span className="text-sm text-white font-semibold">
              {table.cliente || "Sin cliente"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-400">Total:</span>
            <span className="text-xl font-bold text-white">
              ${table.total || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-400">
              Productos:
            </span>
            <span className="text-sm text-white font-semibold">
              {Object.keys(table.productos || {}).length} items
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-5 bg-slate-900/30 border-t border-slate-700/50">
          <div className="flex space-x-3">
            <button
              onClick={onEdit}
              className="flex-1 group/btn relative inline-flex justify-center items-center px-4 py-3 overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/30 hover:from-amber-500/30 hover:to-amber-600/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105"
            >
              <svg
                className="w-4 h-4 mr-2"
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
              Editar
            </button>
            <button
              onClick={onDelete}
              className="flex-1 group/btn relative inline-flex justify-center items-center px-4 py-3 overflow-hidden rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30 hover:from-red-500/30 hover:to-red-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105"
            >
              <svg
                className="w-4 h-4 mr-2"
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
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TableCard;
