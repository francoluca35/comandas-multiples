const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc, 
  doc,
  writeBatch 
} = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq",
  authDomain: "comandas-multiples.firebaseapp.com",
  projectId: "comandas-multiples",
  storageBucket: "comandas-multiples.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para vaciar una colección específica
async function vaciarColeccion(restauranteId, nombreColeccion) {
  try {
    console.log(`🗑️ Vaciamdo colección: ${nombreColeccion}...`);
    
    const coleccionRef = collection(db, 'restaurantes', restauranteId, nombreColeccion);
    const snapshot = await getDocs(coleccionRef);
    
    if (snapshot.empty) {
      console.log(`✅ Colección ${nombreColeccion} ya está vacía`);
      return 0;
    }
    
    // Usar batch para eliminar en lotes
    const batch = writeBatch(db);
    let contador = 0;
    
    snapshot.docs.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
      contador++;
    });
    
    await batch.commit();
    console.log(`✅ ${contador} documentos eliminados de ${nombreColeccion}`);
    return contador;
    
  } catch (error) {
    console.error(`❌ Error vaciando ${nombreColeccion}:`, error.message);
    return 0;
  }
}

// Función para vaciar subcolección específica
async function vaciarSubColeccion(restauranteId, coleccionPadre, subColeccion) {
  try {
    console.log(`🗑️ Vaciamdo subcolección: ${coleccionPadre}/${subColeccion}...`);
    
    const subColeccionRef = collection(db, 'restaurantes', restauranteId, coleccionPadre, subColeccion);
    const snapshot = await getDocs(subColeccionRef);
    
    if (snapshot.empty) {
      console.log(`✅ Subcolección ${coleccionPadre}/${subColeccion} ya está vacía`);
      return 0;
    }
    
    // Usar batch para eliminar en lotes
    const batch = writeBatch(db);
    let contador = 0;
    
    snapshot.docs.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
      contador++;
    });
    
    await batch.commit();
    console.log(`✅ ${contador} documentos eliminados de ${coleccionPadre}/${subColeccion}`);
    return contador;
    
  } catch (error) {
    console.error(`❌ Error vaciando ${coleccionPadre}/${subColeccion}:`, error.message);
    return 0;
  }
}

// Función principal
async function resetSpecificCollections() {
  try {
    console.log('🔄 Iniciando vaciado de colecciones específicas...');
    
    // ID del restaurante
    const restauranteId = 'francomputer';
    console.log('🏪 Usando restauranteId:', restauranteId);
    
    let totalEliminados = 0;
    
    // 1. Vaciar Ingresos
    totalEliminados += await vaciarColeccion(restauranteId, 'Ingresos');
    
    // 2. Vaciar serviciosComercio > servicios_basicos
    totalEliminados += await vaciarSubColeccion(restauranteId, 'serviciosComercio', 'servicios_basicos');
    
    // 3. Vaciar SueldoEmpleados
    totalEliminados += await vaciarColeccion(restauranteId, 'SueldoEmpleados');
    
    // 4. Vaciar compras
    totalEliminados += await vaciarColeccion(restauranteId, 'compras');
    
    // 5. Vaciar PedidosCocina
    totalEliminados += await vaciarColeccion(restauranteId, 'PedidosCocina');
    
    // 6. Vaciar PedidosFinalizados
    totalEliminados += await vaciarColeccion(restauranteId, 'PedidosFinalizados');
    
    console.log('🎉 ¡Vaciado completado exitosamente!');
    console.log(`📊 Total de documentos eliminados: ${totalEliminados}`);
    console.log('📋 Colecciones vaciadas:');
    console.log('   ✅ Ingresos');
    console.log('   ✅ serviciosComercio > servicios_basicos');
    console.log('   ✅ SueldoEmpleados');
    console.log('   ✅ compras');
    console.log('   ✅ PedidosCocina');
    console.log('   ✅ PedidosFinalizados');
    
  } catch (error) {
    console.error('❌ Error durante el vaciado:', error);
  }
}

// Ejecutar el script
resetSpecificCollections();
