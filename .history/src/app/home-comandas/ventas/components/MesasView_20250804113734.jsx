"use client";
import React, { useState, useEffect } from "react";

function MesasView({ onMesaClick, activeMode = "salon" }) {
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

  return (
    <div className="h-full flex flex-col">
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
