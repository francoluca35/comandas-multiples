"use client";
import React, { useState } from "react";

function NavigationBar({
  activeMode,
  onModeChange,
  activeFilter = "todas",
  onFilterChange,
}) {
  const [localActiveFilter, setLocalActiveFilter] = useState(activeFilter);

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
    { id: "search", name: "", icon: "search" },
  ];

  const deliveryActions = [
    { id: "proformas", name: "Proformas", icon: "dollar" },
    { id: "cadeteria", name: "Cadetería", icon: "helmet" },
    { id: "historial", name: "Historial salón", icon: "clock" },
    { id: "search", name: "", icon: "search" },
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
      case "helmet":
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
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
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
      case "search":
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleModeChange = (modeId) => {
    onModeChange(modeId);
  };

  const handleFilterChange = (filterId) => {
    setLocalActiveFilter(filterId);
    if (onFilterChange) {
      onFilterChange(filterId);
    }
  };

  const handleSearch = () => {
    // Función para abrir el buscador
    console.log("Abrir buscador");
  };

  const handleCadeteria = () => {
    // Función para seleccionar chofer de delivery
    console.log("Seleccionar chofer de delivery");
  };

  // Determinar qué acciones mostrar según el modo
  const currentActions = activeMode === "delivery" ? deliveryActions : actions;

  return (
    <div className="bg-gray-800 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {/* Mode Selection */}
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode.id)}
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
        {/* Filters - Only show in Salón mode */}
        {activeMode === "salon" && (
          <>
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  localActiveFilter === filter.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                {filter.name}
              </button>
            ))}
          </>
        )}

        {/* Actions - Dynamic based on mode */}
        {currentActions.map((action) => (
          <button
            key={action.id}
            onClick={
              action.id === "search"
                ? handleSearch
                : action.id === "cadeteria"
                ? handleCadeteria
                : undefined
            }
            className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            {getIcon(action.icon)}
            {action.name && <span>{action.name}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default NavigationBar;
