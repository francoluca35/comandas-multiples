import React from "react";

function TableCard({ table, onEdit, onDelete }) {
  const getStatusColor = (estado) => {
    switch (estado) {
      case "libre":
        return "bg-green-500";
      case "ocupado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
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

  return (
    <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
      {/* Table Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">{table.numero}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              Mesa {table.numero}
            </h3>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${getStatusColor(
                  table.estado
                )}`}
              ></div>
              <span className="text-gray-400 text-sm">
                {getStatusText(table.estado)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Details */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-400">Cliente:</span>
          <span className="text-white">
            {table.cliente || "Sin cliente"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Total:</span>
          <span className="text-white font-semibold">
            ${table.total || 0}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Productos:</span>
          <span className="text-white">
            {Object.keys(table.productos || {}).length} items
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={onEdit}
          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default TableCard; 