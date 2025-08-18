import { useState, useEffect, useCallback } from "react";

// Configuración del cache
const CACHE_CONFIG = {
  TABLES: { key: "tables", ttl: 5 * 60 * 1000 }, // 5 minutos
  PRODUCTS: { key: "products", ttl: 10 * 60 * 1000 }, // 10 minutos
  INVENTORY: { key: "inventory", ttl: 15 * 60 * 1000 }, // 15 minutos
  USER_DATA: { key: "user_data", ttl: 60 * 60 * 1000 }, // 1 hora
  CRITICAL: { key: "critical", ttl: 24 * 60 * 60 * 1000 }, // 24 horas
};

export const useCache = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0,
  });

  // Verificar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Obtener datos del cache
  const getCachedData = useCallback((key, config = CACHE_CONFIG.CRITICAL) => {
    try {
      const cached = localStorage.getItem(`${config.key}_${key}`);
      if (!cached) {
        setCacheStats((prev) => ({ ...prev, misses: prev.misses + 1 }));
        return null;
      }

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Verificar si el cache ha expirado
      if (now - timestamp > config.ttl) {
        localStorage.removeItem(`${config.key}_${key}`);
        setCacheStats((prev) => ({ ...prev, misses: prev.misses + 1 }));
        return null;
      }

      setCacheStats((prev) => ({ ...prev, hits: prev.hits + 1 }));
      return data;
    } catch (error) {
      console.error("Error getting cached data:", error);
      return null;
    }
  }, []);

  // Guardar datos en cache
  const setCachedData = useCallback(
    (key, data, config = CACHE_CONFIG.CRITICAL) => {
      try {
        const cacheData = {
          data,
          timestamp: Date.now(),
          version: "2.0.0",
        };

        localStorage.setItem(`${config.key}_${key}`, JSON.stringify(cacheData));

        // Actualizar estadísticas
        setCacheStats((prev) => ({
          ...prev,
          size: localStorage.length,
        }));

        return true;
      } catch (error) {
        console.error("Error setting cached data:", error);
        return false;
      }
    },
    []
  );

  // Cache inteligente con fallback
  const smartCache = useCallback(
    async (key, fetchFunction, config = CACHE_CONFIG.CRITICAL) => {
      // Intentar obtener del cache primero
      const cachedData = getCachedData(key, config);

      if (cachedData && !isOnline) {
        console.log("📦 Usando datos del cache (offline):", key);
        return { data: cachedData, source: "cache", offline: true };
      }

      if (cachedData && isOnline) {
        console.log("📦 Usando datos del cache (online):", key);
        return { data: cachedData, source: "cache", offline: false };
      }

      // Si no hay cache o estamos online, hacer fetch
      if (isOnline) {
        try {
          console.log("🌐 Obteniendo datos del servidor:", key);
          const freshData = await fetchFunction();

          // Guardar en cache
          setCachedData(key, freshData, config);

          return { data: freshData, source: "server", offline: false };
        } catch (error) {
          console.error("Error fetching data:", error);

          // Si falla el fetch, intentar con cache expirado
          const expiredCache = getCachedData(key, { ...config, ttl: Infinity });
          if (expiredCache) {
            console.log("⚠️ Usando cache expirado como fallback:", key);
            return {
              data: expiredCache,
              source: "expired_cache",
              offline: true,
            };
          }

          throw error;
        }
      } else {
        // Offline sin cache
        throw new Error("Sin conexión y sin datos en cache");
      }
    },
    [isOnline, getCachedData, setCachedData]
  );

  // Cache para datos críticos (siempre disponibles)
  const criticalCache = useCallback(
    async (key, fetchFunction) => {
      return smartCache(key, fetchFunction, CACHE_CONFIG.CRITICAL);
    },
    [smartCache]
  );

  // Cache para datos de mesas (frecuentes)
  const tablesCache = useCallback(
    async (key, fetchFunction) => {
      return smartCache(key, fetchFunction, CACHE_CONFIG.TABLES);
    },
    [smartCache]
  );

  // Cache para productos (menos frecuentes)
  const productsCache = useCallback(
    async (key, fetchFunction) => {
      return smartCache(key, fetchFunction, CACHE_CONFIG.PRODUCTS);
    },
    [smartCache]
  );

  // Cache para inventario (menos frecuentes)
  const inventoryCache = useCallback(
    async (key, fetchFunction) => {
      return smartCache(key, fetchFunction, CACHE_CONFIG.INVENTORY);
    },
    [smartCache]
  );

  // Limpiar cache específico
  const clearCache = useCallback((config = null) => {
    try {
      if (config) {
        // Limpiar cache específico
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith(`${config.key}_`)) {
            localStorage.removeItem(key);
          }
        });
      } else {
        // Limpiar todo el cache
        Object.keys(localStorage).forEach((key) => {
          if (key.includes("_") && key.split("_")[0] in CACHE_CONFIG) {
            localStorage.removeItem(key);
          }
        });
      }

      setCacheStats((prev) => ({ ...prev, size: localStorage.length }));
      console.log("🗑️ Cache limpiado");
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }, []);

  // Obtener estadísticas del cache
  const getCacheStats = useCallback(() => {
    const totalItems = Object.keys(localStorage).filter(
      (key) => key.includes("_") && key.split("_")[0] in CACHE_CONFIG
    ).length;

    return {
      ...cacheStats,
      totalItems,
      hitRate:
        cacheStats.hits + cacheStats.misses > 0
          ? (
              (cacheStats.hits / (cacheStats.hits + cacheStats.misses)) *
              100
            ).toFixed(2)
          : 0,
    };
  }, [cacheStats]);

  // Precachear datos importantes
  const precache = useCallback(
    async (dataMap) => {
      const promises = Object.entries(dataMap).map(
        ([key, { fetchFn, config }]) =>
          smartCache(key, fetchFn, config || CACHE_CONFIG.CRITICAL)
      );

      try {
        await Promise.allSettled(promises);
        console.log("📦 Precache completado");
      } catch (error) {
        console.error("Error en precache:", error);
      }
    },
    [smartCache]
  );

  return {
    // Estado
    isOnline,
    cacheStats: getCacheStats(),

    // Funciones principales
    getCachedData,
    setCachedData,
    smartCache,

    // Caches especializados
    criticalCache,
    tablesCache,
    productsCache,
    inventoryCache,

    // Utilidades
    clearCache,
    precache,
  };
};
