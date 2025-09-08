import React from "react";

function TableCard({ table, onEdit, onDelete, onLiberarMesa }) {
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
    <div className="group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-slate-900/50 transform hover:scale-105">
      {/* Gradient overlay mejorado */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header mejorado */}
        <div className="px-6 py-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-black text-2xl">
                    {table.numero}
                  </span>
                </div>
                <div
                  className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${getStatusDot(
                    table.estado
                  )} shadow-lg animate-pulse border-2 border-slate-800`}
                ></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Mesa {table.numero}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-400">
                    {getStatusText(table.estado)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <div
                className={`px-4 py-2 rounded-full text-sm font-semibold border backdrop-blur-sm ${getStatusColor(
                  table.estado
                )} shadow-lg`}
              >
                {getStatusText(table.estado)}
              </div>
              <div
                className={`px-4 py-2 rounded-full text-sm font-semibold border backdrop-blur-sm ${getLocationColor(
                  table.lugar
                )} shadow-lg`}
              >
                {getLocationText(table.lugar)}
              </div>
            </div>
          </div>
        </div>

        {/* Details mejorados */}
        <div className="px-6 py-6 space-y-4">
          <div className="flex justify-between items-center bg-slate-700/30 rounded-lg px-4 py-3">
            <span className="text-sm font-medium text-slate-400 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Cliente:
            </span>
            <span className="text-sm text-white font-semibold">
              {table.cliente || "Sin cliente"}
            </span>
          </div>
          <div className="flex justify-between items-center bg-slate-700/30 rounded-lg px-4 py-3">
            <span className="text-sm font-medium text-slate-400 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Total:
            </span>
            <span className="text-xl font-bold text-white">
              ${table.total || 0}
            </span>
          </div>
          <div className="flex justify-between items-center bg-slate-700/30 rounded-lg px-4 py-3">
            <span className="text-sm font-medium text-slate-400 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Productos:
            </span>
            <span className="text-sm text-white font-semibold">
              {Object.keys(table.productos || {}).length} items
            </span>
          </div>
        </div>

        {/* Actions mejorados */}
        <div className="px-6 py-6 bg-slate-900/30 border-t border-slate-700/50">
          <div className="flex space-x-3">
            <button
              onClick={onEdit}
              className="flex-1 group/btn relative inline-flex justify-center items-center px-4 py-3 overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/30 hover:from-amber-500/30 hover:to-amber-600/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
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
            
            {/* Botón Liberar Mesa Manual - Solo para mesas ocupadas */}
            {(table.estado === "ocupado" || table.estado === "servido" || table.estado === "pagado") && (
              <button
                onClick={() => onLiberarMesa(table)}
                className="flex-1 group/btn relative inline-flex justify-center items-center px-4 py-3 overflow-hidden rounded-xl bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-400 border border-orange-500/30 hover:from-orange-500/30 hover:to-orange-600/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Liberar
              </button>
            )}
            
            <button
              onClick={onDelete}
              className="flex-1 group/btn relative inline-flex justify-center items-center px-4 py-3 overflow-hidden rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30 hover:from-red-500/30 hover:to-red-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
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
