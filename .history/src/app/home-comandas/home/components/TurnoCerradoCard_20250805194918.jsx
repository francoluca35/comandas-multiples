"use client";
import React from "react";

function TurnoCerradoCard() {
  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6 text-white">
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
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
        <span className="font-semibold text-sm sm:text-base">
          Turno Cerrado
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="bg-gray-700 rounded-lg p-2 sm:p-3">
          <div className="flex items-center">
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2"
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
            <span className="text-xs sm:text-sm">nadie</span>
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-2 sm:p-3">
          <div className="flex items-center">
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2"
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
            <span className="text-xs sm:text-sm">nunca</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
        <button className="flex-1 bg-teal-600 hover:bg-teal-700 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-center transition-colors duration-200">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
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
        <button className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-center transition-colors duration-200">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
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
