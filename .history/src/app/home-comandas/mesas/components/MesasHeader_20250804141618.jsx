import React from "react";

function MesasHeader({ onAddTable }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Mesas</h1>
        <p className="text-gray-600 mt-1">
          Administra las mesas del restaurante
        </p>
      </div>
      <button
        onClick={onAddTable}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m
 0H6"
          />
        </svg>
        Agregar Mesa
      </button>
    </div>
  );
}

export default MesasHeader;
