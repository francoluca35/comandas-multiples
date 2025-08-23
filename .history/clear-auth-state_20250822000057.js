// Script para limpiar el estado de autenticación
console.log("🧹 Limpiando estado de autenticación...");

// Limpiar datos de restaurante
localStorage.removeItem("usuario");
localStorage.removeItem("rol");
localStorage.removeItem("restauranteId");
localStorage.removeItem("nombreResto");
localStorage.removeItem("codActivacion");
localStorage.removeItem("emailResto");
localStorage.removeItem("cantUsuarios");
localStorage.removeItem("finanzas");
localStorage.removeItem("logo");
localStorage.removeItem("usuarioId");
localStorage.removeItem("nombreCompleto");
localStorage.removeItem("userImage");
localStorage.removeItem("imagen");

// Limpiar datos recordados
localStorage.removeItem("recordedEmail");
localStorage.removeItem("recordedCod");

console.log("✅ Estado de autenticación limpiado");
console.log("🔄 Redirigiendo a /comandas/prelogin...");

// Redirigir al prelogin
window.location.href = "/comandas/prelogin";
