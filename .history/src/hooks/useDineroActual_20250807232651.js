"use client";
import { useState, useEffect } from "react";

export const useDineroActual = () => {
  const [dineroActual, setDineroActual] = useState({
    efectivo: 0,
    virtual: 0,
    totalCajas: 0,
    cajas: [],
    ultimaActualizacion: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener el restauranteId del localStorage
  const getRestaurantId = () => {
    const restauranteId = localStorage.getItem("restauranteId");
    if (!restauranteId) {
      throw new Error("No hay restaurante seleccionado");
    }
    return restauranteId;
  };

  // Obtener el dinero actual
  const fetchDineroActual = async () => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch(
        `/api/dinero-actual?restauranteId=${restauranteId}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener el dinero actual");
      }

      const data = await response.json();

      if (data.success) {
        setDineroActual(data.data);
        console.log("💰 Dinero actual cargado:", data.data);
      } else {
        throw new Error(data.error || "Error al obtener el dinero actual");
      }
    } catch (err) {
      console.error("Error fetching dinero actual:", err);
      setError("Error al cargar el dinero actual");
    } finally {
      setLoading(false);
    }
  };

  // Actualizar el dinero actual
  const updateDineroActual = async (cajaId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch("/api/dinero-actual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          cajaId,
          ...updateData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al actualizar el dinero actual"
        );
      }

      const data = await response.json();

      if (data.success) {
        // Recargar los datos después de la actualización
        await fetchDineroActual();
        console.log("✅ Dinero actual actualizado:", data.message);
        return data;
      } else {
        throw new Error(data.error || "Error al actualizar el dinero actual");
      }
    } catch (err) {
      console.error("Error updating dinero actual:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Formatear el dinero para mostrar
  const formatDinero = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  // Obtener el efectivo total
  const getEfectivoTotal = () => {
    return dineroActual.efectivo || 0;
  };

  // Obtener el número total de cajas
  const getTotalCajas = () => {
    return dineroActual.totalCajas || 0;
  };

  // Obtener todas las cajas
  const getCajas = () => {
    return dineroActual.cajas || [];
  };

  // Obtener la última actualización
  const getUltimaActualizacion = () => {
    return dineroActual.ultimaActualizacion;
  };

  // Cargar datos al inicializar
  useEffect(() => {
    fetchDineroActual();
  }, []);

  return {
    dineroActual,
    loading,
    error,
    fetchDineroActual,
    updateDineroActual,
    formatDinero,
    getEfectivoTotal,
    getTotalCajas,
    getCajas,
    getUltimaActualizacion,
  };
};
