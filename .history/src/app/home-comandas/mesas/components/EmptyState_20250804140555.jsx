import React from "react";

function EmptyState({ onAddTable }) {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-12 h-12 text-gray-400"
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
      <h3 className="text-xl font-semibold text-white mb-2">
        No hay mesas creadas
      </h3>
      <p className="text-gray-400 mb-6">
        Comienza agregando tu primera mesa
      </p>
      <button
        onClick={onAddTable}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
      >
        Agregar Primera Mesa
      </button>
    </div>
  );
}

export default EmptyState; 