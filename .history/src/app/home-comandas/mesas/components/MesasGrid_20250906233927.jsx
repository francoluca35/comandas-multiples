import React, { useState } from "react";
import TableCard from "./TableCard";

function MesasGrid({ tables, onEditTable, onDeleteTable, onLiberarMesa }) {
  const [locationFilter, setLocationFilter] = useState("todas"); // "todas", "afuera", "adentro"

  // Filtrar mesas según la ubicación seleccionada
  const filteredTables = tables.filter((table) => {
    if (locationFilter === "todas") return true;
    return table.lugar === locationFilter;
  });

  return (
    <div>
      {/* Botonera de ubicación */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-700/50 rounded-lg p-1 flex backdrop-blur-sm">
          <button
            onClick={() => setLocationFilter("todas")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              locationFilter === "todas"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-300 hover:text-white hover:bg-slate-600/50"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setLocationFilter("adentro")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              locationFilter === "adentro"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-300 hover:text-white hover:bg-slate-600/50"
            }`}
          >
            Adentro
          </button>
          <button
            onClick={() => setLocationFilter("afuera")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              locationFilter === "afuera"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-300 hover:text-white hover:bg-slate-600/50"
            }`}
          >
            Afuera
          </button>
        </div>
      </div>

      {/* Grid de mesas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredTables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onEdit={() => onEditTable(table)}
            onDelete={() => onDeleteTable(table)}
            onLiberarMesa={onLiberarMesa}
          />
        ))}
      </div>

      {/* Mensaje cuando no hay mesas con el filtro seleccionado */}
      {filteredTables.length === 0 && (
        <div className="text-center mt-12">
          <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <p className="text-slate-400 text-lg">
            No hay mesas en la ubicación "
            {locationFilter === "todas"
              ? "todas"
              : locationFilter === "adentro"
              ? "adentro"
              : "afuera"}
            "
          </p>
        </div>
      )}
    </div>
  );
}

export default MesasGrid;
