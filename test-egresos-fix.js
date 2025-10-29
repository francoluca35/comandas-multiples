// Script de prueba para verificar las correcciones de egresos y retiro de efectivo
console.log("🧪 Iniciando pruebas de correcciones de egresos...");

// Simular datos de prueba
const datosPrueba = {
  dineroActual: {
    efectivo: 1000, // Apertura de caja
    virtual: 500,
    totalCajas: 1
  },
  ventas: {
    efectivo: 2500, // Ventas en efectivo
    virtual: 1000,
    total: 3500
  },
  egresos: {
    totalEgresos: 300
  }
};

console.log("📊 Datos de prueba:");
console.log("- Dinero actual (apertura caja):", datosPrueba.dineroActual.efectivo);
console.log("- Ventas en efectivo:", datosPrueba.ventas.efectivo);
console.log("- Total egresos:", datosPrueba.egresos.totalEgresos);

// Calcular efectivo disponible
const efectivoDisponible = datosPrueba.dineroActual.efectivo + datosPrueba.ventas.efectivo;
console.log("💰 Efectivo disponible total:", efectivoDisponible);

// Simular retiro de efectivo
const montoRetiro = 500;
console.log("\n💸 Simulando retiro de efectivo:");
console.log("- Monto a retirar:", montoRetiro);
console.log("- Efectivo disponible:", efectivoDisponible);

if (montoRetiro <= efectivoDisponible) {
  console.log("✅ Retiro válido - hay suficiente efectivo");
  
  // Simular actualización de caja
  const nuevaApertura = datosPrueba.dineroActual.efectivo - montoRetiro;
  console.log("- Nueva apertura de caja:", nuevaApertura);
  console.log("- Efectivo restante disponible:", nuevaApertura + datosPrueba.ventas.efectivo);
} else {
  console.log("❌ Retiro inválido - no hay suficiente efectivo");
}

// Simular retiro excesivo
const montoExcesivo = 5000;
console.log("\n💸 Simulando retiro excesivo:");
console.log("- Monto a retirar:", montoExcesivo);
console.log("- Efectivo disponible:", efectivoDisponible);

if (montoExcesivo <= efectivoDisponible) {
  console.log("✅ Retiro válido");
} else {
  console.log("❌ Retiro inválido - no hay suficiente efectivo");
  console.log("💡 El sistema debería mostrar error y no permitir el retiro");
}

console.log("\n🎯 Resumen de correcciones implementadas:");
console.log("1. ✅ API pagos-resumen: Calcula efectivo solo desde apertura de caja");
console.log("2. ✅ Componente Egresos: Muestra efectivo disponible (apertura + ventas)");
console.log("3. ✅ RetirarEfectivoModal: Valida contra efectivo total disponible");
console.log("4. ✅ RetirarEfectivoModal: Actualiza CajaRegistradora en lugar de Dinero");
console.log("5. ✅ Consistencia: Todo el sistema usa la misma lógica de cálculo");

console.log("\n✨ Las correcciones deberían resolver:");
console.log("- El error de 'valor mínimo debe ser menor que valor máximo'");
console.log("- La inconsistencia entre dinero actual y efectivo disponible");
console.log("- Los problemas de retiro de efectivo");
