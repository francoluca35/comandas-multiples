"use client";
import React, { useState, useEffect } from "react";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";
import { RestaurantGuard } from "../../../components/RestaurantGuard";
import RoleGuard from "../../../components/RoleGuard";
import usePedidosCocina from "../../../hooks/usePedidosCocina";
import useKitchenNotifications from "../../../hooks/useKitchenNotifications";
import useRealTimeNotifications from "../../../hooks/useRealTimeNotifications";
import KitchenNotification from "../../../components/KitchenNotification";

// Componente para mostrar un pedido individual
const PedidoCard = ({ pedido, onStatusChange, tipo }) => {
  const isVacio = !pedido || Object.keys(pedido).length === 0;

  // Determinar si es pedido de salón, takeaway o delivery
  const isTakeaway = pedido.mesa === "TAKEAWAY" || pedido.tipo === "takeaway";
  const isDelivery = pedido.mesa === "DELIVERY" || pedido.tipo === "delivery";
  const isSalon = !isTakeaway && !isDelivery;

  if (isVacio) {
    return (
      <div className="bg-white/80 rounded-xl p-6 flex items-center justify-center border border-gray-200 shadow-sm backdrop-blur-sm">
        <div className="text-gray-500 text-center">
          <div className="text-sm font-medium">Sin pedidos</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-sm rounded-xl p-5 border shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] ${
      isTakeaway 
        ? "bg-orange-50/90 border-orange-200" 
        : isDelivery
        ? "bg-purple-50/90 border-purple-200"
        : "bg-yellow-50/90 border-yellow-200"
    }`}>
      {/* Header del pedido */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full ${
            isTakeaway 
              ? "bg-orange-100" 
              : isDelivery
              ? "bg-purple-100"
              : "bg-yellow-100"
          }`}>
            <svg className={`w-4 h-4 ${
              isTakeaway 
                ? "text-orange-600" 
                : isDelivery
                ? "text-purple-600"
                : "text-yellow-600"
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="font-bold text-gray-800 text-lg">
            {isTakeaway ? `TAKEAWAY - ${pedido.cliente}` : isDelivery ? `DELIVERY - ${pedido.cliente}` : `Mesa ${pedido.mesa}`}
          </div>
          {isDelivery && pedido.direccion && (
            <div className="text-xs text-gray-600 mt-1">
              📍 {pedido.direccion}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {/* Etiqueta de tipo */}
          <div className={`text-xs font-bold px-2 py-1 rounded-full ${
            isTakeaway 
              ? "bg-orange-500 text-white" 
              : isDelivery
              ? "bg-purple-500 text-white"
              : "bg-yellow-500 text-white"
          }`}>
            {isTakeaway ? "TAKEAWAY" : isDelivery ? "DELIVERY" : "SALÓN"}
          </div>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {pedido.productos?.length || 0} items
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="space-y-2 mb-4">
        {pedido.productos?.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between rounded-lg p-2 ${
              isTakeaway 
                ? "bg-orange-100/80" 
                : isDelivery
                ? "bg-purple-100/80"
                : "bg-yellow-100/80"
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center ${
                isTakeaway 
                  ? "bg-orange-200 text-orange-800" 
                  : isDelivery
                  ? "bg-purple-200 text-purple-800"
                  : "bg-yellow-200 text-yellow-800"
              }`}>
                {item.cantidad || item.unidades}
              </span>
              <span className="text-gray-700 font-medium truncate">{item.nombre || item.producto}</span>
            </div>
            {item.notas && (
              <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                isTakeaway 
                  ? "text-orange-600 bg-orange-50" 
                  : isDelivery
                  ? "text-purple-600 bg-purple-50"
                  : "text-yellow-600 bg-yellow-50"
              }`}>
                {item.notas}
              </span>
            )}
          </div>
        ))}
        {pedido.productos?.length > 3 && (
          <div className={`text-xs px-3 py-2 rounded-lg text-center ${
            isTakeaway 
              ? "text-orange-600 bg-orange-100/50" 
              : isDelivery
              ? "text-purple-600 bg-purple-100/50"
              : "text-yellow-600 bg-yellow-100/50"
          }`}>
            +{pedido.productos.length - 3} productos más...
          </div>
        )}
      </div>

      {/* Botón de acción */}
      <div className="flex justify-end">
        {tipo === "primeros" ? (
          <button
            onClick={() => onStatusChange(pedido.id, "listo")}
            className={`font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2 ${
              isTakeaway 
                ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white" 
                : isDelivery
                ? "bg-gradient-to-r from-purple-500 to-red-600 hover:from-purple-600 hover:to-red-700 text-white"
                : "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Marcar Listo</span>
          </button>
        ) : (
          <button
            onClick={() => onStatusChange(pedido.id, "realizado")}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Completado</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Componente principal de la página de cocina
function CocinaContent() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const {
    pedidos,
    loading,
    error,
    fetchPedidos,
    actualizarEstadoPedido,
    addNewPedido,
    getPedidosPendientes,
    getPedidosEnPreparacion,
    getPedidosListos,
    eliminarPedido,
  } = usePedidosCocina();

  // Hook para notificaciones de cocina
  const {
    isEnabled,
    setIsEnabled,
    volume,
    setVolume,
    soundType,
    setSoundType,
    lastNotification,
    notifyNewOrder,
    clearNotification,
    testSound,
    testSpecificSound,
    notifyOrderReady,
  } = useKitchenNotifications();

  // Hook para notificaciones en tiempo real
  const {
    isConnected,
    connectionStatus,
    onNewOrder,
  } = useRealTimeNotifications();

  // Configurar callback para nuevos pedidos en tiempo real
  useEffect(() => {
    const handleNewOrder = (nuevoPedido) => {
      console.log("🔔 Nuevo pedido recibido en tiempo real:", nuevoPedido);
      
      // Agregar el pedido a la lista
      addNewPedido(nuevoPedido);
      
      // Notificar inmediatamente
      notifyNewOrder(nuevoPedido);
    };

    // Configurar el callback en el hook de tiempo real
    onNewOrder(handleNewOrder);
  }, [onNewOrder, addNewPedido, notifyNewOrder]);

  // Función para cambiar el estado de un pedido
  const handleStatusChange = async (pedidoId, nuevoEstado) => {
    try {
      if (nuevoEstado === "listo") {
        // Cambiar estado a "listo" (se mueve a "Pedidos Entregados")
        await actualizarEstadoPedido(pedidoId, "listo");
        
        // Encontrar el pedido para notificar
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (pedido) {
          // Notificar que el pedido está listo (con vibración)
          notifyOrderReady(pedido);
        }
      } else if (nuevoEstado === "eliminar") {
        // Eliminar pedido del historial
        await eliminarPedido(pedidoId);
      }

      // Recargar pedidos para actualizar la vista
      await fetchPedidos();
    } catch (error) {
      console.error("Error al cambiar estado del pedido:", error);
      alert("Error al cambiar el estado del pedido. Inténtalo de nuevo.");
    }
  };

  // Obtener pedidos para cada sección
  const pedidosPrimeros = [
    ...getPedidosPendientes(),
    ...getPedidosEnPreparacion(),
  ];
  const pedidosHechos = getPedidosListos();

  // Función para obtener el color del indicador de conexión
  const getConnectionColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Función para obtener el texto del estado de conexión
  const getConnectionText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Conectado en tiempo real";
      case "connecting":
        return "Conectando...";
      case "error":
        return "Error de conexión";
      default:
        return "Desconectado";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-900 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Cargando pedidos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-slate-900 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-400 text-xl">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar />

      {/* Overlay para cerrar sidebar cuando está abierto */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 overflow-auto ${
          isExpanded
            ? "ml-56 sm:ml-64 md:ml-72 lg:ml-80 xl:ml-96 2xl:ml-[420px]"
            : "ml-16 sm:ml-20"
        }`}
      >
        <div className="min-h-screen bg-slate-800">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  🍳 Vista de Cocina
                </h1>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                  Gestiona los pedidos y el estado de preparación
                </p>
                
                {/* Indicador de estado de conexión en tiempo real */}
                <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getConnectionColor()} ${connectionStatus === "connected" ? "animate-pulse" : ""}`}></div>
                    <span className={`font-medium ${connectionStatus === "connected" ? "text-green-400" : connectionStatus === "connecting" ? "text-yellow-400" : connectionStatus === "error" ? "text-red-400" : "text-gray-400"}`}>
                      {getConnectionText()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de control */}
              <div className="text-center mb-8 space-y-4">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => fetchPedidos()}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Actualizar Pedidos</span>
                    </span>
                  </button>

                  <button
                    onClick={testSound}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      <span>Probar Sonido</span>
                    </span>
                  </button>
                </div>

                {/* Estado de notificaciones */}
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-slate-300">
                      Notificaciones: {isEnabled ? 'Activadas' : 'Desactivadas'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    <span className="text-slate-300">
                      Volumen: {Math.round(volume * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenedor principal */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sección: Primeros Pedidos */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-full shadow-lg mr-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      En Preparación
                    </h2>
                    <div className="ml-3 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {pedidosPrimeros.length}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {pedidosPrimeros.length > 0 ? (
                      pedidosPrimeros.map((pedido) => (
                        <PedidoCard
                          key={`primeros-${pedido.id}`}
                          pedido={pedido}
                          onStatusChange={handleStatusChange}
                          tipo="primeros"
                        />
                      ))
                    ) : (
                      <div className="bg-white/70 rounded-xl p-8 border border-yellow-200 shadow-sm">
                        <div className="text-center">
                          <div className="text-yellow-400 text-4xl mb-3">🍽️</div>
                          <p className="text-yellow-700 font-medium">Sin pedidos pendientes</p>
                          <p className="text-yellow-500 text-sm mt-1">Los nuevos pedidos aparecerán aquí</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sección: Pedidos Entregados */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full shadow-lg mr-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Entregados
                      </h2>
                      <div className="ml-3 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {pedidosHechos.length}
                      </div>
                    </div>
                    {pedidosHechos.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm("¿Estás seguro de que quieres eliminar todo el historial de pedidos entregados?")) {
                            pedidosHechos.forEach(pedido => {
                              handleStatusChange(pedido.id, "eliminar");
                            });
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Limpiar Historial</span>
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {pedidosHechos.length > 0 ? (
                      pedidosHechos.map((pedido) => (
                        <PedidoCard
                          key={`hechos-${pedido.id}`}
                          pedido={pedido}
                          onStatusChange={handleStatusChange}
                          tipo="hechos"
                        />
                      ))
                    ) : (
                      <div className="bg-white/70 rounded-xl p-8 border border-green-200 shadow-sm">
                        <div className="text-center">
                          <div className="text-green-400 text-4xl mb-3">✅</div>
                          <p className="text-green-700 font-medium">Sin pedidos listos</p>
                          <p className="text-green-500 text-sm mt-1">Los pedidos completados aparecerán aquí</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="mt-8 text-center bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border border-slate-600/50 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-blue-500 p-2 rounded-full mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Flujo de Trabajo</h3>
                </div>
                <p className="text-slate-300 text-sm mb-3">
                  Los pedidos se mueven automáticamente de "En Preparación" a "Listos para Servir" 
                  cuando se marca como "Listo", y se eliminan cuando se marca como "Realizado".
                </p>
                
                {/* Leyenda de colores */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-yellow-100/20 border border-yellow-300/30 rounded-xl p-3">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <span className="text-yellow-300 font-medium">SALÓN</span>
                      <span className="text-yellow-400 text-sm">Pedidos de mesas</span>
                    </div>
                  </div>
                  <div className="bg-orange-100/20 border border-orange-300/30 rounded-xl p-3">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <span className="text-orange-300 font-medium">TAKEAWAY</span>
                      <span className="text-orange-400 text-sm">Pedidos para llevar</span>
                    </div>
                  </div>
                  <div className="bg-purple-100/20 border border-purple-300/30 rounded-xl p-3">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      <span className="text-purple-300 font-medium">DELIVERY</span>
                      <span className="text-purple-400 text-sm">Pedidos a domicilio</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-600/30 rounded-xl p-3 inline-block">
                  <p className="text-base font-medium text-blue-300">
                    Total de pedidos activos:{" "}
                    <span className="text-white font-bold text-lg">
                      {pedidosPrimeros.length + pedidosHechos.length}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Componente de notificaciones de cocina */}
      <KitchenNotification
        notification={lastNotification}
        onClose={clearNotification}
        isEnabled={isEnabled}
        onToggleEnabled={() => setIsEnabled(!isEnabled)}
        volume={volume}
        onVolumeChange={setVolume}
        soundType={soundType}
        onSoundTypeChange={setSoundType}
        onTestSound={testSound}
        onTestSpecificSound={testSpecificSound}
      />
    </div>
  );
}

const CocinaPage = () => {
  return (
    <RestaurantGuard>
      <RoleGuard
        requiredPermission="canAccessCocina"
        fallback={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-red-400 mb-2">
                Acceso Denegado
              </h1>
              <p className="text-slate-400 mb-4">
                No tienes permisos para acceder a la vista de cocina.
              </p>
              <p className="text-slate-500 text-sm">
                Solo los administradores y personal de cocina pueden ver esta
                vista.
              </p>
            </div>
          </div>
        }
      >
        <SidebarProvider>
          <CocinaContent />
        </SidebarProvider>
      </RoleGuard>
    </RestaurantGuard>
  );
};

export default CocinaPage;
