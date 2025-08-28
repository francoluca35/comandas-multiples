"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "../../lib/firebase";
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { useBiometricPersistence } from "./useBiometricPersistence";

export const useBiometricSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const { saveCredential, getCredentials, deleteCredential } = useBiometricPersistence();

  // Sincronizar credenciales locales con Firestore
  const syncToCloud = useCallback(async (userId, credentials) => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      
      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) {
        throw new Error("No se encontró el ID del restaurante");
      }

      console.log("☁️ Sincronizando credenciales a Firestore...");
      
      // Guardar cada credencial en Firestore
      for (const credential of credentials) {
        const credentialRef = doc(db, `restaurantes/${restauranteId}/users/${userId}/biometric-credentials`, credential.id);
        
        await setDoc(credentialRef, {
          id: credential.id,
          userId: userId,
          name: credential.name || `Huella ${credential.id}`,
          createdAt: credential.createdAt,
          lastAccessed: credential.lastAccessed,
          deviceId: getDeviceId(), // Identificar el dispositivo
          syncedAt: new Date().toISOString(),
        });
        
        console.log(`✅ Credencial ${credential.id} sincronizada`);
      }
      
      console.log("✅ Sincronización completada");
      return true;
    } catch (error) {
      console.error("❌ Error sincronizando credenciales:", error);
      setSyncError(error.message);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Descargar credenciales desde Firestore
  const syncFromCloud = useCallback(async (userId) => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      
      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) {
        throw new Error("No se encontró el ID del restaurante");
      }

      console.log("📥 Descargando credenciales desde Firestore...");
      
      const credentialsRef = collection(db, `restaurantes/${restauranteId}/users/${userId}/biometric-credentials`);
      const snapshot = await getDocs(credentialsRef);
      
      const cloudCredentials = [];
      snapshot.forEach(doc => {
        cloudCredentials.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`📊 Encontradas ${cloudCredentials.length} credenciales en la nube`);
      
      // Obtener credenciales locales
      const localCredentials = await getCredentials(userId);
      console.log(`📊 Encontradas ${localCredentials.length} credenciales locales`);
      
      // Combinar credenciales (evitar duplicados)
      const allCredentials = [...localCredentials];
      
      for (const cloudCred of cloudCredentials) {
        const exists = localCredentials.find(local => local.id === cloudCred.id);
        if (!exists) {
          // Esta credencial no existe localmente, necesitamos descargarla
          console.log(`📥 Descargando credencial ${cloudCred.id} desde la nube`);
          
          // Nota: Los datos reales de la credencial no están en Firestore por seguridad
          // Solo tenemos metadatos. El usuario deberá reconfigurar esta huella
          console.log(`⚠️ Credencial ${cloudCred.id} requiere reconfiguración`);
        }
      }
      
      return allCredentials;
    } catch (error) {
      console.error("❌ Error descargando credenciales:", error);
      setSyncError(error.message);
      return [];
    } finally {
      setIsSyncing(false);
    }
  }, [getCredentials]);

  // Obtener ID único del dispositivo
  const getDeviceId = useCallback(() => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  }, []);

  // Verificar si hay credenciales en otros dispositivos
  const checkOtherDevices = useCallback(async (userId) => {
    try {
      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) return [];

      const credentialsRef = collection(db, `restaurantes/${restauranteId}/users/${userId}/biometric-credentials`);
      const snapshot = await getDocs(credentialsRef);
      
      const currentDeviceId = getDeviceId();
      const otherDevices = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.deviceId && data.deviceId !== currentDeviceId) {
          otherDevices.push({
            deviceId: data.deviceId,
            name: data.name,
            createdAt: data.createdAt,
            lastAccessed: data.lastAccessed
          });
        }
      });
      
      return otherDevices;
    } catch (error) {
      console.error("❌ Error verificando otros dispositivos:", error);
      return [];
    }
  }, [getDeviceId]);

  // Eliminar credencial de la nube
  const deleteFromCloud = useCallback(async (userId, credentialId) => {
    try {
      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) {
        throw new Error("No se encontró el ID del restaurante");
      }

      const credentialRef = doc(db, `restaurantes/${restauranteId}/users/${userId}/biometric-credentials`, credentialId);
      await deleteDoc(credentialRef);
      
      console.log(`✅ Credencial ${credentialId} eliminada de la nube`);
      return true;
    } catch (error) {
      console.error("❌ Error eliminando credencial de la nube:", error);
      return false;
    }
  }, []);

  // Sincronización automática cuando se registra una nueva credencial
  const autoSync = useCallback(async (userId, newCredential) => {
    try {
      console.log("🔄 Sincronización automática iniciada...");
      
      // Obtener todas las credenciales locales
      const localCredentials = await getCredentials(userId);
      
      // Sincronizar con la nube
      await syncToCloud(userId, localCredentials);
      
      console.log("✅ Sincronización automática completada");
    } catch (error) {
      console.error("❌ Error en sincronización automática:", error);
    }
  }, [getCredentials, syncToCloud]);

  return {
    isSyncing,
    syncError,
    syncToCloud,
    syncFromCloud,
    checkOtherDevices,
    deleteFromCloud,
    autoSync,
    getDeviceId,
  };
};
