// Script para detectar cuándo se borran las credenciales biométricas
console.log("🔍 Iniciando monitoreo de borrado de credenciales biométricas...");

// Variables para tracking
let credentialCount = 0;
let deletionEvents = [];
let isMonitoring = false;

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

// Función para monitorear cambios en IndexedDB
const monitorIndexedDBChanges = () => {
  if (isMonitoring) return;
  isMonitoring = true;
  
  console.log("📊 Monitoreando cambios en IndexedDB...");
  
  // Interceptar todas las operaciones de IndexedDB
  const originalOpen = indexedDB.open;
  indexedDB.open = function(name, version) {
    console.log(`🔍 IndexedDB.open llamado: ${name}, versión: ${version}`);
    
    const request = originalOpen.call(this, name, version);
    
    request.onsuccess = function() {
      const db = this.result;
      console.log(`✅ IndexedDB ${name} abierto`);
      
      // Interceptar transacciones
      const originalTransaction = db.transaction;
      db.transaction = function(storeNames, mode) {
        console.log(`🔄 Transacción iniciada: ${storeNames}, modo: ${mode}`);
        
        const transaction = originalTransaction.call(this, storeNames, mode);
        
        // Interceptar operaciones en object stores
        storeNames.forEach(storeName => {
          const store = transaction.objectStore(storeName);
          
          // Interceptar delete
          const originalDelete = store.delete;
          store.delete = function(key) {
            console.log(`🗑️ DELETE operación en ${storeName}:`, key);
            console.trace("Stack trace del DELETE");
            
            const request = originalDelete.call(this, key);
            
            request.onsuccess = function() {
              console.log(`✅ DELETE completado en ${storeName}:`, key);
              recordDeletionEvent(storeName, key, 'delete');
            };
            
            request.onerror = function() {
              console.error(`❌ Error en DELETE ${storeName}:`, this.error);
            };
            
            return request;
          };
          
          // Interceptar clear
          const originalClear = store.clear;
          store.clear = function() {
            console.log(`🗑️ CLEAR operación en ${storeName}`);
            console.trace("Stack trace del CLEAR");
            
            const request = originalClear.call(this);
            
            request.onsuccess = function() {
              console.log(`✅ CLEAR completado en ${storeName}`);
              recordDeletionEvent(storeName, 'ALL', 'clear');
            };
            
            request.onerror = function() {
              console.error(`❌ Error en CLEAR ${storeName}:`, this.error);
            };
            
            return request;
          };
        });
        
        return transaction;
      };
    };
    
    return request;
  };
  
  console.log("✅ Monitoreo de IndexedDB activado");
};

// Función para registrar eventos de borrado
const recordDeletionEvent = (storeName, key, operation) => {
  const event = {
    timestamp: new Date().toISOString(),
    storeName,
    key,
    operation,
    stackTrace: new Error().stack,
    url: window.location.href,
    userAgent: navigator.userAgent
  };
  
  deletionEvents.push(event);
  console.log("📝 Evento de borrado registrado:", event);
  
  // Verificar si las credenciales fueron afectadas
  if (storeName === "credentials") {
    console.error("🚨 ¡ALERTA! Se detectó borrado de credenciales biométricas!");
    console.error("Detalles del evento:", event);
    
    // Intentar recuperar el conteo
    setTimeout(async () => {
      const newCount = await getCredentialCount();
      console.log(`📊 Conteo después del borrado: ${newCount}`);
    }, 100);
  }
};

// Función para monitorear localStorage
const monitorLocalStorage = () => {
  console.log("📊 Monitoreando cambios en localStorage...");
  
  // Interceptar removeItem
  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function(key) {
    console.log(`🗑️ localStorage.removeItem: ${key}`);
    console.trace("Stack trace del localStorage.removeItem");
    
    if (key.includes('biometric') || key.includes('device') || key.includes('recorded')) {
      console.warn(`⚠️ Intento de borrar clave relacionada con biométricos: ${key}`);
    }
    
    return originalRemoveItem.call(this, key);
  };
  
  // Interceptar clear
  const originalClear = localStorage.clear;
  localStorage.clear = function() {
    console.log("🗑️ localStorage.clear llamado");
    console.trace("Stack trace del localStorage.clear");
    
    return originalClear.call(this);
  };
  
  console.log("✅ Monitoreo de localStorage activado");
};

// Función para verificar credenciales periódicamente
const periodicCheck = async () => {
  const currentCount = await getCredentialCount();
  
  if (currentCount !== credentialCount) {
    console.log(`📊 Cambio detectado en credenciales: ${credentialCount} → ${currentCount}`);
    
    if (currentCount < credentialCount) {
      console.error("🚨 ¡ALERTA! Se perdieron credenciales biométricas!");
      console.error(`Antes: ${credentialCount}, Después: ${currentCount}`);
      
      // Buscar el evento de borrado más reciente
      const recentDeletions = deletionEvents.filter(event => 
        event.storeName === "credentials" && 
        new Date(event.timestamp) > new Date(Date.now() - 5000)
      );
      
      if (recentDeletions.length > 0) {
        console.error("Eventos de borrado recientes:", recentDeletions);
      }
    }
    
    credentialCount = currentCount;
  }
};

// Función para iniciar monitoreo completo
const startMonitoring = async () => {
  console.log("🚀 Iniciando monitoreo completo...");
  
  // Obtener conteo inicial
  credentialCount = await getCredentialCount();
  console.log(`📊 Conteo inicial de credenciales: ${credentialCount}`);
  
  // Activar monitoreos
  monitorIndexedDBChanges();
  monitorLocalStorage();
  
  // Verificación periódica cada 1 segundo
  setInterval(periodicCheck, 1000);
  
  console.log("✅ Monitoreo completo activado");
};

// Función para obtener reporte
const getReport = () => {
  console.log("📋 REPORTE DE MONITOREO");
  console.log("========================");
  console.log(`📊 Credenciales actuales: ${credentialCount}`);
  console.log(`📝 Eventos de borrado registrados: ${deletionEvents.length}`);
  
  if (deletionEvents.length > 0) {
    console.log("📋 Últimos 5 eventos de borrado:");
    deletionEvents.slice(-5).forEach((event, index) => {
      console.log(`${index + 1}. ${event.timestamp} - ${event.operation} en ${event.storeName}`);
      console.log(`   Key: ${event.key}`);
      console.log(`   URL: ${event.url}`);
    });
  }
  
  return {
    currentCount: credentialCount,
    deletionEvents: deletionEvents,
    isMonitoring: isMonitoring
  };
};

// Función para limpiar eventos
const clearEvents = () => {
  deletionEvents = [];
  console.log("🧹 Eventos de borrado limpiados");
};

// Exportar funciones para uso manual
if (typeof window !== "undefined") {
  window.biometricDeletionMonitor = {
    startMonitoring,
    getReport,
    clearEvents,
    getCredentialCount
  };
  
  console.log("🔧 Funciones de monitoreo disponibles:");
  console.log("  - window.biometricDeletionMonitor.startMonitoring()");
  console.log("  - window.biometricDeletionMonitor.getReport()");
  console.log("  - window.biometricDeletionMonitor.clearEvents()");
  console.log("  - window.biometricDeletionMonitor.getCredentialCount()");
}

// Iniciar automáticamente
startMonitoring();
