"use client";
import { useState, useEffect, useCallback } from "react";

export const useAlivios = () => {
  const [alivios, setAlivios] = useState({
    servicios: [],
    totalAlivios: 0,
    alivios: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener el restauranteId del localStorage
  const getRestaurantId = useCallback(() => {
    const restauranteId = localStorage.getItem("restauranteId");
    if (!restauranteId) {
      throw new Error("No hay restaurante seleccionado");
    }
    return restauranteId;
  }, []);

  // Obtener todos los alivios
  const fetchAlivios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      console.log("🔍 Fetching alivios para restaurante:", restauranteId);

      const response = await fetch(
        `/api/alivios?restauranteId=${restauranteId}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Error ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("📊 Respuesta de la API alivios:", data);

      if (data.success) {
        setAlivios(data.data);
        console.log("💰 Alivios cargados:", data.data);
      } else {
        throw new Error(data.error || "Error al obtener los alivios");
      }
    } catch (err) {
      console.error("❌ Error fetching alivios:", err);
      setError("Error al cargar los alivios");
      // Establecer valores por defecto en caso de error
      setAlivios({
        servicios: [],
        totalAlivios: 0,
        alivios: [],
      });
    } finally {
      setLoading(false);
    }
  }, [getRestaurantId]);

  // Crear un nuevo alivio
  const crearAlivio = useCallback(
    async (nombreServicio, monto, tipodepago, fecha, opcionPago) => {
      setLoading(true);
      setError(null);
      try {
        const restauranteId = getRestaurantId();

        // Validar que fecha sea un objeto Date válido
        const fechaValida =
          fecha instanceof Date ? fecha : new Date(fecha || Date.now());

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
            fecha: fechaValida.toISOString(),
            opcionPago,
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
    },
    [getRestaurantId, fetchAlivios]
  );

  // Actualizar un alivio existente
  const actualizarAlivio = useCallback(
    async (servicioId, nombreServicio, monto, tipodepago) => {
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
    },
    [getRestaurantId, fetchAlivios]
  );

  // Eliminar un alivio
  const eliminarAlivio = useCallback(
    async (servicioId) => {
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
    },
    [getRestaurantId, fetchAlivios]
  );

  // Formatear el dinero para mostrar
  const formatDinero = useCallback((amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  }, []);

  // Obtener el total de alivios
  const getTotalAlivios = useCallback(() => {
    try {
      // Si alivios es un array, calcular la suma
      if (Array.isArray(alivios.alivios)) {
        const total = alivios.alivios.reduce((sum, alivio) => {
          const monto = parseFloat(alivio.monto || 0) || 0;
          return sum + monto;
        }, 0);
        console.log("💰 Total alivios calculado desde array:", {
          alivios: alivios.alivios,
          total,
        });
        return total;
      }
      // Si no, usar el totalAlivios del estado
      const total = parseFloat(alivios.totalAlivios) || 0;
      console.log("💰 Total alivios desde estado:", { alivios, total });
      return total;
    } catch (error) {
      console.error("❌ Error calculando total alivios:", error);
      return 0;
    }
  }, [alivios]);

  // Obtener todos los servicios
  const getServicios = useCallback(() => {
    return alivios.servicios || [];
  }, [alivios]);

  // Obtener todos los alivios
  const getAlivios = useCallback(() => {
    return alivios.alivios || [];
  }, [alivios]);

  // Obtener nombres únicos de servicios para autocompletado
  const getNombresServicios = useCallback(() => {
    const servicios = getServicios();
    return [...new Set(servicios.map((servicio) => servicio.nombre))];
  }, [getServicios]);

  // Cargar datos al inicializar
  useEffect(() => {
    fetchAlivios();
  }, []); // Eliminar fetchAlivios de las dependencias

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
