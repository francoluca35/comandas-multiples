"use client";
import React, { useState, useEffect } from "react";

function MesasView({ onMesaClick, activeMode = "salon", mesasOcupadas = new Set(), onMesaOcupadaClick }) {
  // Generar 50 mesas (001-050)
  const mesas = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    numero: String(i + 1).padStart(3, "0"),
    activa: i === 0, // Solo la mesa 001 está activa por defecto
  }));

  const handleMesaClick = (mesa) => {
    if (mesasOcupadas.has(mesa.numero)) {
      // Si la mesa está ocupada, llamar a la función específica para mesas ocupadas
      onMesaOcupadaClick(mesa);
    } else {
      // Si la mesa está libre, llamar a la función normal
      onMesaClick(mesa);
    }
  };

  return (
    <div className="h-full p-6 bg-gray-100">
      <div className="grid grid-cols-7 gap-4">
        {mesas.map((mesa) => {
          const isOcupada = mesasOcupadas.has(mesa.numero);
          
          return (
            <button
              key={mesa.id}
              onClick={() => handleMesaClick(mesa)}
              className={`relative p-4 rounded-lg transition-all duration-200 ${
                isOcupada
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-white text-gray-800 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-bold">{mesa.numero}</div>
                {isOcupada && (
                  <>
                    <div className="text-sm font-medium">OCUPADA</div>
                    <div className="text-xs opacity-90">En uso</div>
                  </>
                )}
              </div>
              
              {/* Indicador de estado */}
              <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full ${
                isOcupada ? "bg-white" : "bg-gray-400"
              }`}></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MesasView;
