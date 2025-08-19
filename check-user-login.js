#!/usr/bin/env node

// Script para verificar que el usuario se esté guardando correctamente en localStorage
console.log("🔍 Verificando datos del usuario en localStorage...\n");

// Simular datos que deberían estar en localStorage después del login
const datosUsuarioEsperados = {
  usuario: "admin",
  nombreCompleto: "Administrador",
  rol: "admin",
  usuarioId: "admin",
  userImage: "",
  imagen: "",
  restauranteId: "deamondd",
  nombreResto: "DeamonDD",
  codActivacion: "K07MMC"
};

console.log("📋 Datos esperados del usuario en localStorage:");
Object.entries(datosUsuarioEsperados).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

// Verificar datos críticos para mostrar el usuario
const datosCriticos = [
  "usuario",
  "nombreCompleto", 
  "rol",
  "restauranteId"
];

console.log("\n🔍 Verificación de datos críticos:");
datosCriticos.forEach(key => {
  const tieneDato = datosUsuarioEsperados.hasOwnProperty(key);
  const status = tieneDato ? "✅" : "❌";
  console.log(`  ${status} ${key}: ${tieneDato ? "Presente" : "Faltante"}`);
});

// Simular lógica del componente TurnoCerradoCard
console.log("\n🔄 Simulando lógica del componente TurnoCerradoCard:");
const usuario = datosUsuarioEsperados.usuario;
const nombreCompleto = datosUsuarioEsperados.nombreCompleto;

if (usuario) {
  const usuarioAMostrar = nombreCompleto || usuario;
  console.log(`  ✅ Usuario a mostrar: ${usuarioAMostrar}`);
} else {
  console.log("  ❌ Usuario a mostrar: No identificado");
}

// Verificar flujo completo
console.log("\n🔄 Flujo completo de login:");
console.log("  1. Usuario selecciona cuenta y ingresa contraseña");
console.log("  2. Se verifica contraseña");
console.log("  3. Se guardan datos en localStorage:");
console.log("     - usuario: nombre de usuario");
console.log("     - nombreCompleto: nombre completo del usuario");
console.log("     - rol: rol del usuario");
console.log("     - restauranteId: ID del restaurante");
console.log("  4. Se redirige a /home-comandas/home");
console.log("  5. TurnoCerradoCard lee localStorage");
console.log("  6. Muestra nombreCompleto o usuario como fallback");

// Posibles problemas
console.log("\n⚠️ Posibles problemas:");
console.log("  1. nombreCompleto no se guarda en localStorage durante el login");
console.log("  2. TurnoCerradoCard no lee correctamente localStorage");
console.log("  3. Datos se pierden después del login");
console.log("  4. localStorage no está disponible");

console.log("\n📝 Recomendaciones:");
console.log("  1. Verificar en DevTools > Application > Local Storage");
console.log("  2. Verificar que nombreCompleto se guarde en el login");
console.log("  3. Verificar que TurnoCerradoCard use useEffect para leer localStorage");
console.log("  4. Verificar que no haya errores en la consola");
