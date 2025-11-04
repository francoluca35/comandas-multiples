import React from "react";

function MesasHeader({ onAddTable, onVerifyStatus, onConfigZones }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Gestión de Mesas
        </h1>
        <p className="text-slate-400 mt-1 sm:mt-2 text-base sm:text-lg">
          Administra las mesas del restaurante
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Botón de Configurar Zonas - solo visible si tiene permiso */}
        {onConfigZones !== undefined && (
          <button
            onClick={onConfigZones}
            className="flex-1 sm:flex-none group relative inline-flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium shadow-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300"
          >
            <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
            <svg
              className="w-5 h-5 sm:mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="hidden sm:inline">Zonas</span>
          </button>
        )}
        <button
          onClick={onVerifyStatus}
          className="flex-1 sm:flex-none group relative inline-flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 text-white font-medium shadow-lg hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300"
        >
          <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
          <svg
            className="w-5 h-5 sm:mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="hidden sm:inline">Verificar</span>
        </button>
        <button
          onClick={onAddTable}
          className="flex-1 sm:flex-none group relative inline-flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300"
        >
          <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
          <svg
            className="w-5 h-5 sm:mr-2"
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
          <span className="hidden sm:inline">Agregar Mesa</span>
        </button>
      </div>
    </div>
  );
}

export default MesasHeader;
