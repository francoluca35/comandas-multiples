"use client";

// Sistema de Métricas por Restaurante - Solo se ejecuta cuando se accede a métricas
class MetricsCollector {
  constructor() {
    this.metrics = {};
    this.isCollecting = false;
    this.restaurants = [];
  }

  // Inicializar métricas para un restaurante específico
  initializeRestaurantMetrics(restaurantId) {
    this.metrics[restaurantId] = {
      performance: {
        pageLoads: 0,
        apiCalls: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errors: [],
        responseTime: 0,
      },
      business: {
        orders: {
          total: 0,
          byHour: {},
          byDay: {},
          averageValue: 0,
          pending: 0,
          completed: 0,
        },
        inventory: {
          lowStock: 0,
          outOfStock: 0,
          totalValue: 0,
          totalItems: 0,
          movements: [],
        },
        tables: {
          total: 0,
          occupied: 0,
          free: 0,
          averageOccupancy: 0,
        },
        users: {
          active: 0,
          byRole: {},
          sessions: [],
        },
      },
      system: {
        lastUpdate: new Date().toISOString(),
        uptime: Date.now(),
        memory: 0,
        database: {
          queries: 0,
          slowQueries: [],
          errors: 0,
        },
      },
    };
  }

  // Generar métricas para todos los restaurantes
  async generateAllRestaurantMetrics() {
    if (this.isCollecting) return;

    this.isCollecting = true;
    console.log("📊 Generando métricas para todos los restaurantes...");

    try {
      // Obtener todos los restaurantes
      const restaurants = await this.getAllRestaurants();
      this.restaurants = restaurants;

      // Limpiar métricas anteriores
      this.metrics = {};

      // Generar métricas para cada restaurante
      for (const restaurant of restaurants) {
        await this.generateRestaurantMetrics(restaurant.id);
      }

      // Guardar métricas en Firestore
      await this.saveMetricsToFirestore();

      console.log("✅ Métricas generadas y guardadas exitosamente");
    } catch (error) {
      console.error("❌ Error generando métricas:", error);
    } finally {
      this.isCollecting = false;
    }
  }

  // Obtener todos los restaurantes
  async getAllRestaurants() {
    try {
      const { collection, getDocs } = await import("firebase/firestore");
      const { db } = await import("../firebase/config");

      const restaurantsRef = collection(db, "restaurantes");
      const snapshot = await getDocs(restaurantsRef);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error obteniendo restaurantes:", error);
      return [];
    }
  }

