import React from "react";

function EmptyState({ onAddTable }) {
  return (
    <div className="text-center py-20">
      <div className="relative mx-auto flex items-center justify-center h-32 w-32 mb-8">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-full p-8 border border-slate-700/50 shadow-2xl">
          <svg
            className="h-16 w-16 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">
        No hay mesas creadas
      </h3>
      <p className="text-slate-400 mb-10 max-w-md mx-auto text-lg">
        Comienza agregando tu primera mesa para gestionar los pedidos del
        restaurante
      </p>
      <button
        onClick={onAddTable}
        className="group relative inline-flex items-center px-8 py-4 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-105"
      >
        <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
        <svg
          className="w-6 h-6 mr-3"
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
