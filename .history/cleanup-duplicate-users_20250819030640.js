#!/usr/bin/env node

// Script para limpiar usuarios duplicados creados con IDs aleatorios
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Configuración de Firebase (necesitas configurar esto)
const firebaseConfig = {
  // Tu configuración de Firebase aquí
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupDuplicateUsers() {
  console.log("🧹 Iniciando limpieza de usuarios duplicados...\n");

  try {
    // Obtener todos los restaurantes
    const restaurantesRef = collection(db, "restaurantes");
    const restaurantesSnap = await getDocs(restaurantesRef);

    for (const restauranteDoc of restaurantesSnap.docs) {
      const restauranteId = restauranteDoc.id;
      console.log(`🔍 Procesando restaurante: ${restauranteId}`);

      // Obtener todos los usuarios del restaurante
      const usersRef = collection(db, `restaurantes/${restauranteId}/users`);
      const usersSnap = await getDocs(usersRef);

      const usuarios = [];
      const usuariosPorNombre = new Map();

      // Agrupar usuarios por nombre
      usersSnap.forEach((userDoc) => {
        const userData = userDoc.data();
        const userName = userData.usuario;
        
        if (!usuariosPorNombre.has(userName)) {
          usuariosPorNombre.set(userName, []);
        }
        usuariosPorNombre.get(userName).push({
          id: userDoc.id,
          data: userData
        });
      });

      // Identificar y eliminar duplicados
      for (const [userName, userInstances] of usuariosPorNombre) {
        if (userInstances.length > 1) {
          console.log(`  ⚠️  Usuario duplicado encontrado: ${userName}`);
          console.log(`     Instancias: ${userInstances.length}`);

          // Mantener la instancia que usa el nombre de usuario como ID
          const keepInstance = userInstances.find(instance => instance.id === userName);
          const deleteInstances = userInstances.filter(instance => instance.id !== userName);

          if (keepInstance) {
            console.log(`     ✅ Manteniendo: ${keepInstance.id}`);
            
            // Eliminar las instancias con IDs aleatorios
            for (const deleteInstance of deleteInstances) {
              console.log(`     🗑️  Eliminando: ${deleteInstance.id}`);
              await deleteDoc(doc(db, `restaurantes/${restauranteId}/users/${deleteInstance.id}`));
            }
          } else {
            // Si no hay instancia con el nombre como ID, mantener la primera
            console.log(`     ✅ Manteniendo: ${userInstances[0].id}`);
            
            // Eliminar las demás instancias
            for (let i = 1; i < userInstances.length; i++) {
              console.log(`     🗑️  Eliminando: ${userInstances[i].id}`);
              await deleteDoc(doc(db, `restaurantes/${restauranteId}/users/${userInstances[i].id}`));
            }
          }
        }
      }
    }

    console.log("\n✅ Limpieza completada exitosamente");
  } catch (error) {
    console.error("❌ Error durante la limpieza:", error);
  }
}

// Ejecutar la limpieza
cleanupDuplicateUsers();
