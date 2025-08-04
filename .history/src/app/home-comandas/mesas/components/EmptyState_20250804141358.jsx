import React from "react";

function EmptyState({ onAddTable }) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-6">
        <svg
          className="h-12 w-12 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No hay mesas creadas
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Comienza agregando tu primera mesa para gestionar los pedidos del
        restaurante
      </p>
      <button
        onClick={onAddTable}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Agregar Primera Mesa
      </button>
    </div>
  );
}

export default EmptyState;
