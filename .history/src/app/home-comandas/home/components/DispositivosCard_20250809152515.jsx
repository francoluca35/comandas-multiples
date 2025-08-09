"use client";
import React, { useState, useEffect } from "react";
import { useDispositivos } from "@/hooks/useDispositivos";
import { useAuth } from "@/app/context/AuthContext";
import MensajeGlobalModal from "./MensajeGlobalModal";

function DispositivosCard() {
  const [showModal, setShowModal] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    dispositivosConectados: 0,
    usuariosActivos: 0,
    usuariosDisponibles: 0,
    totalPermitidos: 0,
    porcentajeUso: 0,
  });
  
  const { dispositivos, usuariosActivos, loading, obtenerEstadisticas } = useDispositivos();
  const { usuario } = useAuth();

  // Actualizar estadísticas cuando cambien los datos
  useEffect(() => {
    const actualizarEstadisticas = async () => {
      const stats = await obtenerEstadisticas();
      setEstadisticas(stats);
    };

    if (!loading) {
      actualizarEstadisticas();
    }
  }, [dispositivos, usuariosActivos, loading, obtenerEstadisticas]);

  // Verificar si el usuario es admin
  const esAdmin = usuario?.rol === "admin" || usuario?.esAdmin;

  const handleMensajeGlobal = () => {
    if (!esAdmin) {
      alert("❌ Solo los administradores pueden enviar mensajes globales");
      return;
    }
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-white">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-semibold">Dispositivos</span>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6 text-white">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-semibold">Dispositivos</span>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Dispositivos Conectados */}
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                <span className="text-sm">Conectados</span>
              </div>
              <span className="text-sm font-semibold text-green-400">
                {estadisticas.dispositivosConectados}
              </span>
            </div>
          </div>

          {/* Usuarios Permitidos */}
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm">Permitidos</span>
              </div>
              <span className="text-sm font-semibold text-blue-400">
                {estadisticas.usuariosActivos}/{estadisticas.totalPermitidos}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de progreso de uso */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Uso de usuarios</span>
            <span>{estadisticas.porcentajeUso}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                estadisticas.porcentajeUso >= 80 ? 'bg-red-500' : 
                estadisticas.porcentajeUso >= 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${estadisticas.porcentajeUso}%` }}
            ></div>
          </div>
        </div>

        {/* Lista de dispositivos conectados */}
        {dispositivos.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Dispositivos activos:</h4>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {dispositivos.slice(0, 3).map((dispositivo) => (
                <div key={dispositivo.id} className="flex items-center justify-between bg-gray-700 rounded px-2 py-1">
                  <span className="text-xs text-gray-300 truncate">
                    {dispositivo.usuarioId || dispositivo.id}
                  </span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                </div>
              ))}
              {dispositivos.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{dispositivos.length - 3} más...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botón de mensaje global */}
        <button 
          onClick={handleMensajeGlobal}
          className={`w-full rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center transition-all duration-200 ${
            esAdmin 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!esAdmin}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {esAdmin ? 'Mensaje para todos' : 'Solo para ADMIN'}
        </button>

        {/* Información adicional */}
        <div className="mt-3 text-xs text-gray-400 text-center">
          {esAdmin ? (
            <p>Envía mensajes a todos los usuarios del sistema</p>
          ) : (
            <p>Contacta al administrador para enviar mensajes</p>
          )}
        </div>
      </div>

      {/* Modal de mensaje global */}
      <MensajeGlobalModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}

export default DispositivosCard;
