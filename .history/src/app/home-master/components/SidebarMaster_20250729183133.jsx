"use client";
import { useState } from "react";
import {
  FaHome,
  FaStore,
  FaMoneyBill,
  FaHistory,
  FaToggleOn,
  FaSignOutAlt,
} from "react-icons/fa";

const opciones = [
  { id: "inicio", label: "Inicio", icon: <FaHome /> },
  { id: "restaurantes", label: "Restaurantes", icon: <FaStore /> },
  { id: "pagos", label: "Pagos", icon: <FaMoneyBill /> },
  { id: "historial", label: "Historial", icon: <FaHistory /> },
  { id: "activacion", label: "Act/Des", icon: <FaToggleOn /> },
];

export default function SidebarMaster({ onChangeVista }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div
      className={`h-screen bg-gray-900 text-white transition-all duration-300 ${
        abierto ? "w-48" : "w-2"
      } relative`}
      onMouseEnter={() => setAbierto(true)}
      onMouseLeave={() => setAbierto(false)}
    >
      <div className="flex flex-col items-start h-full py-4 px-2 gap-2">
        {opciones.map((op) => (
          <button
            key={op.id}
            onClick={() => onChangeVista(op.id)}
            className="flex items-center gap-2 w-full hover:bg-gray-700 p-2 rounded text-xs font-bold"
          >
            <span className="text-lg">{op.icon}</span>
            {abierto && <span>{op.label}</span>}
          </button>
        ))}

        <div className="mt-auto w-full">
          <button
            onClick={() => alert("Cerrar sesión")}
            className="flex items-center gap-2 w-full hover:bg-red-700 p-2 rounded text-xs font-bold text-white"
          >
            <span className="text-lg">
              <FaSignOutAlt />
            </span>
            {abierto && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
