"use client";
import React from "react";

const WazeTrafficInfo = () => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold text-blue-800 mb-1">
            Waze Data Feed Activado
          </h3>
          <p className="text-xs text-blue-700">
            Los datos de tráfico se actualizan cada 2 minutos desde Waze. Incluye información sobre accidentes, 
            peligros, construcciones y embotellamientos en tiempo real.
          </p>
          <p className="text-xs text-blue-600 mt-1">
            💡 <strong>Completamente gratis</strong> - Sin límites de uso
          </p>
        </div>
      </div>
    </div>
  );
};

export default WazeTrafficInfo;

