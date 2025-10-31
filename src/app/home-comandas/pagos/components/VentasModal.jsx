"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function VentasModal({ isOpen, onClose }) {
  const [selectedPeriod, setSelectedPeriod] = useState("dia");
  const [ventasData, setVentasData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Obtener ventas desde la API
  const fetchVentas = async (period) => {
    setLoading(true);
    try {
      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) {
        throw new Error("No hay restaurante seleccionado");
      }

      const response = await fetch(
        `/api/ventas-periodo?restauranteId=${restauranteId}&periodo=${period}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener las ventas");
      }

      const data = await response.json();

      if (data.success) {
        setVentasData(data.data);
      } else {
        throw new Error(data.error || "Error al obtener las ventas");
      }
    } catch (error) {
      console.error("❌ Error obteniendo ventas:", error);
      // En caso de error, mostrar datos vacíos
      setVentasData({
        restaurante: 0,
        takeaway: 0,
        delivery: 0,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedPeriod) {
      fetchVentas(selectedPeriod);
    }
  }, [isOpen, selectedPeriod]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case "dia":
        return "del día";
      case "semana":
        return "de la semana";
      case "mes":
        return "del mes";
      default:
        return "";
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 999999 }}
    >
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-400"
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
            <h3 className="text-lg font-bold text-white">Ventas</h3>
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
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Seleccionar período
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedPeriod("dia")}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === "dia"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setSelectedPeriod("semana")}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === "semana"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setSelectedPeriod("mes")}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === "mes"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Mes
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-slate-400">Cargando ventas...</span>
            </div>
          ) : ventasData ? (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">
                Ingresos {getPeriodLabel(selectedPeriod)}
              </h4>

              {/* Ventas por tipo */}
              <div className="grid gap-3">
                {/* Restaurante */}
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
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
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">Restaurante</p>
                        <p className="text-slate-400 text-sm">
                          Comidas en el local
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-green-400">
                      {formatCurrency(ventasData.restaurante)}
                    </span>
                  </div>
                </div>

                {/* Takeaway */}
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">Takeaway</p>
                        <p className="text-slate-400 text-sm">Para llevar</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-blue-400">
                      {formatCurrency(ventasData.takeaway)}
                    </span>
                  </div>
                </div>

                {/* Delivery */}
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">Delivery</p>
                        <p className="text-slate-400 text-sm">A domicilio</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-purple-400">
                      {formatCurrency(ventasData.delivery)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">Total</p>
                      <p className="text-slate-300 text-sm">
                        Ingresos {getPeriodLabel(selectedPeriod)}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(ventasData.total)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400">No hay datos disponibles</p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-slate-700 transition-all duration-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body);
}
