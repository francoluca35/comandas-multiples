"use client";
import { useState } from "react";

export default function SidebarMaster({ onChangeVista }) {
  const opciones = [
    { id: "inicio", label: "Inicio" },
    { id: "restaurantes", label: "Restaurantes" },
    { id: "pagos", label: "Pagos" },
    { id: "historial", label: "Historial" },
    { id: "activacion", label: "Act/Des" },
  ];

  return (
    <div className="w-40 bg-gray-200 h-screen flex flex-col p-2 text-xs font-bold">
      {opciones.map((op) => (
        <button
          key={op.id}
          onClick={() => onChangeVista(op.id)}
          className="py-2 hover:bg-gray-400 rounded"
        >
          {op.label}
        </button>
      ))}
      <div className="mt-auto text-[10px] text-gray-600 italic">io...</div>
    </div>
  );
}
