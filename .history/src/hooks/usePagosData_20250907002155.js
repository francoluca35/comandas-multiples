"use client";
import { useState, useEffect, useMemo, useCallback } from "react";

export const usePagosData = () => {
  const [data, setData] = useState({
    alivios: { servicios: [], totalAlivios: 0, alivios: [] },
    inversionTotal: { inversionTotal: 0, totalProductos: 0, productos: [] },
    sueldos: [],
    ingresos: { ingresos: [], totalIngresos: 0, tipos: [] },
    dineroActual: { efectivo: 0, virtual: 0, totalCajas: 0, cajas: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener el restauranteId del localStorage
  const getRestaurantId = useCallback(() => {
    const restauranteId = localStorage.getItem("restauranteId");
    if (!restauranteId) {
      throw new Error("No hay restaurante seleccionado");
    }
    return restauranteId;
  }, []);

  // Función para formatear dinero
  const formatDinero = useCallback((amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  }, []);

  // Función para cargar todos los datos
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const restauranteId = getRestaurantId();
      
      // Hacer todas las llamadas en paralelo
      const [aliviosRes, inversionRes, sueldosRes, ingresosRes, dineroRes] = await Promise.all([
        fetch(`/api/alivios?restauranteId=${restauranteId}`),
        fetch(`/api/inversion-total?restauranteId=${restauranteId}`),
        fetch(`/api/sueldos?restauranteId=${restauranteId}`),
        fetch(`/api/ingresos?restauranteId=${restauranteId}`),
        fetch(`/api/dinero-actual?restauranteId=${restauranteId}`)
      ]);

      const [aliviosData, inversionData, sueldosData, ingresosData, dineroData] = await Promise.all([
        aliviosRes.json(),
        inversionRes.json(),
        sueldosRes.json(),
        ingresosRes.json(),
        dineroRes.json()
      ]);

      setData({
        alivios: aliviosData.success ? aliviosData.data : { servicios: [], totalAlivios: 0, alivios: [] },
        inversionTotal: inversionData.success ? inversionData.data : { inversionTotal: 0, totalProductos: 0, productos: [] },
        sueldos: sueldosData.success ? sueldosData.data : [],
        ingresos: ingresosData.success ? ingresosData.data : { ingresos: [], totalIngresos: 0, tipos: [] },
        dineroActual: dineroData.success ? dineroData.data : { efectivo: 0, virtual: 0, totalCajas: 0, cajas: [] }
      });

      console.log("💰 Todos los datos de pagos cargados exitosamente");
    } catch (err) {
      console.error("❌ Error cargando datos de pagos:", err);
      setError("Error al cargar los datos de pagos");
    } finally {
      setLoading(false);
    }
  }, [getRestaurantId]);

  // Cargar datos al inicializar
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Calcular valores memoizados
  const pagosData = useMemo(() => {
    // Calcular total de alivios
    const totalAlivios = Array.isArray(data.alivios.alivios) 
      ? data.alivios.alivios.reduce((sum, alivio) => sum + (parseFloat(alivio.monto) || 0), 0)
      : parseFloat(data.alivios.totalAlivios) || 0;

    // Calcular total de inversión
    const totalCompras = Array.isArray(data.inversionTotal.productos)
      ? data.inversionTotal.productos.reduce((sum, producto) => sum + (parseFloat(producto.costoTotal || producto.precio) || 0), 0)
      : parseFloat(data.inversionTotal.inversionTotal) || 0;

    // Calcular total de sueldos
    const totalSueldos = Array.isArray(data.sueldos) 
      ? data.sueldos.reduce((sum, empleado) => {
          if (empleado.historialPagos && typeof empleado.historialPagos === "object") {
            return sum + Object.values(empleado.historialPagos).reduce((empleadoSum, pago) => {
              return empleadoSum + (parseFloat(pago.total) || 0);
            }, 0);
          }
          return sum;
        }, 0)
      : 0;

    // Calcular cantidad de sueldos
    const cantidadSueldos = Array.isArray(data.sueldos)
      ? data.sueldos.reduce((sum, empleado) => {
          if (empleado.historialPagos && typeof empleado.historialPagos === "object") {
            return sum + Object.keys(empleado.historialPagos).length;
          }
          return sum;
        }, 0)
      : 0;

    // Otros valores
    const totalIngresos = parseFloat(data.ingresos.totalIngresos) || 0;
    const efectivoTotal = parseFloat(data.dineroActual.efectivo) || 0;
    const virtualTotal = parseFloat(data.dineroActual.virtual) || 0;

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
      formatDinero,
      loading,
      error,
      refetch: fetchAllData
    };
  }, [data, formatDinero, loading, error, fetchAllData]);

  return pagosData;
};
