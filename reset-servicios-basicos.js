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

// Función para vaciar servicios_basicos
async function vaciarServiciosBasicos() {
  try {
    console.log('🗑️ Vaciamdo servicios_basicos...');
    
    const restauranteId = 'francomputer';
    
    // Primero obtener el documento de serviciosComercio
    const serviciosComercioRef = collection(db, 'restaurantes', restauranteId, 'serviciosComercio');
    const serviciosSnapshot = await getDocs(serviciosComercioRef);
    
    if (serviciosSnapshot.empty) {
      console.log('✅ No hay documentos en serviciosComercio');
      return 0;
    }
    
    let totalEliminados = 0;
    
    // Para cada documento de serviciosComercio, vaciar su subcolección servicios_basicos
    for (const servicioDoc of serviciosSnapshot.docs) {
      const serviciosBasicosRef = collection(db, 'restaurantes', restauranteId, 'serviciosComercio', servicioDoc.id, 'servicios_basicos');
      const serviciosBasicosSnapshot = await getDocs(serviciosBasicosRef);
      
      if (!serviciosBasicosSnapshot.empty) {
        const batch = writeBatch(db);
        serviciosBasicosSnapshot.docs.forEach((docSnapshot) => {
          batch.delete(docSnapshot.ref);
          totalEliminados++;
        });
        await batch.commit();
        console.log(`✅ ${serviciosBasicosSnapshot.docs.length} documentos eliminados de servicios_basicos en ${servicioDoc.id}`);
      }
    }
    
    console.log(`✅ Total servicios_basicos eliminados: ${totalEliminados}`);
    return totalEliminados;
    
  } catch (error) {
    console.error('❌ Error vaciando servicios_basicos:', error.message);
    return 0;
  }
}

// Ejecutar
vaciarServiciosBasicos();
