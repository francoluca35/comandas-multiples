// Script para probar el API de pagos
const testPagosAPI = async () => {
  try {
    console.log('🔄 Probando API de pagos...');
    
    const restauranteId = 'francomputer';
    const response = await fetch(`http://localhost:3000/api/pagos-resumen?restauranteId=${restauranteId}`);
    
    console.log('📊 Status:', response.status);
    console.log('📊 OK:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Datos recibidos:', data);
      console.log('📊 Loading en datos:', data.data?.loading);
    } else {
      console.log('❌ Error en respuesta:', response.statusText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testPagosAPI();
