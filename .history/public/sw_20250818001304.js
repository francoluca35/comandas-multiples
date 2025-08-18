const CACHE_NAME = "comandas-v2.0";
const STATIC_CACHE = "static-v2.0";
const DYNAMIC_CACHE = "dynamic-v2.0";
const API_CACHE = "api-v2.0";

// Archivos críticos para funcionamiento offline
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/Assets/LogoApp.png",
  "/favicon.ico",
];

// Estrategias de cache
const CACHE_STRATEGIES = {
  STATIC_FIRST: "static-first",
  NETWORK_FIRST: "network-first",
  CACHE_FIRST: "cache-first",
  NETWORK_ONLY: "network-only",
};

// Instalación del Service Worker
self.addEventListener("install", (event) => {
  console.log("🚀 Service Worker instalando...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("📦 Cacheando archivos estáticos...");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("✅ Service Worker instalado correctamente");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("❌ Error en instalación:", error);
      })
  );
});

// Activación del Service Worker
self.addEventListener("activate", (event) => {
  console.log("🔄 Service Worker activando...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Limpiar caches antiguos
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE
            ) {
              console.log("🗑️ Eliminando cache antiguo:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("✅ Service Worker activado");
        return self.clients.claim();
      })
  );
});

// Interceptar requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estrategia según el tipo de request
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirst(request, API_CACHE));
  } else if (isPageRequest(request)) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(networkOnly(request));
  }
});

// Funciones auxiliares
function isStaticAsset(request) {
  return (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font"
  );
}

function isAPIRequest(request) {
  return (
    request.url.includes("/api/") ||
    request.url.includes("firestore.googleapis.com")
  );
}

function isPageRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}

// Estrategia: Cache First (para assets estáticos)
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error("Error en cacheFirst:", error);
    return new Response("Error de red", { status: 503 });
  }
}

// Estrategia: Network First (para APIs y páginas)
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("🌐 Red no disponible, usando cache...");
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback para páginas
    if (request.mode === "navigate") {
      return caches.match("/offline");
    }

    return new Response("Sin conexión", { status: 503 });
  }
}

// Estrategia: Network Only (para datos críticos)
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error("Error en networkOnly:", error);
    return new Response("Error de red", { status: 503 });
  }
}

// Background Sync para datos offline
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  try {
    console.log("🔄 Sincronizando datos offline...");

    // Obtener datos pendientes del IndexedDB
    const pendingData = await getPendingData();

    for (const data of pendingData) {
      try {
        await fetch(data.url, {
          method: data.method,
          headers: data.headers,
          body: data.body,
        });

        // Marcar como sincronizado
        await removePendingData(data.id);
      } catch (error) {
        console.error("Error sincronizando:", error);
      }
    }

    console.log("✅ Sincronización completada");
  } catch (error) {
    console.error("Error en syncOfflineData:", error);
  }
}

// Push notifications
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Nueva notificación",
    icon: "/Assets/LogoApp.png",
    badge: "/Assets/LogoApp.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Ver",
        icon: "/Assets/LogoApp.png",
      },
      {
        action: "close",
        title: "Cerrar",
        icon: "/Assets/LogoApp.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("Comandas App", options));
});

// Click en notificación
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// Funciones auxiliares para IndexedDB (simplificadas)
async function getPendingData() {
  // Implementar lógica para obtener datos pendientes
  return [];
}

async function removePendingData(id) {
  // Implementar lógica para remover datos sincronizados
  return Promise.resolve();
}
