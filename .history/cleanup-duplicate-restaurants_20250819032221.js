const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  doc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  setDoc,
} = require("firebase/firestore");

// Configuración de Firebase (ajusta según tu configuración)
const firebaseConfig = {
  apiKey: "AIzaSyBqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función helper para generar ID del restaurante
const generarRestauranteId = (nombre) => {
  return nombre
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
};

async function cleanupDuplicateRestaurants() {
  try {
    console.log("🔍 Iniciando limpieza de restaurantes duplicados...");

    // Obtener todos los documentos de la colección restaurantes
    const restaurantesRef = collection(db, "restaurantes");
    const snapshot = await getDocs(restaurantesRef);
    
    const restaurantes = snapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    }));

    console.log(`📊 Encontrados ${restaurantes.length} restaurantes`);

    // Agrupar por nombre del restaurante
    const restaurantesPorNombre = {};
    
    restaurantes.forEach(restaurante => {
      const nombre = restaurante.data.nombre || restaurante.id;
      if (!restaurantesPorNombre[nombre]) {
        restaurantesPorNombre[nombre] = [];
      }
      restaurantesPorNombre[nombre].push(restaurante);
    });

    // Procesar cada grupo de restaurantes
    for (const [nombre, docs] of Object.entries(restaurantesPorNombre)) {
      console.log(`\n🏪 Procesando restaurante: ${nombre}`);
      console.log(`📝 Documentos encontrados: ${docs.length}`);

      if (docs.length === 1) {
        const doc = docs[0];
        const expectedId = generarRestauranteId(nombre);
        
        if (doc.id !== expectedId) {
          console.log(`⚠️  ID incorrecto: ${doc.id} (debería ser: ${expectedId})`);
          
          // Crear el documento con el ID correcto
          await setDoc(doc(db, "restaurantes", expectedId), doc.data);
          console.log(`✅ Documento creado con ID correcto: ${expectedId}`);
          
          // Eliminar el documento con ID incorrecto
          await deleteDoc(doc(db, "restaurantes", doc.id));
          console.log(`🗑️  Documento eliminado con ID incorrecto: ${doc.id}`);
        } else {
          console.log(`✅ ID correcto: ${doc.id}`);
        }
      } else {
        console.log(`⚠️  Múltiples documentos encontrados para: ${nombre}`);
        
        // Encontrar el documento con el ID correcto
        const expectedId = generarRestauranteId(nombre);
        const correctDoc = docs.find(doc => doc.id === expectedId);
        const incorrectDocs = docs.filter(doc => doc.id !== expectedId);
        
        if (correctDoc) {
          console.log(`✅ Documento correcto encontrado: ${correctDoc.id}`);
          
          // Eliminar documentos incorrectos
          for (const doc of incorrectDocs) {
            await deleteDoc(doc(db, "restaurantes", doc.id));
            console.log(`🗑️  Documento duplicado eliminado: ${doc.id}`);
          }
        } else {
          console.log(`❌ No se encontró documento con ID correcto: ${expectedId}`);
          
          // Usar el primer documento y moverlo al ID correcto
          const firstDoc = docs[0];
          await setDoc(doc(db, "restaurantes", expectedId), firstDoc.data);
          console.log(`✅ Documento movido a ID correcto: ${expectedId}`);
          
          // Eliminar todos los documentos duplicados
          for (const doc of docs) {
            await deleteDoc(doc(db, "restaurantes", doc.id));
            console.log(`🗑️  Documento duplicado eliminado: ${doc.id}`);
          }
        }
      }
    }

    console.log("\n✅ Limpieza completada exitosamente");
    
    // Verificar resultado final
    const finalSnapshot = await getDocs(restaurantesRef);
    const finalRestaurantes = finalSnapshot.docs.map(doc => ({
      id: doc.id,
      nombre: doc.data().nombre
    }));
    
    console.log("\n📊 Estado final de restaurantes:");
    finalRestaurantes.forEach(rest => {
      console.log(`  - ${rest.nombre} (ID: ${rest.id})`);
    });

  } catch (error) {
    console.error("❌ Error durante la limpieza:", error);
  }
}

// Ejecutar la limpieza
cleanupDuplicateRestaurants();
