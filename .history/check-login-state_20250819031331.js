#!/usr/bin/env node

// Script para verificar el estado del localStorage después del login
console.log("🔍 Verificando estado del localStorage después del login...\n");

// Simular datos que deberían estar en localStorage después del login
const datosEsperados = {
  nombreResto: "DeamonDD",
  codActivacion: "K07MMC",
  restauranteId: "deamondd",
  usuario: "admin",
  rol: "admin",
  usuarioId: "admin",
  userImage: "",
  imagen: ""
};

console.log("📋 Datos esperados en localStorage después del login:");
Object.entries(datosEsperados).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

// Verificar que todos los datos necesarios estén presentes
const datosRequeridos = [
  "nombreResto",
  "codActivacion", 
  "restauranteId",
  "usuario",
  "rol"
];

console.log("\n🔍 Verificación de datos requeridos:");
datosRequeridos.forEach(key => {
  const tieneDato = datosEsperados.hasOwnProperty(key);
  const status = tieneDato ? "✅" : "❌";
  console.log(`  ${status} ${key}: ${tieneDato ? "Presente" : "Faltante"}`);
});

// Verificar consistencia del restauranteId
const nombreResto = datosEsperados.nombreResto;
const restauranteIdGenerado = nombreResto
  .toLowerCase()
  .replace(/[^a-z0-9]/g, "_")
  .replace(/_+/g, "_")
  .replace(/^_|_$/g, "");

const restauranteIdAlmacenado = datosEsperados.restauranteId;

console.log("\n🔧 Verificación de restauranteId:");
console.log(`  - Nombre del restaurante: ${nombreResto}`);
console.log(`  - ID generado: ${restauranteIdGenerado}`);
console.log(`  - ID almacenado: ${restauranteIdAlmacenado}`);
console.log(`  - ¿Coinciden?: ${restauranteIdGenerado === restauranteIdAlmacenado ? "✅" : "❌"}`);

// Simular flujo de login
console.log("\n🔄 Simulando flujo de login:");
console.log("  1. Usuario ingresa credenciales");
console.log("  2. Se verifica código de activación");
console.log("  3. Se guardan datos en localStorage");
console.log("  4. Se redirige a /home-comandas/home");
console.log("  5. RestaurantContext carga datos del localStorage");
console.log("  6. RestaurantGuard verifica que restauranteActual existe");

// Posibles problemas
console.log("\n⚠️ Posibles problemas:");
console.log("  1. localStorage no se guarda correctamente");
console.log("  2. RestaurantContext no encuentra el restaurante en Firebase");
console.log("  3. Código de activación no coincide");
console.log("  4. restauranteId no se genera correctamente");
console.log("  5. RestaurantGuard redirige antes de que se cargue el contexto");

console.log("\n📝 Recomendaciones:");
console.log("  1. Verificar en DevTools > Application > Local Storage");
console.log("  2. Verificar en DevTools > Console los logs del RestaurantContext");
console.log("  3. Verificar que Firebase esté conectado correctamente");
console.log("  4. Verificar que el documento del restaurante exista en Firebase");
