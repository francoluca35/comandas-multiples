// Script para resetear datos financieros desde el navegador
// Ejecutar en la consola del navegador en la página de la app

async function resetFinancialData() {
  try {
    console.log('🔄 Iniciando reset de datos financieros...');
    
    // Obtener el restauranteId del localStorage
    const restauranteId = localStorage.getItem('restauranteId') || 'francomputer';
    console.log('🏪 Usando restauranteId:', restauranteId);
    
    // Función helper para hacer requests a las APIs
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
    
    // 1. Limpiar todos los ingresos
    console.log('📊 Limpiando ingresos...');
    try {
      const ingresosResponse = await makeRequest(`/api/ingresos?restauranteId=${restauranteId}`);
      if (ingresosResponse.success && ingresosResponse.ingresos) {
        for (const ingreso of ingresosResponse.ingresos) {
          await makeRequest(`/api/ingresos/${ingreso.id}?restauranteId=${restauranteId}`, 'DELETE');
          console.log(`✅ Ingreso eliminado: ${ingreso.id}`);
        }
      }
    } catch (error) {
      console.log('⚠️ No se pudieron eliminar ingresos:', error.message);
    }
    
    // 2. Limpiar todos los egresos
    console.log('💸 Limpiando egresos...');
    try {
      const egresosResponse = await makeRequest(`/api/egresos?restauranteId=${restauranteId}`);
      if (egresosResponse.success && egresosResponse.egresos) {
        for (const egreso of egresosResponse.egresos) {
          await makeRequest(`/api/egresos/${egreso.id}?restauranteId=${restauranteId}`, 'DELETE');
          console.log(`✅ Egreso eliminado: ${egreso.id}`);
        }
      }
    } catch (error) {
      console.log('⚠️ No se pudieron eliminar egresos:', error.message);
    }
    
    // 3. Resetear caja registradora
    console.log('💰 Reseteando caja registradora...');
    try {
      await makeRequest(`/api/caja-registradora?restauranteId=${restauranteId}`, 'PUT', {
        Apertura: '0',
        Cierre: '0',
        Extraccion: {}
      });
      console.log('✅ Caja registradora reseteada');
    } catch (error) {
      console.log('⚠️ No se pudo resetear la caja:', error.message);
    }
    
    // 4. Resetear dinero virtual
    console.log('💳 Reseteando dinero virtual...');
    try {
      await makeRequest(`/api/dinero-virtual?restauranteId=${restauranteId}`, 'PUT', {
        Virtual: '0'
      });
      console.log('✅ Dinero virtual reseteado');
    } catch (error) {
      console.log('⚠️ No se pudo resetear el dinero virtual:', error.message);
    }
    
    // 5. Resetear mesas pagadas (volver a estado libre)
    console.log('🪑 Reseteando mesas pagadas...');
    try {
      const mesasResponse = await makeRequest(`/api/tables?restauranteId=${restauranteId}`);
      if (mesasResponse.success && mesasResponse.tables) {
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
          }
        }
      }
    } catch (error) {
      console.log('⚠️ No se pudieron resetear las mesas:', error.message);
    }
    
    // 6. Limpiar pedidos de takeaway pagados
    console.log('🥡 Limpiando takeaway pagados...');
    try {
      const takeawayResponse = await makeRequest(`/api/takeaway?restauranteId=${restauranteId}`);
      if (takeawayResponse.success && takeawayResponse.orders) {
        for (const order of takeawayResponse.orders) {
          if (order.estado === 'pagado') {
            await makeRequest(`/api/takeaway/${order.id}?restauranteId=${restauranteId}`, 'DELETE');
            console.log(`✅ Takeaway eliminado: ${order.id}`);
          }
        }
      }
    } catch (error) {
      console.log('⚠️ No se pudieron eliminar takeaway:', error.message);
    }
    
    // 7. Limpiar pedidos de delivery pagados
    console.log('🚚 Limpiando delivery pagados...');
    try {
      const deliveryResponse = await makeRequest(`/api/delivery?restauranteId=${restauranteId}`);
      if (deliveryResponse.success && deliveryResponse.orders) {
        for (const order of deliveryResponse.orders) {
          if (order.estado === 'pagado') {
            await makeRequest(`/api/delivery/${order.id}?restauranteId=${restauranteId}`, 'DELETE');
            console.log(`✅ Delivery eliminado: ${order.id}`);
          }
        }
      }
    } catch (error) {
      console.log('⚠️ No se pudieron eliminar delivery:', error.message);
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
