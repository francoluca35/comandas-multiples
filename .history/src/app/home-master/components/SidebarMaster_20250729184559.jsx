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
  { id: "inicio", label: "Inicio", icon: <FaHome size={22} /> },
  { id: "restaurantes", label: "Restaurantes", icon: <FaStore size={22} /> },
  { id: "pagos", label: "Pagos", icon: <FaMoneyBill size={22} /> },
  { id: "historial", label: "Historial", icon: <FaHistory size={22} /> },
  { id: "activacion", label: "Act/Des", icon: <FaToggleOn size={22} /> },
];

export default function SidebarMaster({ onChangeVista }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div
      className={`h-screen bg-[#e4e4e4] text-black transition-all duration-300 ${
        abierto ? "w-48" : "w-14"
      } relative`}
      onMouseEnter={() => setAbierto(true)}
      onMouseLeave={() => setAbierto(false)}
    >
      <div className="flex flex-col justify-between h-full py-6">
        {/* Opciones */}
        <div className="flex flex-col gap-6 items-center">
          {opciones.map((op) => (
            <button
              key={op.id}
              onClick={() => onChangeVista(op.id)}
              className="flex items-center gap-4 hover:bg-black hover:text-white w-full px-4 py-2 rounded transition-colors duration-200"
            >
              <div className="flex justify-center w-6">{op.icon}</div>
              {abierto && (
                <span className="text-sm font-semibold">{op.label}</span>
              )}
            </button>
          ))}
        </div>

        {/* Cerrar sesión */}
        <div className="px-4">
          <button
            onClick={() => alert("Cerrar sesión")}
            className="flex items-center gap-4 hover:bg-black hover:text-white w-full px-2 py-2 rounded transition-colors duration-200"
          >
            <FaSignOutAlt size={22} />
            {abierto && <span className="text-sm font-semibold">Salir</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
