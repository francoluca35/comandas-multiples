// Script de prueba para alertas de stock bajo
// Ejecutar en la consola del navegador

console.log("🔔 Iniciando prueba de alertas de stock bajo...");

// Función para simular productos con stock bajo
async function simularStockBajo() {
  try {
    const restauranteId = localStorage.getItem("restauranteId");
    console.log("🧪 Simulando productos con stock bajo...");
    
    // Simular actualización de stock para crear productos con stock bajo
    const productosParaSimular = [
      { nombre: "Sprite 1.5L", stock: 1 }, // Crítico
      { nombre: "Quilmes", stock: 2 },     // Muy bajo
      { nombre: "Coca Cola", stock: 3 },   // Muy bajo
      { nombre: "Agua", stock: 4 },        // Bajo
    ];
    
    console.log("📦 Productos a simular:", productosParaSimular);
    
    for (const producto of productosParaSimular) {
      // Buscar en bebidas
      const bebidasResponse = await fetch(`/api/stock?restauranteId=${restauranteId}`);
      if (bebidasResponse.ok) {
        const bebidas = await bebidasResponse.json();
        const bebidaEncontrada = bebidas.find(b => 
          b.nombre.toLowerCase().includes(producto.nombre.toLowerCase())
        );
        
        if (bebidaEncontrada) {
          console.log(`🔧 Actualizando ${bebidaEncontrada.nombre} a stock ${producto.stock}...`);
          
          const response = await fetch("/api/stock", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              restauranteId,
              productoId: bebidaEncontrada.id,
              stock: producto.stock,
              habilitada: producto.stock > 0,
              activo: producto.stock > 0,
            }),
          });
          
          if (response.ok) {
            console.log(`✅ ${bebidaEncontrada.nombre} actualizado a stock ${producto.stock}`);
          } else {
            console.log(`❌ Error actualizando ${bebidaEncontrada.nombre}`);
          }
        } else {
          console.log(`⚠️ No se encontró ${producto.nombre} en bebidas`);
        }
      }
    }
    
    console.log("🎉 Simulación completada. Recarga la página para ver la alerta.");
    
  } catch (error) {
    console.error("❌ Error en la simulación:", error);
  }
}

// Función para restaurar stock normal
async function restaurarStockNormal() {
  try {
    const restauranteId = localStorage.getItem("restauranteId");
    console.log("🔄 Restaurando stock normal...");
    
    const productosParaRestaurar = [
      { nombre: "Sprite 1.5L", stock: 50 },
      { nombre: "Quilmes", stock: 100 },
      { nombre: "Coca Cola", stock: 75 },
      { nombre: "Agua", stock: 200 },
    ];
    
    for (const producto of productosParaRestaurar) {
      const bebidasResponse = await fetch(`/api/stock?restauranteId=${restauranteId}`);
      if (bebidasResponse.ok) {
        const bebidas = await bebidasResponse.json();
        const bebidaEncontrada = bebidas.find(b => 
          b.nombre.toLowerCase().includes(producto.nombre.toLowerCase())
        );
        
        if (bebidaEncontrada) {
          const response = await fetch("/api/stock", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              restauranteId,
              productoId: bebidaEncontrada.id,
              stock: producto.stock,
              habilitada: true,
              activo: true,
            }),
          });
          
          if (response.ok) {
            console.log(`✅ ${bebidaEncontrada.nombre} restaurado a stock ${producto.stock}`);
          }
        }
      }
    }
    
    console.log("🎉 Stock restaurado. Las alertas deberían desaparecer.");
    
  } catch (error) {
    console.error("❌ Error restaurando stock:", error);
  }
}

// Función para limpiar configuraciones de alertas
function limpiarConfiguracionesAlerta() {
  localStorage.removeItem('stockAlertDontRemind');
  localStorage.removeItem('stockAlertRememberLater');
  console.log("🧹 Configuraciones de alerta limpiadas");
}

// Función para verificar estado actual del stock
async function verificarStockActual() {
  try {
    const restauranteId = localStorage.getItem("restauranteId");
    
    console.log("📊 Estado actual del stock:");
    
    const bebidasResponse = await fetch(`/api/stock?restauranteId=${restauranteId}`);
    if (bebidasResponse.ok) {
      const bebidas = await bebidasResponse.json();
      console.log("🥤 Bebidas:");
      bebidas.forEach(bebida => {
        const stock = bebida.stock;
        let estado = "Normal";
        if (stock === 1) estado = "🚨 Crítico";
        else if (stock >= 2 && stock <= 3) estado = "⚠️ Muy Bajo";
        else if (stock === 4) estado = "⚡ Bajo";
        
        console.log(`  - ${bebida.nombre}: ${stock} unidades (${estado})`);
      });
    }
    
  } catch (error) {
    console.error("❌ Error verificando stock:", error);
  }
}

// Exportar funciones
window.simularStockBajo = simularStockBajo;
window.restaurarStockNormal = restaurarStockNormal;
window.limpiarConfiguracionesAlerta = limpiarConfiguracionesAlerta;
window.verificarStockActual = verificarStockActual;

console.log("✅ Script de prueba de alertas cargado. Funciones disponibles:");
console.log("- simularStockBajo() - Simular productos con stock bajo");
console.log("- restaurarStockNormal() - Restaurar stock normal");
console.log("- limpiarConfiguracionesAlerta() - Limpiar configuraciones");
console.log("- verificarStockActual() - Ver estado actual del stock");
console.log("\n💡 Instrucciones:");
console.log("1. Ejecuta simularStockBajo()");
console.log("2. Recarga la página del home");
console.log("3. Deberías ver la alerta de stock bajo");
console.log("4. Prueba los botones 'Recordar más tarde' y 'No recordar hasta reponer'");
