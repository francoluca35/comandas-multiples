const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBvOkBwJ1T3aJ5hKjH8iL9mN2oP3qR4sT5u",
  authDomain: "comandas-multiples.firebaseapp.com",
  projectId: "comandas-multiples",
  storageBucket: "comandas-multiples.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function resetMesaPositions() {
  try {
    console.log('🔄 Iniciando reset de posiciones de mesas...');
    
    // Obtener el restauranteId desde el argumento de línea de comandos o usar uno por defecto
    const restauranteId = process.argv[2] || 'restaurante-1';
    console.log(`📍 Usando restauranteId: ${restauranteId}`);
    
    // Obtener todas las mesas
    const mesasRef = collection(db, `restaurantes/${restauranteId}/tables`);
    const mesasSnapshot = await getDocs(mesasRef);
    
    if (mesasSnapshot.empty) {
      console.log('❌ No se encontraron mesas para este restaurante');
      return;
    }
    
    console.log(`📊 Encontradas ${mesasSnapshot.size} mesas`);
    
    // Separar mesas por ubicación
    const mesasAdentro = [];
    const mesasAfuera = [];
    
    mesasSnapshot.forEach((doc) => {
      const mesa = { id: doc.id, ...doc.data() };
      if (mesa.lugar === 'adentro') {
        mesasAdentro.push(mesa);
      } else if (mesa.lugar === 'afuera') {
        mesasAfuera.push(mesa);
      }
    });
    
    console.log(`🏠 Mesas adentro: ${mesasAdentro.length}`);
    console.log(`🌳 Mesas afuera: ${mesasAfuera.length}`);
    
    const hasAfuera = mesasAfuera.length > 0;
    const containerHeight = 600;
    const mitad = containerHeight / 2;
    
    // Actualizar posiciones de mesas adentro
    for (let i = 0; i < mesasAdentro.length; i++) {
      const mesa = mesasAdentro[i];
      const espacioDisponible = hasAfuera ? mitad - 100 : containerHeight - 100;
      const nuevaPosicion = {
        x: 50 + (i % 3) * 150 + Math.random() * 50, // Distribución en 3 columnas
        y: 50 + Math.floor(i / 3) * 100 + Math.random() * 30 // Distribución en filas
      };
      
      // Asegurar que no exceda los límites
      nuevaPosicion.x = Math.min(nuevaPosicion.x, 500);
      nuevaPosicion.y = Math.min(nuevaPosicion.y, espacioDisponible);
      
      const mesaRef = doc(db, `restaurantes/${restauranteId}/tables/${mesa.id}`);
      await updateDoc(mesaRef, {
        position: nuevaPosicion,
        updatedAt: new Date()
      });
      
      console.log(`✅ Mesa ${mesa.numero} (adentro) actualizada:`, nuevaPosicion);
    }
    
    // Actualizar posiciones de mesas afuera
    for (let i = 0; i < mesasAfuera.length; i++) {
      const mesa = mesasAfuera[i];
      const nuevaPosicion = {
        x: 50 + (i % 3) * 150 + Math.random() * 50, // Distribución en 3 columnas
        y: mitad + 50 + Math.floor(i / 3) * 100 + Math.random() * 30 // Empieza en la mitad
      };
      
      // Asegurar que no exceda los límites
      nuevaPosicion.x = Math.min(nuevaPosicion.x, 500);
      nuevaPosicion.y = Math.min(nuevaPosicion.y, containerHeight - 50);
      
      const mesaRef = doc(db, `restaurantes/${restauranteId}/tables/${mesa.id}`);
      await updateDoc(mesaRef, {
        position: nuevaPosicion,
        updatedAt: new Date()
      });
      
      console.log(`✅ Mesa ${mesa.numero} (afuera) actualizada:`, nuevaPosicion);
    }
    
    console.log('🎉 Reset de posiciones completado exitosamente!');
    console.log('💡 Las mesas ahora se distribuirán correctamente en el layout vertical');
    
  } catch (error) {
    console.error('❌ Error durante el reset:', error);
  }
}

// Ejecutar el script
resetMesaPositions();
