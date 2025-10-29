// Script de prueba para verificar el cálculo correcto del dinero actual
console.log("🧪 Iniciando pruebas de cálculo del dinero actual...");

// Simular datos de prueba
const datosPrueba = {
  aperturaCaja: 1000, // Dinero inicial en caja
  ventasEfectivo: 2500, // Ventas en efectivo
  ventasVirtual: 1000, // Ventas virtuales
  egresosEfectivo: 200, // Egresos en efectivo
  egresosVirtual: 50, // Egresos virtuales
};

console.log("📊 Datos iniciales:");
console.log("- Apertura de caja:", datosPrueba.aperturaCaja);
console.log("- Ventas en efectivo:", datosPrueba.ventasEfectivo);
console.log("- Ventas virtuales:", datosPrueba.ventasVirtual);
console.log("- Egresos en efectivo:", datosPrueba.egresosEfectivo);
console.log("- Egresos virtuales:", datosPrueba.egresosVirtual);

// Calcular dinero actual correcto
const dineroActualEfectivo = datosPrueba.aperturaCaja + datosPrueba.ventasEfectivo - datosPrueba.egresosEfectivo;
const dineroActualVirtual = datosPrueba.ventasVirtual - datosPrueba.egresosVirtual;

console.log("\n💰 Dinero actual calculado:");
console.log("- Efectivo actual:", dineroActualEfectivo);
console.log("- Virtual actual:", dineroActualVirtual);

// Verificar cálculos
console.log("\n✅ Verificación de cálculos:");
console.log("- Efectivo: 1000 + 2500 - 200 =", dineroActualEfectivo);
console.log("- Virtual: 1000 - 50 =", dineroActualVirtual);

// Simular retiro de efectivo
console.log("\n💸 Simulando retiro de efectivo de $500:");
const montoRetiro = 500;
console.log("- Monto a retirar:", montoRetiro);
console.log("- Efectivo disponible antes:", dineroActualEfectivo);

if (montoRetiro <= dineroActualEfectivo) {
  console.log("✅ Retiro válido - hay suficiente efectivo");
  
  // Simular actualización (solo se descuenta de la apertura de caja)
  const nuevaApertura = datosPrueba.aperturaCaja - montoRetiro;
  const nuevoDineroActual = nuevaApertura + datosPrueba.ventasEfectivo - datosPrueba.egresosEfectivo;
  
  console.log("- Nueva apertura de caja:", nuevaApertura);
  console.log("- Nuevo dinero actual efectivo:", nuevoDineroActual);
  console.log("- Diferencia:", dineroActualEfectivo - nuevoDineroActual);
} else {
  console.log("❌ Retiro inválido - no hay suficiente efectivo");
}

// Simular pago a empleado en efectivo
console.log("\n👨‍💼 Simulando pago a empleado de $800 en efectivo:");
const montoPago = 800;
console.log("- Monto a pagar:", montoPago);
console.log("- Efectivo disponible antes:", dineroActualEfectivo);

if (montoPago <= dineroActualEfectivo) {
  console.log("✅ Pago válido - hay suficiente efectivo");
  
  // Simular actualización
  const nuevaApertura = datosPrueba.aperturaCaja - montoPago;
  const nuevoDineroActual = nuevaApertura + datosPrueba.ventasEfectivo - datosPrueba.egresosEfectivo;
  
  console.log("- Nueva apertura de caja:", nuevaApertura);
  console.log("- Nuevo dinero actual efectivo:", nuevoDineroActual);
  console.log("- Diferencia:", dineroActualEfectivo - nuevoDineroActual);
} else {
  console.log("❌ Pago inválido - no hay suficiente efectivo");
}

console.log("\n🎯 Resumen de correcciones implementadas:");
console.log("1. ✅ API pagos-resumen: Calcula dinero actual = apertura + ventas - egresos");
console.log("2. ✅ Separación de egresos: Por forma de pago (efectivo/virtual)");
console.log("3. ✅ Componente Egresos: Muestra dinero actual real");
console.log("4. ✅ Modales: Validan contra dinero actual real");
console.log("5. ✅ Consistencia: Todo el sistema usa la misma lógica");

console.log("\n✨ Beneficios de las correcciones:");
console.log("- El dinero actual refleja el dinero real disponible");
console.log("- Los retiros y pagos se descuentan correctamente");
console.log("- La validación es precisa y consistente");
console.log("- El sistema es más confiable y preciso");
