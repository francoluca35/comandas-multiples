// Script para resetear COMPLETAMENTE todos los datos financieros usando Firebase v9+
// Ejecutar en la consola del navegador

(async function resetCompleteFirebaseV9() {
  try {
    console.log('🔄 Iniciando reset COMPLETO con Firebase v9+...');
    
    // Obtener el restauranteId del localStorage
    const restauranteId = localStorage.getItem('restauranteId') || 'francomputer';
    console.log('🏪 Usando restauranteId:', restauranteId);
    
    // Verificar que Firebase esté disponible
    if (typeof window !== 'undefined' && window.firebase) {
      // Usar la sintaxis de Firebase v9+
      const { getFirestore, collection, getDocs, deleteDoc, updateDoc, writeBatch, doc } = window.firebase.firestore;
      const db = getFirestore();
      
      // 1. BORRAR TODOS LOS INGRESOS
      console.log('📊 Borrando TODOS los ingresos...');
      const ingresosRef = collection(db, 'restaurantes', restauranteId, 'Ingresos');
      const ingresosSnapshot = await getDocs(ingresosRef);
      
      const batch1 = writeBatch(db);
      ingresosSnapshot.docs.forEach(docSnapshot => {
        batch1.delete(docSnapshot.ref);
      });
      await batch1.commit();
      console.log(`✅ Ingresos eliminados: ${ingresosSnapshot.docs.length}`);
      
      // 2. BORRAR TODOS LOS EGRESOS
      console.log('💸 Borrando TODOS los egresos...');
      const egresosRef = collection(db, 'restaurantes', restauranteId, 'Egresos');
      const egresosSnapshot = await getDocs(egresosRef);
      
      const batch2 = writeBatch(db);
      egresosSnapshot.docs.forEach(docSnapshot => {
        batch2.delete(docSnapshot.ref);
      });
      await batch2.commit();
      console.log(`✅ Egresos eliminados: ${egresosSnapshot.docs.length}`);
      
      // 3. BORRAR COMPLETAMENTE CajaRegistradora
      console.log('💰 Borrando CajaRegistradora completamente...');
      const cajaRef = collection(db, 'restaurantes', restauranteId, 'CajaRegistradora');
      const cajaSnapshot = await getDocs(cajaRef);
      
      const batch3 = writeBatch(db);
      cajaSnapshot.docs.forEach(docSnapshot => {
        batch3.delete(docSnapshot.ref);
      });
      await batch3.commit();
      console.log(`✅ Cajas eliminadas: ${cajaSnapshot.docs.length}`);
      
      // 4. BORRAR COMPLETAMENTE Dinero
      console.log('💳 Borrando Dinero completamente...');
      const dineroRef = collection(db, 'restaurantes', restauranteId, 'Dinero');
      const dineroSnapshot = await getDocs(dineroRef);
      
      const batch4 = writeBatch(db);
      dineroSnapshot.docs.forEach(docSnapshot => {
        batch4.delete(docSnapshot.ref);
      });
      await batch4.commit();
      console.log(`✅ Dinero eliminado: ${dineroSnapshot.docs.length}`);
      
      // 5. BORRAR SUELDO EMPLEADOS
      console.log('👥 Borrando sueldos de empleados...');
      const sueldosRef = collection(db, 'restaurantes', restauranteId, 'SueldoEmpleados');
      const sueldosSnapshot = await getDocs(sueldosRef);
      
      const batch5 = writeBatch(db);
      sueldosSnapshot.docs.forEach(docSnapshot => {
        batch5.delete(docSnapshot.ref);
      });
      await batch5.commit();
      console.log(`✅ Sueldos eliminados: ${sueldosSnapshot.docs.length}`);
      
      // 6. RESETEAR MESAS PAGADAS
      console.log('🪑 Reseteando mesas pagadas...');
      const mesasRef = collection(db, 'restaurantes', restauranteId, 'tables');
      const mesasSnapshot = await getDocs(mesasRef);
      
      const batch6 = writeBatch(db);
      let mesasReseteadas = 0;
      mesasSnapshot.docs.forEach(docSnapshot => {
        const mesaData = docSnapshot.data();
        if (mesaData.estado === 'pagado') {
          batch6.update(docSnapshot.ref, {
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
      const takeawayRef = collection(db, 'restaurantes', restauranteId, 'takeaway');
      const takeawaySnapshot = await getDocs(takeawayRef);
      
      const batch7 = writeBatch(db);
      let takeawayEliminados = 0;
      takeawaySnapshot.docs.forEach(docSnapshot => {
        const takeawayData = docSnapshot.data();
        if (takeawayData.estado === 'pagado') {
          batch7.delete(docSnapshot.ref);
          takeawayEliminados++;
        }
      });
      await batch7.commit();
      console.log(`✅ Takeaway eliminados: ${takeawayEliminados}`);
      
      // 8. BORRAR DELIVERY PAGADOS
      console.log('🚚 Borrando delivery pagados...');
      const deliveryRef = collection(db, 'restaurantes', restauranteId, 'delivery');
      const deliverySnapshot = await getDocs(deliveryRef);
      
      const batch8 = writeBatch(db);
      let deliveryEliminados = 0;
      deliverySnapshot.docs.forEach(docSnapshot => {
        const deliveryData = docSnapshot.data();
        if (deliveryData.estado === 'pagado') {
          batch8.delete(docSnapshot.ref);
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
