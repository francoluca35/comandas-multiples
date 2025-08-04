import React from "react";

function TableCard({ table, onEdit, onDelete }) {
  const getStatusColor = (estado) => {
    switch (estado) {
      case "libre":
        return "bg-green-100 text-green-800 border-green-200";
      case "ocupado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case "libre":
        return "Libre";
      case "ocupado":
        return "Ocupado";
      default:
        return "Desconocido";
    }
  };

  const getStatusDot = (estado) => {
    switch (estado) {
      case "libre":
        return "bg-green-400";
      case "ocupado":
        return "bg-red-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">{table.numero}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Mesa {table.numero}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${getStatusDot(table.estado)}`}></div>
                <span className="text-sm text-gray-500">
                  {getStatusText(table.estado)}
                </span>
              </div>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(table.estado)}`}>
            {getStatusText(table.estado)}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-6 py-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">Cliente:</span>
          <span className="text-sm text-gray-900 font-medium">
            {table.cliente || "Sin cliente"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">Total:</span>
          <span className="text-lg font-bold text-gray-900">
            ${table.total || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">Productos:</span>
          <span className="text-sm text-gray-900 font-medium">
            {Object.keys(table.productos || {}).length} items
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
          <button
            onClick={onDelete}
            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TableCard;
