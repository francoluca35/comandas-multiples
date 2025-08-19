// Script para eliminar la colección metrics desde la consola del navegador
// Copia y pega este código en la consola del navegador cuando estés en la página de métricas

async function deleteMetricsCollection() {
  try {
    console.log("🗑️ Iniciando eliminación de colección metrics...");

    // Importar Firebase
    const { collection, getDocs, deleteDoc } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
    );

    // Obtener la instancia de Firestore (asumiendo que ya está inicializada)
    const db = window.firebase?.firestore?.() || window.db;

    if (!db) {
      throw new Error("No se pudo obtener la instancia de Firestore");
    }

    const metricsRef = collection(db, "metrics");
    const snapshot = await getDocs(metricsRef);

    if (snapshot.empty) {
      console.log("✅ La colección metrics ya está vacía");
      return;
    }

    console.log(
      `📊 Encontrados ${snapshot.docs.length} documentos para eliminar`
    );

    // Eliminar todos los documentos
    const deletePromises = snapshot.docs.map((doc) => {
      console.log(`🗑️ Eliminando documento: ${doc.id}`);
      return deleteDoc(doc.ref);
    });

    await Promise.all(deletePromises);

    console.log(
      `✅ Eliminados ${snapshot.docs.length} documentos exitosamente`
    );
    console.log("🔄 La colección metrics ha sido completamente eliminada");
  } catch (error) {
    console.error("❌ Error eliminando colección metrics:", error);
  }
}

// Ejecutar la función
deleteMetricsCollection();
