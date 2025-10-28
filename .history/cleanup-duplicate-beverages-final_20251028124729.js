const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc, query, where } = require('firebase/firestore');

// Configuración de Firebase (usa las mismas credenciales que tu app)
const firebaseConfig = {
  // Reemplaza con tu configuración de Firebase
  apiKey: "AIzaSyBvOkBwJ1TNUf1D_7QKXqzM0UyP3nQrRcM",
  authDomain: "comandas-multiples.firebaseapp.com",
  projectId: "comandas-multiples",
  storageBucket: "comandas-multiples.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupDuplicateBeverages() {
  try {
    console.log('🔍 Iniciando limpieza de bebidas duplicadas...');
    
    // Obtener el restauranteId del localStorage (simulado)
    const restauranteId = 'tu_restaurante_id'; // Reemplaza con tu restauranteId real
    
    // Obtener bebidas del inventario
    console.log('📦 Obteniendo bebidas del inventario...');
    const stockResponse = await fetch(`http://localhost:3000/api/stock?restauranteId=${restauranteId}`);
    const stockBebidas = await stockResponse.json();
    
    console.log(`✅ Encontradas ${stockBebidas.length} bebidas en inventario`);
    
    // Obtener bebidas del menú
    console.log('🍽️ Obteniendo bebidas del menú...');
    const bebidasResponse = await fetch(`http://localhost:3000/api/bebidas?restauranteId=${restauranteId}`);
    const menuBebidas = await bebidasResponse.json();
    
    console.log(`✅ Encontradas ${menuBebidas.length} bebidas en menú`);
    
    // Identificar duplicados
    const duplicates = [];
    
    for (const stockBebida of stockBebidas) {
      const duplicate = menuBebidas.find(menuBebida => 
        menuBebida.nombre.toLowerCase() === stockBebida.nombre.toLowerCase()
      );
      
      if (duplicate) {
        duplicates.push({
          stock: stockBebida,
          menu: duplicate
        });
      }
    }
    
    console.log(`🔍 Encontrados ${duplicates.length} duplicados:`);
    duplicates.forEach(dup => {
      console.log(`  - ${dup.stock.nombre} (Stock: ${dup.stock.stock}, Menú: ${dup.menu.id})`);
    });
    
    if (duplicates.length === 0) {
      console.log('✅ No hay duplicados encontrados');
      return;
    }
    
    // Eliminar duplicados del menú (mantener solo los del inventario)
    console.log('🗑️ Eliminando duplicados del menú...');
    
    for (const duplicate of duplicates) {
      try {
        const deleteResponse = await fetch(`http://localhost:3000/api/bebidas?restauranteId=${restauranteId}&bebidaId=${duplicate.menu.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log(`✅ Eliminado del menú: ${duplicate.stock.nombre}`);
        } else {
          console.log(`❌ Error eliminando del menú: ${duplicate.stock.nombre}`);
        }
      } catch (error) {
        console.log(`❌ Error eliminando ${duplicate.stock.nombre}:`, error.message);
      }
    }
    
    console.log('🎉 Limpieza completada');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
}

// Ejecutar la limpieza
cleanupDuplicateBeverages();
