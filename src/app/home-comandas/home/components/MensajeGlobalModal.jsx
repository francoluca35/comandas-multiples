"use client";
import React, { useState } from "react";
import { useDispositivos } from "@/hooks/useDispositivos";
import { useAuth } from "@/app/context/AuthContext";

function MensajeGlobalModal({ isOpen, onClose }) {
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { enviarMensajeATodos, usuariosActivos } = useDispositivos();
  const { usuario } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mensaje.trim()) {
      alert("Por favor, escribe un mensaje");
      return;
    }

    try {
      setEnviando(true);
      await enviarMensajeATodos(mensaje.trim(), usuario?.usuario || "admin");

      alert(
        `✅ Mensaje enviado exitosamente a ${usuariosActivos.length} usuarios`
      );
      setMensaje("");
      onClose();
    } catch (error) {
      console.error("❌ Error enviando mensaje:", error);
      alert("❌ Error al enviar el mensaje. Por favor, inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            📢 Mensaje para Todos
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-200">
            <strong>Usuarios activos:</strong> {usuariosActivos.length}
          </p>
          <p className="text-xs text-blue-300 mt-1">
            El mensaje se enviará a todos los usuarios conectados y quedará
            pendiente para los que no estén logueados.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mensaje:
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Escribe tu mensaje aquí..."
              rows={4}
              maxLength={500}
              required
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {mensaje.length}/500
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
              disabled={enviando || !mensaje.trim()}
            >
              {enviando ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Enviar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MensajeGlobalModal;
