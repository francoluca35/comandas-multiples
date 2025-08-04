import React from "react";

function MesasHeader({ onAddTable }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Gestión de Mesas
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Administra las mesas del restaurante
        </p>
      </div>
      <button
        onClick={onAddTable}
        className="group relative inline-flex items-center px-6 py-3 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-105"
      >
        <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
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
        Agregar Mesa
      </button>
    </div>
  );
}

export default MesasHeader;
