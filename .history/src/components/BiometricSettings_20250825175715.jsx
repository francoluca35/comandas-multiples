"use client";
import React, { useState, useEffect } from "react";
import { FaFingerprint, FaPlus, FaTrash, FaExclamationTriangle, FaCheck } from "react-icons/fa";
import BiometricSetupModal from "./BiometricSetupModal";
import { useBiometricAuth } from "../hooks/useBiometricAuth";

const BiometricSettings = ({ userId, username }) => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const {
    isSupported,
    isAvailable,
    loading: authLoading,
  } = useBiometricAuth();

  useEffect(() => {
    loadCredentials();
  }, [userId]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const restauranteId = localStorage.getItem("restauranteId");
      
      // Obtener credenciales del usuario desde la base de datos
      const response = await fetch(`/api/users/${userId}/biometric-credentials`, {
        headers: {
          "x-restaurante-id": restauranteId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCredentials(data.credentials || []);
      } else {
        console.error("Error cargando credenciales");
      }
    } catch (error) {
      console.error("Error cargando credenciales:", error);
      setError("Error al cargar las credenciales biométricas");
    } finally {
      setLoading(false);
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

      // Recargar credenciales
      await loadCredentials();
      setShowDeleteConfirm(null);
      
    } catch (error) {
      console.error("Error eliminando credencial:", error);
      setError(error.message);
    }
  };

  const handleSetupSuccess = async () => {
    await loadCredentials();
    setShowSetupModal(false);
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-white">Cargando credenciales...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <FaFingerprint className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Huellas Digitales</h3>
            <p className="text-slate-400 text-sm">Gestiona tus credenciales biométricas</p>
          </div>
        </div>
      </div>

      {/* Estado de compatibilidad */}
      {!isSupported && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <FaExclamationTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">Tu dispositivo no soporta autenticación biométrica</span>
          </div>
        </div>
      )}

      {!isAvailable && isSupported && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <FaExclamationTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400">La autenticación biométrica no está disponible en tu dispositivo</span>
          </div>
        </div>
      )}

      {/* Lista de credenciales */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold">
            Huellas Configuradas ({credentials.length}/4)
          </h4>
          {isSupported && isAvailable && credentials.length < 4 && (
            <button
              onClick={() => setShowSetupModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FaPlus className="w-4 h-4" />
              <span>Agregar Huella</span>
            </button>
          )}
        </div>

        {credentials.length === 0 ? (
          <div className="bg-slate-700/50 rounded-lg p-6 text-center">
            <FaFingerprint className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 mb-3">No tienes huellas digitales configuradas</p>
            {isSupported && isAvailable && (
              <button
                onClick={() => setShowSetupModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Configurar Primera Huella
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {credentials.map((cred) => (
              <div key={cred.id} className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <FaCheck className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{cred.name}</p>
                      <p className="text-slate-400 text-sm">
                        Configurada el {new Date(cred.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(cred.id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-2"
                    title="Eliminar huella"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-slate-700/50 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-2">Información</h4>
        <ul className="text-slate-400 text-sm space-y-1">
          <li>• Puedes configurar hasta 4 huellas digitales</li>
          <li>• Usa cualquiera de tus huellas para iniciar sesión</li>
          <li>• Las huellas se guardan de forma segura en tu dispositivo</li>
          <li>• Puedes eliminar huellas que ya no uses</li>
        </ul>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <FaTrash className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Eliminar Huella</h3>
                <p className="text-slate-400 text-sm">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-white mb-6">
              ¿Estás seguro de que quieres eliminar esta huella digital?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteCredential(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de configuración */}
      <BiometricSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onSuccess={handleSetupSuccess}
        userId={userId}
        username={username}
        existingCredentials={credentials}
        isInitialSetup={false}
      />

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-4">
          <div className="flex items-center space-x-2">
            <FaExclamationTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiometricSettings;
