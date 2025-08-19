"use client";

import { useState } from "react";
import { 
  FaMoneyBillAlt, 
  FaStore, 
  FaUsers, 
  FaChartLine,
  FaPlus,
  FaKey
} from "react-icons/fa";

export default function VistaDashboard() {
  const [stats, setStats] = useState({
    restaurantesActivos: 12,
    pagosTotales: 45000,
    usuariosTotales: 48,
    crecimiento: 15.5
  });

  const quickActions = [
    {
      id: "crear-restaurante",
      label: "Crear Restaurante",
      icon: FaPlus,
      description: "Registrar nuevo restaurante",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      id: "activar-restaurante",
      label: "Activar Restaurante",
      icon: FaKey,
      description: "Activar restaurante existente",
      color: "bg-green-600 hover:bg-green-700"
    }
  ];

  const handleQuickAction = (actionId) => {
    console.log("Acción rápida:", actionId);
    // Aquí se implementaría la lógica para cada acción
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Panel de control y estadísticas del sistema
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Última actualización</p>
          <p className="text-white font-medium">
            {new Date().toLocaleString('es-ES')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Restaurantes Activos</p>
              <p className="text-2xl font-bold text-white">
                {stats.restaurantesActivos}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <FaStore className="text-white text-xl" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pagos Totales</p>
              <p className="text-2xl font-bold text-white">
                ${stats.pagosTotales.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <FaMoneyBillAlt className="text-white text-xl" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Usuarios Totales</p>
              <p className="text-2xl font-bold text-white">
                {stats.usuariosTotales}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <FaUsers className="text-white text-xl" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Crecimiento</p>
              <p className="text-2xl font-bold text-white">
                +{stats.crecimiento}%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-white text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                className={`${action.color} text-white p-4 rounded-lg flex items-center space-x-3 transition-colors duration-200`}
                title={action.description}
              >
                <Icon className="text-xl" />
                <span className="font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <div className="flex-1">
              <p className="text-white text-sm">
                Nuevo restaurante "Café Central" registrado
              </p>
              <p className="text-gray-400 text-xs">
                Hace 2 horas
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="flex-1">
              <p className="text-white text-sm">
                Pago procesado para "Restaurante ABC"
              </p>
              <p className="text-gray-400 text-xs">
                Hace 4 horas
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <div className="flex-1">
              <p className="text-white text-sm">
                Usuario "admin@resto.com" activado
              </p>
              <p className="text-gray-400 text-xs">
                Hace 6 horas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
