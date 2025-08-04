import React from "react";

function MesasHeader({ onAddTable }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Gestión de Mesas</h1>
        <p className="text-gray-400 mt-2">
          Administra las mesas del restaurante
        </p>
      </div>
      <button
        onClick={onAddTable}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
      >
        <svg
          className="w-5 h-5"
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
        <span>Agregar Mesa</span>
      </button>
    </div>
  );
}

export default MesasHeader; 