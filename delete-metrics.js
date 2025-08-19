// Script avanzado para eliminar métricas desde la línea de comandos
// Uso: node delete-metrics.js [--force] [--dry-run]

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} = require("firebase/firestore");
const readline = require("readline");

// Configuración de Firebase (ajusta según tu configuración)
const firebaseConfig = {
  // Aquí va tu configuración de Firebase
  // Puedes copiarla desde src/lib/firebase.js
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Crear interfaz de lectura
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Función para preguntar al usuario
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Función para mostrar estadísticas de métricas
async function showMetricsStats() {
  try {
    const metricsRef = collection(db, "metrics");
    const snapshot = await getDocs(metricsRef);

    if (snapshot.empty) {
      console.log("📊 No hay métricas en la base de datos");
      return { count: 0, restaurants: [] };
    }

    const restaurants = [];
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      restaurants.push({
        id: doc.id,
        name: data.restaurantName || doc.id,
        lastUpdate: data.generatedAt || "N/A",
        orders: data.business?.orders?.total || 0,
        revenue: data.business?.orders?.averageValue || 0,
      });
    });

    console.log(`📊 Estadísticas de métricas:`);
    console.log(
      `   • Total de restaurantes con métricas: ${restaurants.length}`
    );
    console.log(`   • Total de documentos: ${snapshot.docs.length}`);

    if (restaurants.length > 0) {
      console.log("\n🏪 Restaurantes con métricas:");
      restaurants.forEach((restaurant, index) => {
        console.log(`   ${index + 1}. ${restaurant.name}`);
        console.log(`      - Pedidos: ${restaurant.orders}`);
        console.log(
          `      - Ingresos promedio: $${restaurant.revenue.toFixed(2)}`
        );
        console.log(`      - Última actualización: ${restaurant.lastUpdate}`);
      });
    }

    return { count: snapshot.docs.length, restaurants };
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    return { count: 0, restaurants: [] };
  }
}

// Función para eliminar métricas con confirmación
async function deleteMetricsCollection(force = false, dryRun = false) {
  try {
    console.log("🗑️ Iniciando proceso de eliminación de métricas...");

    // Mostrar estadísticas
    const stats = await showMetricsStats();

    if (stats.count === 0) {
      console.log("✅ No hay métricas para eliminar");
      return;
    }

    // Confirmación del usuario
    if (!force) {
      console.log(
        "\n⚠️  ADVERTENCIA: Esta acción eliminará permanentemente todas las métricas."
      );
      console.log("   • Se eliminarán todos los datos históricos de métricas");
      console.log("   • Esta acción no se puede deshacer");
      console.log("   • Los datos se perderán permanentemente");

      const answer = await askQuestion(
        "\n¿Estás seguro de que quieres continuar? (yes/no): "
      );
      if (answer.toLowerCase() !== "yes" && answer.toLowerCase() !== "y") {
        console.log("❌ Operación cancelada por el usuario");
        return;
      }
    }

    if (dryRun) {
      console.log(
        "🔍 MODO DRY-RUN: No se eliminarán archivos, solo simulación"
      );
      console.log(
        `📊 Se simularía la eliminación de ${stats.count} documentos`
      );
      return;
    }

    // Eliminar métricas
    const metricsRef = collection(db, "metrics");
    const snapshot = await getDocs(metricsRef);

    console.log(`🗑️ Eliminando ${snapshot.docs.length} documentos...`);

    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log(
      `✅ Eliminados ${snapshot.docs.length} documentos de métricas exitosamente`
    );
  } catch (error) {
    console.error("❌ Error eliminando métricas:", error);
    throw error;
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const dryRun = args.includes("--dry-run");

  console.log("🚀 Script de eliminación de métricas");
  console.log("=====================================");

  if (force) console.log("🔧 Modo forzado activado");
  if (dryRun) console.log("🔍 Modo dry-run activado");

  try {
    await deleteMetricsCollection(force, dryRun);
    console.log("\n🎉 Proceso completado exitosamente");
  } catch (error) {
    console.error("\n💥 Error durante el proceso:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = { deleteMetricsCollection, showMetricsStats };
