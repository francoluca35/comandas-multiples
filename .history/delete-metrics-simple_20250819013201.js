// Script simple para eliminar métricas desde la línea de comandos
// Uso: node delete-metrics-simple.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc } = require('firebase/firestore');

// Configuración de Firebase (ajusta según tu configuración)
const firebaseConfig = {
  // Aquí va tu configuración de Firebase
  // Puedes copiarla desde src/lib/firebase.js
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteMetricsCollection() {
  try {
    console.log('🗑️ Iniciando eliminación de métricas...');
    
    const metricsRef = collection(db, 'metrics');
    const snapshot = await getDocs(metricsRef);
    
    if (snapshot.empty) {
      console.log('✅ La colección metrics ya está vacía');
      return;
    }
    
    console.log(`📊 Encontrados ${snapshot.docs.length} documentos de métricas`);
    
    // Eliminar todos los documentos
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`✅ Eliminados ${snapshot.docs.length} documentos de métricas exitosamente`);
    
  } catch (error) {
    console.error('❌ Error eliminando métricas:', error);
    process.exit(1);
  }
}

// Ejecutar la función
deleteMetricsCollection()
  .then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
