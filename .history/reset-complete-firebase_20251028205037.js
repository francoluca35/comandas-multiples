// Script para resetear COMPLETAMENTE todos los datos financieros usando Firebase directo
// Ejecutar en la consola del navegador

(async function resetCompleteFirebase() {
  try {
    console.log('🔄 Iniciando reset COMPLETO con Firebase directo...');
    
    // Obtener el restauranteId del localStorage
    const restauranteId = localStorage.getItem('restauranteId') || 'francomputer';
    console.log('🏪 Usando restauranteId:', restauranteId);
    
    // Verificar que Firebase esté disponible
    if (typeof window !== 'undefined' && window.firebase) {
      const db = window.firebase.firestore();
      
      // 1. BORRAR TODOS LOS INGRESOS
      console.log('📊 Borrando TODOS los ingresos...');
      const ingresosRef = db.collection('restaurantes').doc(restauranteId).collection('Ingresos');
      const ingresosSnapshot = await ingresosRef.get();
      
      const batch1 = db.batch();
      ingresosSnapshot.docs.forEach(doc => {
        batch1.delete(doc.ref);
      });
      await batch1.commit();
      console.log(`✅ Ingresos eliminados: ${ingresosSnapshot.docs.length}`);
      
      // 2. BORRAR TODOS LOS EGRESOS
      console.log('💸 Borrando TODOS los egresos...');
      const egresosRef = db.collection('restaurantes').doc(restauranteId).collection('Egresos');
      const egresosSnapshot = await egresosRef.get();
      
      const batch2 = db.batch();
      egresosSnapshot.docs.forEach(doc => {
        batch2.delete(doc.ref);
      });
      await batch2.commit();
      console.log(`✅ Egresos eliminados: ${egresosSnapshot.docs.length}`);
      
      // 3. BORRAR COMPLETAMENTE CajaRegistradora
      console.log('💰 Borrando CajaRegistradora completamente...');
      const cajaRef = db.collection('restaurantes').doc(restauranteId).collection('CajaRegistradora');
      const cajaSnapshot = await cajaRef.get();
      
      const batch3 = db.batch();
      cajaSnapshot.docs.forEach(doc => {
        batch3.delete(doc.ref);
      });
      await batch3.commit();
      console.log(`✅ Cajas eliminadas: ${cajaSnapshot.docs.length}`);
      
      // 4. BORRAR COMPLETAMENTE Dinero
      console.log('💳 Borrando Dinero completamente...');
      const dineroRef = db.collection('restaurantes').doc(restauranteId).collection('Dinero');
      const dineroSnapshot = await dineroRef.get();
      
      const batch4 = db.batch();
      dineroSnapshot.docs.forEach(doc => {
        batch4.delete(doc.ref);
      });
      await batch4.commit();
      console.log(`✅ Dinero eliminado: ${dineroSnapshot.docs.length}`);
      
      // 5. BORRAR SUELDO EMPLEADOS
      console.log('👥 Borrando sueldos de empleados...');
      const sueldosRef = db.collection('restaurantes').doc(restauranteId).collection('SueldoEmpleados');
      const sueldosSnapshot = await sueldosRef.get();
      
      const batch5 = db.batch();
      sueldosSnapshot.docs.forEach(doc => {
        batch5.delete(doc.ref);
      });
      await batch5.commit();
      console.log(`✅ Sueldos eliminados: ${sueldosSnapshot.docs.length}`);
      
      // 6. RESETEAR MESAS PAGADAS
      console.log('🪑 Reseteando mesas pagadas...');
      const mesasRef = db.collection('restaurantes').doc(restauranteId).collection('tables');
      const mesasSnapshot = await mesasRef.get();
      
      const batch6 = db.batch();
      let mesasReseteadas = 0;
      mesasSnapshot.docs.forEach(doc => {
        const mesaData = doc.data();
        if (mesaData.estado === 'pagado') {
          batch6.update(doc.ref, {
            estado: 'libre',
            productos: [],
            total: 0,
            cliente: '',
            datos_cliente: {},
            metodoPago: '',
            updatedAt: new Date()
          });
          mesasReseteadas++;
        }
      });
      await batch6.commit();
      console.log(`✅ Mesas reseteadas: ${mesasReseteadas}`);
      
      // 7. BORRAR TAKEAWAY PAGADOS
      console.log('🥡 Borrando takeaway pagados...');
      const takeawayRef = db.collection('restaurantes').doc(restauranteId).collection('takeaway');
      const takeawaySnapshot = await takeawayRef.get();
      
      const batch7 = db.batch();
      let takeawayEliminados = 0;
      takeawaySnapshot.docs.forEach(doc => {
        const takeawayData = doc.data();
        if (takeawayData.estado === 'pagado') {
          batch7.delete(doc.ref);
          takeawayEliminados++;
        }
      });
      await batch7.commit();
      console.log(`✅ Takeaway eliminados: ${takeawayEliminados}`);
      
      // 8. BORRAR DELIVERY PAGADOS
      console.log('🚚 Borrando delivery pagados...');
      const deliveryRef = db.collection('restaurantes').doc(restauranteId).collection('delivery');
      const deliverySnapshot = await deliveryRef.get();
      
      const batch8 = db.batch();
      let deliveryEliminados = 0;
      deliverySnapshot.docs.forEach(doc => {
        const deliveryData = doc.data();
        if (deliveryData.estado === 'pagado') {
          batch8.delete(doc.ref);
          deliveryEliminados++;
        }
      });
      await batch8.commit();
      console.log(`✅ Delivery eliminados: ${deliveryEliminados}`);
      
      console.log('🎉 ¡RESET COMPLETO EXITOSO!');
      console.log('📋 Resumen de eliminación:');
      console.log(`   ✅ Ingresos: ${ingresosSnapshot.docs.length} eliminados`);
      console.log(`   ✅ Egresos: ${egresosSnapshot.docs.length} eliminados`);
      console.log(`   ✅ CajaRegistradora: ${cajaSnapshot.docs.length} eliminadas`);
      console.log(`   ✅ Dinero: ${dineroSnapshot.docs.length} eliminados`);
      console.log(`   ✅ Sueldo Empleados: ${sueldosSnapshot.docs.length} eliminados`);
      console.log(`   ✅ Mesas pagadas: ${mesasReseteadas} reseteadas`);
      console.log(`   ✅ Takeaway pagados: ${takeawayEliminados} eliminados`);
      console.log(`   ✅ Delivery pagados: ${deliveryEliminados} eliminados`);
      
    } else {
      throw new Error('Firebase no está disponible. Usa el script de APIs en su lugar.');
    }
    
    console.log('🔄 Recargando página en 3 segundos...');
    setTimeout(() => {
      window.location.reload();
    }, 3000);
    
  } catch (error) {
    console.error('❌ Error durante el reset completo:', error);
    alert('Error durante el reset: ' + error.message);
  }
})();
