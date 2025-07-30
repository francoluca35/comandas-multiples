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
  const [opcionActiva, setOpcionActiva] = useState("inicio");

  return (
    <div
      className={`h-screen bg-[#111] text-white transition-all duration-300 ${
        abierto ? "w-48" : "w-16"
      } relative`}
      onMouseEnter={() => setAbierto(true)}
      onMouseLeave={() => setAbierto(false)}
    >
      <div className="flex flex-col justify-between h-full py-6">
        {/* Opciones */}
        <div
          className={`flex flex-col ${
            abierto ? "items-start px-3" : "items-center"
          } flex-1 gap-4`}
        >
          {opciones.map((op) => {
            const Icon = op.icon;
            const activo = opcionActiva === op.id;

            return (
              <button
                key={op.id}
                onClick={() => {
                  setOpcionActiva(op.id);
                  onChangeVista(op.id);
                }}
                className={`flex items-center gap-4 w-full px-3 py-2 rounded-lg transition-colors duration-200
                  ${
                    activo
                      ? "bg-black text-white"
                      : "text-white/80 hover:bg-gray-800"
                  }
                  ${abierto ? "justify-start" : "justify-center"}
                `}
              >
                <Icon size={24} />
                {abierto && (
                  <span className="text-sm font-medium">{op.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Botón salir */}
        <div className={abierto ? "px-3" : "flex justify-center"}>
          <button
            onClick={() => alert("Cerrar sesión")}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors duration-200
              text-white/80 hover:bg-red-600 hover:text-white
              ${abierto ? "justify-start" : "justify-center"}
            `}
          >
            <FaSignOutAlt size={24} />
            {abierto && <span className="text-sm font-medium">Salir</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
