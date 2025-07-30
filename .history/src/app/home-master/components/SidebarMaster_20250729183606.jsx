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
      className={`h-screen bg-[#e1e1e1] text-black transition-all duration-300 ${
        abierto ? "w-48" : "w-14"
      } relative z-20`}
      onMouseEnter={() => setAbierto(true)}
      onMouseLeave={() => setAbierto(false)}
    >
      <div className="flex flex-col items-center h-full py-4 px-2 gap-3">
        {opciones.map((op) => (
          <button
            key={op.id}
            onClick={() => onChangeVista(op.id)}
            className={`flex items-center ${
              abierto ? "justify-start" : "justify-center"
            } gap-3 w-full hover:bg-gray-300 p-2 rounded text-sm font-bold transition-all`}
          >
            <span className="text-xl">{op.icon}</span>
            {abierto && <span>{op.label}</span>}
          </button>
        ))}

        <div className="mt-auto w-full">
          <button
            onClick={() => alert("Cerrar sesión")}
            className={`flex items-center ${
              abierto ? "justify-start" : "justify-center"
            } gap-3 w-full hover:bg-red-600 p-2 rounded text-sm font-bold text-black`}
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
