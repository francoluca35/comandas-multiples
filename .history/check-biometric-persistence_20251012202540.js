// Script para verificar la persistencia de credenciales biométricas
console.log("🔍 Verificando persistencia de credenciales biométricas...");

// Función para obtener credenciales de IndexedDB
const getCredentialsFromDB = async (userId) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("BiometricAuthDB", 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["credentials"], "readonly");
      const store = transaction.objectStore("credentials");
      const index = store.index("userId");
      
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    };
  });.
  
};

// Función para verificar credenciales antes y después de login
const checkCredentialsPersistence = async (userId) => {
  console.log(`🔍 Verificando credenciales para usuario: ${userId}`);
  
  try {
    // Verificar antes del login
    console.log("📊 Verificando credenciales ANTES del login...");
    const credentialsBefore = await getCredentialsFromDB(userId);
    console.log("🔑 Credenciales antes:", credentialsBefore);
    console.log("📊 Cantidad antes:", credentialsBefore.length);
    
    // Simular un delay para simular el proceso de login
    console.log("⏳ Simulando proceso de login...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar después del login
    console.log("📊 Verificando credenciales DESPUÉS del login...");
    const credentialsAfter = await getCredentialsFromDB(userId);
    console.log("🔑 Credenciales después:", credentialsAfter);
    console.log("📊 Cantidad después:", credentialsAfter.length);
    
    // Comparar resultados
    if (credentialsBefore.length === credentialsAfter.length) {
      console.log("✅ Las credenciales se mantuvieron intactas");
    } else {
      console.log("❌ Las credenciales cambiaron o se perdieron");
      console.log(`📊 Diferencia: ${credentialsBefore.length} -> ${credentialsAfter.length}`);
    }
    
    return {
      before: credentialsBefore,
      after: credentialsAfter,
      persisted: credentialsBefore.length === credentialsAfter.length
    };
  } catch (error) {
    console.error("❌ Error verificando persistencia:", error);
    return { error: error.message };
  }
};

// Función para verificar localStorage antes y después
const checkLocalStoragePersistence = () => {
  console.log("💾 Verificando localStorage...");
  
  const keys = [
    "restauranteId",
    "usuario",
    "rol",
    "usuarioId",
    "nombreCompleto"
  ];
  
  const before = {};
  const after = {};
  
  // Capturar estado antes
  keys.forEach(key => {
    before[key] = localStorage.getItem(key);
  });
  
  console.log("📊 localStorage ANTES:", before);
  
  // Simular delay
  setTimeout(() => {
    // Capturar estado después
    keys.forEach(key => {
      after[key] = localStorage.getItem(key);
    });
    
    console.log("📊 localStorage DESPUÉS:", after);
    
    // Comparar
    const changed = keys.filter(key => before[key] !== after[key]);
    if (changed.length > 0) {
      console.log("⚠️ localStorage cambió en las siguientes claves:", changed);
      changed.forEach(key => {
        console.log(`  ${key}: "${before[key]}" -> "${after[key]}"`);
      });
    } else {
      console.log("✅ localStorage se mantuvo estable");
    }
  }, 2000);
};

// Función para monitorear cambios en IndexedDB
const monitorIndexedDBChanges = () => {
  console.log("👀 Monitoreando cambios en IndexedDB...");
  
  // Crear un observer para detectar cambios
  let lastCheck = Date.now();
  
  const checkForChanges = async () => {
    try {
      const request = indexedDB.open("BiometricAuthDB", 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["credentials"], "readonly");
        const store = transaction.objectStore("credentials");
        const request = store.getAll();
        
        request.onsuccess = () => {
          const credentials = request.result;
          const now = Date.now();
          
          console.log(`⏰ [${new Date(now).toLocaleTimeString()}] Credenciales en IndexedDB:`, credentials.length);
          
          if (credentials.length === 0 && now - lastCheck > 1000) {
            console.log("⚠️ ¡ALERTA! Las credenciales se borraron");
          }
          
          lastCheck = now;
        };
      };
    } catch (error) {
      console.error("❌ Error monitoreando IndexedDB:", error);
    }
  };
  
  // Verificar cada segundo
  const interval = setInterval(checkForChanges, 1000);
  
  // Retornar función para detener el monitoreo
  return () => clearInterval(interval);
};

// Exportar funciones para uso manual
if (typeof window !== "undefined") {
  window.checkBiometricPersistence = {
    checkCredentialsPersistence,
    checkLocalStoragePersistence,
    monitorIndexedDBChanges
  };
  
  console.log("🔧 Funciones disponibles:");
  console.log("  - window.checkBiometricPersistence.checkCredentialsPersistence(userId)");
  console.log("  - window.checkBiometricPersistence.checkLocalStoragePersistence()");
  console.log("  - window.checkBiometricPersistence.monitorIndexedDBChanges()");
}

// Ejecutar verificación inicial
checkLocalStoragePersistence();
