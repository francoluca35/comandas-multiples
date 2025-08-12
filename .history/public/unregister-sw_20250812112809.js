// Script para desinstalar el Service Worker anterior
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service Worker desinstalado:', registration);
    }
  });
  
  // Limpiar cache
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for (let name of names) {
        caches.delete(name);
        console.log('Cache eliminado:', name);
      }
    });
  }
}
