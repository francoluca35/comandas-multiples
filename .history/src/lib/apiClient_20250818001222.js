// Cliente API optimizado para la versión 2.0
class ApiClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
    this.timeout = 10000; // 10 segundos
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 segundo
    
    // Cache de requests
    this.requestCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    
    // Interceptors
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    
    // Métricas
    this.metrics = {
      requests: 0,
      cacheHits: 0,
      errors: 0,
      avgResponseTime: 0,
    };
  }

  // Agregar interceptor de request
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  // Agregar interceptor de response
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  // Generar cache key
  generateCacheKey(url, options = {}) {
    const { method = 'GET', body, params } = options;
    const key = `${method}:${url}`;
    
    if (body) {
      return `${key}:${JSON.stringify(body)}`;
    }
    
    if (params) {
      return `${key}:${JSON.stringify(params)}`;
    }
    
    return key;
  }

  // Verificar cache
  getFromCache(cacheKey) {
    const cached = this.requestCache.get(cacheKey);
    if (!cached) return null;

    const { data, timestamp } = cached;
    const now = Date.now();

    if (now - timestamp > this.cacheTimeout) {
      this.requestCache.delete(cacheKey);
      return null;
    }

    this.metrics.cacheHits++;
    return data;
  }

  // Guardar en cache
  setCache(cacheKey, data) {
    this.requestCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  // Limpiar cache
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.requestCache.keys()) {
        if (key.includes(pattern)) {
          this.requestCache.delete(key);
        }
      }
    } else {
      this.requestCache.clear();
    }
  }

  // Delay con backoff exponencial
  async delay(attempt) {
    const delayTime = this.retryDelay * Math.pow(2, attempt - 1);
    await new Promise(resolve => setTimeout(resolve, delayTime));
  }

  // Request con retry automático
  async request(url, options = {}) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(url, options);
    
    // Verificar cache para GET requests
    if (options.method === 'GET' || !options.method) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('📦 Cache hit:', url);
        return cached;
      }
    }

    // Aplicar interceptors de request
    let finalOptions = { ...options };
    for (const interceptor of this.requestInterceptors) {
      finalOptions = await interceptor(url, finalOptions);
    }

    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`🌐 Request (attempt ${attempt}):`, url);
        
        const response = await this.makeRequest(url, finalOptions);
        
        // Aplicar interceptors de response
        let finalResponse = response;
        for (const interceptor of this.responseInterceptors) {
          finalResponse = await interceptor(url, finalResponse);
        }

        // Calcular métricas
        const responseTime = Date.now() - startTime;
        this.updateMetrics(responseTime);

        // Cachear respuesta exitosa
        if (response.ok && (options.method === 'GET' || !options.method)) {
          this.setCache(cacheKey, finalResponse);
        }

        return finalResponse;

      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Request failed (attempt ${attempt}):`, error.message);
        
        if (attempt < this.retryAttempts) {
          await this.delay(attempt);
        }
      }
    }

    // Todas las tentativas fallaron
    this.metrics.errors++;
    throw lastError;
  }

  // Request HTTP real
  async makeRequest(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
      
      const response = await fetch(fullUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  // Actualizar métricas
  updateMetrics(responseTime) {
    this.metrics.requests++;
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (this.metrics.requests - 1) + responseTime) / 
      this.metrics.requests;
  }

  // Métodos HTTP
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  async patch(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Obtener métricas
  getMetrics() {
    return {
      ...this.metrics,
      cacheHitRate: this.metrics.requests > 0 
        ? (this.metrics.cacheHits / this.metrics.requests * 100).toFixed(2)
        : 0,
      errorRate: this.metrics.requests > 0
        ? (this.metrics.errors / this.metrics.requests * 100).toFixed(2)
        : 0,
    };
  }

  // Resetear métricas
  resetMetrics() {
    this.metrics = {
      requests: 0,
      cacheHits: 0,
      errors: 0,
      avgResponseTime: 0,
    };
  }
}

// Instancia global del cliente API
const apiClient = new ApiClient();

// Interceptor para agregar headers de autenticación
apiClient.addRequestInterceptor(async (url, options) => {
  const restaurantId = localStorage.getItem('restauranteId');
  if (restaurantId) {
    options.headers = {
      ...options.headers,
      'X-Restaurant-ID': restaurantId,
    };
  }
  return options;
});

// Interceptor para manejar errores comunes
apiClient.addResponseInterceptor(async (url, response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    switch (response.status) {
      case 401:
        // Redirigir a login
        window.location.href = '/login';
        break;
      case 403:
        console.error('Acceso denegado:', errorData);
        break;
      case 404:
        console.error('Recurso no encontrado:', url);
        break;
      case 500:
        console.error('Error del servidor:', errorData);
        break;
      default:
        console.error('Error HTTP:', response.status, errorData);
    }
  }
  
  return response;
});

// Interceptor para logging
apiClient.addResponseInterceptor(async (url, response) => {
  console.log(`📊 API Response: ${response.status} - ${url}`);
  return response;
});

export default apiClient;
