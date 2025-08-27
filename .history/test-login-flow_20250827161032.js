// Script de prueba para verificar el flujo de login
console.log("🧪 Probando flujo de login...");

// Simular datos después del prelogin (solo datos del restaurante)
localStorage.setItem("restauranteId", "test_restaurant");
localStorage.setItem("nombreResto", "Test Restaurant");
localStorage.setItem("cantUsuarios", "5");
localStorage.setItem("finanzas", "true");
localStorage.setItem("logo", "");

// NO establecer datos de usuario específico
// localStorage.setItem("usuario", "admin");
// localStorage.setItem("rol", "admin");
// localStorage.setItem("usuarioId", "admin_id");
// localStorage.setItem("nombreCompleto", "Admin User");

console.log("📋 Datos simulados después del prelogin:");
console.log("- restauranteId:", localStorage.getItem("restauranteId"));
console.log("- nombreResto:", localStorage.getItem("nombreResto"));
console.log("- usuario:", localStorage.getItem("usuario"));
console.log("- rol:", localStorage.getItem("rol"));
console.log("- usuarioId:", localStorage.getItem("usuarioId"));
console.log("- nombreCompleto:", localStorage.getItem("nombreCompleto"));

// Verificar lógica de autenticación
const restauranteId = localStorage.getItem("restauranteId");
const usuario = localStorage.getItem("usuario");
const rol = localStorage.getItem("rol");
const usuarioId = localStorage.getItem("usuarioId");
const nombreCompleto = localStorage.getItem("nombreCompleto");

console.log("\n🔍 Verificando lógica de autenticación:");
console.log("- Datos del restaurante disponibles:", !!(restauranteId && usuario && rol));
console.log("- Usuario específico logueado:", !!(usuarioId && nombreCompleto));
console.log("- Debería permitir login:", !(usuarioId && nombreCompleto));

console.log("\n✅ Prueba completada. El usuario debería poder elegir usuario y contraseña.");
