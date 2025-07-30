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
      className={`h-screen bg-[#e4e4e4] text-black transition-all duration-300 ${
        abierto ? "w-40" : "w-14"
      } relative`}
      onMouseEnter={() => setAbierto(true)}
      onMouseLeave={() => setAbierto(false)}
    >
      <div className="flex flex-col justify-between h-full py-6 ">
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
                onClick={() => {
                  setOpcionActiva(op.id);
                  onChangeVista(op.id);
                }}
                className={`flex items-center gap-4 w-full transition-all duration-200 ${
                  abierto
                    ? `justify-center px-3 py-1.5 rounded ${
                        opcionActiva === op.id
                          ? "bg-red-300 text-black shadow-md"
                          : "hover:bg-black hover:text-white"
                      }`
                    : `${
                        opcionActiva === op.id
                          ? "bg-white text-black rounded"
                          : ""
                      }`
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
            className={`flex items-center gap-2 hover:bg-black hover:text-white w-full  px-1 py-2 rounded transition-all duration-200 ${
              abierto ? "justify-center" : "justify-center"
            }`}
          >
            <FaSignOutAlt size={abierto ? 28 : 32} />
            {abierto && <span className="text-xl font-regular">Salir</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
