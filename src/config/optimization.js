// Configuración de optimizaciones de rendimiento

// Configuración de cache
export const CACHE_CONFIG = {
  // Tiempos de cache en milisegundos
  TIMES: {
    SHORT: 30 * 1000, // 30 segundos
    MEDIUM: 5 * 60 * 1000, // 5 minutos
    LONG: 30 * 60 * 1000, // 30 minutos
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 horas
  },

  // Configuración de React Query
  REACT_QUERY: {
    DEFAULT_STALE_TIME: 5 * 60 * 1000, // 5 minutos
    DEFAULT_GC_TIME: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
    MAX_RETRIES: 3,
    RETRY_DELAY: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },

  // Configuración de localStorage
  STORAGE: {
    PREFIX: "comandas_",
    VERSION: "1.0.0",
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
  },
};

// Configuración de lazy loading
export const LAZY_LOADING_CONFIG = {
  // Componentes que se cargan de forma lazy
  COMPONENTS: {
    HEAVY_CHARTS: "src/components/charts/",
    REPORTS: "src/components/reports/",
    ANALYTICS: "src/components/analytics/",
  },

  // Imágenes que se cargan de forma lazy
  IMAGES: {
    THRESHOLD: 0.1, // 10% del viewport
    ROOT_MARGIN: "50px",
  },
};

// Configuración de virtualización
export const VIRTUALIZATION_CONFIG = {
  // Configuración para listas virtuales
  LISTS: {
    ITEM_HEIGHT: 60,
    BUFFER_SIZE: 5,
    MIN_ITEMS_TO_VIRTUALIZE: 100,
  },

  // Configuración para tablas virtuales
  TABLES: {
    ROW_HEIGHT: 50,
    HEADER_HEIGHT: 60,
    BUFFER_SIZE: 10,
  },
};

// Configuración de debounce y throttle
export const DEBOUNCE_CONFIG = {
  SEARCH: 300, // 300ms para búsquedas
  RESIZE: 250, // 250ms para resize
  SCROLL: 100, // 100ms para scroll
  INPUT: 500, // 500ms para inputs
};

// Configuración de optimizaciones de imágenes
export const IMAGE_CONFIG = {
  // Formatos soportados
  FORMATS: ["webp", "avif", "jpg", "png"],

  // Tamaños de imagen
  SIZES: {
    THUMBNAIL: "150x150",
    SMALL: "300x300",
    MEDIUM: "600x600",
    LARGE: "1200x1200",
  },

  // Calidad de compresión
  QUALITY: {
    LOW: 60,
    MEDIUM: 80,
    HIGH: 95,
  },
};

// Configuración de bundle splitting
export const BUNDLE_CONFIG = {
  // Chunks principales
  CHUNKS: {
    VENDOR: "vendor",
    COMMON: "common",
    RUNTIME: "runtime",
  },

  // Límites de tamaño
  SIZE_LIMITS: {
    VENDOR: 500 * 1024, // 500KB
    COMMON: 200 * 1024, // 200KB
    MAIN: 300 * 1024, // 300KB
  },
};

// Configuración de service worker
export const SW_CONFIG = {
  // Estrategias de cache
  STRATEGIES: {
    CACHE_FIRST: "cache-first",
    NETWORK_FIRST: "network-first",
    STALE_WHILE_REVALIDATE: "stale-while-revalidate",
    NETWORK_ONLY: "network-only",
    CACHE_ONLY: "cache-only",
  },

  // Archivos a cachear
  CACHE_FILES: [
    "/",
    "/static/js/bundle.js",
    "/static/css/main.css",
    "/manifest.json",
  ],

  // Tiempo de expiración del cache
  CACHE_EXPIRATION: 7 * 24 * 60 * 60 * 1000, // 7 días
};

// Configuración de métricas de rendimiento
export const PERFORMANCE_CONFIG = {
  // Core Web Vitals
  CORE_WEB_VITALS: {
    LCP: 2500, // Largest Contentful Paint (ms)
    FID: 100, // First Input Delay (ms)
    CLS: 0.1, // Cumulative Layout Shift
  },

  // Métricas personalizadas
  CUSTOM_METRICS: {
    TIME_TO_INTERACTIVE: 3500,
    FIRST_MEANINGFUL_PAINT: 2000,
    SPEED_INDEX: 3000,
  },

  // Umbrales de alerta
  ALERTS: {
    SLOW_LOAD: 3000,
    SLOW_INTERACTION: 100,
    HIGH_MEMORY: 50 * 1024 * 1024, // 50MB
  },
};

