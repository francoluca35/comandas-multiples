"use client";
import { useState } from "react";
import {
  FaBars,
  FaHome,
  FaPowerOff,
  FaStore,
  FaMoneyBill,
  FaHistory,
  FaToggleOn,
} from "react-icons/fa";

const opciones = [
  { id: "inicio", label: "Inicio", icon: FaHome },
  { id: "restaurantes", label: "Restaurantes", icon: FaStore },
  { id: "pagos", label: "Pagos", icon: FaMoneyBill },
  { id: "historial", label: "Historial", icon: FaHistory },
  { id: "activacion", label: "Act/Des", icon: FaToggleOn },
];

export default function Sidebar({ onChangeVista }) {
  const [abierto, setAbierto] = useState(false);
  const [opcionActiva, setOpcionActiva] = useState("ventas");

  return (
    <div
      className={`h-screen bg-[#111] transition-all duration-300 ${
        abierto ? "w-48" : "w-14"
      } flex flex-col justify-between`}
    >
      {/* Sección superior */}
      <div>
        {/* Botón de toggle */}
        <div
          className={`flex items-center ${
            abierto ? "justify-start pl-3" : "justify-center"
          } h-14 text-white font-bold`}
        >
          <button
            onClick={() => setAbierto(!abierto)}
            className="focus:outline-none"
          >
            <FaBars size={20} />
          </button>
          {abierto && <span className="ml-3 text-sm">admin</span>}
        </div>

        {/* Opciones */}
        <div className="flex flex-col gap-1 mt-2">
          {opciones.map(({ id, label, icon: Icon }) => {
            const activo = opcionActiva === id;

            return (
              <button
                key={id}
                onClick={() => {
                  setOpcionActiva(id);
                  onChangeVista?.(id);
                }}
                className={`flex items-center gap-3 h-10 px-3 rounded-l-full transition-all w-full
                  ${
                    activo
                      ? "bg-white text-black font-bold"
                      : "text-white hover:bg-white/20"
                  }
                  ${abierto ? "justify-start" : "justify-center"}
                `}
              >
                <Icon
                  size={20}
                  className={`${
                    activo ? "text-red-600" : "text-white"
                  } transition-all`}
                />
                {abierto && (
                  <span
                    className={`text-sm font-medium ${
                      activo ? "text-red-600" : "text-white/70"
                    }`}
                  >
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Botón de salida */}
      <div className="mb-4">
        <button
          onClick={() => alert("Cerrar sesión")}
          className={`flex items-center gap-3 h-10 px-3 rounded-l-full text-white w-full
      justify-center transition-all duration-200
      hover:bg-red-500 hover:text-white
    `}
        >
          <FaPowerOff size={18} />
          {abierto && <span className="text-sm">Salir</span>}
        </button>
      </div>
    </div>
  );
}
