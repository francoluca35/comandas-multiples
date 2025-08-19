"use client";
import React, { useState, useEffect } from "react";
import { useTurno } from "../../../context/TurnoContext";

function TurnoCard() {
  const {
    turnoAbierto,
    turnoInfo,
    abrirTurno,
    cerrarTurno,
    obtenerDuracionTurno,
    loading,
  } = useTurno();

  // Obtener usuario directamente del localStorage para el sistema de restaurantes
  const [usuarioActual, setUsuarioActual] = useState("No identificado");

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    const nombreCompleto = localStorage.getItem("nombreCompleto");

    if (usuario) {
      setUsuarioActual(nombreCompleto || usuario);
    } else {
      setUsuarioActual("No identificado");
    }
  }, []);

  const [duracion, setDuracion] = useState("0 min");

  // Mostrar loading mientras se carga el contexto
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-white shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg
              className="w-10 h-10 text-gray-400"
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
          <h2 className="text-2xl font-bold mb-2">Cargando...</h2>
          <p className="text-gray-300">Verificando estado del turno</p>
        </div>
      </div>
    );
  }

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
      // Mostrar mensaje de confirmación
      alert(
        "¡Turno abierto exitosamente! Ya puedes usar la aplicación completa."
      );
    } else {
      alert("Error al abrir el turno. Por favor, inténtalo de nuevo.");
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
              <span className="text-sm">
                {turnoInfo?.horaApertura || "Hora"}
              </span>
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

  // Mostrar turno cerrado con diseño mejorado
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 text-white shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Turno Cerrado</h2>
        <p className="text-gray-300">
          Debes abrir un turno para usar la aplicación
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-blue-400 mr-3"
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
            <div>
              <p className="text-sm text-gray-300">Usuario actual</p>
              <p className="font-medium">{usuarioActual}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-400 mr-3"
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
            <div>
              <p className="text-sm text-gray-300">Hora actual</p>
              <p className="font-medium">
                {new Date().toLocaleString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleAbrirTurno}
          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-lg px-6 py-3 text-lg font-semibold flex items-center justify-center shadow-lg transform transition-all duration-200 hover:scale-105"
        >
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          Abrir Turno
        </button>

        <button className="w-full bg-gray-700 hover:bg-gray-600 rounded-lg px-6 py-3 text-lg font-medium flex items-center justify-center transition-colors duration-200">
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Ver Informes
        </button>
      </div>
    </div>
  );
}

export default TurnoCard;
