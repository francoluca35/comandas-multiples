import { useState, useEffect, useCallback, useMemo } from "react";
import { useCache } from "./useCache";
import apiClient from "../lib/apiClient";

export const useInventarioOptimized = () => {
  const { inventoryCache, criticalCache, smartCache } = useCache();
  const [bebidas, setBebidas] = useState([]);
  const [materiaPrima, setMateriaPrima] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Cache keys
  const CACHE_KEYS = {
    BEBIDAS: "inventario_bebidas",
    MATERIA_PRIMA: "inventario_materia_prima",
    STATS: "inventario_stats",
  };

  // Cargar datos con cache inteligente
  const loadInventario = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar bebidas y materia prima en paralelo con cache
      const [bebidasResult, materiaPrimaResult] = await Promise.allSettled([
        inventoryCache(CACHE_KEYS.BEBIDAS, async () => {
          const response = await apiClient.get("/api/stock");
          const data = await response.json();
          return data.filter((item) => item.tipo === "bebida");
        }),
        inventoryCache(CACHE_KEYS.MATERIA_PRIMA, async () => {
          const response = await apiClient.get("/api/materia-prima");
          return response.json();
        }),
      ]);

      // Procesar resultados
      if (bebidasResult.status === "fulfilled") {
        setBebidas(bebidasResult.value.data || []);
      }

      if (materiaPrimaResult.status === "fulfilled") {
        setMateriaPrima(materiaPrimaResult.value.data || []);
      }

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error("Error cargando inventario:", error);
      setError(error.message);
      setLoading(false);
    }
  }, [inventoryCache]);

  // Cargar datos al montar
  useEffect(() => {
    loadInventario();
  }, [loadInventario]);

  // Memoizar estadísticas financieras
  const financialStats = useMemo(() => {
    const allItems = [...bebidas, ...materiaPrima];

    const stats = allItems.reduce(
      (acc, item) => {
        const valorEnStock = (item.stock || 0) * (item.precio || 0);
        const costoStock = (item.stock || 0) * (item.costo || 0);
        const ganancia = valorEnStock - costoStock;

        return {
          valorEnStock: acc.valorEnStock + valorEnStock,
          costoStock: acc.costoStock + costoStock,
          ganancia: acc.ganancia + ganancia,
          totalItems: acc.totalItems + 1,
          itemsConStock: acc.itemsConStock + ((item.stock || 0) > 0 ? 1 : 0),
          itemsSinStock: acc.itemsSinStock + ((item.stock || 0) === 0 ? 1 : 0),
        };
      },
      {
        valorEnStock: 0,
        costoStock: 0,
        ganancia: 0,
        totalItems: 0,
        itemsConStock: 0,
        itemsSinStock: 0,
      }
    );

    return {
      ...stats,
      gananciaPorcentual:
        stats.costoStock > 0 ? (stats.ganancia / stats.costoStock) * 100 : 0,
    };
  }, [bebidas, materiaPrima]);

  // Memoizar items por tipo
  const itemsByType = useMemo(() => {
    return {
      bebidas: bebidas.filter((item) => item.tipo === "bebida"),
      alimentos: materiaPrima.filter((item) => item.tipo === "alimento"),
      stock: materiaPrima.filter((item) => item.esStock),
      comida: materiaPrima.filter((item) => item.esComida),
    };
  }, [bebidas, materiaPrima]);

  // Memoizar items con stock bajo
  const lowStockItems = useMemo(() => {
    const allItems = [...bebidas, ...materiaPrima];
    return allItems.filter(
      (item) => (item.stock || 0) <= 5 && (item.stock || 0) > 0
    );
  }, [bebidas, materiaPrima]);

  // Memoizar items sin stock
  const outOfStockItems = useMemo(() => {
    const allItems = [...bebidas, ...materiaPrima];
    return allItems.filter((item) => (item.stock || 0) === 0);
  }, [bebidas, materiaPrima]);

  // Buscar items optimizada
  const searchItems = useCallback(
    (query, type = null) => {
      if (!query.trim()) {
        return type ? itemsByType[type] || [] : [...bebidas, ...materiaPrima];
      }

      const searchTerm = query.toLowerCase();
      const allItems = [...bebidas, ...materiaPrima];

      const filtered = allItems.filter((item) => {
        const matchesQuery =
          item.nombre.toLowerCase().includes(searchTerm) ||
          item.categoria?.toLowerCase().includes(searchTerm);

        const matchesType = !type || item.tipo === type;

        return matchesQuery && matchesType;
      });

      return filtered;
    },
    [bebidas, materiaPrima, itemsByType]
  );

  // Filtrar por categoría
  const filterByCategory = useCallback(
    (category) => {
      const allItems = [...bebidas, ...materiaPrima];
      return allItems.filter((item) => item.categoria === category);
    },
    [bebidas, materiaPrima]
  );

  // Crear bebida optimizada
  const createBebida = useCallback(async (bebidaData) => {
    try {
      // Validación local
      if (!bebidaData.nombre || !bebidaData.categoria) {
        throw new Error("Nombre y categoría son requeridos");
      }

      // Crear bebida en servidor
      const response = await apiClient.post("/api/stock", {
        ...bebidaData,
        tipo: "bebida",
      });

      if (!response.ok) {
        throw new Error("Error creando bebida");
      }

      const newBebida = await response.json();

      // Actualizar estado local
      setBebidas((prev) => [...prev, newBebida]);

      // Limpiar cache
      apiClient.clearCache("inventory");

      return newBebida;
    } catch (error) {
      console.error("Error creando bebida:", error);
      throw error;
    }
  }, []);

  // Crear materia prima optimizada
  const createMateriaPrima = useCallback(async (materiaPrimaData) => {
    try {
      // Validación local
      if (!materiaPrimaData.nombre || !materiaPrimaData.categoria) {
        throw new Error("Nombre y categoría son requeridos");
      }

      // Crear materia prima en servidor
      const response = await apiClient.post("/api/materia-prima", {
        ...materiaPrimaData,
        tipo: "alimento",
      });

      if (!response.ok) {
        throw new Error("Error creando materia prima");
      }

      const newMateriaPrima = await response.json();

      // Actualizar estado local
      setMateriaPrima((prev) => [...prev, newMateriaPrima]);

      // Limpiar cache
      apiClient.clearCache("inventory");

      return newMateriaPrima;
    } catch (error) {
      console.error("Error creando materia prima:", error);
      throw error;
    }
  }, []);

  // Actualizar item optimizado
  const updateItem = useCallback(
    async (itemId, updates, type) => {
      try {
        // Actualización optimista
        if (type === "bebida") {
          setBebidas((prev) =>
            prev.map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            )
          );
        } else {
          setMateriaPrima((prev) =>
            prev.map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            )
          );
        }

        // Actualizar en servidor
        const endpoint =
          type === "bebida" ? "/api/stock" : "/api/materia-prima";
        const response = await apiClient.put(`${endpoint}/${itemId}`, updates);

        if (!response.ok) {
          throw new Error("Error actualizando item");
        }

        // Limpiar cache
        apiClient.clearCache("inventory");

        return true;
      } catch (error) {
        console.error("Error actualizando item:", error);

        // Revertir cambios en caso de error
        loadInventario();

        throw error;
      }
    },
    [loadInventario]
  );

  // Eliminar item optimizado
  const deleteItem = useCallback(
    async (itemId, type) => {
      try {
        // Eliminación optimista
        if (type === "bebida") {
          setBebidas((prev) => prev.filter((item) => item.id !== itemId));
        } else {
          setMateriaPrima((prev) => prev.filter((item) => item.id !== itemId));
        }

        // Eliminar en servidor
        const endpoint =
          type === "bebida" ? "/api/stock" : "/api/materia-prima";
        const response = await apiClient.delete(`${endpoint}/${itemId}`);

        if (!response.ok) {
          throw new Error("Error eliminando item");
        }

        // Limpiar cache
        apiClient.clearCache("inventory");

        return true;
      } catch (error) {
        console.error("Error eliminando item:", error);

        // Revertir cambios en caso de error
        loadInventario();

        throw error;
      }
    },
    [loadInventario]
  );

  // Estadísticas de performance
  const performanceStats = useMemo(() => {
    return {
      totalItems: bebidas.length + materiaPrima.length,
      bebidas: bebidas.length,
      materiaPrima: materiaPrima.length,
      lowStock: lowStockItems.length,
      outOfStock: outOfStockItems.length,
      lastUpdate: lastUpdate?.toLocaleTimeString(),
      cacheHitRate: apiClient.getMetrics().cacheHitRate,
    };
  }, [
    bebidas.length,
    materiaPrima.length,
    lowStockItems.length,
    outOfStockItems.length,
    lastUpdate,
  ]);

  // Refrescar datos
  const refreshData = useCallback(async () => {
    // Limpiar cache para forzar recarga
    apiClient.clearCache("inventory");

    await loadInventario();
  }, [loadInventario]);

  return {
    // Estado
    bebidas,
    materiaPrima,
    loading,
    error,

    // Datos memoizados
    financialStats,
    itemsByType,
    lowStockItems,
    outOfStockItems,

    // Funciones optimizadas
    searchItems,
    filterByCategory,
    createBebida,
    createMateriaPrima,
    updateItem,
    deleteItem,
    refreshData,

    // Estadísticas
    performanceStats,
  };
};
