// Script para debuggear el almacenamiento de credenciales biométricas
console.log("🔍 Debug: Verificando almacenamiento biométrico...");

// Verificar IndexedDB
const checkIndexedDB = async () => {
  try {
    console.log("📊 Verificando IndexedDB...");
    
    const request = indexedDB.open("BiometricAuthDB", 1);
    
    request.onerror = () => {
      console.error("❌ Error abriendo IndexedDB:", request.error);
    };
    
    request.onsuccess = () => {
      const db = request.result;
      console.log("✅ IndexedDB abierto correctamente");
      
      if (db.objectStoreNames.contains("credentials")) {
        console.log("✅ Store 'credentials' existe");
        
        const transaction = db.transaction(["credentials"], "readonly");
        const store = transaction.objectStore("credentials");
        const request = store.getAll();
        
        request.onsuccess = () => {
          const credentials = request.result;
          console.log("📋 Credenciales almacenadas:", credentials);
          console.log("📊 Total de credenciales:", credentials.length);
          
          if (credentials.length > 0) {
            credentials.forEach((cred, index) => {
              console.log(`🔑 Credencial ${index + 1}:`, {
                id: cred.id,
                userId: cred.userId,
                createdAt: cred.createdAt,
                hasCredentialData: !!cred.credentialData
              });
            });
          } else {
            console.log("⚠️ No hay credenciales almacenadas");
          }
        };
        
        request.onerror = () => {
          console.error("❌ Error obteniendo credenciales:", request.error);
        };
      } else {
        console.log("⚠️ Store 'credentials' no existe");
      }
    };
    
    request.onupgradeneeded = (event) => {
      console.log("🔄 IndexedDB necesita actualización");
      const db = event.target.result;
      if (!db.objectStoreNames.contains("credentials")) {
        const store = db.createObjectStore("credentials", { keyPath: "id" });
        store.createIndex("userId", "userId", { unique: false });
        console.log("✅ Store 'credentials' creado");
      }
    };
  } catch (error) {
    console.error("❌ Error verificando IndexedDB:", error);
  }
};

// Verificar localStorage
const checkLocalStorage = () => {
  console.log("💾 Verificando localStorage...");
  
  const keys = [
    "restauranteId",
    "usuario",
    "rol",
    "usuarioId",
    "nombreCompleto",
    "userImage",
    "imagen"
  ];
  
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`${key}: ${value || "NO ENCONTRADO"}`);
  });
};

// Verificar soporte de WebAuthn
const checkWebAuthnSupport = () => {
  console.log("🔐 Verificando soporte de WebAuthn...");
  
  if (window.PublicKeyCredential) {
    console.log("✅ PublicKeyCredential está disponible");
    
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then(available => {
        console.log(`🔐 Autenticador biométrico disponible: ${available}`);
      })
      .catch(error => {
        console.error("❌ Error verificando autenticador:", error);
      });
  } else {
    console.log("❌ PublicKeyCredential no está disponible");
  }
};

// Ejecutar todas las verificaciones
const runAllChecks = async () => {
  console.log("🚀 Iniciando verificaciones de almacenamiento biométrico...");
  
  checkLocalStorage();
  checkWebAuthnSupport();
  await checkIndexedDB();
  
  console.log("✅ Verificaciones completadas");
};

// Ejecutar inmediatamente
runAllChecks();

// También exportar para uso manual
if (typeof window !== "undefined") {
  window.debugBiometricStorage = {
    checkIndexedDB,
    checkLocalStorage,
    checkWebAuthnSupport,
    runAllChecks
  };
}
