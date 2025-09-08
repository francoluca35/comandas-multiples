"use client";
import { useState, useEffect, useMemo } from "react";
import { useDineroActual } from "./useDineroActual";
import { useInversionTotal } from "./useInversionTotal";
import { useAlivios } from "./useAlivios";
import { useSueldos } from "./useSueldos";
import { useIngresos } from "./useIngresos";

export const usePagosData = () => {
  const { formatDinero, getEfectivoTotal, getVirtualTotal } = useDineroActual();
  const { getInversionTotal } = useInversionTotal();
  const { getTotalAlivios } = useAlivios();
  const { getTotalSueldos, getCantidadSueldos } = useSueldos();
  const { getTotalIngresos } = useIngresos();

  // Memoizar todos los valores para evitar recálculos
  const pagosData = useMemo(() => {
    const totalAlivios = getTotalAlivios || 0;
    const totalCompras = getInversionTotal || 0;
    const totalSueldos = getTotalSueldos || 0;
    const cantidadSueldos = getCantidadSueldos || 0;
    const totalIngresos = getTotalIngresos || 0;
    const efectivoTotal = getEfectivoTotal || 0;
    const virtualTotal = getVirtualTotal || 0;

    // Calcular totales
    const gastosTotales = totalAlivios + totalCompras + totalSueldos;
    const ingresosTotales = efectivoTotal + virtualTotal + totalIngresos;
    const rendimiento = ingresosTotales - gastosTotales;

    return {
      // Egresos
      totalAlivios,
      totalCompras,
      totalSueldos,
      cantidadSueldos,
      gastosTotales,
      
      // Ingresos
      totalIngresos,
      efectivoTotal,
      virtualTotal,
      ingresosTotales,
      
      // Rendimiento
      rendimiento,
      esGanancia: rendimiento >= 0,
      
      // Utilidades
      formatDinero
    };
  }, [
    getTotalAlivios,
    getInversionTotal,
    getTotalSueldos,
    getCantidadSueldos,
    getTotalIngresos,
    getEfectivoTotal,
    getVirtualTotal,
    formatDinero
  ]);

  return pagosData;
};
