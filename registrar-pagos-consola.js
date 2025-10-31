// SCRIPT PARA EJECUTAR EN LA CONSOLA DEL NAVEGADOR
// Copia y pega este código en la consola del navegador (F12) cuando estés en la app

async function registrarPagosEjemplo() {
  try {
    console.log('🔄 Registrando pagos de ejemplo...');
    
    // Obtener restauranteId del localStorage
    const restauranteId = localStorage.getItem('restauranteId');
    if (!restauranteId) {
      throw new Error('No hay restaurante seleccionado');
    }
    
    console.log(`🏪 Restaurante: ${restauranteId}`);
    
    // Función helper para hacer requests
    const makeRequest = async (url, method = 'GET', data = null) => {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    };
    
    // 1. REGISTRAR PAGO EN EFECTIVO
    console.log('');
    console.log('💰 Registrando pago EFECTIVO de $10.000...');
    
    const ingresoEfectivo = {
      tipoIngreso: 'Ingreso Manual',
      motivo: 'Pago de prueba en efectivo',
      monto: '10000',
      formaIngreso: 'Efectivo',
      opcionPago: 'caja',
      fecha: new Date().toISOString()
    };
    
    const responseEfectivo = await makeRequest('/api/ingresos', 'POST', ingresoEfectivo);
    console.log('✅ Respuesta:', responseEfectivo);
    
    // 2. REGISTRAR PAGO VIRTUAL
    console.log('');
    console.log('💳 Registrando pago VIRTUAL de $10.000...');
    
    const ingresoVirtual = {
      tipoIngreso: 'Ingreso Manual',
      motivo: 'Pago de prueba virtual',
      monto: '10000',
      formaIngreso: 'MercadoPago',
      opcionPago: 'cuenta_restaurante',
      fecha: new Date().toISOString()
    };
    
    const responseVirtual = await makeRequest('/api/ingresos', 'POST', ingresoVirtual);
    console.log('✅ Respuesta:', responseVirtual);
    
    console.log('');
    console.log('🎉 PAGOS REGISTRADOS EXITOSAMENTE');
    console.log('✅ $10.000 en EFECTIVO agregado');
    console.log('✅ $10.000 en VIRTUAL agregado');
    console.log('');
    console.log('🔄 Recarga la página para ver los cambios');
    
    // Preguntar si quiere recargar
    if (confirm('¿Recargar la página ahora?')) {
      window.location.reload();
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error: ' + error.message);
  }
}

// EJECUTAR
console.log('🚀 Ejecutando registro de pagos...');
registrarPagosEjemplo();

