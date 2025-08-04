"use client";
import React, { useState } from "react";

function MesasView({ onMesaClick }) {
  const [activeMode, setActiveMode] = useState("salon");
  const [activeFilter, setActiveFilter] = useState("todas");

  // Generar 50 mesas (001-050)
  const mesas = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    numero: String(i + 1).padStart(3, "0"),
    activa: i === 0, // Solo la mesa 001 está activa
    monto: i === 0 ? 2250 : 0,
    cantidad: i === 0 ? 1 : 0,
    usuario: i === 0 ? "admin" : "",
    fecha: i === 0 ? "29 jul 20:15" : "",
  }));

  const modes = [
    { id: "salon", name: "Salón", icon: "table" },
    { id: "takeaway", name: "Takeaway", icon: "bag" },
    { id: "delivery", name: "Delivery", icon: "truck" },
  ];

  const filters = [
    { id: "grilla", name: "Grilla+" },
    { id: "z1", name: "Z1" },
    { id: "todas", name: "Todas" },
  ];

  const actions = [
    { id: "proformas", name: "Proformas", icon: "dollar" },
    { id: "historial", name: "Historial salón", icon: "clock" },
    { id: "grid", name: "", icon: "grid" },
  ];

  const getTableIcon = () => (
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
        d="M6 8h12M6 8v8M18 8v8"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v8"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10c0-1.1.9-2 2-2s2 .9 2 2v4c0 1.1-.9 2-2 2s-2-.9-2-2v-4z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 10c0-1.1.9-2 2-2s2 .9 2 2v4c0 1.1-.9 2-2 2s-2-.9-2-2v-4z"
      />
    </svg>
  );

  const getIcon = (iconName) => {
    switch (iconName) {
      case "table":
        return getTableIcon();
      case "bag":
        return (
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
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        );
      case "truck":
        return (
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
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
          </svg>
        );
      case "dollar":
        return (
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        );
      case "clock":
        return (
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "grid":
        return (
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
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header Navigation */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Mode Selection */}
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                activeMode === mode.id
                  ? "bg-white text-gray-900 border-2 border-blue-400"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              {getIcon(mode.icon)}
              <span className="font-medium">{mode.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {/* Filters */}
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === filter.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              {filter.name}
            </button>
          ))}

          {/* Actions */}
          {actions.map((action) => (
            <button
              key={action.id}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              {getIcon(action.icon)}
              {action.name && <span>{action.name}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Mesas Grid */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-7 gap-4">
          {mesas.map((mesa) => (
            <div
              key={mesa.id}
              onClick={() => onMesaClick(mesa)}
              className={`relative cursor-pointer rounded-lg p-4 transition-all hover:scale-105 ${
                mesa.activa
                  ? "bg-pink-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {/* Mesa Number */}
              <div className="text-center font-bold text-lg mb-2">
                {mesa.numero}
              </div>

              {/* Active Mesa Info */}
              {mesa.activa && (
                <div className="text-sm space-y-1">
                  <div className="font-semibold">$ {mesa.monto}</div>
                  <div>X{mesa.cantidad}</div>
                  <div>{mesa.usuario}</div>
                  <div className="text-xs opacity-80">{mesa.fecha}</div>
                </div>
              )}

              {/* Status Dot */}
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MesasView;
