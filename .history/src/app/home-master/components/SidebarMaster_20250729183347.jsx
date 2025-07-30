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
        abierto ? "w-52" : "w-12"
      } relative`}
      onMouseEnter={() => setAbierto(true)}
      onMouseLeave={() => setAbierto(false)}
    >
      <div className="flex flex-col items-start h-full py-6 px-3 gap-4">
        {opciones.map((op) => (
          <button
            key={op.id}
            onClick={() => onChangeVista(op.id)}
            className="flex items-center gap-3 w-full hover:bg-gray-700 p-3 rounded text-sm font-semibold"
          >
            <span className="text-2xl">{op.icon}</span>
            {abierto && <span>{op.label}</span>}
          </button>
        ))}

        <div className="mt-auto w-full pb-4">
          <button
            onClick={() => alert("Cerrar sesión")}
            className="flex items-center gap-3 w-full hover:bg-red-700 p-3 rounded text-sm font-semibold text-white"
          >
            <span className="text-xl">
              <FaSignOutAlt />
            </span>
            {abierto && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
