// Script para resetear datos financieros desde el navegador
// Ejecutar en la consola del navegador en la página de la app

async function resetFinancialData() {
  try {
    console.log('🔄 Iniciando reset de datos financieros...');
    
    // Importar Firebase (asumiendo que ya está disponible en la página)
    const { 
      collection, 
      getDocs, 
      deleteDoc, 
      doc, 
      updateDoc,
      serverTimestamp 
    } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Obtener la instancia de Firestore (asumiendo que está disponible globalmente)
    const db = window.db || window.firebase?.firestore();
    if (!db) {
      throw new Error('Firebase no está disponible. Asegúrate de estar en la página de la app.');
    }
    
    // ID del restaurante (cambia por el tuyo)
    const restauranteId = localStorage.getItem('restauranteId') || 'francomputer';
    console.log('🏪 Usando restauranteId:', restauranteId);
    
    // 1. Limpiar todos los ingresos
    console.log('📊 Limpiando ingresos...');
    const ingresosRef = collection(db, 'restaurantes', restauranteId, 'Ingresos');
    const ingresosSnapshot = await getDocs(ingresosRef);
    
    for (const docSnapshot of ingresosSnapshot.docs) {
      await deleteDoc(docSnapshot.ref);
      console.log(`✅ Ingreso eliminado: ${docSnapshot.id}`);
    }
    
    // 2. Limpiar todos los egresos
    console.log('💸 Limpiando egresos...');
    const egresosRef = collection(db, 'restaurantes', restauranteId, 'Egresos');
    const egresosSnapshot = await getDocs(egresosRef);
    
    for (const docSnapshot of egresosSnapshot.docs) {
      await deleteDoc(docSnapshot.ref);
      console.log(`✅ Egreso eliminado: ${docSnapshot.id}`);
    }
    
    // 3. Resetear caja registradora
    console.log('💰 Reseteando caja registradora...');
    const cajaRef = collection(db, 'restaurantes', restauranteId, 'CajaRegistradora');
    const cajaSnapshot = await getDocs(cajaRef);
    
    for (const docSnapshot of cajaSnapshot.docs) {
      await updateDoc(docSnapshot.ref, {
        Apertura: '0',
        Cierre: '0',
        Extraccion: {},
        ultimaActualizacion: serverTimestamp()
      });
      console.log(`✅ Caja reseteada: ${docSnapshot.id}`);
    }
    
    // 4. Resetear dinero virtual
    console.log('💳 Reseteando dinero virtual...');
    const dineroRef = collection(db, 'restaurantes', restauranteId, 'Dinero');
    const dineroSnapshot = await getDocs(dineroRef);
    
    for (const docSnapshot of dineroSnapshot.docs) {
      await updateDoc(docSnapshot.ref, {
        Virtual: '0',
        ultimaActualizacion: serverTimestamp()
      });
      console.log(`✅ Dinero virtual reseteado: ${docSnapshot.id}`);
    }
    
    // 5. Resetear mesas pagadas (volver a estado libre)
    console.log('🪑 Reseteando mesas pagadas...');
    const mesasRef = collection(db, 'restaurantes', restauranteId, 'tables');
    const mesasSnapshot = await getDocs(mesasRef);
    
    for (const docSnapshot of mesasSnapshot.docs) {
      const mesaData = docSnapshot.data();
      if (mesaData.estado === 'pagado') {
        await updateDoc(docSnapshot.ref, {
          estado: 'libre',
          productos: [],
          total: 0,
          cliente: '',
          datos_cliente: {},
          metodoPago: '',
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Mesa liberada: ${docSnapshot.id}`);
      }
    }
    
    // 6. Limpiar pedidos de takeaway pagados
    console.log('🥡 Limpiando takeaway pagados...');
    const takeawayRef = collection(db, 'restaurantes', restauranteId, 'takeaway');
    const takeawaySnapshot = await getDocs(takeawayRef);
    
    for (const docSnapshot of takeawaySnapshot.docs) {
      const takeawayData = docSnapshot.data();
      if (takeawayData.estado === 'pagado') {
        await deleteDoc(docSnapshot.ref);
        console.log(`✅ Takeaway eliminado: ${docSnapshot.id}`);
      }
    }
    
    // 7. Limpiar pedidos de delivery pagados
    console.log('🚚 Limpiando delivery pagados...');
    const deliveryRef = collection(db, 'restaurantes', restauranteId, 'delivery');
    const deliverySnapshot = await getDocs(deliveryRef);
    
    for (const docSnapshot of deliverySnapshot.docs) {
      const deliveryData = docSnapshot.data();
      if (deliveryData.estado === 'pagado') {
        await deleteDoc(docSnapshot.ref);
        console.log(`✅ Delivery eliminado: ${docSnapshot.id}`);
      }
    }
    
    console.log('🎉 ¡Reset completado exitosamente!');
    console.log('📋 Resumen:');
    console.log('   - Ingresos: 0');
    console.log('   - Egresos: 0');
    console.log('   - Caja registradora: $0');
    console.log('   - Dinero virtual: $0');
    console.log('   - Mesas: todas liberadas');
    console.log('   - Takeaway pagados: eliminados');
    console.log('   - Delivery pagados: eliminados');
    
    // Recargar la página para ver los cambios
    if (confirm('¿Recargar la página para ver los cambios?')) {
      window.location.reload();
    }
    
  } catch (error) {
    console.error('❌ Error durante el reset:', error);
    alert('Error durante el reset: ' + error.message);
  }
}

// Ejecutar el reset
console.log('🚀 Ejecutando reset de datos financieros...');
resetFinancialData();
