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
      className={`h-screen bg-[#111] transition-all duration-300 ${
        abierto ? "w-48" : "w-16"
      } relative`}
      onMouseEnter={() => setAbierto(true)}
      onMouseLeave={() => setAbierto(false)}
    >
      <div className="flex flex-col justify-between h-full">
        {/* Opciones */}
        <div
          className={`flex flex-col gap-6 pt-6 ${
            abierto ? "items-start px-3" : "items-center"
          } flex-1`}
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
                  ${abierto ? "justify-start" : "justify-center"}
                  ${activo ? "" : "hover:bg-white/10"}
                `}
              >
                <div
                  className={`p-3 rounded-lg ${
                    activo ? "bg-white" : ""
                  } transition-all`}
                >
                  <Icon
                    size={20}
                    className={`${
                      activo ? "text-black" : "text-white"
                    } transition-all`}
                  />
                </div>
                {abierto && (
                  <span
                    className={`text-sm font-medium ${
                      activo ? "text-white" : "text-white/70"
                    }`}
                  >
                    {op.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
