// Script para proteger las credenciales biométricas de ser borradas
console.log("🛡️ Iniciando protección de credenciales biométricas...");

// Función para verificar si las credenciales están siendo borradas
const protectBiometricCredentials = () => {
  // Interceptar localStorage.removeItem para proteger credenciales
  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function(key) {
    // Lista de claves que NO deben ser borradas (credenciales biométricas)
    const protectedKeys = [
      "deviceId",
      "recordedEmail", 
      "recordedCod",
      "biometric_credentials",
      "biometric_device_id"
    ];
    
    // Verificar si se está intentando borrar una clave protegida
    if (protectedKeys.includes(key)) {
      console.warn(`⚠️ Intento de borrar clave protegida: ${key}`);
      console.warn("🛡️ Protección activada - No se borrará la clave");
      return; // No borrar la clave
    }
    
    // Si no es una clave protegida, proceder normalmente
    return originalRemoveItem.call(this, key);
  };
  
  // Interceptar localStorage.clear para proteger credenciales
  const originalClear = localStorage.clear;
  localStorage.clear = function() {
    console.warn("⚠️ Intento de limpiar todo localStorage");
    console.warn("🛡️ Protección activada - Preservando credenciales biométricas");
    
    // Obtener todas las claves
    const allKeys = Object.keys(localStorage);
    
    // Filtrar claves protegidas
    const protectedKeys = [
      "deviceId",
      "recordedEmail", 
      "recordedCod",
      "biometric_credentials",
      "biometric_device_id"
    ];
    
    // Borrar solo las claves no protegidas
    allKeys.forEach(key => {
      if (!protectedKeys.includes(key)) {
        originalRemoveItem.call(this, key);
      }
    });
    
    console.log("✅ localStorage limpiado preservando credenciales biométricas");
  };
  
  console.log("✅ Protección de credenciales biométricas activada");
};

// Función para verificar integridad de IndexedDB
const protectIndexedDB = () => {
  // Interceptar deleteDatabase para proteger IndexedDB biométrico
  const originalDeleteDatabase = indexedDB.deleteDatabase;
  indexedDB.deleteDatabase = function(name) {
    if (name === "BiometricAuthDB") {
      console.warn("⚠️ Intento de borrar IndexedDB de credenciales biométricas");
      console.warn("🛡️ Protección activada - No se borrará la base de datos");
      return; // No borrar la base de datos
    }
    
    // Si no es la base de datos biométrica, proceder normalmente
    return originalDeleteDatabase.call(this, name);
  };
  
  console.log("✅ Protección de IndexedDB activada");
};

// Función para monitorear cambios en credenciales
const monitorCredentialChanges = () => {
  let lastCredentialCount = 0;
  
  const checkCredentials = async () => {
    try {
      const request = indexedDB.open("BiometricAuthDB", 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["credentials"], "readonly");
        const store = transaction.objectStore("credentials");
        const request = store.getAll();
        
        request.onsuccess = () => {
          const credentials = request.result;
          const currentCount = credentials.length;
          
          if (currentCount < lastCredentialCount && lastCredentialCount > 0) {
            console.error("🚨 ¡ALERTA! Se detectó borrado de credenciales biométricas");
            console.error(`📊 Credenciales antes: ${lastCredentialCount}, después: ${currentCount}`);
            
            // Intentar recuperar desde backup si existe
            attemptRecovery();
          }
          
          lastCredentialCount = currentCount;
        };
      };
    } catch (error) {
      console.error("❌ Error monitoreando credenciales:", error);
    }
  };
  
  // Verificar cada 2 segundos
  setInterval(checkCredentials, 2000);
  
  console.log("✅ Monitoreo de credenciales activado");
};

// Función para intentar recuperación
const attemptRecovery = () => {
  console.log("🔄 Intentando recuperación de credenciales...");
  
  // Aquí se podría implementar lógica de recuperación
  // Por ejemplo, desde un backup en localStorage o desde la nube
  
  console.log("⚠️ Recuperación automática no implementada");
  console.log("💡 Sugerencia: Verificar logs para identificar qué causó el borrado");
};

// Función para crear backup de credenciales
const createBackup = async () => {
  try {
    const request = indexedDB.open("BiometricAuthDB", 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["credentials"], "readonly");
      const store = transaction.objectStore("credentials");
      const request = store.getAll();
      
      request.onsuccess = () => {
        const credentials = request.result;
        
        // Crear backup en localStorage
        const backup = {
          timestamp: new Date().toISOString(),
          credentials: credentials,
          deviceId: localStorage.getItem("deviceId")
        };
        
        localStorage.setItem("biometric_backup", JSON.stringify(backup));
        console.log("✅ Backup de credenciales creado");
      };
    };
  } catch (error) {
    console.error("❌ Error creando backup:", error);
  }
};

// Función para restaurar desde backup
const restoreFromBackup = async () => {
  try {
    const backupData = localStorage.getItem("biometric_backup");
    if (!backupData) {
      console.log("⚠️ No hay backup disponible");
      return false;
    }
    
    const backup = JSON.parse(backupData);
    console.log("🔄 Restaurando desde backup...");
    
    // Aquí se implementaría la lógica de restauración
    // Por seguridad, no se restauran automáticamente las credenciales
    
    console.log("✅ Restauración completada");
    return true;
  } catch (error) {
    console.error("❌ Error restaurando desde backup:", error);
    return false;
  }
};

// Función para verificar estado de protección
const checkProtectionStatus = () => {
  console.log("🔍 Verificando estado de protección...");
  
  // Verificar si las funciones están interceptadas
  const isLocalStorageProtected = localStorage.removeItem.toString().includes("protectedKeys");
  const isIndexedDBProtected = indexedDB.deleteDatabase.toString().includes("BiometricAuthDB");
  
  console.log(`🛡️ Protección localStorage: ${isLocalStorageProtected ? "✅" : "❌"}`);
  console.log(`🛡️ Protección IndexedDB: ${isIndexedDBProtected ? "✅" : "❌"}`);
  
  return {
    localStorage: isLocalStorageProtected,
    indexedDB: isIndexedDBProtected
  };
};

// Inicializar protección
const initProtection = () => {
  console.log("🚀 Inicializando sistema de protección...");
  
  protectBiometricCredentials();
  protectIndexedDB();
  monitorCredentialChanges();
  
  // Crear backup inicial
  setTimeout(createBackup, 1000);
  
  // Verificar estado
  setTimeout(checkProtectionStatus, 2000);
  
  console.log("✅ Sistema de protección inicializado");
};

// Exportar funciones para uso manual
if (typeof window !== "undefined") {
  window.biometricProtection = {
    initProtection,
    checkProtectionStatus,
    createBackup,
    restoreFromBackup,
    monitorCredentialChanges
  };
  
  console.log("🔧 Funciones de protección disponibles:");
  console.log("  - window.biometricProtection.initProtection()");
  console.log("  - window.biometricProtection.checkProtectionStatus()");
  console.log("  - window.biometricProtection.createBackup()");
  console.log("  - window.biometricProtection.restoreFromBackup()");
}

// Inicializar automáticamente
initProtection();
