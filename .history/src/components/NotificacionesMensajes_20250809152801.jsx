"use client";
import React, { useState } from "react";
import { useMensajesUsuario } from "@/hooks/useMensajesUsuario";
import { useAuth } from "@/app/context/AuthContext";

function NotificacionesMensajes() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { usuario } = useAuth();
  const { mensajesNoLeidos, cantidadNoLeidos, marcarComoLeido, marcarTodosComoLeidos } = useMensajesUsuario(usuario?.id);

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleMarcarComoLeido = async (mensajeId) => {
    try {
      await marcarComoLeido(mensajeId);
    } catch (error) {
      console.error("❌ Error marcando mensaje como leído:", error);
    }
  };

  const handleMarcarTodosComoLeidos = async () => {
    try {
      await marcarTodosComoLeidos();
    } catch (error) {
      console.error("❌ Error marcando todos los mensajes como leídos:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Ahora";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 text-gray-300 hover:text-white transition-colors focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.83 19.172A4 4 0 015.914 16H3a1 1 0 01-1-1V4a1 1 0 011-1h14a1 1 0 011 1v11a1 1 0 01-1 1h-2.914a4 4 0 01-1.086 3.172L15 17H4.83z" />
        </svg>
        
        {/* Badge de notificaciones */}
        {cantidadNoLeidos > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {cantidadNoLeidos > 9 ? "9+" : cantidadNoLeidos}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Notificaciones</h3>
              {cantidadNoLeidos > 0 && (
                <button
                  onClick={handleMarcarTodosComoLeidos}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Marcar todos como leídos
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {mensajesNoLeidos.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No tienes mensajes pendientes</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {mensajesNoLeidos.map((mensaje) => (
                  <div
                    key={mensaje.id}
                    className="p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => handleMarcarComoLeido(mensaje.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-medium text-white">
                            {mensaje.adminId === "admin" ? "Administrador" : mensaje.adminId}
                          </span>
                          <span className="ml-2 text-xs text-gray-400">
                            {formatTimestamp(mensaje.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {mensaje.mensaje}
                        </p>
                      </div>
                      <div className="ml-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {mensajesNoLeidos.length > 0 && (
            <div className="p-3 border-t border-gray-700 bg-gray-750">
              <p className="text-xs text-gray-400 text-center">
                Haz clic en un mensaje para marcarlo como leído
              </p>
            </div>
          )}
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

export default NotificacionesMensajes;
