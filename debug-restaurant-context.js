#!/usr/bin/env node

// Script para debuggear el contexto del restaurante
console.log("🔍 Debuggeando contexto del restaurante...\n");

// Simular localStorage
const mockLocalStorage = {
  nombreResto: "DeamonDD",
  codActivacion: "K07MMC",
  restauranteId: "deamondd",
  usuario: "admin",
  rol: "admin",
};

console.log("📋 Datos en localStorage:");
Object.entries(mockLocalStorage).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

// Generar ID del restaurante
const nombreResto = mockLocalStorage.nombreResto;
const restauranteId = nombreResto
  .toLowerCase()
  .replace(/[^a-z0-9]/g, "_")
  .replace(/_+/g, "_")
  .replace(/^_|_$/g, "");

console.log("\n🔧 ID del restaurante generado:", restauranteId);

// Verificar si coincide con el almacenado
const restauranteIdAlmacenado = mockLocalStorage.restauranteId;
console.log("🔧 ID del restaurante almacenado:", restauranteIdAlmacenado);
console.log("🔧 ¿Coinciden?:", restauranteId === restauranteIdAlmacenado);

// Simular estructura de datos esperada
const estructuraEsperada = {
  restaurantes: {
    deamondd: {
      nombre: "DeamonDD",
      codigoActivacion: "K07MMC",
      cantidadUsuarios: 2,
      conFinanzas: true,
    },
  },
};

console.log("\n📊 Estructura esperada en Firebase:");
console.log(JSON.stringify(estructuraEsperada, null, 2));

// Verificar campos
console.log("\n🔍 Verificación de campos:");
console.log(`  - Campo en documento: codigoActivacion`);
console.log(`  - Valor esperado: ${mockLocalStorage.codActivacion}`);
console.log(
  `  - Coincidencia: ${
    estructuraEsperada.restaurantes.deamondd.codigoActivacion ===
    mockLocalStorage.codActivacion
  }`
);

console.log("\n📝 Recomendaciones:");
console.log(
  "  1. Verificar que el campo en Firebase se llame 'codigoActivacion'"
);
console.log("  2. Verificar que el valor coincida exactamente");
console.log("  3. Verificar que el restauranteId se genere correctamente");
console.log("  4. Verificar que localStorage tenga todos los datos necesarios");
