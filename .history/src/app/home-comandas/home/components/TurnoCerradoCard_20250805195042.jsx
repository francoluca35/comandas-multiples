"use client";
import React from "react";

function TurnoCerradoCard() {
  return (
    <div className="bg-gray-800 rounded-lg p-4 text-white">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
          <svg
            className="w-4 h-4"
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
        <span className="font-semibold">Turno Cerrado</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-gray-400 mr-2"
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
            <span className="text-sm">Nadie</span>
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-gray-400 mr-2"
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
            <span className="text-sm">Nunca</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center">
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
          Abrir
        </button>
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center">
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
          Informe
        </button>
      </div>
    </div>
  );
}

export default TurnoCerradoCard;
