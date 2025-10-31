"use client";
import { useState, useEffect, useCallback } from "react";

export const useStockAlerts = () => {
  const [stockBajo, setStockBajo] = useState([]);
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

  // Obtener productos con stock bajo
  const fetchStockBajo = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const restauranteId = getRestaurantId();
      const productosStockBajo = [];

      // Obtener bebidas con stock bajo
      const bebidasResponse = await fetch(`/api/stock?restauranteId=${restauranteId}`);
      if (bebidasResponse.ok) {
        const bebidas = await bebidasResponse.json();
        const bebidasStockBajo = bebidas.filter(bebida => {
          const stockValue = Number(bebida.stock) || 0;
          return stockValue >= 1 && stockValue <= 4; // Stock bajo: entre 1 y 4
        });
        
        bebidasStockBajo.forEach(bebida => {
          productosStockBajo.push({
            id: bebida.id,
            nombre: bebida.nombre,
            stock: bebida.stock,
            tipo: 'bebida',
            precio: bebida.precio,
            categoria: bebida.subcategoria || 'bebidas'
          });
        });
      }

      // Obtener materia prima con stock bajo
      const materiaPrimaResponse = await fetch(`/api/materia-prima?restauranteId=${restauranteId}`);
      if (materiaPrimaResponse.ok) {
        const materiaPrima = await materiaPrimaResponse.json();
        const materiaStockBajo = materiaPrima.filter(mp => {
          const stockValue = Number(mp.stock) || 0;
          return stockValue >= 1 && stockValue <= 4; // Stock bajo: entre 1 y 4
        });
        
        materiaStockBajo.forEach(mp => {
          productosStockBajo.push({
            id: mp.id,
            nombre: mp.nombre,
            stock: mp.stock,
            tipo: 'materia_prima',
            precio: mp.precio,
            categoria: mp.categoria || 'general'
          });
        });
      }

      setStockBajo(productosStockBajo);
      return productosStockBajo;
    } catch (err) {
      console.error("Error fetching stock bajo:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar si hay productos con stock bajo
  const tieneStockBajo = useCallback(() => {
    return stockBajo.length > 0;
  }, [stockBajo]);

  // Obtener productos críticos (stock = 1)
  const getProductosCriticos = useCallback(() => {
    return stockBajo.filter(producto => producto.stock === 1);
  }, [stockBajo]);

  // Obtener productos con stock muy bajo (stock = 2-3)
  const getProductosMuyBajo = useCallback(() => {
    return stockBajo.filter(producto => producto.stock >= 2 && producto.stock <= 3);
  }, [stockBajo]);

  // Obtener productos con stock bajo (stock = 4)
  const getProductosBajo = useCallback(() => {
    return stockBajo.filter(producto => producto.stock === 4);
  }, [stockBajo]);

  // Cargar datos al inicializar
  useEffect(() => {
    fetchStockBajo();
  }, [fetchStockBajo]);

  // Refrescar cada 2 minutos (reducido para evitar carga excesiva)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStockBajo();
    }, 2 * 60 * 1000); // 2 minutos

    return () => clearInterval(interval);
  }, [fetchStockBajo]);

  return {
    stockBajo,
    loading,
    error,
    fetchStockBajo,
    tieneStockBajo,
    getProductosCriticos,
    getProductosMuyBajo,
    getProductosBajo,
  };
};
