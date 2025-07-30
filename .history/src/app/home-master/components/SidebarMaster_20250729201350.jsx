"use client";
import { useState } from "react";
import {
  FaBars,
  FaHome,
  FaShoppingCart,
  FaDollarSign,
  FaBoxes,
  FaUtensils,
  FaChartBar,
  FaTags,
  FaUser,
  FaCog,
  FaPowerOff,
} from "react-icons/fa";

const opciones = [
  { id: "principal", label: "Principal", icon: FaHome },
  { id: "ventas", label: "Ventas", icon: FaShoppingCart },
  { id: "dinero", label: "Dinero", icon: FaDollarSign },
  { id: "stock", label: "Stock", icon: FaBoxes },
  { id: "cocina", label: "Cocina", icon: FaUtensils },
  { id: "analisis", label: "Análisis", icon: FaChartBar },
  { id: "gestion", label: "Gestión", icon: FaTags },
  { id: "perfil", label: "Perfil", icon: FaUser },
  { id: "ajustes", label: "Ajustes", icon: FaCog },
];

export default function Sidebar({ onChangeVista }) {
  const [opcionActiva, setOpcionActiva] = useState("ventas");

  return (
    <div className="h-screen w-48 bg-[#111] flex flex-col justify-between py-4">
      {/* Parte superior */}
      <div>
        {/* Botón Admin */}
        <div className="flex items-center px-4 mb-2 text-white font-semibold text-sm">
          <FaBars className="mr-2" /> admin
        </div>

        {/* Opciones de menú */}
        <div className="flex flex-col">
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
                className={`w-full flex items-center h-10 px-4 text-sm font-medium rounded-l-full transition-all ${
                  activo
                    ? "bg-white text-black"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Icon className="mr-3" size={14} />
                {op.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Botón Salir */}
      <div className="px-4">
        <button
          onClick={() => alert("Cerrar sesión")}
          className="w-full flex items-center h-10 text-sm font-medium text-white hover:bg-red-600 hover:text-white rounded-l-full"
        >
          <FaPowerOff className="mr-3" size={14} />
          Salir
        </button>
      </div>
    </div>
  );
}
