"use client";
import { useState, useEffect } from "react";

export const useCompras = () => {
  const [compras, setCompras] = useState([]);
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

  // Obtener todas las compras
  const fetchCompras = async () => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch(`/api/compras?restauranteId=${restauranteId}`);

      if (!response.ok) {
        throw new Error("Error al obtener las compras");
      }

      const data = await response.json();
      setCompras(data);
    } catch (err) {
      console.error("Error fetching compras:", err);
      setError("Error al cargar las compras");
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva compra
  const createCompra = async (compraData) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch("/api/compras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          ...compraData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la compra");
      }

      const nuevaCompra = await response.json();
      
      // Recargar las compras para mostrar la nueva
      await fetchCompras();

      return nuevaCompra;
    } catch (err) {
      console.error("Error creating compra:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas de compras
  const getComprasStats = () => {
    const totalCompras = compras.length;
    const totalGastado = compras.reduce((total, compra) => {
      return total + (compra.precioTotal || 0);
    }, 0);

    const comprasConsumoFinal = compras.filter(compra => compra.esConsumoFinal);
    const comprasMateriaPrima = compras.filter(compra => !compra.esConsumoFinal);

    const gastoConsumoFinal = comprasConsumoFinal.reduce((total, compra) => {
      return total + (compra.precioTotal || 0);
    }, 0);

    const gastoMateriaPrima = comprasMateriaPrima.reduce((total, compra) => {
      return total + (compra.precioTotal || 0);
    }, 0);

    return {
      totalCompras,
      totalGastado,
      comprasConsumoFinal: comprasConsumoFinal.length,
      comprasMateriaPrima: comprasMateriaPrima.length,
      gastoConsumoFinal,
      gastoMateriaPrima,
    };
  };

  // Buscar compras por nombre
  const searchCompras = (searchTerm) => {
    if (!searchTerm.trim()) return compras;

    return compras.filter((compra) =>
      compra.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Obtener compras por fecha
  const getComprasByDate = (startDate, endDate) => {
    return compras.filter((compra) => {
      const compraDate = new Date(compra.fechaCompra?.toDate?.() || compra.fechaCompra);
      return compraDate >= startDate && compraDate <= endDate;
    });
  };

  // Cargar compras al inicializar
  useEffect(() => {
    fetchCompras();
  }, []);

  return {
    compras,
    loading,
    error,
    fetchCompras,
    createCompra,
    getComprasStats,
    searchCompras,
    getComprasByDate,
  };
};
