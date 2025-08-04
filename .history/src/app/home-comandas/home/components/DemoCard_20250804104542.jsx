import React from "react";

function DemoCard() {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-6 text-white">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
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
        <span className="font-semibold">Demo</span>
      </div>
      <h2 className="text-xl font-bold mb-3">Tu tiempo es lo más valioso!</h2>
      <p className="text-sm mb-6 opacity-90">
        Sin estrés ni riesgos, sin cablerío ni configuración, sin manuales ni
        complicaciones. Cambió el paradigma: manejá tu negocio con sólo dos
        taps!
      </p>
      <div className="flex space-x-3">
        <button className="flex-1 bg-purple-500 hover:bg-purple-600 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center">
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Suscribite
        </button>
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center">
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
          Visitanos
        </button>
      </div>
    </div>
  );
}

export default DemoCard;
