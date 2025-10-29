"use client";
import { useState, useEffect, useCallback, useRef } from "react";

export const usePagosOptimizado = () => {
  const [data, setData] = useState({
    dineroActual: {
      efectivo: 0,
      virtual: 0,
      totalCajas: 0,
      cajas: [],
      ultimaActualizacion: null,
    },
    ingresos: {
      ingresos: [],
      totalIngresos: 0,
      tipos: [],
    },
    egresos: {
      egresos: [],
      totalEgresos: 0,
      tipos: [],
    },
    ventas: {
      efectivo: 0,
      virtual: 0,
      total: 0,
    },
    loading: false,
    error: null,
  });

  // Cache para evitar llamadas repetidas
  const cacheRef = useRef({
    lastFetch: 0,
    cacheDuration: 30000, // 30 segundos de cache
    data: null
  });

  // Obtener el restauranteId del localStorage
  const getRestaurantId = () => {
    const restauranteId = localStorage.getItem("restauranteId");
    if (!restauranteId) {
      throw new Error("No hay restaurante seleccionado");
    }
    return restauranteId;
  };

  // Función para calcular totales de ventas desde todas las fuentes
  const calcularTotalesVentas = useCallback(async (restauranteId) => {
    try {
      console.log("🛒 Calculando totales de ventas...");
      
      // Obtener ventas de Salón (mesas)
      const mesasResponse = await fetch(`/api/tables?restauranteId=${restauranteId}`);
      const mesasData = mesasResponse.ok ? await mesasResponse.json() : { tables: [] };
      
      // Obtener ventas de Takeaway
      const takeawayResponse = await fetch(`/api/takeaway?restauranteId=${restauranteId}`);
      const takeawayData = takeawayResponse.ok ? await takeawayResponse.json() : { takeaway: [] };
      
      // Obtener ventas de Delivery
      const deliveryResponse = await fetch(`/api/delivery?restauranteId=${restauranteId}`);
      const deliveryData = deliveryResponse.ok ? await deliveryResponse.json() : { delivery: [] };

      let efectivoTotal = 0;
      let virtualTotal = 0;

      // Procesar ventas de Salón (mesas)
      if (mesasData.tables) {
        mesasData.tables.forEach(mesa => {
          if (mesa.estado === "pagado" && mesa.total) {
            if (mesa.metodoPago === "efectivo") {
              efectivoTotal += parseFloat(mesa.total) || 0;
            } else if (mesa.metodoPago === "tarjeta" || mesa.metodoPago === "mercadopago") {
              virtualTotal += parseFloat(mesa.total) || 0;
            }
          }
        });
      }

      // Procesar ventas de Takeaway
      if (takeawayData.takeaway) {
        takeawayData.takeaway.forEach(venta => {
          if (venta.estado === "pagado" && venta.total) {
            if (venta.metodoPago === "efectivo") {
              efectivoTotal += parseFloat(venta.total) || 0;
            } else if (venta.metodoPago === "tarjeta" || venta.metodoPago === "mercadopago") {
              virtualTotal += parseFloat(venta.total) || 0;
            }
          }
        });
      }

      // Procesar ventas de Delivery
      if (deliveryData.delivery) {
        deliveryData.delivery.forEach(venta => {
          if (venta.estado === "pagado" && venta.total) {
            if (venta.metodoPago === "efectivo") {
              efectivoTotal += parseFloat(venta.total) || 0;
            } else if (venta.metodoPago === "tarjeta" || venta.metodoPago === "mercadopago") {
              virtualTotal += parseFloat(venta.total) || 0;
            }
          }
        });
      }

      console.log("💰 Totales calculados:", { efectivo: efectivoTotal, virtual: virtualTotal });

      return {
        efectivo: efectivoTotal,
        virtual: virtualTotal,
        total: efectivoTotal + virtualTotal,
      };
    } catch (error) {
      console.error("❌ Error calculando totales de ventas:", error);
      return { efectivo: 0, virtual: 0, total: 0 };
    }
  }, []);

  // Función principal para cargar todos los datos de pagos
  const fetchAllPagosData = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const restauranteId = getRestaurantId();
      console.log("🔄 Cargando todos los datos de pagos...");

      // Hacer todas las llamadas en paralelo
      const [
        dineroActualResponse,
        ingresosResponse,
        egresosResponse,
        ventasTotales
      ] = await Promise.all([
        fetch(`/api/dinero-actual?restauranteId=${restauranteId}`),
        fetch(`/api/ingresos?restauranteId=${restauranteId}`),
        fetch(`/api/egresos?restauranteId=${restauranteId}`),
        calcularTotalesVentas(restauranteId)
      ]);

      // Procesar respuestas
      const dineroActualData = dineroActualResponse.ok 
        ? await dineroActualResponse.json() 
        : { success: false, data: { efectivo: 0, virtual: 0, totalCajas: 0, cajas: [], ultimaActualizacion: null } };

      const ingresosData = ingresosResponse.ok 
        ? await ingresosResponse.json() 
        : { success: false, data: { ingresos: [], totalIngresos: 0, tipos: [] } };

      const egresosData = egresosResponse.ok 
        ? await egresosResponse.json() 
        : { success: false, data: { egresos: [], totalEgresos: 0, tipos: [] } };

      // Actualizar estado con todos los datos
      setData({
        dineroActual: dineroActualData.success ? dineroActualData.data : {
          efectivo: 0,
          virtual: 0,
          totalCajas: 0,
          cajas: [],
          ultimaActualizacion: null,
        },
        ingresos: ingresosData.success ? ingresosData.data : {
          ingresos: [],
          totalIngresos: 0,
          tipos: [],
        },
        egresos: egresosData.success ? egresosData.data : {
          egresos: [],
          totalEgresos: 0,
          tipos: [],
        },
        ventas: ventasTotales,
        loading: false,
        error: null,
      });

      console.log("✅ Todos los datos de pagos cargados exitosamente");
    } catch (error) {
      console.error("❌ Error cargando datos de pagos:", error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message || "Error al cargar los datos de pagos"
      }));
    }
  }, [calcularTotalesVentas]);

  // Cargar datos al inicializar
  useEffect(() => {
    fetchAllPagosData();
  }, [fetchAllPagosData]);

  // Funciones de utilidad
  const formatDinero = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const getEfectivoTotal = () => {
    return data.dineroActual.efectivo + data.ventas.efectivo;
  };

  const getVirtualTotal = () => {
    return data.dineroActual.virtual + data.ventas.virtual;
  };

  const getTotalCajas = () => {
    return data.dineroActual.totalCajas;
  };

  const getCajas = () => {
    return data.dineroActual.cajas;
  };

  const getUltimaActualizacion = () => {
    return data.dineroActual.ultimaActualizacion;
  };

  const getTotalIngresos = () => {
    return data.ingresos.totalIngresos;
  };

  const getTotalEgresos = () => {
    return data.egresos.totalEgresos;
  };

  const getVentasEfectivo = () => {
    return data.ventas.efectivo;
  };

  const getVentasVirtual = () => {
    return data.ventas.virtual;
  };

  const getVentasTotal = () => {
    return data.ventas.total;
  };

  return {
    // Datos completos
    data,
    
    // Funciones de carga
    fetchAllPagosData,
    calcularTotalesVentas,
    
    // Funciones de utilidad
    formatDinero,
    
    // Totales combinados (dinero actual + ventas)
    getEfectivoTotal,
    getVirtualTotal,
    getTotalCajas,
    getCajas,
    getUltimaActualizacion,
    
    // Totales de ingresos y egresos
    getTotalIngresos,
    getTotalEgresos,
    
    // Totales de ventas únicamente
    getVentasEfectivo,
    getVentasVirtual,
    getVentasTotal,
    
    // Estados
    loading: data.loading,
    error: data.error,
  };
};
