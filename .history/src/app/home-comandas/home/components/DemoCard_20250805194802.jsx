"use client";
import React from "react";

function DemoCard() {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 text-white h-full">
      <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2 sm:mr-3">
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </div>
        <span className="font-semibold text-sm sm:text-base md:text-lg">Demo</span>
      </div>
      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-3 md:mb-4">Tu tiempo es lo más valioso!</h2>
      <p className="text-xs sm:text-sm md:text-base lg:text-lg mb-4 sm:mb-5 md:mb-6 opacity-90 leading-relaxed">
        Sin estrés ni riesgos, sin cablerío ni configuración, sin manuales ni
        complicaciones. Cambió el paradigma: manejá tu negocio con sólo dos
        taps!
      </p>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 md:space-x-3">
        <button className="flex-1 bg-purple-500 hover:bg-purple-600 rounded-lg px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-3 text-xs sm:text-sm md:text-base font-medium flex items-center justify-center transition-all duration-200">
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span className="hidden sm:inline">Suscribite</span>
          <span className="sm:hidden">Sub</span>
        </button>
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-3 text-xs sm:text-sm md:text-base font-medium flex items-center justify-center transition-all duration-200">
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
          <span className="hidden sm:inline">Visitanos</span>
          <span className="sm:hidden">Vis</span>
        </button>
      </div>
    </div>
  );
}

export default DemoCard;
