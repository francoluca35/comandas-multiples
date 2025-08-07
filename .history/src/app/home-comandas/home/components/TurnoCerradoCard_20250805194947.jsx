"use client";
import React from "react";

function TurnoCerradoCard() {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white shadow-lg border border-gray-700">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-lg">Turno Cerrado</h3>
          <p className="text-gray-400 text-sm">Sistema inactivo</p>
        </div>
      </div>

      {/* Status Info */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6 border border-gray-600">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-4 h-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-300 text-xs font-medium">USUARIO</p>
              <p className="text-white text-sm">Nadie conectado</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-4 h-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-300 text-xs font-medium">ÚLTIMO ACCESO</p>
              <p className="text-white text-sm">Nunca</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg px-4 py-3 text-sm font-semibold flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          Abrir Turno
        </button>
        <button className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-lg px-4 py-3 text-sm font-semibold flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Ver Informe
        </button>
      </div>
    </div>
  );
}

export default TurnoCerradoCard;
