"use client";
import { useState, useEffect, useCallback } from "react";
import metricsCollector from "../lib/metrics";

export const useMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [historicalMetrics, setHistoricalMetrics] = useState([]);
  const [aggregations, setAggregations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Cargar métricas históricas
  const loadHistoricalMetrics = useCallback(async (hours = 24, limit = 100) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/metrics?hours=${hours}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error("Error cargando métricas históricas");
      }

      const data = await response.json();

      setHistoricalMetrics(data.metrics || []);
      setAggregations(data.aggregations || null);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error cargando métricas históricas:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Suscribirse a métricas en tiempo real
  useEffect(() => {
    const unsubscribe = metricsCollector.subscribe((summary) => {
      setMetrics(summary);
      setLastUpdate(new Date());
    });

    // Cargar métricas históricas al montar
    loadHistoricalMetrics();

    return unsubscribe;
  }, [loadHistoricalMetrics]);

  // Obtener métricas actuales
  const getCurrentMetrics = useCallback(() => {
    return metricsCollector.getMetrics();
  }, []);

  // Obtener resumen actual
  const getCurrentSummary = useCallback(() => {
    return metricsCollector.getSummary();
  }, []);

  // Registrar evento de negocio
  const recordBusinessEvent = useCallback((eventType, data) => {
    switch (eventType) {
      case "order_created":
        metricsCollector.recordOrder(data);
        break;
      case "inventory_updated":
        metricsCollector.recordInventoryUpdate(data);
        break;
      case "user_session":
        metricsCollector.recordUserSession(data);
        break;
      case "restaurant_activity":
        metricsCollector.recordRestaurantActivity(data);
        break;
      default:
        metricsCollector.recordBusinessAction(eventType, data);
    }
  }, []);

  // Registrar hit de cache
  const recordCacheHit = useCallback(() => {
    metricsCollector.recordCacheHit();
  }, []);

  // Registrar miss de cache
  const recordCacheMiss = useCallback(() => {
    metricsCollector.recordCacheMiss();
  }, []);

  // Limpiar métricas
  const clearMetrics = useCallback(() => {
    metricsCollector.clear();
    setMetrics(null);
    setHistoricalMetrics([]);
    setAggregations(null);
  }, []);

  // Obtener métricas por período
  const getMetricsByPeriod = useCallback(
    (period = "24h") => {
      const now = Date.now();
      let since;

      switch (period) {
        case "1h":
          since = now - 60 * 60 * 1000;
          break;
        case "6h":
          since = now - 6 * 60 * 60 * 1000;
          break;
        case "24h":
          since = now - 24 * 60 * 60 * 1000;
          break;
        case "7d":
          since = now - 7 * 24 * 60 * 60 * 1000;
          break;
        default:
          since = now - 24 * 60 * 60 * 1000;
      }

      return historicalMetrics.filter((metric) => metric.timestamp >= since);
    },
    [historicalMetrics]
  );

  // Obtener tendencias
  const getTrends = useCallback(() => {
    if (historicalMetrics.length < 2) return null;

    const recent = historicalMetrics.slice(0, 10);
    const older = historicalMetrics.slice(10, 20);

    if (older.length === 0) return null;

    const calculateTrend = (recentData, olderData, key) => {
      const recentAvg =
        recentData.reduce(
          (sum, item) => sum + (item.summary?.performance?.[key] || 0),
          0
        ) / recentData.length;
      const olderAvg =
        olderData.reduce(
          (sum, item) => sum + (item.summary?.performance?.[key] || 0),
          0
        ) / olderData.length;

      if (olderAvg === 0) return 0;
      return ((recentAvg - olderAvg) / olderAvg) * 100;
    };

    return {
      pageLoads: calculateTrend(recent, older, "totalPageLoads"),
      apiCalls: calculateTrend(recent, older, "totalApiCalls"),
      errors: calculateTrend(recent, older, "totalErrors"),
      cacheHitRate: calculateTrend(recent, older, "cacheHitRate"),
    };
  }, [historicalMetrics]);

  // Obtener alertas
  const getAlerts = useCallback(() => {
    const alerts = [];

    if (metrics) {
      // Alertas de performance
      if (metrics.performance.totalErrors > 10) {
        alerts.push({
          type: "error",
          category: "performance",
          message: "Muchos errores detectados",
          value: metrics.performance.totalErrors,
          severity: "high",
        });
      }

      if (metrics.performance.avgPageLoadTime > 3000) {
        alerts.push({
          type: "warning",
          category: "performance",
          message: "Tiempo de carga lento",
          value: `${metrics.performance.avgPageLoadTime.toFixed(0)}ms`,
          severity: "medium",
        });
      }

      if (metrics.performance.cacheHitRate < 50) {
        alerts.push({
          type: "warning",
          category: "performance",
          message: "Tasa de cache baja",
          value: `${metrics.performance.cacheHitRate.toFixed(1)}%`,
          severity: "medium",
        });
      }

      // Alertas de negocio
      if (metrics.business.outOfStockItems > 5) {
        alerts.push({
          type: "error",
          category: "business",
          message: "Muchos items sin stock",
          value: metrics.business.outOfStockItems,
          severity: "high",
        });
      }

      if (metrics.business.lowStockItems > 10) {
        alerts.push({
          type: "warning",
          category: "business",
          message: "Items con stock bajo",
          value: metrics.business.lowStockItems,
          severity: "medium",
        });
      }

      // Alertas del sistema
      if (metrics.system.networkErrors > 5) {
        alerts.push({
          type: "error",
          category: "system",
          message: "Errores de red",
          value: metrics.system.networkErrors,
          severity: "high",
        });
      }

      if (metrics.system.avgNetworkResponseTime > 2000) {
        alerts.push({
          type: "warning",
          category: "system",
          message: "Respuesta de red lenta",
          value: `${metrics.system.avgNetworkResponseTime.toFixed(0)}ms`,
          severity: "medium",
        });
      }
    }

    return alerts;
  }, [metrics]);

  // Obtener estadísticas de rendimiento
  const getPerformanceStats = useCallback(() => {
    if (!metrics) return null;

    return {
      pageLoads: {
        total: metrics.performance.totalPageLoads,
        avgTime: metrics.performance.avgPageLoadTime,
        trend: getTrends()?.pageLoads || 0,
      },
      apiCalls: {
        total: metrics.performance.totalApiCalls,
        avgResponseTime: metrics.performance.avgApiResponseTime,
        trend: getTrends()?.apiCalls || 0,
      },
      cache: {
        hitRate: metrics.performance.cacheHitRate,
        hits: metricsCollector.metrics.performance.cacheHits,
        misses: metricsCollector.metrics.performance.cacheMisses,
        trend: getTrends()?.cacheHitRate || 0,
      },
      errors: {
        total: metrics.performance.totalErrors,
        trend: getTrends()?.errors || 0,
      },
    };
  }, [metrics, getTrends]);

  // Obtener estadísticas de negocio
  const getBusinessStats = useCallback(() => {
    if (!metrics) return null;

    return {
      orders: {
        total: metrics.business.totalOrders,
        avgValue: metrics.business.avgOrderValue,
      },
      users: {
        active: metrics.business.activeUsers,
      },
      restaurants: {
        active: metrics.business.activeRestaurants,
      },
      inventory: {
        lowStock: metrics.business.lowStockItems,
        outOfStock: metrics.business.outOfStockItems,
        totalValue: metrics.business.inventoryValue,
      },
    };
  }, [metrics]);

  // Obtener estadísticas del sistema
  const getSystemStats = useCallback(() => {
    if (!metrics) return null;

    return {
      uptime: metrics.system.uptime,
      memory: metrics.system.memoryUsage,
      network: {
        requests: metrics.system.networkRequests,
        errors: metrics.system.networkErrors,
        avgResponseTime: metrics.system.avgNetworkResponseTime,
      },
    };
  }, [metrics]);

  return {
    // Estado
    metrics,
    historicalMetrics,
    aggregations,
    loading,
    error,
    lastUpdate,

    // Métricas actuales
    getCurrentMetrics,
    getCurrentSummary,

    // Eventos de negocio
    recordBusinessEvent,
    recordCacheHit,
    recordCacheMiss,

    // Utilidades
    clearMetrics,
    loadHistoricalMetrics,
    getMetricsByPeriod,
    getTrends,
    getAlerts,

    // Estadísticas organizadas
    getPerformanceStats,
    getBusinessStats,
    getSystemStats,
  };
};
