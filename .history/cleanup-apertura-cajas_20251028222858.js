const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  updateDoc, 
  doc 
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

// Función para limpiar el campo Apertura de todas las cajas
async function cleanupAperturaCajas() {
  try {
    console.log('🔄 Limpiando campo Apertura de cajas registradoras...');
    
    const restauranteId = 'francomputer';
    
    // Obtener todas las cajas registradoras
    const cajaRef = collection(db, 'restaurantes', restauranteId, 'CajaRegistradora');
    const cajaSnapshot = await getDocs(cajaRef);
    
    if (cajaSnapshot.empty) {
      console.log('✅ No hay cajas registradoras para limpiar');
      return;
    }
    
    let cajasActualizadas = 0;
    
    // Limpiar el campo Apertura de cada caja
    for (const cajaDoc of cajaSnapshot.docs) {
      const cajaData = cajaDoc.data();
      
      if (cajaData.Apertura && cajaData.Apertura !== '0') {
        console.log(`🧹 Limpiando caja ${cajaDoc.id}: Apertura = ${cajaData.Apertura} -> 0`);
        
        await updateDoc(cajaDoc.ref, {
          Apertura: '0',
          ultimaActualizacion: new Date()
        });
        
        cajasActualizadas++;
      }
    }
    
    console.log(`✅ ${cajasActualizadas} cajas actualizadas`);
    console.log('🎉 ¡Limpieza completada!');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
}

// Ejecutar
cleanupAperturaCajas();
