"use client";
import React, { useState, useEffect } from "react";
import { FaFingerprint, FaTimes, FaCheck, FaExclamationTriangle, FaTrash, FaPlus } from "react-icons/fa";
import { useBiometricAuth } from "../hooks/useBiometricAuth";

const BiometricSetupModal = ({ isOpen, onClose, onSuccess, userId, username, existingCredentials = [] }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [credentialName, setCredentialName] = useState("");
  const [credentials, setCredentials] = useState(existingCredentials);
  
  const {
    isSupported,
    isAvailable,
    loading,
    registerBiometric,
  } = useBiometricAuth();

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(null);
      setSuccess(false);
      setCredentialName("");
      setCredentials(existingCredentials);
    }
  }, [isOpen, existingCredentials]);

  const handleSetupBiometric = async () => {
    try {
      if (!credentialName.trim()) {
        setError("Por favor, ingresa un nombre para la huella digital");
        return;
      }

      if (credentials.length >= 4) {
        setError("Ya tienes el máximo de 4 huellas digitales configuradas");
        return;
      }

      setError(null);
      setStep(2);

      const credentialData = await registerBiometric(userId, username);
      
      // Guardar las credenciales en la base de datos
      const restauranteId = localStorage.getItem("restauranteId");
      const response = await fetch("/api/biometric/save-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-restaurante-id": restauranteId,
        },
        body: JSON.stringify({
          userId,
          username,
          credentialData,
          credentialName: credentialName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar las credenciales biométricas");
      }

      const result = await response.json();
      
      // Agregar la nueva credencial a la lista local
      const newCredential = {
        ...credentialData,
        name: credentialName.trim(),
        createdAt: new Date().toISOString(),
        id: `credential_${Date.now()}`,
      };
      
      setCredentials([...credentials, newCredential]);
      setSuccess(true);
      setStep(3);
      
      // Llamar al callback de éxito después de un breve delay
      setTimeout(() => {
        onSuccess(newCredential);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error configurando huella digital:", error);
      setError(error.message);
      setStep(1);
    }
  };

  const handleDeleteCredential = async (credentialId) => {
    try {
      const restauranteId = localStorage.getItem("restauranteId");
      const response = await fetch("/api/biometric/delete-credential", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-restaurante-id": restauranteId,
        },
        body: JSON.stringify({
          userId,
          credentialId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar la credencial");
      }

      // Actualizar la lista local
      setCredentials(credentials.filter(cred => cred.id !== credentialId));
      
    } catch (error) {
      console.error("Error eliminando credencial:", error);
      setError(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FaFingerprint className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Configurar Huellas Digitales</h2>
              <p className="text-slate-400 text-sm">Para {username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="space-y-6">
          {/* Paso 1: Verificación de compatibilidad y configuración */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Mostrar huellas existentes */}
              {credentials.length > 0 && (
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center">
                    <FaFingerprint className="w-4 h-4 mr-2" />
                    Huellas Configuradas ({credentials.length}/4)
                  </h3>
                  <div className="space-y-2">
                    {credentials.map((cred) => (
                      <div key={cred.id} className="flex items-center justify-between bg-slate-600/50 rounded-lg p-3">
                        <div>
                          <p className="text-white font-medium">{cred.name}</p>
                          <p className="text-slate-400 text-sm">
                            {new Date(cred.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteCredential(cred.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Eliminar huella"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verificación de compatibilidad */}
              {!isSupported ? (
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                    <FaExclamationTriangle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">No Compatible</h3>
                  <p className="text-slate-400">
                    Tu dispositivo no soporta autenticación biométrica.
                  </p>
                </div>
              ) : !isAvailable ? (
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                    <FaExclamationTriangle className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">No Disponible</h3>
                  <p className="text-slate-400">
                    La autenticación biométrica no está disponible en tu dispositivo.
                  </p>
                </div>
              ) : credentials.length >= 4 ? (
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                    <FaFingerprint className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Límite Alcanzado</h3>
                  <p className="text-slate-400">
                    Ya tienes el máximo de 4 huellas digitales configuradas.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                      <FaFingerprint className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Agregar Nueva Huella</h3>
                    <p className="text-slate-400">
                      Tu dispositivo soporta autenticación por huella digital.
                    </p>
                  </div>

                  {/* Campo de nombre para la nueva huella */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Nombre de la huella:
                    </label>
                    <input
                      type="text"
                      value={credentialName}
                      onChange={(e) => setCredentialName(e.target.value)}
                      placeholder="Ej: Dedo índice derecho"
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                      maxLength={30}
                    />
                  </div>

                  <button
                    onClick={handleSetupBiometric}
                    disabled={loading || !credentialName.trim()}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Configurando...</span>
                      </>
                    ) : (
                      <>
                        <FaPlus className="w-4 h-4" />
                        <span>Agregar Huella Digital</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Paso 2: Configuración en progreso */}
          {step === 2 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <FaFingerprint className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Configurando Huella Digital</h3>
              <p className="text-slate-400">
                Por favor, sigue las instrucciones de tu dispositivo para registrar tu huella digital.
              </p>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-300">
                  💡 <strong>Consejo:</strong> Coloca tu dedo en el sensor de huellas dactilares cuando se te solicite.
                </p>
              </div>
            </div>
          )}

          {/* Paso 3: Configuración exitosa */}
          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <FaCheck className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">¡Configuración Exitosa!</h3>
              <p className="text-slate-400">
                Tu huella digital "{credentialName}" ha sido configurada correctamente.
              </p>
              <p className="text-slate-400 text-sm">
                Total de huellas: {credentials.length}/4
              </p>
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FaExclamationTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          {step === 1 && isSupported && isAvailable && credentials.length < 4 && !loading && (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiometricSetupModal;
