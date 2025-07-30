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
      <div className="flex flex-col justify-between h-full py-4">
        <div className="flex flex-col gap-6">
          {opciones.map((op) => (
            <button
              key={op.id}
              onClick={() => onChangeVista(op.id)}
              className={`flex items-center ${
                abierto ? "justify-start" : "justify-center"
              }  w-full hover:bg-gray-300 p-2  rounded text-sm font-bold px-4`}
            >
              <span className="text-4xl">{op.icon}</span>
              {abierto && <span>{op.label}</span>}
            </button>
          ))}
        </div>

        <div className="px-2">
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
