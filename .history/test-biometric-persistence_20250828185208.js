// Script para probar la persistencia de credenciales biométricas durante el login
console.log("🧪 Iniciando prueba de persistencia de credenciales biométricas...");

// Variables para tracking
let initialCredentialCount = 0;
let testResults = [];

// Función para obtener el conteo actual de credenciales
const getCredentialCount = async () => {
  try {
    const request = indexedDB.open("BiometricAuthDB", 1);
    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["credentials"], "readonly");
        const store = transaction.objectStore("credentials");
        const countRequest = store.count();
        
        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = () => reject(countRequest.error);
      };
    });
  } catch (error) {
    console.error("❌ Error obteniendo conteo de credenciales:", error);
    return 0;
  }
};

// Función para obtener detalles de las credenciales
const getCredentialDetails = async () => {
  try {
    const request = indexedDB.open("BiometricAuthDB", 1);
    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["credentials"], "readonly");
        const store = transaction.objectStore("credentials");
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
    });
  } catch (error) {
    console.error("❌ Error obteniendo detalles de credenciales:", error);
    return [];
  }
};

// Función para registrar un punto de prueba
const recordTestPoint = async (pointName) => {
  const count = await getCredentialCount();
  const details = await getCredentialDetails();
  
  const testPoint = {
    timestamp: new Date().toISOString(),
    pointName,
    credentialCount: count,
    credentialDetails: details.map(cred => ({
      id: cred.id,
      userId: cred.userId,
      createdAt: cred.createdAt,
      lastAccessed: cred.lastAccessed
    })),
    url: window.location.href,
    localStorageKeys: Object.keys(localStorage).filter(key => 
      key.includes('biometric') || key.includes('device') || key.includes('recorded')
    )
  };
  
  testResults.push(testPoint);
  console.log(`📊 Punto de prueba "${pointName}": ${count} credenciales`);
  
  return testPoint;
};

// Función para simular el proceso de login
const simulateLoginProcess = async () => {
  console.log("🔄 Simulando proceso de login...");
  
  // Punto 1: Antes del login
  await recordTestPoint("Antes del login");
  
  // Simular guardado de datos de usuario en localStorage
  console.log("📝 Simulando guardado de datos de usuario...");
  localStorage.setItem("usuario", "test_user");
  localStorage.setItem("rol", "admin");
  localStorage.setItem("usuarioId", "test_id");
  localStorage.setItem("nombreCompleto", "Test User");
  
  // Punto 2: Después de guardar datos de usuario
  await recordTestPoint("Después de guardar datos de usuario");
  
  // Simular redirección (sin hacerla realmente)
  console.log("🔄 Simulando redirección...");
  
  // Punto 3: Después de simular redirección
  await recordTestPoint("Después de simular redirección");
  
  // Simular recarga de página (sin hacerla realmente)
  console.log("🔄 Simulando recarga de página...");
  
  // Punto 4: Después de simular recarga
  await recordTestPoint("Después de simular recarga");
  
  console.log("✅ Simulación de login completada");
};

// Función para generar reporte de prueba
const generateTestReport = () => {
  console.log("📋 REPORTE DE PRUEBA DE PERSISTENCIA");
  console.log("=====================================");
  
  testResults.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.pointName}`);
    console.log(`   Timestamp: ${result.timestamp}`);
    console.log(`   Credenciales: ${result.credentialCount}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   localStorage biométrico: ${result.localStorageKeys.join(', ')}`);
    
    if (result.credentialDetails.length > 0) {
      console.log(`   Detalles de credenciales:`);
      result.credentialDetails.forEach(cred => {
        console.log(`     - ID: ${cred.id}`);
        console.log(`     - Usuario: ${cred.userId}`);
        console.log(`     - Creada: ${cred.createdAt}`);
        console.log(`     - Último acceso: ${cred.lastAccessed}`);
      });
    }
  });
  
  // Verificar si hubo pérdida de credenciales
  const initialCount = testResults[0]?.credentialCount || 0;
  const finalCount = testResults[testResults.length - 1]?.credentialCount || 0;
  
  console.log(`\n📊 RESUMEN:`);
  console.log(`   Credenciales iniciales: ${initialCount}`);
  console.log(`   Credenciales finales: ${finalCount}`);
  
  if (finalCount < initialCount) {
    console.error(`   ❌ PÉRDIDA DETECTADA: ${initialCount - finalCount} credenciales perdidas`);
  } else if (finalCount === initialCount) {
    console.log(`   ✅ PERSISTENCIA EXITOSA: Todas las credenciales se mantuvieron`);
  } else {
    console.log(`   ⚠️ CRECIMIENTO DETECTADO: ${finalCount - initialCount} credenciales nuevas`);
  }
  
  return {
    testResults,
    initialCount,
    finalCount,
    success: finalCount >= initialCount
  };
};

// Función para limpiar datos de prueba
const cleanupTestData = () => {
  // Remover datos de prueba del localStorage
  localStorage.removeItem("usuario");
  localStorage.removeItem("rol");
  localStorage.removeItem("usuarioId");
  localStorage.removeItem("nombreCompleto");
  
  testResults = [];
  console.log("🧹 Datos de prueba limpiados");
};

// Función para ejecutar prueba completa
const runFullTest = async () => {
  console.log("🚀 Ejecutando prueba completa de persistencia...");
  
  try {
    // Obtener estado inicial
    initialCredentialCount = await getCredentialCount();
    console.log(`📊 Estado inicial: ${initialCredentialCount} credenciales`);
    
    // Ejecutar simulación
    await simulateLoginProcess();
    
    // Generar reporte
    const report = generateTestReport();
    
    // Limpiar datos de prueba
    cleanupTestData();
    
    console.log("✅ Prueba completa finalizada");
    return report;
    
  } catch (error) {
    console.error("❌ Error durante la prueba:", error);
    return { error: error.message };
  }
};

// Función para verificar estado actual
const checkCurrentState = async () => {
  console.log("🔍 Verificando estado actual...");
  
  const count = await getCredentialCount();
  const details = await getCredentialDetails();
  
  console.log(`📊 Credenciales actuales: ${count}`);
  console.log(`📋 Detalles:`);
  details.forEach(cred => {
    console.log(`   - ID: ${cred.id}`);
    console.log(`   - Usuario: ${cred.userId}`);
    console.log(`   - Creada: ${cred.createdAt}`);
  });
  
  return { count, details };
};

// Exportar funciones para uso manual
if (typeof window !== "undefined") {
  window.biometricPersistenceTest = {
    runFullTest,
    simulateLoginProcess,
    generateTestReport,
    checkCurrentState,
    cleanupTestData,
    recordTestPoint
  };
  
  console.log("🔧 Funciones de prueba disponibles:");
  console.log("  - window.biometricPersistenceTest.runFullTest()");
  console.log("  - window.biometricPersistenceTest.checkCurrentState()");
  console.log("  - window.biometricPersistenceTest.generateTestReport()");
  console.log("  - window.biometricPersistenceTest.cleanupTestData()");
}

// Verificar estado inicial automáticamente
checkCurrentState();
