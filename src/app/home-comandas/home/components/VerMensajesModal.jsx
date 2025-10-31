"use client";
import React, { useEffect, useState } from "react";
import { useDispositivos } from "@/hooks/useDispositivos";
import { useAuth } from "@/app/context/AuthContext";

function VerMensajesModal({ isOpen, onClose }) {
  const { obtenerMensajesUsuario, marcarMensajeLeido } = useDispositivos();
  const { usuario } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && usuario?.id) {
      cargarMensajes();
    }
  }, [isOpen, usuario?.id]);

  const cargarMensajes = async () => {
    try {
      setLoading(true);
      const usuarioId = localStorage.getItem("usuarioId") || usuario?.id;
      const mensajesData = await obtenerMensajesUsuario(usuarioId);
      setMensajes(mensajesData || []);
    } catch (error) {
      console.error("Error cargando mensajes:", error);
      setMensajes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarLeido = async (mensajeId) => {
    try {
      const usuarioId = localStorage.getItem("usuarioId") || usuario?.id;
      await marcarMensajeLeido(usuarioId, mensajeId);
      // Recargar mensajes después de marcar como leído
      await cargarMensajes();
    } catch (error) {
      console.error("Error marcando mensaje como leído:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2a2a2a] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Mensajes del Admin</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-400">Cargando mensajes...</span>
            </div>
          ) : mensajes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-6xl mb-4">📭</div>
              <p className="text-gray-400 text-lg mb-2">No hay mensajes nuevos</p>
              <p className="text-gray-500 text-sm">
                Los mensajes del administrador aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {mensajes.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className="bg-[#3a3a3a] rounded-lg p-4 border-l-4 border-blue-500 hover:bg-[#4a4a4a] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg
                          className="w-5 h-5 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="text-blue-400 font-semibold text-sm">
                          Administrador
                        </span>
                        {mensaje.timestamp && (
                          <span className="text-gray-500 text-xs">
                            {new Date(
                              mensaje.timestamp?.toDate?.() ||
                                mensaje.timestamp ||
                                Date.now()
                            ).toLocaleString("es-ES")}
                          </span>
                        )}
                      </div>
                      <p className="text-white text-base leading-relaxed whitespace-pre-wrap">
                        {mensaje.mensaje}
                      </p>
                    </div>
                  </div>
                  {!mensaje.leido && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <button
                        onClick={() => handleMarcarLeido(mensaje.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Marcar como leído
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>
              {mensajes.length === 0
                ? "No hay mensajes"
                : `${mensajes.length} ${mensajes.length === 1 ? "mensaje" : "mensajes"}`}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerMensajesModal;

