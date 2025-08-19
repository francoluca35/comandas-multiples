"use client";

import { useAuth } from "../context/AuthContext";
import { 
  FaHome, 
  FaStore, 
  FaCreditCard, 
  FaHistory, 
  FaKey, 
  FaSignOutAlt,
  FaUser
} from "react-icons/fa";

export default function Sidebar({ vistaActual, onVistaChange }) {
  const { usuario, logout } = useAuth();

  const menuItems = [
    {
      id: "inicio",
      label: "Dashboard",
      icon: FaHome,
      description: "Panel principal"
    },
    {
      id: "restaurantes",
      label: "Restaurantes",
      icon: FaStore,
      description: "Gestión de restaurantes"
    },
    {
      id: "pagos",
      label: "Pagos",
      icon: FaCreditCard,
      description: "Gestión de pagos"
    },
    {
      id: "historial",
      label: "Historial",
      icon: FaHistory,
      description: "Historial de actividades"
    },
    {
      id: "activacion",
      label: "Activación",
      icon: FaKey,
      description: "Activación de restaurantes"
    }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">
          Superadmin Comandas
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Panel de Administración
        </p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <FaUser className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {usuario?.email || "Admin"}
            </p>
            <p className="text-xs text-gray-400">
              Superadmin
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = vistaActual === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onVistaChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                  title={item.description}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors duration-200"
        >
          <FaSignOutAlt className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
