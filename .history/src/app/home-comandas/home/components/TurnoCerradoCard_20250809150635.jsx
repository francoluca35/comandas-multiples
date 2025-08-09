"use client";
import React, { useState, useEffect } from "react";
import { useTurno } from "../../../context/TurnoContext";

function TurnoCard() {
  const { turnoAbierto, turnoInfo, abrirTurno, cerrarTurno, obtenerDuracionTurno } = useTurno();
  const [duracion, setDuracion] = useState("0 min");

  // Actualizar duración cada minuto cuando el turno esté abierto
  useEffect(() => {
    if (turnoAbierto) {
      setDuracion(obtenerDuracionTurno());
      const interval = setInterval(() => {
        setDuracion(obtenerDuracionTurno());
      }, 60000); // Actualizar cada minuto

      return () => clearInterval(interval);
    }
  }, [turnoAbierto, obtenerDuracionTurno]);

  const handleAbrirTurno = () => {
    if (abrirTurno()) {
      console.log("Turno abierto exitosamente");
    }
  };

  const handleCerrarTurno = () => {
    if (confirm("¿Estás seguro de que quieres cerrar el turno?")) {
      cerrarTurno();
      console.log("Turno cerrado exitosamente");
    }
  };

  if (turnoAbierto) {
    // Mostrar turno abierto
    return (
      <div className="bg-green-800 rounded-lg p-6 text-white">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="font-semibold">Turno Abierto</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-green-700 rounded-lg p-3">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-green-300 mr-2"
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
              <span className="text-sm">{turnoInfo?.usuario || "Usuario"}</span>
            </div>
          </div>
          <div className="bg-green-700 rounded-lg p-3">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-green-300 mr-2"
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
              <span className="text-sm">{turnoInfo?.horaApertura || "Hora"}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-700 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-300 mr-2"
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
            <span className="text-sm font-medium">Duración: {duracion}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button 
            onClick={handleCerrarTurno}
            className="flex-1 bg-red-600 hover:bg-red-700 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cerrar
          </button>
          <button className="flex-1 bg-green-700 hover:bg-green-600 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center">
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

  // Mostrar turno cerrado
  return (
    <div className="bg-gray-800 rounded-lg p-6 text-white">
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
      
      <div className="grid grid-cols-2 gap-3 mb-6">
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
      
      <div className="flex space-x-3">
        <button 
          onClick={handleAbrirTurno}
          className="flex-1 bg-teal-600 hover:bg-teal-700 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center"
        >
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
        <button className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center">
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

export default TurnoCard;
