import { useState, useEffect } from "react";

export const useBebidas = () => {
  const [bebidas, setBebidas] = useState([]);
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

  // Obtener todas las bebidas
  const fetchBebidas = async () => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch(
        `/api/bebidas?restauranteId=${restauranteId}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener las bebidas");
      }

      const data = await response.json();
      setBebidas(data);
    } catch (err) {
      console.error("Error fetching bebidas:", err);
      setError("Error al cargar las bebidas");
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva bebida
  const createBebida = async (bebidaData) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch("/api/bebidas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          ...bebidaData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la bebida");
      }

      const nuevaBebida = await response.json();
      setBebidas((prev) => [...prev, nuevaBebida]);
      return nuevaBebida;
    } catch (err) {
      console.error("Error creating bebida:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar bebida
  const updateBebida = async (bebidaId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch("/api/bebidas", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          bebidaId,
          ...updateData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar la bebida");
      }

      // Actualizar el estado local
      setBebidas((prev) =>
        prev.map((bebida) =>
          bebida.id === bebidaId ? { ...bebida, ...updateData } : bebida
        )
      );

      return { success: true };
    } catch (err) {
      console.error("Error updating bebida:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar bebida
  const deleteBebida = async (bebidaId) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch(
        `/api/bebidas?restauranteId=${restauranteId}&bebidaId=${bebidaId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar la bebida");
      }

      // Remover del estado local
      setBebidas((prev) => prev.filter((bebida) => bebida.id !== bebidaId));
      return { success: true };
    } catch (err) {
      console.error("Error deleting bebida:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar bebida por nombre
  const findBebidaByNombre = (nombre) => {
    return bebidas.find(
      (bebida) => bebida.nombre.toLowerCase() === nombre.toLowerCase()
    );
  };

  // Obtener bebidas por subcategoría
  const getBebidasBySubcategoria = (subcategoria) => {
    return bebidas.filter((bebida) => bebida.subcategoria === subcategoria);
  };

  // Obtener bebidas habilitadas
  const getBebidasHabilitadas = () => {
    return bebidas.filter((bebida) => bebida.habilitada);
  };

  // Obtener bebidas sin stock
  const getBebidasSinStock = () => {
    return bebidas.filter((bebida) => bebida.stock === 0);
  };

  // Actualizar habilitación basada en stock
  const updateHabilitacionByStock = async () => {
    const bebidasSinStock = bebidas.filter(
      (bebida) => bebida.stock === 0 && bebida.habilitada
    );
    const bebidasConStock = bebidas.filter(
      (bebida) => bebida.stock > 0 && !bebida.habilitada
    );

    // Deshabilitar bebidas sin stock
    for (const bebida of bebidasSinStock) {
      await updateBebida(bebida.id, { habilitada: false });
    }

    // Habilitar bebidas con stock
    for (const bebida of bebidasConStock) {
      await updateBebida(bebida.id, { habilitada: true });
    }
  };

  // Cargar bebidas al inicializar
  useEffect(() => {
    fetchBebidas();
  }, []);

  return {
    bebidas,
    loading,
    error,
    fetchBebidas,
    createBebida,
    updateBebida,
    deleteBebida,
    findBebidaByNombre,
    getBebidasBySubcategoria,
    getBebidasHabilitadas,
    getBebidasSinStock,
    updateHabilitacionByStock,
  };
};
