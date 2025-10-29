// Script para resetear posiciones de mesas desde el navegador
(async function() {
  try {
    console.log('🔄 Iniciando reset de posiciones de mesas...');
    
    // Obtener el restauranteId desde localStorage
    const restauranteId = localStorage.getItem('restauranteId');
    if (!restauranteId) {
      console.error('❌ No se encontró restauranteId en localStorage');
      return;
    }
    
    console.log(`📍 Usando restauranteId: ${restauranteId}`);
    
    // Importar Firebase (asumiendo que ya está disponible globalmente)
    if (typeof window.firebase === 'undefined') {
      console.error('❌ Firebase no está disponible. Asegúrate de estar en la página de la app.');
      return;
    }
    
    const db = window.firebase.firestore();
    
    // Obtener todas las mesas
    const mesasSnapshot = await db.collection(`restaurantes/${restauranteId}/tables`).get();
    
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
      
      await db.collection(`restaurantes/${restauranteId}/tables`).doc(mesa.id).update({
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
      
      await db.collection(`restaurantes/${restauranteId}/tables`).doc(mesa.id).update({
        position: nuevaPosicion,
        updatedAt: new Date()
      });
      
      console.log(`✅ Mesa ${mesa.numero} (afuera) actualizada:`, nuevaPosicion);
    }
    
    console.log('🎉 Reset de posiciones completado exitosamente!');
    console.log('💡 Las mesas ahora se distribuirán correctamente en el layout vertical');
    console.log('🔄 Recarga la página para ver los cambios');
    
  } catch (error) {
    console.error('❌ Error durante el reset:', error);
  }
})();
