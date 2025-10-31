"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useIngresos } from "@/hooks/useIngresos";
import { useDineroActual } from "@/hooks/useDineroActual";
import { usePagosOptimizado } from "@/hooks/usePagosOptimizado";

function DineroCard() {
  const { getTotalIngresos, getIngresos, ingresos } = useIngresos();
  const { formatDinero, dineroActual } = useDineroActual();
  const { getEgresosEfectivo, getEgresosVirtual } = usePagosOptimizado();

  // Calcular resumen de ingresos y egresos usando useMemo
  const resumen = useMemo(() => {
    try {
      // Obtener ingresos totales
      const totalIngresos = getTotalIngresos() || 0;

      // Calcular ingresos por tipo basándose en los datos reales registrados
      let ingresoEfectivo = 0;
      let ingresoVirtual = 0;

      // Obtener todos los ingresos registrados
      const todosLosIngresos = getIngresos();

      // Calcular ingresos por tipo según la forma de ingreso registrada
      todosLosIngresos.forEach((ingreso) => {
        const monto = parseFloat(ingreso.monto) || 0;
        
        // Normalizar formaIngreso para comparación
        const formaIngreso = (ingreso.formaIngreso || "").toLowerCase();

        if (
          ingreso.formaIngreso === "Efectivo" ||
          ingreso.opcionPago === "caja"
        ) {
          ingresoEfectivo += monto;
        } else if (
          formaIngreso === "mercadopago" ||
          formaIngreso === "mercado pago" ||
          formaIngreso === "tarjeta" ||
          formaIngreso === "transferencia" ||
          ingreso.opcionPago === "cuenta_restaurante"
        ) {
          ingresoVirtual += monto;
        }
      });

      // Calcular egresos por tipo
      // Los egresos de la colección Egresos (desde usePagosOptimizado)
      const egresosEfectivoRegistrados = getEgresosEfectivo() || 0;
      const egresosVirtualRegistrados = getEgresosVirtual() || 0;
      
      // Calcular egresos totales
      const egresoEfectivo = egresosEfectivoRegistrados;
      const egresoVirtual = egresosVirtualRegistrados;

      // Calcular valores NETOS (ingresos - egresos)
      const ingresoEfectivoNeto = ingresoEfectivo - egresoEfectivo;
      const ingresoVirtualNeto = ingresoVirtual - egresoVirtual;

      const resultado = {
        ingresoEfectivo: ingresoEfectivoNeto,
        ingresoVirtual: ingresoVirtualNeto,
        egresoEfectivo,
        egresoVirtual,
      };

      console.log("💰 Resumen calculado (NETO):", {
        ingresoEfectivoBruto: ingresoEfectivo,
        ingresoVirtualBruto: ingresoVirtual,
        ...resultado,
        totalIngresos,
      });

      return resultado;
    } catch (error) {
      console.error("❌ Error calculando resumen:", error);
      return {
        ingresoEfectivo: 0,
        ingresoVirtual: 0,
        egresoEfectivo: 0,
        egresoVirtual: 0,
      };
    }
  }, [
    // Depender de valores primitivos específicos en lugar de objetos completos
    ingresos?.totalIngresos,
    ingresos?.ingresos?.length, // Agregar dependencia de ingresos
    dineroActual?.efectivo,
    dineroActual?.virtual,
    getEgresosEfectivo,
    getEgresosVirtual,
  ]);

  const handleNavigation = (route) => {
    window.location.href = `/home-comandas/${route}`;
  };

  return (
    <div className="bg-[#2a2a2a] rounded-lg p-4 sm:p-6 text-white h-full">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        </div>
        <span className="font-semibold">Dinero</span>
      </div>

      {/* Grid de 4 informes */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {/* Ingreso Efectivo */}
        <div className="bg-green-600 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-white mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="text-sm font-medium">Ingreso Efectivo</span>
            </div>
            <span className="text-sm font-bold">
              {formatDinero(resumen.ingresoEfectivo)}
            </span>
          </div>
        </div>

        {/* Ingreso Virtual */}
        <div className="bg-blue-600 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-white mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="text-sm font-medium">Ingreso Virtual</span>
            </div>
            <span className="text-sm font-bold">
              {formatDinero(resumen.ingresoVirtual)}
            </span>
          </div>
        </div>

        {/* Egreso Efectivo */}
        <div className="bg-red-600 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-white mr-2"
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
              <span className="text-sm font-medium">Egreso Efectivo</span>
            </div>
            <span className="text-sm font-bold">
              -{formatDinero(resumen.egresoEfectivo)}
            </span>
          </div>
        </div>

        {/* Egreso Virtual */}
        <div className="bg-orange-600 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-white mr-2"
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
              <span className="text-sm font-medium">Egreso Virtual</span>
            </div>
            <span className="text-sm font-bold">
              -{formatDinero(resumen.egresoVirtual)}
            </span>
          </div>
        </div>
      </div>

      {/* Botón de acción */}
      <div className="flex justify-center">
        <button
          onClick={() => handleNavigation("pagos")}
          className="bg-gray-600 hover:bg-gray-700 rounded-lg px-6 py-2 text-sm font-medium transition-colors duration-200 w-full"
        >
          Ver historial completo
        </button>
      </div>
    </div>
  );
}

export default DineroCard;
