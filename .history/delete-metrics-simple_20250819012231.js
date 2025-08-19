// Script simple para eliminar la colección metrics
// Copia y pega este código en la consola del navegador cuando estés en la página de métricas

async function deleteMetricsSimple() {
  try {
    console.log("🗑️ Eliminando colección metrics...");

    // Usar la función que ya existe en el sistema
    if (window.metricsCollector) {
      const result = await window.metricsCollector.deleteMetricsCollection();
      console.log("✅ Resultado:", result);
    } else {
      console.log("❌ No se encontró metricsCollector en window");
      console.log("💡 Intenta acceder a la página de métricas primero");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Ejecutar
deleteMetricsSimple();
