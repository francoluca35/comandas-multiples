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
                  ${
                    activo
                      ? "bg-black text-yellow-400"
                      : "text-yellow-400 hover:bg-white/10"
                  }
                  ${abierto ? "justify-start" : "justify-center"}
                `}
              >
                <div
                  className={`p-2 rounded ${
                    activo
                      ? "border border-white bg-white/10"
                      : "border border-transparent"
                  }`}
                >
                  <Icon
                    size={20}
                    className={`${
                      activo ? "text-yellow-400" : "text-yellow-400"
                    }`}
                  />
                </div>
                {abierto && (
                  <span className="text-sm font-medium">{op.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