// Configuración de optimizaciones de red
export const NETWORK_CONFIG = {
  // Configuración de requests
  REQUESTS: {
    TIMEOUT: 10000, // 10 segundos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },

  // Configuración de prefetch
  PREFETCH: {
    ENABLED: true,
    PRIORITY: "low",
    THROTTLE: 1000, // 1 segundo entre prefetches
  },

  // Configuración de compresión
  COMPRESSION: {
    ENABLED: true,
    ALGORITHM: "gzip",
    MIN_SIZE: 1024, // 1KB
  },
};

// Configuración de optimizaciones de memoria
export const MEMORY_CONFIG = {
  // Límites de memoria
  LIMITS: {
    MAX_HEAP_SIZE: 100 * 1024 * 1024, // 100MB
    WARNING_THRESHOLD: 80 * 1024 * 1024, // 80MB
  },

  // Configuración de garbage collection
  GC: {
    ENABLE_MONITORING: true,
    COLLECT_INTERVAL: 30000, // 30 segundos
  },
};

// Configuración de optimizaciones de renderizado
export const RENDER_CONFIG = {
  // Configuración de React
  REACT: {
    ENABLE_CONCURRENT_MODE: true,
    ENABLE_SUSPENSE: true,
    ENABLE_TRANSITIONS: true,
  },

  // Configuración de CSS
  CSS: {
    ENABLE_CRITICAL_CSS: true,
    ENABLE_CSS_IN_JS: false,
    ENABLE_PURGE_CSS: true,
  },

  // Configuración de fuentes
  FONTS: {
    ENABLE_FONT_DISPLAY_SWAP: true,
    ENABLE_FONT_PRELOAD: true,
    ENABLE_FONT_SUBSETTING: true,
  },
};

// Configuración de optimizaciones de accesibilidad
export const ACCESSIBILITY_CONFIG = {
  // Configuración de ARIA
  ARIA: {
    ENABLE_LIVE_REGIONS: true,
    ENABLE_FOCUS_MANAGEMENT: true,
    ENABLE_KEYBOARD_NAVIGATION: true,
  },

  // Configuración de contraste
  CONTRAST: {
    MIN_RATIO: 4.5,
    LARGE_TEXT_RATIO: 3.0,
  },

  // Configuración de animaciones
  ANIMATIONS: {
    RESPECT_PREFERS_REDUCED_MOTION: true,
    ENABLE_SMOOTH_SCROLLING: true,
  },
};

// Configuración de optimizaciones de SEO
export const SEO_CONFIG = {
  // Configuración de meta tags
  META: {
    ENABLE_DYNAMIC_TITLE: true,
    ENABLE_OPEN_GRAPH: true,
    ENABLE_TWITTER_CARDS: true,
  },

  // Configuración de sitemap
  SITEMAP: {
    ENABLE_AUTO_GENERATION: true,
    UPDATE_FREQUENCY: "daily",
    PRIORITY: 0.8,
  },

  // Configuración de robots
  ROBOTS: {
    ENABLE_ROBOTS_TXT: true,
    ALLOW_INDEXING: true,
    CRAWL_DELAY: 1,
  },
};

// Configuración de optimizaciones de seguridad
export const SECURITY_CONFIG = {
  // Configuración de CSP
  CSP: {
    ENABLE_STRICT_MODE: true,
    ALLOW_INLINE_SCRIPTS: false,
    ALLOW_EVAL: false,
  },

  // Configuración de HTTPS
  HTTPS: {
    ENABLE_HSTS: true,
    ENABLE_HPKP: false,
    ENABLE_CSP: true,
  },

  // Configuración de validación
  VALIDATION: {
    ENABLE_INPUT_SANITIZATION: true,
    ENABLE_XSS_PROTECTION: true,
    ENABLE_CSRF_PROTECTION: true,
  },
};

// Función para obtener configuración específica
export const getConfig = (category, key) => {
  const configs = {
    cache: CACHE_CONFIG,
    lazy: LAZY_LOADING_CONFIG,
    virtual: VIRTUALIZATION_CONFIG,
    debounce: DEBOUNCE_CONFIG,
    image: IMAGE_CONFIG,
    bundle: BUNDLE_CONFIG,
    sw: SW_CONFIG,
    performance: PERFORMANCE_CONFIG,
    network: NETWORK_CONFIG,
    memory: MEMORY_CONFIG,
    render: RENDER_CONFIG,
    accessibility: ACCESSIBILITY_CONFIG,
    seo: SEO_CONFIG,
    security: SECURITY_CONFIG,
  };

  return configs[category]?.[key];
};

// Función para validar configuración
export const validateConfig = (config) => {
  const errors = [];

  // Validar tiempos de cache
  if (config.cache?.TIMES?.SHORT < 1000) {
    errors.push("Cache time too short");
  }

  // Validar límites de memoria
  if (config.memory?.LIMITS?.MAX_HEAP_SIZE > 500 * 1024 * 1024) {
    errors.push("Memory limit too high");
  }

  return errors;
};

// Función para optimizar configuración automáticamente
export const optimizeConfig = (config) => {
  const optimized = { ...config };

  // Optimizar tiempos de cache basado en el dispositivo
  if (navigator.hardwareConcurrency <= 2) {
    optimized.cache.TIMES.SHORT *= 2;
    optimized.cache.TIMES.MEDIUM *= 1.5;
  }

  // Optimizar límites de memoria basado en la memoria disponible
  if (navigator.deviceMemory) {
    optimized.memory.LIMITS.MAX_HEAP_SIZE = Math.min(
      optimized.memory.LIMITS.MAX_HEAP_SIZE,
      navigator.deviceMemory * 50 * 1024 * 1024
    );
  }

  return optimized;
};

export default {
  CACHE_CONFIG,
  LAZY_LOADING_CONFIG,
  VIRTUALIZATION_CONFIG,
  DEBOUNCE_CONFIG,
  IMAGE_CONFIG,
  BUNDLE_CONFIG,
  SW_CONFIG,
  PERFORMANCE_CONFIG,
  NETWORK_CONFIG,
  MEMORY_CONFIG,
  RENDER_CONFIG,
  ACCESSIBILITY_CONFIG,
  SEO_CONFIG,
  SECURITY_CONFIG,
  getConfig,
  validateConfig,
  optimizeConfig,
};
