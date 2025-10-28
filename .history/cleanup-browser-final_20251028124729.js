// Script para limpiar bebidas duplicadas - Ejecutar en la consola del navegador
// Asegúrate de estar en la página de productos antes de ejecutar

async function cleanupDuplicateBeverages() {
  try {
    console.log('🔍 Iniciando limpieza de bebidas duplicadas...');
    
    // Obtener el restauranteId del localStorage
    const restauranteId = localStorage.getItem('restauranteId');
    if (!restauranteId) {
      console.error('❌ No se encontró restauranteId en localStorage');
      return;
    }
    
    console.log('🏪 RestauranteId:', restauranteId);
    
    // Obtener bebidas del inventario
    console.log('📦 Obteniendo bebidas del inventario...');
    const stockResponse = await fetch(`/api/stock?restauranteId=${restauranteId}`);
    const stockBebidas = await stockResponse.json();
    
    console.log(`✅ Encontradas ${stockBebidas.length} bebidas en inventario`);
    
    // Obtener bebidas del menú
    console.log('🍽️ Obteniendo bebidas del menú...');
    const bebidasResponse = await fetch(`/api/bebidas?restauranteId=${restauranteId}`);
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
    
    // Confirmar eliminación
    const confirmDelete = confirm(`¿Eliminar ${duplicates.length} bebidas duplicadas del menú?\n\nEsto mantendrá solo las bebidas del inventario.`);
    
    if (!confirmDelete) {
      console.log('❌ Operación cancelada');
      return;
    }
    
    // Eliminar duplicados del menú (mantener solo los del inventario)
    console.log('🗑️ Eliminando duplicados del menú...');
    
    let deletedCount = 0;
    for (const duplicate of duplicates) {
      try {
        const deleteResponse = await fetch(`/api/bebidas?restauranteId=${restauranteId}&bebidaId=${duplicate.menu.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log(`✅ Eliminado del menú: ${duplicate.stock.nombre}`);
          deletedCount++;
        } else {
          console.log(`❌ Error eliminando del menú: ${duplicate.stock.nombre}`);
        }
      } catch (error) {
        console.log(`❌ Error eliminando ${duplicate.stock.nombre}:`, error.message);
      }
    }
    
    console.log(`🎉 Limpieza completada. ${deletedCount} bebidas eliminadas del menú.`);
    console.log('🔄 Recarga la página para ver los cambios.');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
}

// Ejecutar la función
cleanupDuplicateBeverages();
