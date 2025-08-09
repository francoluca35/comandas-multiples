"use client";
import React, { useState, useEffect } from "react";
import { useIngresos } from "../../../../hooks/useIngresos";

function VentasModal({ isOpen, onClose }) {
  const [selectedPeriod, setSelectedPeriod] = useState("dia");
  const [ventasData, setVentasData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fetchIngresos } = useIngresos();

  const periods = [
    { id: "dia", name: "Día", icon: "📅" },
    { id: "semana", name: "Semana", icon: "📊" },
    { id: "mes", name: "Mes", icon: "📈" },
  ];

  const formatDinero = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const getDateRange = (period) => {
    const now = new Date();
    const start = new Date();

    switch (period) {
      case "dia":
        start.setHours(0, 0, 0, 0);
        break;
      case "semana":
        start.setDate(now.getDate() - 7);
        break;
      case "mes":
        start.setMonth(now.getMonth() - 1);
        break;
      default:
        start.setHours(0, 0, 0, 0);
    }

    return { start, end: now };
  };

  const fetchVentas = async (period) => {
    setLoading(true);
    try {
      // Simular datos de ventas - aquí deberías conectar con tu API real
      const mockVentas = [
        {
          id: 1,
          tipo: "Restaurante",
          mesa: "Mesa 5",
          monto: 2500,
          metodo: "Efectivo",
          fecha: new Date(),
          items: ["Hamburguesa", "Coca Cola", "Papas"],
        },
        {
          id: 2,
          tipo: "Takeaway",
          cliente: "Juan Pérez",
          monto: 1800,
          metodo: "Mercado Pago",
          fecha: new Date(),
          items: ["Pizza", "Agua"],
        },
        {
          id: 3,
          tipo: "Delivery",
          cliente: "María García",
          direccion: "Av. Corrientes 123",
          monto: 3200,
          metodo: "Tarjeta",
          fecha: new Date(),
          items: ["Pasta", "Vino", "Postre"],
        },
      ];

      setVentasData(mockVentas);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedPeriod) {
      fetchVentas(selectedPeriod);
    }
  }, [isOpen, selectedPeriod]);

  const getTotalVentas = () => {
    return ventasData.reduce((total, venta) => total + venta.monto, 0);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 999999 }}
    >
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Ventas</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex space-x-2 mb-6">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                selectedPeriod === period.id
                  ? "bg-blue-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              <span>{period.icon}</span>
              <span className="font-medium">{period.name}</span>
            </button>
          ))}
        </div>

        {/* Total Summary */}
        <div className="bg-slate-700/50 rounded-lg p-4 mb-6 border border-slate-600/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500/20 rounded-md flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <span className="text-white font-medium">Total Ventas</span>
            </div>
            <span className="text-2xl font-bold text-green-400">
              {formatDinero(getTotalVentas())}
            </span>
          </div>
        </div>

        {/* Ventas List */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : ventasData.length > 0 ? (
            <div className="space-y-3">
              {ventasData.map((venta) => (
                <div
                  key={venta.id}
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          venta.tipo === "Restaurante"
                            ? "bg-green-500"
                            : venta.tipo === "Takeaway"
                            ? "bg-blue-500"
                            : "bg-purple-500"
                        }`}
                      ></div>
                      <span className="text-white font-medium">
                        {venta.tipo}
                      </span>
                      {venta.mesa && (
                        <span className="text-slate-400">- {venta.mesa}</span>
                      )}
                      {venta.cliente && (
                        <span className="text-slate-400">
                          - {venta.cliente}
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-bold text-green-400">
                      {formatDinero(venta.monto)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-slate-400">
                        {venta.fecha.toLocaleDateString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-slate-400">• {venta.metodo}</span>
                      {venta.direccion && (
                        <span className="text-slate-400">
                          • {venta.direccion}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    <span className="text-xs text-slate-500">Items: </span>
                    <span className="text-xs text-slate-300">
                      {venta.items.join(", ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              No hay ventas registradas para este período
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VentasModal;
