// Service Worker personalizado para evitar cachear APIs
self.addEventListener("install", (event) => {
  console.log("Service Worker instalado");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activado");
  event.waitUntil(self.clients.claim());
});

// Interceptar requests para evitar cachear APIs
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // No cachear APIs ni requests POST
  if (url.pathname.startsWith("/api/") || request.method === "POST") {
    // Para APIs y POST requests, usar network only
    event.respondWith(fetch(request));
    return;
  }

  // Para otros requests, usar la estrategia por defecto
  event.respondWith(
    fetch(request).catch(() => {
      // Fallback para requests que fallan
      if (request.destination === "document") {
        return caches.match("/offline.html");
      }
      return new Response("Offline", { status: 503 });
    })
  );
});

// Manejar mensajes del cliente
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