  // Configurar listeners de performance
  setupPerformanceListeners() {
    // Performance API
    if (typeof window !== "undefined" && window.performance) {
      // Observer de navegación
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordPageLoad(entry);
        });
      });

      try {
        observer.observe({ entryTypes: ["navigation"] });
      } catch (e) {
        console.warn("PerformanceObserver no soportado");
      }

      // Observer de recursos
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordResourceLoad(entry);
        });
      });

      try {
        resourceObserver.observe({ entryTypes: ["resource"] });
      } catch (e) {
        console.warn("Resource PerformanceObserver no soportado");
      }
    }

    // Error tracking
    window.addEventListener("error", (event) => {
      this.recordError(event.error || new Error(event.message), "runtime");
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.recordError(event.reason, "promise");
    });
  }

  // Configurar listeners de negocio
  setupBusinessListeners() {
    // Interceptar llamadas a la API para métricas de negocio
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = args[0];

      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;

        this.recordApiCall(url, duration, response.status);

        // Detectar acciones de negocio basadas en URLs
        this.detectBusinessActions(url, response);

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        this.recordApiCall(url, duration, 0, error);
        throw error;
      }
    };
  }

  // Configurar listeners del sistema
  setupSystemListeners() {
    // Monitoreo de memoria (si está disponible)
    if (performance.memory) {
      setInterval(() => {
        this.recordMemoryUsage();
      }, 10000);
    }

    // Monitoreo de conexión
    if (navigator.connection) {
      navigator.connection.addEventListener("change", () => {
        this.recordConnectionChange();
      });
    }

    // Monitoreo de visibilidad
    document.addEventListener("visibilitychange", () => {
      this.recordVisibilityChange();
    });
  }

  // Registrar carga de página
  recordPageLoad(entry) {
    const page = window.location.pathname;
    const loadTime = entry.loadEventEnd - entry.loadEventStart;

    if (!this.metrics.performance.pageLoads[page]) {
      this.metrics.performance.pageLoads[page] = {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0,
      };
    }

    const pageMetrics = this.metrics.performance.pageLoads[page];
    pageMetrics.count++;
    pageMetrics.totalTime += loadTime;
    pageMetrics.avgTime = pageMetrics.totalTime / pageMetrics.count;
    pageMetrics.minTime = Math.min(pageMetrics.minTime, loadTime);
    pageMetrics.maxTime = Math.max(pageMetrics.maxTime, loadTime);
  }

  // Registrar carga de recursos
  recordResourceLoad(entry) {
    // Solo registrar recursos importantes
    if (entry.initiatorType === "fetch" || entry.name.includes("/api/")) {
      this.metrics.system.network.requests++;
      this.metrics.system.network.avgResponseTime =
        (this.metrics.system.network.avgResponseTime *
          (this.metrics.system.network.requests - 1) +
          entry.duration) /
        this.metrics.system.network.requests;
    }
  }

  // Registrar llamada a API
  recordApiCall(url, duration, status, error = null) {
    const apiCall = {
      url,
      duration,
      status,
      timestamp: Date.now(),
      error: error?.message,
    };

    this.metrics.performance.apiCalls[url] = this.metrics.performance.apiCalls[
      url
    ] || {
      count: 0,
      totalDuration: 0,
      avgDuration: 0,
      errors: 0,
      lastCall: null,
    };

    const apiMetrics = this.metrics.performance.apiCalls[url];
    apiMetrics.count++;
    apiMetrics.totalDuration += duration;
    apiMetrics.avgDuration = apiMetrics.totalDuration / apiMetrics.count;
    apiMetrics.lastCall = apiCall;

    if (error || status >= 400) {
      apiMetrics.errors++;
      this.metrics.system.network.errors++;
    }
  }

  // Detectar acciones de negocio
  detectBusinessActions(url, response) {
    const urlStr = typeof url === "string" ? url : url.toString();

    // Detectar creación de pedidos
    if (urlStr.includes("/api/pedidos") && response.status === 201) {
      this.recordBusinessAction("order_created", { url: urlStr });
    }

    // Detectar actualizaciones de inventario
    if (
      urlStr.includes("/api/stock") ||
      urlStr.includes("/api/materia-prima")
    ) {
      this.recordBusinessAction("inventory_updated", { url: urlStr });
    }

    // Detectar login de usuarios
    if (urlStr.includes("/api/auth") && response.status === 200) {
      this.recordBusinessAction("user_login", { url: urlStr });
    }
  }

  // Registrar acción de negocio
  recordBusinessAction(action, data = {}) {
    const actionRecord = {
      action,
      data,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.metrics.performance.userActions.push(actionRecord);

    // Mantener solo las últimas 100 acciones
    if (this.metrics.performance.userActions.length > 100) {
      this.metrics.performance.userActions =
        this.metrics.performance.userActions.slice(-100);
    }
  }

  // Registrar error
  recordError(error, type = "unknown") {
    const errorRecord = {
      message: error.message,
      stack: error.stack,
      type,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.metrics.performance.errors.push(errorRecord);

    // Mantener solo los últimos 50 errores
    if (this.metrics.performance.errors.length > 50) {
      this.metrics.performance.errors =
        this.metrics.performance.errors.slice(-50);
    }
  }

  // Registrar uso de memoria
  recordMemoryUsage() {
    if (performance.memory) {
      this.metrics.system.memory.push({
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now(),
      });

      // Mantener solo las últimas 100 mediciones
      if (this.metrics.system.memory.length > 100) {
        this.metrics.system.memory = this.metrics.system.memory.slice(-100);
      }
    }
  }

  // Registrar cambio de conexión
  recordConnectionChange() {
    if (navigator.connection) {
      this.recordBusinessAction("connection_change", {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
      });
    }
  }

  // Registrar cambio de visibilidad
  recordVisibilityChange() {
    this.recordBusinessAction("visibility_change", {
      hidden: document.hidden,
    });
  }

  // Registrar hit de cache
  recordCacheHit() {
    this.metrics.performance.cacheHits++;
  }

  // Registrar miss de cache
  recordCacheMiss() {
    this.metrics.performance.cacheMisses++;
  }

  // Registrar métricas de pedidos
  recordOrder(orderData) {
    this.metrics.business.orders.total++;

    const restaurantId = orderData.restaurantId || "unknown";
    this.metrics.business.orders.byRestaurant[restaurantId] =
      (this.metrics.business.orders.byRestaurant[restaurantId] || 0) + 1;

    const hour = new Date().getHours();
    this.metrics.business.orders.byHour[hour] =
      (this.metrics.business.orders.byHour[hour] || 0) + 1;

    const day = new Date().toDateString();
    this.metrics.business.orders.byDay[day] =
      (this.metrics.business.orders.byDay[day] || 0) + 1;

    // Actualizar valor promedio
    const currentTotal =
      this.metrics.business.orders.averageValue *
      (this.metrics.business.orders.total - 1);
    this.metrics.business.orders.averageValue =
      (currentTotal + (orderData.total || 0)) /
      this.metrics.business.orders.total;
  }

  // Registrar métricas de inventario
  recordInventoryUpdate(inventoryData) {
    if (inventoryData.stock <= 5 && inventoryData.stock > 0) {
      this.metrics.business.inventory.lowStock++;
    }

    if (inventoryData.stock === 0) {
      this.metrics.business.inventory.outOfStock++;
    }

    this.metrics.business.inventory.totalValue +=
      (inventoryData.stock || 0) * (inventoryData.precio || 0);

    this.metrics.business.inventory.movements.push({
      item: inventoryData.nombre,
      stock: inventoryData.stock,
      timestamp: Date.now(),
    });

    // Mantener solo los últimos 100 movimientos
    if (this.metrics.business.inventory.movements.length > 100) {
      this.metrics.business.inventory.movements =
        this.metrics.business.inventory.movements.slice(-100);
    }
  }

  // Registrar sesión de usuario
  recordUserSession(userData) {
    this.metrics.business.users.active++;

    const role = userData.rol || "unknown";
    this.metrics.business.users.byRole[role] =
      (this.metrics.business.users.byRole[role] || 0) + 1;

    this.metrics.business.users.sessions.push({
      user: userData.usuario || userData.email,
      role,
      timestamp: Date.now(),
    });

    // Mantener solo las últimas 100 sesiones
    if (this.metrics.business.users.sessions.length > 100) {
      this.metrics.business.users.sessions =
        this.metrics.business.users.sessions.slice(-100);
    }
  }

  // Registrar restaurante activo
  recordRestaurantActivity(restaurantData) {
    this.metrics.business.restaurants.active++;

    this.metrics.business.restaurants.performance[restaurantData.id] = {
      name: restaurantData.nombre,
      lastActivity: Date.now(),
      orders: this.metrics.business.orders.byRestaurant[restaurantData.id] || 0,
    };
  }

  // Obtener métricas actuales
  getMetrics() {
    return {
      ...this.metrics,
      system: {
        ...this.metrics.system,
        uptime: Date.now() - this.metrics.system.uptime,
      },
    };
  }

  // Obtener métricas resumidas
  getSummary() {
    const metrics = this.getMetrics();

    return {
      performance: {
        totalPageLoads: Object.values(metrics.performance.pageLoads).reduce(
          (sum, page) => sum + page.count,
          0
        ),
        avgPageLoadTime:
          Object.values(metrics.performance.pageLoads).reduce(
            (sum, page) => sum + page.avgTime,
            0
          ) / Math.max(Object.keys(metrics.performance.pageLoads).length, 1),
        cacheHitRate:
          (metrics.performance.cacheHits /
            Math.max(
              metrics.performance.cacheHits + metrics.performance.cacheMisses,
              1
            )) *
          100,
        totalErrors: metrics.performance.errors.length,
        totalApiCalls: Object.values(metrics.performance.apiCalls).reduce(
          (sum, api) => sum + api.count,
          0
        ),
        avgApiResponseTime:
          Object.values(metrics.performance.apiCalls).reduce(
            (sum, api) => sum + api.avgDuration,
            0
          ) / Math.max(Object.keys(metrics.performance.apiCalls).length, 1),
      },
      business: {
        totalOrders: metrics.business.orders.total,
        avgOrderValue: metrics.business.orders.averageValue,
        activeUsers: metrics.business.users.active,
        activeRestaurants: metrics.business.restaurants.active,
        lowStockItems: metrics.business.inventory.lowStock,
        outOfStockItems: metrics.business.inventory.outOfStock,
        inventoryValue: metrics.business.inventory.totalValue,
      },
      system: {
        uptime: metrics.system.uptime,
        memoryUsage:
          metrics.system.memory.length > 0
            ? metrics.system.memory[metrics.system.memory.length - 1]
            : null,
        networkRequests: metrics.system.network.requests,
        networkErrors: metrics.system.network.errors,
        avgNetworkResponseTime: metrics.system.network.avgResponseTime,
      },
    };
  }

  // Enviar métricas al servidor
  async flushMetrics() {
    if (!this.isCollecting) return;

    try {
      const metrics = this.getMetrics();
      const summary = this.getSummary();

      // Enviar al servidor (solo si estamos en modo superadmin)
      const currentPath = window.location.pathname;
      if (currentPath.includes("/home-master")) {
        await fetch("/api/metrics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            metrics,
            summary,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          }),
        });
      }

      // Notificar a listeners
      this.notifyListeners(summary);
    } catch (error) {
      console.error("Error enviando métricas:", error);
    }
  }

  // Suscribirse a cambios de métricas
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  // Notificar a listeners
  notifyListeners(summary) {
    this.listeners.forEach((callback) => {
      try {
        callback(summary);
      } catch (error) {
        console.error("Error en listener de métricas:", error);
      }
    });
  }

  // Limpiar métricas
  clear() {
    this.metrics = {
      performance: {
        pageLoads: {},
        apiCalls: {},
        cacheHits: 0,
        cacheMisses: 0,
        errors: [],
        userActions: [],
      },
      business: {
        orders: {
          total: 0,
          byRestaurant: {},
          byHour: {},
          byDay: {},
          averageValue: 0,
        },
        inventory: {
          lowStock: 0,
          outOfStock: 0,
          totalValue: 0,
          movements: [],
        },
        users: {
          active: 0,
          byRole: {},
          sessions: [],
        },
        restaurants: {
          active: 0,
          performance: {},
        },
      },
      system: {
        uptime: Date.now(),
        memory: [],
        network: {
          requests: 0,
          errors: 0,
          avgResponseTime: 0,
        },
        database: {
          queries: 0,
          slowQueries: [],
          errors: 0,
        },
      },
    };
  }
}

// Instancia global del recolector de métricas
const metricsCollector = new MetricsCollector();

export default metricsCollector;
