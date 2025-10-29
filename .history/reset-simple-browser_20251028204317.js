// Script simple para resetear datos financieros
// Ejecutar en la consola del navegador

(async function resetFinancialData() {
  try {
    console.log('🔄 Iniciando reset de datos financieros...');
    
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
    
    // 1. Limpiar ingresos
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
      console.log('⚠️ Error con ingresos:', error.message);
    }
    
    // 2. Limpiar egresos
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
      console.log('⚠️ Error con egresos:', error.message);
    }
    
    // 3. Resetear caja registradora
    console.log('💰 Reseteando caja...');
    try {
      await makeRequest(`/api/caja-registradora?restauranteId=${restauranteId}`, 'PUT', {
        Apertura: '0',
        Cierre: '0',
        Extraccion: {}
      });
      console.log('✅ Caja reseteada');
    } catch (error) {
      console.log('⚠️ Error con caja:', error.message);
    }
    
    // 4. Resetear dinero virtual
    console.log('💳 Reseteando dinero virtual...');
    try {
      await makeRequest(`/api/dinero-virtual?restauranteId=${restauranteId}`, 'PUT', {
        Virtual: '0'
      });
      console.log('✅ Dinero virtual reseteado');
    } catch (error) {
      console.log('⚠️ Error con dinero virtual:', error.message);
    }
    
    console.log('🎉 ¡Reset completado!');
    console.log('🔄 Recargando página en 2 segundos...');
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error durante el reset:', error);
    alert('Error: ' + error.message);
  }
})();
