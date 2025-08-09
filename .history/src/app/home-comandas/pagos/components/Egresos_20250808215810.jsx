"use client";
import React, { useState, useCallback } from "react";
import { useDineroActual } from "../../../../hooks/useDineroActual";
import { useInversionTotal } from "../../../../hooks/useInversionTotal";
import { useAlivios } from "../../../../hooks/useAlivios";
import AlivioModal from "./AlivioModal";
import EgresarModal from "./EgresarModal";
import RetirarModal from "./RetirarModal";
import PagarProveedorModal from "./PagarProveedorModal";

function Egresos({ onToggle, isExpanded }) {
  const { formatDinero, getEfectivoTotal, getVirtualTotal } = useDineroActual();
  const { getInversionTotal, inversionTotal, fetchInversionTotal } =
    useInversionTotal();
  const { getTotalAlivios, alivios, fetchAlivios } = useAlivios();

  const [showAlivioModal, setShowAlivioModal] = useState(false);
  const [showEgresarModal, setShowEgresarModal] = useState(false);
  const [showRetirarModal, setShowRetirarModal] = useState(false);
  const [showPagarProveedorModal, setShowPagarProveedorModal] = useState(false);

  // Calcular gastos totales
  const calcularGastosTotales = useCallback(() => {
    try {
      const totalAlivios = getTotalAlivios() || 0;
      const totalCompras = getInversionTotal() || 0;
      // Aquí podrías agregar otros tipos de egresos si los tienes
      const total = totalAlivios + totalCompras;
      console.log("💰 Gastos totales calculados:", {
        totalAlivios,
        totalCompras,
        total,
      });
      return total;
    } catch (error) {
      console.error("❌ Error calculando gastos totales:", error);
      return 0;
    }
  }, [getTotalAlivios, getInversionTotal]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 shadow-2xl shadow-slate-900/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/25">
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
                d="M20 12H4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white"> Egresos</h2>
        </div>
        <button
          onClick={onToggle}
          className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
          title={isExpanded ? "Ocultar sección" : "Mostrar sección"}
        >
          <svg
            className={`w-5 h-5 text-white transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Content - Conditionally visible */}
      {isExpanded && (
        <>
          {/* Summary Cards */}
          <div className="space-y-2 mb-4">
            {/* Alivios */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-red-500/20 rounded-md flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium">Alivios</span>
              </div>
              <span className="text-lg font-bold text-red-400">
                {formatDinero(getTotalAlivios() || 0)}
              </span>
            </div>

            {/* Compras */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-orange-500/20 rounded-md flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                    />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium">Compras</span>
              </div>
              <span className="text-lg font-bold text-orange-400">
                {formatDinero(getInversionTotal() || 0)}
              </span>
            </div>

            {/* Gastos Totales */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-600/30">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-md flex items-center justify-center">
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
                <span className="text-white text-sm font-medium">
                  Gastos Totales
                </span>
              </div>
              <span className="text-xl font-bold text-white">
                {formatDinero(calcularGastosTotales())}
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => setShowEgresarModal(true)}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl mb-4 hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
            <span>Egresar</span>
          </button>

          {/* Secondary Action Buttons - First Row */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => setShowAlivioModal(true)}
              className="bg-blue-500 text-white font-medium py-2 px-2 rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center space-x-1"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs">Aliviar</span>
            </button>
            <button
              onClick={() => setShowRetirarModal(true)}
              className="bg-blue-500 text-white font-medium py-2 px-2 rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center space-x-1"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="text-xs">Retirar</span>
            </button>
          </div>

          {/* Secondary Action Buttons - Second Row */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setShowPagarProveedorModal(true)}
              className="bg-blue-500 text-white font-medium py-2 px-2 rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center space-x-1"
            >
              <svg
                className="w-3 h-3"
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
              <span className="text-xs">Pagar proveedor</span>
            </button>
            <button className="bg-blue-500 text-white font-medium py-2 px-2 rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center space-x-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-xs">Pagar empleado</span>
            </button>
          </div>

          {/* View/Report Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button className="bg-slate-600 text-white font-medium py-2 px-3 rounded-lg hover:bg-slate-700 transition-all duration-300 flex items-center justify-center space-x-2">
              <svg
                className="w-4 h-4"
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
              <span className="text-sm">Ver egresos por cuenta</span>
            </button>
            <button className="bg-slate-600 text-white font-medium py-2 px-3 rounded-lg hover:bg-slate-700 transition-all duration-300 flex items-center justify-center space-x-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">Historial de egresos</span>
            </button>
          </div>
        </>
      )}

      {/* Modal de Alivio */}
      <AlivioModal
        isOpen={showAlivioModal}
        onClose={() => setShowAlivioModal(false)}
        onSuccess={() => {
          console.log("✅ Alivio creado exitosamente");
          // Recargar datos después de crear un alivio
          fetchAlivios();
        }}
      />

      {/* Modal de Egresar */}
      <EgresarModal
        isOpen={showEgresarModal}
        onClose={() => setShowEgresarModal(false)}
        onSuccess={() => {
          console.log("✅ Egreso registrado exitosamente");
          // Recargar datos después de crear un egreso
          fetchAlivios();
          fetchInversionTotal();
        }}
      />

      {/* Modal de Retirar */}
      <RetirarModal
        isOpen={showRetirarModal}
        onClose={() => setShowRetirarModal(false)}
        onSuccess={() => {
          console.log("✅ Extracción creada exitosamente");
          // Recargar datos después de crear una extracción
          // Aquí podrías recargar los datos de dinero actual si es necesario
        }}
      />

      {/* Modal de Pagar Proveedor */}
      <PagarProveedorModal
        isOpen={showPagarProveedorModal}
        onClose={() => setShowPagarProveedorModal(false)}
        onSuccess={() => {
          console.log("✅ Pago a proveedor creado exitosamente");
          // Recargar datos después de crear un pago a proveedor
          // Aquí podrías recargar los datos de dinero actual si es necesario
        }}
      />
    </div>
  );
}

export default Egresos;
