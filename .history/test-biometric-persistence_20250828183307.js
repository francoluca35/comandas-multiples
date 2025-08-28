// Script de prueba para verificar la persistencia de credenciales biométricas
console.log("🧪 Iniciando prueba de persistencia de credenciales biométricas...");

// Función para simular el proceso de login y verificar persistencia
const testBiometricPersistence = async () => {
  try {
    console.log("📊 Paso 1: Verificando estado inicial...");
    
    // Verificar IndexedDB
    const request = indexedDB.open("BiometricAuthDB", 1);
    request.onsuccess = async () => {
      const db = request.result;
      const transaction = db.transaction(["credentials"], "readonly");
      const store = transaction.objectStore("credentials");
      const request = store.getAll();
      
      request.onsuccess = () => {
        const credentials = request.result;
        console.log("📋 Credenciales iniciales:", credentials.length);
        
        if (credentials.length > 0) {
          console.log("✅ Hay credenciales almacenadas");
          
          // Simular proceso de login
          simulateLoginProcess(credentials);
        } else {
          console.log("⚠️ No hay credenciales almacenadas para probar");
        }
      };
    };
  } catch (error) {
    console.error("❌ Error en prueba:", error);
  }
};

// Simular el proceso de login
const simulateLoginProcess = async (initialCredentials) => {
  console.log("🔄 Paso 2: Simulando proceso de login...");
  
  // Capturar estado antes
  const beforeState = {
    credentials: initialCredentials.length,
    localStorage: {
      restauranteId: localStorage.getItem("restauranteId"),
      usuario: localStorage.getItem("usuario"),
      usuarioId: localStorage.getItem("usuarioId"),
    }
  };
  
  console.log("📊 Estado ANTES del login:", beforeState);
  
  // Simular cambios en localStorage (como ocurre en el login)
  const originalRestauranteId = localStorage.getItem("restauranteId");
  const originalUsuario = localStorage.getItem("usuario");
  const originalUsuarioId = localStorage.getItem("usuarioId");
  
  // Simular datos de login
  localStorage.setItem("restauranteId", "test_restaurant");
  localStorage.setItem("usuario", "test_user");
  localStorage.setItem("usuarioId", "test_user_id");
  
  console.log("⏳ Simulando login...");
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Verificar estado después
  const afterState = await checkCurrentState();
  
  console.log("📊 Estado DESPUÉS del login:", afterState);
  
  // Restaurar estado original
  if (originalRestauranteId) {
    localStorage.setItem("restauranteId", originalRestauranteId);
  } else {
    localStorage.removeItem("restauranteId");
  }
  
  if (originalUsuario) {
    localStorage.setItem("usuario", originalUsuario);
  } else {
    localStorage.removeItem("usuario");
  }
  
  if (originalUsuarioId) {
    localStorage.setItem("usuarioId", originalUsuarioId);
  } else {
    localStorage.removeItem("usuarioId");
  }
  
  // Analizar resultados
  analyzeResults(beforeState, afterState);
};

// Verificar estado actual
const checkCurrentState = async () => {
  return new Promise((resolve) => {
    const request = indexedDB.open("BiometricAuthDB", 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["credentials"], "readonly");
      const store = transaction.objectStore("credentials");
      const request = store.getAll();
      
      request.onsuccess = () => {
        const credentials = request.result;
        resolve({
          credentials: credentials.length,
          localStorage: {
            restauranteId: localStorage.getItem("restauranteId"),
            usuario: localStorage.getItem("usuario"),
            usuarioId: localStorage.getItem("usuarioId"),
          }
        });
      };
    };
  });
};

// Analizar resultados
const analyzeResults = (before, after) => {
  console.log("📊 Paso 3: Analizando resultados...");
  
  const credentialPersisted = before.credentials === after.credentials;
  const localStorageChanged = JSON.stringify(before.localStorage) !== JSON.stringify(after.localStorage);
  
  console.log("🔍 Resultados:");
  console.log(`  - Credenciales persistieron: ${credentialPersisted ? "✅" : "❌"}`);
  console.log(`  - localStorage cambió: ${localStorageChanged ? "✅" : "❌"}`);
  
  if (credentialPersisted) {
    console.log("🎉 ¡ÉXITO! Las credenciales biométricas se mantuvieron intactas");
  } else {
    console.log("❌ ¡PROBLEMA! Las credenciales se perdieron durante el proceso");
  }
  
  if (localStorageChanged) {
    console.log("ℹ️ localStorage cambió como se esperaba durante el login");
  }
  
  // Recomendaciones
  if (!credentialPersisted) {
    console.log("💡 Recomendaciones:");
    console.log("  1. Verificar que no se esté limpiando IndexedDB");
    console.log("  2. Revisar el AppProvider para asegurar que no borre datos innecesariamente");
    console.log("  3. Verificar que el hook useBiometricPersistence esté funcionando correctamente");
  }
};

// Función para limpiar datos de prueba
const cleanupTestData = () => {
  console.log("🧹 Limpiando datos de prueba...");
  
  // Limpiar localStorage de prueba
  localStorage.removeItem("test_restaurant");
  localStorage.removeItem("test_user");
  localStorage.removeItem("test_user_id");
  
  console.log("✅ Datos de prueba limpiados");
};

// Exportar funciones para uso manual
if (typeof window !== "undefined") {
  window.testBiometricPersistence = {
    testBiometricPersistence,
    cleanupTestData,
    checkCurrentState
  };
  
  console.log("🔧 Funciones de prueba disponibles:");
  console.log("  - window.testBiometricPersistence.testBiometricPersistence()");
  console.log("  - window.testBiometricPersistence.cleanupTestData()");
  console.log("  - window.testBiometricPersistence.checkCurrentState()");
}

// Ejecutar prueba automáticamente
testBiometricPersistence();
