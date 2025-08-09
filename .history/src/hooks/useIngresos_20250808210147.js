"use client";
import { useState, useEffect } from "react";

export const useIngresos = () => {
  const [ingresos, setIngresos] = useState({
    ingresos: [],
    totalIngresos: 0,
    tipos: [],
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

  // Obtener todos los ingresos
  const fetchIngresos = async () => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch(
        `/api/ingresos?restauranteId=${restauranteId}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener los ingresos");
      }

      const data = await response.json();

      if (data.success) {
        setIngresos(data.data);
        console.log("💰 Ingresos cargados:", data.data);
      } else {
        throw new Error(data.error || "Error al obtener los ingresos");
      }
    } catch (err) {
      console.error("Error fetching ingresos:", err);
      setError("Error al cargar los ingresos");
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo ingreso
  const crearIngreso = async (
    tipoIngreso,
    motivo,
    monto,
    formaIngreso,
    fecha,
    opcionPago
  ) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      
      // Validar que fecha sea un objeto Date válido
      const fechaValida = fecha instanceof Date ? fecha : new Date(fecha || Date.now());
      
      const response = await fetch("/api/ingresos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          tipoIngreso,
          motivo,
          monto,
          formaIngreso,
          fecha: fechaValida.toISOString(),
          opcionPago,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear el ingreso");
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Ingreso creado:", data.data);
        // Recargar los ingresos después de crear uno nuevo
        await fetchIngresos();
        return data.data;
      } else {
        throw new Error(data.error || "Error al crear el ingreso");
      }
    } catch (err) {
      console.error("Error creating ingreso:", err);
      setError("Error al crear el ingreso");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un ingreso existente
  const actualizarIngreso = async (
    ingresoId,
    tipoIngreso,
    motivo,
    monto,
    formaIngreso,
    fecha
  ) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch("/api/ingresos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          ingresoId,
          tipoIngreso,
          motivo,
          monto,
          formaIngreso,
          fecha: fecha.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el ingreso");
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Ingreso actualizado:", data.data);
        // Recargar los ingresos después de actualizar
        await fetchIngresos();
        return data.data;
      } else {
        throw new Error(data.error || "Error al actualizar el ingreso");
      }
    } catch (err) {
      console.error("Error updating ingreso:", err);
      setError("Error al actualizar el ingreso");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un ingreso
  const eliminarIngreso = async (ingresoId) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch(
        `/api/ingresos?restauranteId=${restauranteId}&ingresoId=${ingresoId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el ingreso");
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Ingreso eliminado");
        // Recargar los ingresos después de eliminar
        await fetchIngresos();
        return true;
      } else {
        throw new Error(data.error || "Error al eliminar el ingreso");
      }
    } catch (err) {
      console.error("Error deleting ingreso:", err);
      setError("Error al eliminar el ingreso");
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

  // Obtener el total de ingresos
  const getTotalIngresos = () => {
    return ingresos.totalIngresos || 0;
  };

  // Obtener todos los ingresos
  const getIngresos = () => {
    return ingresos.ingresos || [];
  };

  // Obtener tipos únicos de ingresos para autocompletado
  const getTiposIngreso = () => {
    const tipos = ingresos.tipos || [];
    return [...new Set(tipos)];
  };

  // Cargar datos al inicializar
  useEffect(() => {
    fetchIngresos();
  }, []);

  return {
    ingresos,
    loading,
    error,
    fetchIngresos,
    crearIngreso,
    actualizarIngreso,
    eliminarIngreso,
    formatDinero,
    getTotalIngresos,
    getIngresos,
    getTiposIngreso,
  };
};
