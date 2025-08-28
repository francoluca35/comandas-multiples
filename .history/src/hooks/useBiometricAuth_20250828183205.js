"use client";
import { useState, useEffect, useCallback } from "react";
import { useBiometricPersistence } from "./useBiometricPersistence";

export const useBiometricAuth = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Usar el hook de persistencia
  const {
    isInitialized,
    saveCredential,
    getCredentials,
    verifyIntegrity,
    deleteCredential,
  } = useBiometricPersistence();

  // Verificar si la autenticación biométrica está soportada
  useEffect(() => {
    const checkBiometricSupport = async () => {
      try {
        // Verificar si la Web Authentication API está disponible
        if (!window.PublicKeyCredential) {
          setIsSupported(false);
          setIsAvailable(false);
          return;
        }

        // Verificar si la autenticación biométrica está disponible
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsSupported(true);
        setIsAvailable(available);
      } catch (error) {
        console.error("Error verificando soporte biométrico:", error);
        setIsSupported(false);
        setIsAvailable(false);
      }
    };

    checkBiometricSupport();
  }, []);

  // Registrar credenciales biométricas
  const registerBiometric = useCallback(async (userId, username) => {
    setLoading(true);
    setError(null);

    try {
      if (!isAvailable) {
        throw new Error("La autenticación biométrica no está disponible en este dispositivo");
      }

      // Generar challenge aleatorio
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Crear opciones de registro
      const publicKeyOptions = {
        challenge: challenge,
        rp: {
          name: "Sistema de Comandas",
          id: window.location.hostname,
        },
        user: {
          id: new Uint8Array(16),
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [
          {
            type: "public-key",
            alg: -7, // ES256
          },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "direct",
      };

      // Crear credenciales
      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions,
      });

      // Convertir credenciales a formato almacenable
      const credentialData = {
        id: credential.id,
        type: credential.type,
        rawId: Array.from(new Uint8Array(credential.rawId)),
        response: {
          attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
          clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
        },
      };

      // Guardar usando el hook de persistencia
      await saveCredential(userId, credentialData);

      return credentialData;
    } catch (error) {
      console.error("Error registrando credenciales biométricas:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAvailable]);

  // Autenticar con credenciales biométricas
  const authenticateBiometric = useCallback(async (userId, storedCredentials) => {
    setLoading(true);
    setError(null);

    try {
      if (!isAvailable) {
        throw new Error("La autenticación biométrica no está disponible en este dispositivo");
      }

      // Obtener credenciales desde IndexedDB si no se proporcionan
      let credentialsToUse = storedCredentials;
      if (!credentialsToUse) {
        const localCredentials = await getCredentials(userId);
        if (localCredentials.length === 0) {
          throw new Error("No se encontraron credenciales biométricas configuradas");
        }
        credentialsToUse = localCredentials.map(cred => cred.credentialData);
      }

      // Generar challenge aleatorio
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Convertir credenciales almacenadas de vuelta a formato usable
      // Asegurar que credentialsToUse sea un array
      const credentialsArray = Array.isArray(credentialsToUse) ? credentialsToUse : [credentialsToUse];
      
      const allowCredentials = credentialsArray.map(cred => ({
        type: cred.type,
        id: new Uint8Array(cred.rawId),
        transports: ["internal"],
      }));

      // Crear opciones de autenticación
      const publicKeyOptions = {
        challenge: challenge,
        rpId: window.location.hostname,
        allowCredentials: allowCredentials,
        userVerification: "required",
        timeout: 60000,
      };

      // Autenticar
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyOptions,
      });

      // Verificar que la autenticación fue exitosa
      if (assertion) {
        return {
          success: true,
          credentialId: assertion.id,
          authenticatorData: Array.from(new Uint8Array(assertion.response.authenticatorData)),
          clientDataJSON: Array.from(new Uint8Array(assertion.response.clientDataJSON)),
          signature: Array.from(new Uint8Array(assertion.response.signature)),
        };
      } else {
        throw new Error("Autenticación biométrica fallida");
      }
    } catch (error) {
      console.error("Error en autenticación biométrica:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAvailable]);

  // Eliminar credenciales biométricas
  const removeBiometric = useCallback(async (credentialId) => {
    setLoading(true);
    setError(null);

    try {
      // Eliminar de IndexedDB
      await deleteCredentialFromDB(credentialId);
      
      // Nota: La Web Authentication API no proporciona un método directo para eliminar credenciales
      // Esto se maneja a nivel del sistema operativo o del navegador
      // Por ahora, solo marcamos como eliminada en nuestra base de datos
      return { success: true };
    } catch (error) {
      console.error("Error eliminando credenciales biométricas:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener credenciales locales
  const getLocalCredentials = useCallback(async (userId) => {
    try {
      return await getCredentialsFromDB(userId);
    } catch (error) {
      console.error("Error obteniendo credenciales locales:", error);
      return [];
    }
  }, []);

  return {
    isSupported,
    isAvailable,
    loading,
    error,
    registerBiometric,
    authenticateBiometric,
    removeBiometric,
    getLocalCredentials,
  };
};
