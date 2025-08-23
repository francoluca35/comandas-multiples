// Script para debuggear el estado de autenticación
console.log("🔍 === DEBUG AUTH STATE ===");

// Verificar localStorage
const authData = {
  usuario: localStorage.getItem("usuario"),
  rol: localStorage.getItem("rol"),
  restauranteId: localStorage.getItem("restauranteId"),
  nombreResto: localStorage.getItem("nombreResto"),
  codActivacion: localStorage.getItem("codActivacion"),
  emailResto: localStorage.getItem("emailResto"),
  cantUsuarios: localStorage.getItem("cantUsuarios"),
  finanzas: localStorage.getItem("finanzas"),
  logo: localStorage.getItem("logo"),
  usuarioId: localStorage.getItem("usuarioId"),
  nombreCompleto: localStorage.getItem("nombreCompleto"),
  userImage: localStorage.getItem("userImage"),
  imagen: localStorage.getItem("imagen"),
};

console.log("📋 Datos en localStorage:", authData);

// Verificar si hay datos mínimos necesarios
const hasMinimalData = authData.usuario && authData.rol && authData.restauranteId;
console.log("✅ Datos mínimos presentes:", hasMinimalData);

// Verificar la ruta actual
const currentPath = window.location.pathname;
console.log("📍 Ruta actual:", currentPath);

// Verificar si estamos en el sistema de restaurantes
const isRestaurantSystem = currentPath.includes("/home-comandas");
console.log("🏪 Sistema de restaurantes:", isRestaurantSystem);

// Verificar si debería estar autenticado
const shouldBeAuthenticated = isRestaurantSystem && hasMinimalData;
console.log("🔐 Debería estar autenticado:", shouldBeAuthenticated);

// Verificar si está en la página de login cuando debería estar autenticado
const isOnLoginPage = currentPath === "/home-comandas" || currentPath === "/home-comandas/login";
const isOnHomePage = currentPath === "/home-comandas/home";

console.log("📄 En página de login:", isOnLoginPage);
console.log("🏠 En página home:", isOnHomePage);

if (shouldBeAuthenticated && isOnLoginPage) {
  console.log("⚠️ PROBLEMA: Usuario autenticado pero en página de login");
  console.log("💡 Solución: Debería redirigir a /home-comandas/home");
} else if (!shouldBeAuthenticated && isOnHomePage) {
  console.log("⚠️ PROBLEMA: Usuario no autenticado pero en página home");
  console.log("💡 Solución: Debería redirigir a /home-comandas/login");
} else {
  console.log("✅ Estado de autenticación correcto");
}

console.log("🔍 === FIN DEBUG ===");
