"use client";
import { useState, useEffect } from "react";

export const useAlivios = () => {
  const [alivios, setAlivios] = useState({
    servicios: [],
    totalAlivios: 0,
    alivios: [],
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

  // Obtener todos los alivios
  const fetchAlivios = async () => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch(
        `/api/alivios?restauranteId=${restauranteId}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener los alivios");
      }

      const data = await response.json();

      if (data.success) {
        setAlivios(data.data);
        console.log("💰 Alivios cargados:", data.data);
      } else {
        throw new Error(data.error || "Error al obtener los alivios");
      }
    } catch (err) {
      console.error("Error fetching alivios:", err);
      setError("Error al cargar los alivios");
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo alivio
  const crearAlivio = async (nombreServicio, monto, tipodepago, fecha) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch("/api/alivios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          nombreServicio,
          monto,
          tipodepago,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear el alivio");
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Alivio creado:", data.data);
        // Recargar los alivios después de crear uno nuevo
        await fetchAlivios();
        return data.data;
      } else {
        throw new Error(data.error || "Error al crear el alivio");
      }
    } catch (err) {
      console.error("Error creating alivio:", err);
      setError("Error al crear el alivio");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un alivio existente
  const actualizarAlivio = async (
    servicioId,
    nombreServicio,
    monto,
    tipodepago
  ) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch("/api/alivios", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          servicioId,
          nombreServicio,
          monto,
          tipodepago,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el alivio");
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Alivio actualizado:", data.data);
        // Recargar los alivios después de actualizar
        await fetchAlivios();
        return data.data;
      } else {
        throw new Error(data.error || "Error al actualizar el alivio");
      }
    } catch (err) {
      console.error("Error updating alivio:", err);
      setError("Error al actualizar el alivio");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un alivio
  const eliminarAlivio = async (servicioId) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch(
        `/api/alivios?restauranteId=${restauranteId}&servicioId=${servicioId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el alivio");
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Alivio eliminado");
        // Recargar los alivios después de eliminar
        await fetchAlivios();
        return true;
      } else {
        throw new Error(data.error || "Error al eliminar el alivio");
      }
    } catch (err) {
      console.error("Error deleting alivio:", err);
      setError("Error al eliminar el alivio");
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

  // Obtener el total de alivios
  const getTotalAlivios = () => {
    return alivios.totalAlivios || 0;
  };

  // Obtener todos los servicios
  const getServicios = () => {
    return alivios.servicios || [];
  };

  // Obtener todos los alivios
  const getAlivios = () => {
    return alivios.alivios || [];
  };

  // Obtener nombres únicos de servicios para autocompletado
  const getNombresServicios = () => {
    const servicios = getServicios();
    return [...new Set(servicios.map((servicio) => servicio.nombre))];
  };

  // Cargar datos al inicializar
  useEffect(() => {
    fetchAlivios();
  }, []);

  return {
    alivios,
    loading,
    error,
    fetchAlivios,
    crearAlivio,
    actualizarAlivio,
    eliminarAlivio,
    formatDinero,
    getTotalAlivios,
    getServicios,
    getAlivios,
    getNombresServicios,
  };
};
