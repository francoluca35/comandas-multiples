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
  { id: "inicio", label: "Inicio", icon: FaHome },
  { id: "restaurantes", label: "Restaurantes", icon: FaStore },
  { id: "pagos", label: "Pagos", icon: FaMoneyBill },
  { id: "historial", label: "Historial", icon: FaHistory },
  { id: "activacion", label: "Act/Des", icon: FaToggleOn },
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
      <div className="flex flex-col justify-between h-full py-6 mt-10">
        {/* Opciones */}
        <div
          className={`flex flex-col  ${
            abierto ? "items-start px-3" : "items-center"
          } flex-1  gap-10 `}
        >
          {opciones.map((op) => {
            const IconComponent = op.icon;
            return (
              <button
                key={op.id}
                onClick={() => onChangeVista(op.id)}
                className={`flex  items-center gap-4 w-full transition-all duration-200 ${
                  abierto
                    ? "justify-start hover:bg-black hover:text-white px-3 py-1.5 rounded"
                    : "justify-center "
                }`}
              >
                <IconComponent size={abierto ? 28 : 32} />
                {abierto && (
                  <span className="text-sm font-semibold">{op.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Cerrar sesión */}
        <div className={abierto ? "px-3" : "flex justify-center"}>
          <button
            onClick={() => alert("Cerrar sesión")}
            className={`flex items-center gap-4 hover:bg-black hover:text-white w-full px-3 py-2 rounded transition-all duration-200 ${
              abierto ? "justify-start" : "justify-center"
            }`}
          >
            <FaSignOutAlt size={abierto ? 28 : 32} />
            {abierto && <span className="text-sm font-semibold">Salir</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
