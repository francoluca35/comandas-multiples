// Script para ejecutar en la consola del navegador
// Limpia bebidas duplicadas manteniendo solo las del inventario

async function cleanupDuplicateBeverages() {
  try {
    console.log('🔍 Iniciando limpieza de bebidas duplicadas...');
    
    // Obtener restauranteId del localStorage
    const restaurantId = localStorage.getItem('restauranteId') || 'default-restaurant';
    console.log('🏪 Usando restauranteId:', restaurantId);
    
    // Importar Firebase (asumiendo que ya está disponible)
    const { getFirestore, collection, getDocs, deleteDoc, doc } = window.firebase.firestore;
    const db = getFirestore();
    
    // Referencia a la colección de productos
    const productsRef = collection(db, `restaurantes/${restaurantId}/productos`);
    
    // Obtener todos los productos
    const snapshot = await getDocs(productsRef);
    const products = [];
    
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`📦 Total de productos encontrados: ${products.length}`);
    
    // Filtrar bebidas
    const beverages = products.filter(product => 
      product.tipo === 'bebida' || 
      product.categoria === 'bebidas' ||
      product.subcategoria === 'bebidas' ||
      product.nombre?.toLowerCase().includes('coca') ||
      product.nombre?.toLowerCase().includes('fanta') ||
      product.nombre?.toLowerCase().includes('sprite') ||
      product.nombre?.toLowerCase().includes('quilmes') ||
      product.nombre?.toLowerCase().includes('brahama')
    );
    
    console.log(`🥤 Bebidas encontradas: ${beverages.length}`);
    beverages.forEach(b => console.log(`   - ${b.nombre} (origen: ${b.origen}, tipo: ${b.tipo})`));
    
    // Agrupar bebidas por nombre (case insensitive)
    const beverageGroups = {};
    beverages.forEach(beverage => {
      const name = beverage.nombre?.toLowerCase().trim();
      if (name) {
        if (!beverageGroups[name]) {
          beverageGroups[name] = [];
        }
        beverageGroups[name].push(beverage);
      }
    });
    
    // Encontrar duplicados
    const duplicates = Object.entries(beverageGroups).filter(([name, items]) => items.length > 1);
    
    console.log(`🔄 Bebidas duplicadas encontradas: ${duplicates.length}`);
    
    let deletedCount = 0;
    
    for (const [name, items] of duplicates) {
      console.log(`\n🍺 Procesando: "${name}" (${items.length} duplicados)`);
      
      // Separar bebidas del inventario vs bebidas del menú
      const inventoryBeverages = items.filter(item => item.origen === 'inventario');
      const menuBeverages = items.filter(item => item.origen !== 'inventario');
      
      console.log(`   📦 Del inventario: ${inventoryBeverages.length}`);
      console.log(`   🍽️ Del menú: ${menuBeverages.length}`);
      
      // Si hay bebidas del inventario, eliminar las del menú
      if (inventoryBeverages.length > 0 && menuBeverages.length > 0) {
        console.log(`   ❌ Eliminando ${menuBeverages.length} bebidas del menú...`);
        
        for (const menuBeverage of menuBeverages) {
          try {
            await deleteDoc(doc(db, `restaurantes/${restaurantId}/productos`, menuBeverage.id));
            console.log(`   ✅ Eliminado: ${menuBeverage.nombre} (ID: ${menuBeverage.id})`);
            deletedCount++;
          } catch (error) {
            console.error(`   ❌ Error eliminando ${menuBeverage.nombre}:`, error);
          }
        }
      }
      // Si solo hay bebidas del menú, eliminar duplicados y mantener una
      else if (menuBeverages.length > 1) {
        console.log(`   🔄 Eliminando duplicados del menú...`);
        
        // Mantener la primera, eliminar las demás
        const toKeep = menuBeverages[0];
        const toDelete = menuBeverages.slice(1);
        
        for (const duplicate of toDelete) {
          try {
            await deleteDoc(doc(db, `restaurantes/${restaurantId}/productos`, duplicate.id));
            console.log(`   ✅ Eliminado duplicado: ${duplicate.nombre} (ID: ${duplicate.id})`);
            deletedCount++;
          } catch (error) {
            console.error(`   ❌ Error eliminando duplicado ${duplicate.nombre}:`, error);
          }
        }
      }
    }
    
    console.log(`\n🎉 Limpieza completada!`);
    console.log(`📊 Total de bebidas eliminadas: ${deletedCount}`);
    console.log(`✅ Ahora las bebidas solo aparecerán una vez en la vista de productos`);
    console.log(`🔄 Recarga la página para ver los cambios`);
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
}

// Ejecutar la función
cleanupDuplicateBeverages();
