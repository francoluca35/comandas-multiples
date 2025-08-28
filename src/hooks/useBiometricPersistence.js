"use client";
import { useState, useEffect, useCallback } from "react";

// Función para inicializar IndexedDB con manejo de errores mejorado
const initDB = () => {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open("BiometricAuthDB", 1);
      
      request.onerror = () => {
        console.error("❌ Error abriendo IndexedDB:", request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        console.log("✅ IndexedDB abierto correctamente");
        resolve(request.result);
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
      console.error("❌ Error inicializando IndexedDB:", error);
      reject(error);
    }
  });
};

// Función para guardar credenciales con verificación
const saveCredentialToDB = async (userId, credentialData) => {
  try {
    console.log("💾 Guardando credencial biométrica para usuario:", userId);
    const db = await initDB();
    const transaction = db.transaction(["credentials"], "readwrite");
    const store = transaction.objectStore("credentials");
    
    const credentialRecord = {
      id: credentialData.id,
      userId: userId,
      credentialData: credentialData,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
    };
    
    await store.put(credentialRecord);
    console.log("✅ Credencial guardada exitosamente");
    return credentialRecord;
  } catch (error) {
    console.error("❌ Error guardando credencial:", error);
    throw error;
  }
};

// Función para obtener credenciales con verificación
const getCredentialsFromDB = async (userId) => {
  try {
    console.log("🔍 Obteniendo credenciales para usuario:", userId);
    const db = await initDB();
    const transaction = db.transaction(["credentials"], "readonly");
    const store = transaction.objectStore("credentials");
    const index = store.index("userId");
    
    const request = index.getAll(userId);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const credentials = request.result;
        console.log(`📊 Encontradas ${credentials.length} credenciales para usuario ${userId}`);
        resolve(credentials);
      };
      request.onerror = () => {
        console.error("❌ Error obteniendo credenciales:", request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("❌ Error obteniendo credenciales:", error);
    return [];
  }
};

// Función para verificar la integridad de las credenciales
const verifyCredentialsIntegrity = async (userId) => {
  try {
    const credentials = await getCredentialsFromDB(userId);
    
    if (credentials.length === 0) {
      console.log("⚠️ No se encontraron credenciales para el usuario:", userId);
      return { valid: false, reason: "no_credentials" };
    }
    
    // Verificar que cada credencial tenga los datos necesarios
    const validCredentials = credentials.filter(cred => {
      const isValid = cred.credentialData && 
                     cred.credentialData.id && 
                     cred.credentialData.rawId &&
                     cred.credentialData.type;
      
      if (!isValid) {
        console.warn("⚠️ Credencial corrupta encontrada:", cred.id);
      }
      
      return isValid;
    });
    
    if (validCredentials.length !== credentials.length) {
      console.warn(`⚠️ ${credentials.length - validCredentials.length} credenciales corruptas encontradas`);
    }
    
    return {
      valid: validCredentials.length > 0,
      total: credentials.length,
      valid: validCredentials.length,
      corrupted: credentials.length - validCredentials.length
    };
  } catch (error) {
    console.error("❌ Error verificando integridad:", error);
    return { valid: false, reason: "error", error: error.message };
  }
};

// Hook principal para manejar la persistencia de credenciales biométricas
export const useBiometricPersistence = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Inicializar IndexedDB al montar el componente
  useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDB();
        setIsInitialized(true);
        console.log("✅ IndexedDB inicializado correctamente");
      } catch (error) {
        console.error("❌ Error inicializando IndexedDB:", error);
        setError(error.message);
      }
    };

    initializeDB();
  }, []);

  // Función para guardar credenciales
  const saveCredential = useCallback(async (userId, credentialData) => {
    if (!isInitialized) {
      throw new Error("IndexedDB no está inicializado");
    }
    
    try {
      const result = await saveCredentialToDB(userId, credentialData);
      
      // Verificar que se guardó correctamente
      const verification = await verifyCredentialsIntegrity(userId);
      if (!verification.valid) {
        throw new Error("La credencial no se guardó correctamente");
      }
      
      return result;
    } catch (error) {
      console.error("❌ Error guardando credencial:", error);
      setError(error.message);
      throw error;
    }
  }, [isInitialized]);

  // Función para obtener credenciales
  const getCredentials = useCallback(async (userId) => {
    if (!isInitialized) {
      console.warn("⚠️ IndexedDB no está inicializado, intentando inicializar...");
      try {
        await initDB();
        setIsInitialized(true);
      } catch (error) {
        console.error("❌ No se pudo inicializar IndexedDB:", error);
        return [];
      }
    }
    
    try {
      const credentials = await getCredentialsFromDB(userId);
      
      // Actualizar timestamp de último acceso
      if (credentials.length > 0) {
        const db = await initDB();
        const transaction = db.transaction(["credentials"], "readwrite");
        const store = transaction.objectStore("credentials");
        
        for (const cred of credentials) {
          cred.lastAccessed = new Date().toISOString();
          await store.put(cred);
        }
      }
      
      return credentials;
    } catch (error) {
      console.error("❌ Error obteniendo credenciales:", error);
      setError(error.message);
      return [];
    }
  }, [isInitialized]);

  // Función para verificar integridad
  const verifyIntegrity = useCallback(async (userId) => {
    if (!isInitialized) {
      return { valid: false, reason: "not_initialized" };
    }
    
    try {
      return await verifyCredentialsIntegrity(userId);
    } catch (error) {
      console.error("❌ Error verificando integridad:", error);
      setError(error.message);
      return { valid: false, reason: "error", error: error.message };
    }
  }, [isInitialized]);

  // Función para eliminar credenciales
  const deleteCredential = useCallback(async (credentialId) => {
    if (!isInitialized) {
      throw new Error("IndexedDB no está inicializado");
    }
    
    try {
      const db = await initDB();
      const transaction = db.transaction(["credentials"], "readwrite");
      const store = transaction.objectStore("credentials");
      
      await store.delete(credentialId);
      console.log("✅ Credencial eliminada:", credentialId);
      return { success: true };
    } catch (error) {
      console.error("❌ Error eliminando credencial:", error);
      setError(error.message);
      throw error;
    }
  }, [isInitialized]);

  // Función para limpiar credenciales de un usuario
  const clearUserCredentials = useCallback(async (userId) => {
    if (!isInitialized) {
      throw new Error("IndexedDB no está inicializado");
    }
    
    try {
      const credentials = await getCredentialsFromDB(userId);
      const db = await initDB();
      const transaction = db.transaction(["credentials"], "readwrite");
      const store = transaction.objectStore("credentials");
      
      for (const cred of credentials) {
        await store.delete(cred.id);
      }
      
      console.log(`✅ ${credentials.length} credenciales eliminadas para usuario:`, userId);
      return { success: true, deleted: credentials.length };
    } catch (error) {
      console.error("❌ Error limpiando credenciales:", error);
      setError(error.message);
      throw error;
    }
  }, [isInitialized]);

  return {
    isInitialized,
    error,
    saveCredential,
    getCredentials,
    verifyIntegrity,
    deleteCredential,
    clearUserCredentials,
  };
};
