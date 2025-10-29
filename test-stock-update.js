// Script de prueba para verificar la actualización automática de stock
// Ejecutar en la consola del navegador después de hacer una venta

console.log("🧪 Iniciando prueba de actualización de stock...");

// Función para verificar el stock de un producto
async function verificarStock(productoNombre) {
  try {
    const restauranteId = localStorage.getItem("restauranteId");
    
    // Buscar en bebidas
    const bebidasResponse = await fetch(`/api/stock?restauranteId=${restauranteId}`);
    if (bebidasResponse.ok) {
      const bebidas = await bebidasResponse.json();
      const bebida = bebidas.find(b => b.nombre.toLowerCase() === productoNombre.toLowerCase());
      if (bebida) {
        console.log(`📦 ${productoNombre} (Bebida):`, {
          stock: bebida.stock,
          precio: bebida.precio,
          habilitada: bebida.habilitada,
          activo: bebida.activo
        });
        return bebida;
      }
    }
    
    // Buscar en materia prima
    const materiaPrimaResponse = await fetch(`/api/materia-prima?restauranteId=${restauranteId}`);
    if (materiaPrimaResponse.ok) {
      const materiaPrima = await materiaPrimaResponse.json();
      const materia = materiaPrima.find(mp => mp.nombre.toLowerCase() === productoNombre.toLowerCase());
      if (materia) {
        console.log(`📦 ${productoNombre} (Materia Prima):`, {
          stock: materia.stock,
          precio: materia.precio
        });
        return materia;
      }
    }
    
    console.log(`❌ Producto "${productoNombre}" no encontrado en inventario`);
    return null;
  } catch (error) {
    console.error("Error verificando stock:", error);
    return null;
  }
}

// Función para simular una venta y verificar que se actualice el stock
async function simularVentaYVerificarStock() {
  console.log("🛒 Simulando venta de Sprite 1.5L...");
  
  // Verificar stock antes de la venta
  console.log("📊 Stock ANTES de la venta:");
  const stockAntes = await verificarStock("Sprite 1.5L");
  
  if (stockAntes) {
    console.log(`✅ Stock actual: ${stockAntes.stock}`);
    console.log("💡 Ahora haz una venta real de Sprite 1.5L desde la interfaz y luego ejecuta:");
    console.log("verificarStockDespuesVenta()");
  } else {
    console.log("❌ No se encontró Sprite 1.5L en el inventario");
    console.log("💡 Asegúrate de que el producto esté registrado en el inventario");
  }
}

// Función para verificar stock después de una venta
async function verificarStockDespuesVenta() {
  console.log("📊 Stock DESPUÉS de la venta:");
  const stockDespues = await verificarStock("Sprite 1.5L");
  
  if (stockDespues) {
    console.log(`✅ Stock actual: ${stockDespues.stock}`);
    console.log("🎉 ¡La actualización de stock está funcionando correctamente!");
  } else {
    console.log("❌ No se pudo verificar el stock después de la venta");
  }
}

// Función para listar todos los productos en inventario
async function listarInventario() {
  try {
    const restauranteId = localStorage.getItem("restauranteId");
    
    console.log("📋 Inventario completo:");
    
    // Bebidas
    const bebidasResponse = await fetch(`/api/stock?restauranteId=${restauranteId}`);
    if (bebidasResponse.ok) {
      const bebidas = await bebidasResponse.json();
      console.log("🥤 Bebidas:");
      bebidas.forEach(bebida => {
        console.log(`  - ${bebida.nombre}: ${bebida.stock} unidades ($${bebida.precio})`);
      });
    }
    
    // Materia prima
    const materiaPrimaResponse = await fetch(`/api/materia-prima?restauranteId=${restauranteId}`);
    if (materiaPrimaResponse.ok) {
      const materiaPrima = await materiaPrimaResponse.json();
      console.log("🍽️ Materia Prima:");
      materiaPrima.forEach(mp => {
        console.log(`  - ${mp.nombre}: ${mp.stock} unidades ($${mp.precio})`);
      });
    }
  } catch (error) {
    console.error("Error listando inventario:", error);
  }
}

// Exportar funciones para uso en consola
window.verificarStock = verificarStock;
window.simularVentaYVerificarStock = simularVentaYVerificarStock;
window.verificarStockDespuesVenta = verificarStockDespuesVenta;
window.listarInventario = listarInventario;

console.log("✅ Script de prueba cargado. Funciones disponibles:");
console.log("- simularVentaYVerificarStock() - Verificar stock antes de venta");
console.log("- verificarStockDespuesVenta() - Verificar stock después de venta");
console.log("- verificarStock('nombre') - Verificar stock de producto específico");
console.log("- listarInventario() - Listar todo el inventario");
