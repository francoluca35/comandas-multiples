const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp 
} = require('firebase/firestore');

// ⚠️ IMPORTANTE: Reemplaza estas credenciales con las tuyas
const firebaseConfig = {
  apiKey: "AIzaSyBqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq",
  authDomain: "comandas-multiples.firebaseapp.com",
  projectId: "comandas-multiples",
  storageBucket: "comandas-multiples.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ⚠️ CAMBIA ESTO: ID de tu restaurante
const restauranteId = 'francomputer';

// Función para resetear TODOS los datos financieros
async function resetAllFinancialData() {
  try {
    console.log('🔄 INICIANDO RESET COMPLETO DE DATOS FINANCIEROS...');
    console.log(`🏪 Restaurante: ${restauranteId}`);
    console.log('');
    
    let totalEliminados = 0;
    
    // ==========================================
    // 1. ELIMINAR TODOS LOS INGRESOS
    // ==========================================
    console.log('📊 ELIMINANDO INGRESOS...');
    const ingresosRef = collection(db, 'restaurantes', restauranteId, 'Ingresos');
    const ingresosSnapshot = await getDocs(ingresosRef);
    
    for (const docSnapshot of ingresosSnapshot.docs) {
      await deleteDoc(docSnapshot.ref);
      totalEliminados++;
    }
    console.log(`✅ Ingresos eliminados: ${ingresosSnapshot.size}`);
    console.log('');
    
    // ==========================================
    // 2. ELIMINAR TODOS LOS EGRESOS
    // ==========================================
    console.log('💸 ELIMINANDO EGRESOS...');
    const egresosRef = collection(db, 'restaurantes', restauranteId, 'Egresos');
    const egresosSnapshot = await getDocs(egresosRef);
    
    for (const docSnapshot of egresosSnapshot.docs) {
      await deleteDoc(docSnapshot.ref);
      totalEliminados++;
    }
    console.log(`✅ Egresos eliminados: ${egresosSnapshot.size}`);
    console.log('');
    
    // ==========================================
    // 3. RESETEAR CAJA REGISTRADORA
    // ==========================================
    console.log('💰 RESETEANDO CAJA REGISTRADORA...');
    const cajaRef = collection(db, 'restaurantes', restauranteId, 'CajaRegistradora');
    const cajaSnapshot = await getDocs(cajaRef);
    
    for (const docSnapshot of cajaSnapshot.docs) {
      await updateDoc(docSnapshot.ref, {
        Apertura: '0',
        Cierre: '0',
        Extraccion: {},
        ultimaActualizacion: serverTimestamp()
      });
    }
    console.log(`✅ Cajas reseteadas: ${cajaSnapshot.size}`);
    console.log('');
    
    // ==========================================
    // 4. RESETEAR DINERO VIRTUAL
    // ==========================================
    console.log('💳 RESETEANDO DINERO VIRTUAL...');
    const dineroRef = collection(db, 'restaurantes', restauranteId, 'Dinero');
    const dineroSnapshot = await getDocs(dineroRef);
    
    for (const docSnapshot of dineroSnapshot.docs) {
      await updateDoc(docSnapshot.ref, {
        Virtual: '0',
        fechaActualizacion: serverTimestamp()
      });
    }
    console.log(`✅ Dinero virtual reseteado: ${dineroSnapshot.size}`);
    console.log('');
    
    // ==========================================
    // 5. RESETEAR MESAS PAGADAS
    // ==========================================
    console.log('🪑 RESETEANDO MESAS PAGADAS...');
    const mesasRef = collection(db, 'restaurantes', restauranteId, 'tables');
    const mesasSnapshot = await getDocs(mesasRef);
    
    let mesasReseteadas = 0;
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
          fechaVenta: null,
          updatedAt: serverTimestamp()
        });
        mesasReseteadas++;
      }
    }
    console.log(`✅ Mesas reseteadas: ${mesasReseteadas}`);
    console.log('');
    
    // ==========================================
    // 6. ELIMINAR TAKEAWAY PAGADOS
    // ==========================================
    console.log('🥡 ELIMINANDO TAKEAWAY PAGADOS...');
    const takeawayRef = collection(db, 'restaurantes', restauranteId, 'takeaway');
    const takeawaySnapshot = await getDocs(takeawayRef);
    
    let takeawayEliminados = 0;
    for (const docSnapshot of takeawaySnapshot.docs) {
      const takeawayData = docSnapshot.data();
      if (takeawayData.estado === 'pagado') {
        await deleteDoc(docSnapshot.ref);
        takeawayEliminados++;
        totalEliminados++;
      }
    }
    console.log(`✅ Takeaway eliminados: ${takeawayEliminados}`);
    console.log('');
    
    // ==========================================
    // 7. ELIMINAR DELIVERY PAGADOS
    // ==========================================
    console.log('🚚 ELIMINANDO DELIVERY PAGADOS...');
    const deliveryRef = collection(db, 'restaurantes', restauranteId, 'delivery');
    const deliverySnapshot = await getDocs(deliveryRef);
    
    let deliveryEliminados = 0;
    for (const docSnapshot of deliverySnapshot.docs) {
      const deliveryData = docSnapshot.data();
      if (deliveryData.estado === 'pagado') {
        await deleteDoc(docSnapshot.ref);
        deliveryEliminados++;
        totalEliminados++;
      }
    }
    console.log(`✅ Delivery eliminados: ${deliveryEliminados}`);
    console.log('');
    
    // ==========================================
    // 8. ELIMINAR ALIVIOS
    // ==========================================
    console.log('🏥 ELIMINANDO ALIVIOS...');
    const aliviosRef = collection(db, 'restaurantes', restauranteId, 'Alivios');
    const aliviosSnapshot = await getDocs(aliviosRef);
    
    for (const docSnapshot of aliviosSnapshot.docs) {
      await deleteDoc(docSnapshot.ref);
      totalEliminados++;
    }
    console.log(`✅ Alivios eliminados: ${aliviosSnapshot.size}`);
    console.log('');
    
    // ==========================================
    // 9. ELIMINAR INVERSION
    // ==========================================
    console.log('📦 ELIMINANDO INVERSION...');
    const inversionRef = collection(db, 'restaurantes', restauranteId, 'Inversion');
    const inversionSnapshot = await getDocs(inversionRef);
    
    for (const docSnapshot of inversionSnapshot.docs) {
      await deleteDoc(docSnapshot.ref);
      totalEliminados++;
    }
    console.log(`✅ Inversiones eliminadas: ${inversionSnapshot.size}`);
    console.log('');
    
    // ==========================================
    // 10. ELIMINAR SUELDOS
    // ==========================================
    console.log('💵 ELIMINANDO SUELDOS...');
    const sueldosRef = collection(db, 'restaurantes', restauranteId, 'Sueldos');
    const sueldosSnapshot = await getDocs(sueldosRef);
    
    for (const docSnapshot of sueldosSnapshot.docs) {
      await deleteDoc(docSnapshot.ref);
      totalEliminados++;
    }
    console.log(`✅ Sueldos eliminados: ${sueldosSnapshot.size}`);
    console.log('');
    
    // ==========================================
    // RESUMEN FINAL
    // ==========================================
    console.log('=====================================');
    console.log('🎉 RESET COMPLETADO EXITOSAMENTE');
    console.log('=====================================');
    console.log(`📋 TOTAL DE DOCUMENTOS ELIMINADOS: ${totalEliminados}`);
    console.log('');
    console.log('✅ RESULTADOS:');
    console.log('   - Ingresos: TODOS ELIMINADOS');
    console.log('   - Egresos: TODOS ELIMINADOS');
    console.log('   - Caja registradora: RESETEADA A $0');
    console.log('   - Dinero virtual: RESETEADO A $0');
    console.log(`   - Mesas pagadas: ${mesasReseteadas} RESETEADAS`);
    console.log(`   - Takeaway pagados: ${takeawayEliminados} ELIMINADOS`);
    console.log(`   - Delivery pagados: ${deliveryEliminados} ELIMINADOS`);
    console.log('   - Alivios: TODOS ELIMINADOS');
    console.log('   - Inversiones: TODAS ELIMINADAS');
    console.log('   - Sueldos: TODOS ELIMINADOS');
    console.log('');
    
  } catch (error) {
    console.error('❌ ERROR DURANTE EL RESET:', error);
    throw error;
  }
}

// Ejecutar el reset
console.log('⚠️  ATENCIÓN: Este script eliminará TODOS los datos financieros');
console.log('⚠️  Asegúrate de tener un backup antes de continuar');
console.log('');
console.log('Presiona Ctrl+C para cancelar en los próximos 5 segundos...');
console.log('');

// Esperar 5 segundos antes de ejecutar
setTimeout(async () => {
  await resetAllFinancialData();
  process.exit(0);
}, 5000);

