// Script simple para resetear datos financieros
// Ejecutar en la consola del navegador

async function resetSimple() {
  try {
    console.log('🔄 Reseteando datos financieros...');
    
    const restauranteId = localStorage.getItem('restauranteId') || 'francomputer';
    console.log('🏪 Restaurante:', restauranteId);
    
    // Función helper para hacer requests
    const makeRequest = async (url, method = 'GET', data = null) => {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : null
      });
      return response.json();
    };
    
    // 1. Limpiar ingresos
    console.log('📊 Limpiando ingresos...');
    const ingresosResponse = await makeRequest(`/api/ingresos?restauranteId=${restauranteId}`);
    if (ingresosResponse.success && ingresosResponse.ingresos) {
      for (const ingreso of ingresosResponse.ingresos) {
        await makeRequest(`/api/ingresos/${ingreso.id}?restauranteId=${restauranteId}`, 'DELETE');
        console.log(`✅ Ingreso eliminado: ${ingreso.id}`);
      }
    }
    
    // 2. Limpiar egresos
    console.log('💸 Limpiando egresos...');
    const egresosResponse = await makeRequest(`/api/egresos?restauranteId=${restauranteId}`);
    if (egresosResponse.success && egresosResponse.egresos) {
      for (const egreso of egresosResponse.egresos) {
        await makeRequest(`/api/egresos/${egreso.id}?restauranteId=${restauranteId}`, 'DELETE');
        console.log(`✅ Egreso eliminado: ${egreso.id}`);
      }
    }
    
    // 3. Resetear caja registradora
    console.log('💰 Reseteando caja...');
    await makeRequest(`/api/caja-registradora?restauranteId=${restauranteId}`, 'PUT', {
      Apertura: '0',
      Cierre: '0',
      Extraccion: {}
    });
    
    // 4. Resetear dinero virtual
    console.log('💳 Reseteando dinero virtual...');
    await makeRequest(`/api/dinero-virtual?restauranteId=${restauranteId}`, 'PUT', {
      Virtual: '0'
    });
    
    console.log('🎉 ¡Reset completado!');
    console.log('🔄 Recargando página...');
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error: ' + error.message);
  }
}

// Ejecutar
resetSimple();
