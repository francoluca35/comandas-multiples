// Script de debug para verificar la actualización de stock
// Ejecutar en la consola del navegador

console.log("🔧 Iniciando debug de actualización de stock...");

// Función para simular la estructura de un pedido real
function simularPedido() {
  return [
    {
      id: 1234567890,
      producto: "Sprite 1.5L",  // ← Estructura real del pedido
      unidades: 2,              // ← Estructura real del pedido
      precio: 3000,
      total: 6000
    },
    {
      id: 1234567891,
      producto: "Quilmes",
      unidades: 1,
      precio: 13000,
      total: 13000
    }
  ];
}

// Función para probar la actualización de stock
async function probarActualizacionStock() {
  try {
    console.log("🧪 Simulando pedido...");
    const pedido = simularPedido();
    console.log("📦 Pedido simulado:", pedido);
    
    // Importar el hook (esto no funcionará directamente, pero muestra la estructura)
    console.log("💡 Para probar en la app real:");
    console.log("1. Haz un pedido real desde la interfaz");
    console.log("2. Completa el pago");
    console.log("3. Verifica en la consola los logs de actualización de stock");
    console.log("4. Revisa el inventario para ver si el stock se actualizó");
    
    // Mostrar estructura esperada
    console.log("\n📋 Estructura esperada del pedido:");
    pedido.forEach(item => {
      console.log(`  - Producto: "${item.producto}"`);
      console.log(`    Unidades: ${item.unidades}`);
      console.log(`    Precio: $${item.precio}`);
      console.log(`    Total: $${item.total}`);
    });
    
  } catch (error) {
    console.error("❌ Error en la prueba:", error);
  }
}

// Función para verificar logs en tiempo real
function monitorearLogs() {
  console.log("👀 Monitoreando logs de actualización de stock...");
  console.log("💡 Busca estos logs en la consola:");
  console.log("  - '📦 Actualizando stock por venta:'");
  console.log("  - '🔍 Procesando producto:'");
  console.log("  - '✅ Encontrado:'");
  console.log("  - '✅ Stock actualizado:'");
  console.log("  - '✅ Stock actualizado exitosamente'");
}

// Función para verificar inventario antes y después
async function verificarInventarioCompleto() {
  try {
    const restauranteId = localStorage.getItem("restauranteId");
    console.log("📊 Verificando inventario completo...");
    
    // Bebidas
    const bebidasResponse = await fetch(`/api/stock?restauranteId=${restauranteId}`);
    if (bebidasResponse.ok) {
      const bebidas = await bebidasResponse.json();
      console.log("🥤 Bebidas en inventario:");
      bebidas.forEach(bebida => {
        console.log(`  - ${bebida.nombre}: ${bebida.stock} unidades`);
      });
    }
    
    // Materia prima
    const materiaPrimaResponse = await fetch(`/api/materia-prima?restauranteId=${restauranteId}`);
    if (materiaPrimaResponse.ok) {
      const materiaPrima = await materiaPrimaResponse.json();
      console.log("🍽️ Materia prima en inventario:");
      materiaPrima.forEach(mp => {
        console.log(`  - ${mp.nombre}: ${mp.stock} unidades`);
      });
    }
    
  } catch (error) {
    console.error("❌ Error verificando inventario:", error);
  }
}

// Exportar funciones
window.probarActualizacionStock = probarActualizacionStock;
window.monitorearLogs = monitorearLogs;
window.verificarInventarioCompleto = verificarInventarioCompleto;

console.log("✅ Script de debug cargado. Funciones disponibles:");
console.log("- probarActualizacionStock() - Simular estructura de pedido");
console.log("- monitorearLogs() - Ver qué logs buscar");
console.log("- verificarInventarioCompleto() - Ver todo el inventario");
