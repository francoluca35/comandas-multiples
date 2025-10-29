// Script completo para resetear TODOS los datos financieros
// Ejecutar en la consola del navegador

(async function resetCompleteFinancialData() {
  try {
    console.log('🔄 Iniciando reset COMPLETO de datos financieros...');
    
    // Obtener el restauranteId del localStorage
    const restauranteId = localStorage.getItem('restauranteId') || 'francomputer';
    console.log('🏪 Usando restauranteId:', restauranteId);
    
    // Función helper para hacer requests
    const makeRequest = async (url, method = 'GET', data = null) => {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : null
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    };
    
    // 1. BORRAR TODOS LOS INGRESOS
    console.log('📊 Borrando TODOS los ingresos...');
    try {
      const ingresosResponse = await makeRequest(`/api/ingresos?restauranteId=${restauranteId}`);
      if (ingresosResponse.success && ingresosResponse.ingresos) {
        for (const ingreso of ingresosResponse.ingresos) {
          await makeRequest(`/api/ingresos/${ingreso.id}?restauranteId=${restauranteId}`, 'DELETE');
          console.log(`✅ Ingreso eliminado: ${ingreso.id}`);
        }
        console.log(`📊 Total ingresos eliminados: ${ingresosResponse.ingresos.length}`);
      }
    } catch (error) {
      console.log('⚠️ Error con ingresos:', error.message);
    }
    
    // 2. BORRAR TODOS LOS EGRESOS
    console.log('💸 Borrando TODOS los egresos...');
    try {
      const egresosResponse = await makeRequest(`/api/egresos?restauranteId=${restauranteId}`);
      if (egresosResponse.success && egresosResponse.egresos) {
        for (const egreso of egresosResponse.egresos) {
          await makeRequest(`/api/egresos/${egreso.id}?restauranteId=${restauranteId}`, 'DELETE');
          console.log(`✅ Egreso eliminado: ${egreso.id}`);
        }
        console.log(`💸 Total egresos eliminados: ${egresosResponse.egresos.length}`);
      }
    } catch (error) {
      console.log('⚠️ Error con egresos:', error.message);
    }
    
    // 3. BORRAR COMPLETAMENTE CajaRegistradora
    console.log('💰 Borrando CajaRegistradora completamente...');
    try {
      const cajaResponse = await makeRequest(`/api/caja-registradora?restauranteId=${restauranteId}`);
      if (cajaResponse.success && cajaResponse.cajas) {
        for (const caja of cajaResponse.cajas) {
          await makeRequest(`/api/caja-registradora/${caja.id}?restauranteId=${restauranteId}`, 'DELETE');
          console.log(`✅ Caja eliminada: ${caja.id}`);
        }
        console.log(`💰 Total cajas eliminadas: ${cajaResponse.cajas.length}`);
      }
    } catch (error) {
      console.log('⚠️ Error con cajas:', error.message);
    }
    
    // 4. BORRAR COMPLETAMENTE Dinero (dinero_actual)
    console.log('💳 Borrando Dinero completamente...');
    try {
      const dineroResponse = await makeRequest(`/api/dinero-actual?restauranteId=${restauranteId}`);
      if (dineroResponse.success && dineroResponse.dinero) {
        for (const dinero of dineroResponse.dinero) {
          await makeRequest(`/api/dinero-actual/${dinero.id}?restauranteId=${restauranteId}`, 'DELETE');
          console.log(`✅ Dinero eliminado: ${dinero.id}`);
        }
        console.log(`💳 Total dinero eliminado: ${dineroResponse.dinero.length}`);
      }
    } catch (error) {
      console.log('⚠️ Error con dinero:', error.message);
    }
    
    // 5. BORRAR SUELDO EMPLEADOS
    console.log('👥 Borrando sueldos de empleados...');
    try {
      const sueldosResponse = await makeRequest(`/api/sueldo-empleados?restauranteId=${restauranteId}`);
      if (sueldosResponse.success && sueldosResponse.sueldos) {
        for (const sueldo of sueldosResponse.sueldos) {
          await makeRequest(`/api/sueldo-empleados/${sueldo.id}?restauranteId=${restauranteId}`, 'DELETE');
          console.log(`✅ Sueldo eliminado: ${sueldo.id}`);
        }
        console.log(`👥 Total sueldos eliminados: ${sueldosResponse.sueldos.length}`);
      }
    } catch (error) {
      console.log('⚠️ Error con sueldos:', error.message);
    }
    
    // 6. RESETEAR MESAS PAGADAS
    console.log('🪑 Reseteando mesas pagadas...');
    try {
      const mesasResponse = await makeRequest(`/api/tables?restauranteId=${restauranteId}`);
      if (mesasResponse.success && mesasResponse.tables) {
        let mesasReseteadas = 0;
        for (const mesa of mesasResponse.tables) {
          if (mesa.estado === 'pagado') {
            await makeRequest(`/api/tables/${mesa.id}?restauranteId=${restauranteId}`, 'PUT', {
              estado: 'libre',
              productos: [],
              total: 0,
              cliente: '',
              datos_cliente: {},
              metodoPago: ''
            });
            console.log(`✅ Mesa liberada: ${mesa.id}`);
            mesasReseteadas++;
          }
        }
        console.log(`🪑 Total mesas reseteadas: ${mesasReseteadas}`);
      }
    } catch (error) {
      console.log('⚠️ Error con mesas:', error.message);
    }
    
    // 7. BORRAR TAKEAWAY PAGADOS
    console.log('🥡 Borrando takeaway pagados...');
    try {
      const takeawayResponse = await makeRequest(`/api/takeaway?restauranteId=${restauranteId}`);
      if (takeawayResponse.success && takeawayResponse.orders) {
        let takeawayEliminados = 0;
        for (const order of takeawayResponse.orders) {
          if (order.estado === 'pagado') {
            await makeRequest(`/api/takeaway/${order.id}?restauranteId=${restauranteId}`, 'DELETE');
            console.log(`✅ Takeaway eliminado: ${order.id}`);
            takeawayEliminados++;
          }
        }
        console.log(`🥡 Total takeaway eliminados: ${takeawayEliminados}`);
      }
    } catch (error) {
      console.log('⚠️ Error con takeaway:', error.message);
    }
    
    // 8. BORRAR DELIVERY PAGADOS
    console.log('🚚 Borrando delivery pagados...');
    try {
      const deliveryResponse = await makeRequest(`/api/delivery?restauranteId=${restauranteId}`);
      if (deliveryResponse.success && deliveryResponse.orders) {
        let deliveryEliminados = 0;
        for (const order of deliveryResponse.orders) {
          if (order.estado === 'pagado') {
            await makeRequest(`/api/delivery/${order.id}?restauranteId=${restauranteId}`, 'DELETE');
            console.log(`✅ Delivery eliminado: ${order.id}`);
            deliveryEliminados++;
          }
        }
        console.log(`🚚 Total delivery eliminados: ${deliveryEliminados}`);
      }
    } catch (error) {
      console.log('⚠️ Error con delivery:', error.message);
    }
    
    console.log('🎉 ¡RESET COMPLETO EXITOSO!');
    console.log('📋 Resumen de eliminación:');
    console.log('   ✅ Ingresos: TODOS eliminados');
    console.log('   ✅ Egresos: TODOS eliminados');
    console.log('   ✅ CajaRegistradora: COMPLETAMENTE eliminada');
    console.log('   ✅ Dinero: COMPLETAMENTE eliminado');
    console.log('   ✅ Sueldo Empleados: TODOS eliminados');
    console.log('   ✅ Mesas pagadas: Reseteadas a libre');
    console.log('   ✅ Takeaway pagados: Eliminados');
    console.log('   ✅ Delivery pagados: Eliminados');
    console.log('🔄 Recargando página en 3 segundos...');
    
    setTimeout(() => {
      window.location.reload();
    }, 3000);
    
  } catch (error) {
    console.error('❌ Error durante el reset completo:', error);
    alert('Error durante el reset: ' + error.message);
  }
})();
