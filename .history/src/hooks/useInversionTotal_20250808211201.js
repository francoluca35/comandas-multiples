"use client";
import { useState, useEffect } from "react";

export const useInversionTotal = () => {
  const [inversionTotal, setInversionTotal] = useState({
    inversionTotal: 0,
    totalProductos: 0,
    productos: [],
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

  // Obtener la inversión total
  const fetchInversionTotal = async () => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      console.log(
        "🔍 Fetching inversión total para restaurante:",
        restauranteId
      );

      const response = await fetch(
        `/api/inversion-total?restauranteId=${restauranteId}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Error ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("📊 Respuesta de la API:", data);

      if (data.success) {
        setInversionTotal(data.data);
        console.log("💰 Inversión total cargada:", data.data);
      } else {
        throw new Error(data.error || "Error al obtener la inversión total");
      }
    } catch (err) {
      console.error("❌ Error fetching inversión total:", err);
      setError("Error al cargar la inversión total");
      // Establecer valores por defecto en caso de error
      setInversionTotal({
        inversionTotal: 0,
        totalProductos: 0,
        productos: [],
      });
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

  // Obtener la inversión total
  const getInversionTotal = () => {
    try {
      // Si productos es un array, calcular la suma
      if (Array.isArray(inversionTotal.productos)) {
        const total = inversionTotal.productos.reduce(
          (sum, producto) => {
            const costoTotal = parseFloat(producto.costoTotal || producto.precio || 0) || 0;
            return sum + costoTotal;
          },
          0
        );
        console.log("💰 Total inversión calculado desde array:", {
          productos: inversionTotal.productos,
          total,
        });
        return total;
      }
      // Si no, usar el inversionTotal del estado
      const total = parseFloat(inversionTotal.inversionTotal) || 0;
      console.log("💰 Total inversión desde estado:", { inversionTotal, total });
      return total;
    } catch (error) {
      console.error("❌ Error calculando inversión total:", error);
      return 0;
    }
  };

  // Obtener el número total de productos
  const getTotalProductos = () => {
    return inversionTotal.totalProductos || 0;
  };

  // Obtener todos los productos
  const getProductos = () => {
    return inversionTotal.productos || [];
  };

  // Cargar datos al inicializar
  useEffect(() => {
    fetchInversionTotal();
  }, []);

  return {
    inversionTotal,
    loading,
    error,
    fetchInversionTotal,
    formatDinero,
    getInversionTotal,
    getTotalProductos,
    getProductos,
  };
};
