"use client";
import React, { useState, useEffect } from "react";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";
import { RestaurantGuard } from "../../../components/RestaurantGuard";
import RoleGuard from "../../../components/RoleGuard";
import usePedidosCocina from "../../../hooks/usePedidosCocina";

// Componente para mostrar un pedido individual
const PedidoCard = ({ pedido, onStatusChange, tipo }) => {
  const isVacio = !pedido || Object.keys(pedido).length === 0;

  if (isVacio) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 h-28 flex items-center justify-center border border-gray-300">
        <div className="text-gray-500 text-center">
          <div className="text-sm font-medium">Sin pedidos</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4 h-28 flex items-center justify-between shadow-sm border border-gray-300">
      {/* Contenido del pedido */}
      <div className="flex-1 pr-3">
        {/* Mesa */}
        <div className="font-semibold text-gray-800 mb-2 text-base">
          {pedido.mesa ? `Mesa ${pedido.mesa}` : `Pedido #${pedido.id}`}
        </div>

        {/* Productos */}
        <div className="space-y-1.5">
          {pedido.productos?.slice(0, 3).map((item, index) => (
            <div
              key={index}
              className="flex items-center text-sm text-gray-700"
            >
              <span className="font-semibold text-gray-800 mr-2 min-w-[20px]">
                ×{item.cantidad}
              </span>
              <span className="text-gray-700 truncate">{item.nombre}</span>
              {item.notas && (
                <span className="text-xs text-blue-600 ml-2 flex-shrink-0">
                  {item.notas}
                </span>
              )}
            </div>
          ))}
          {pedido.productos?.length > 3 && (
            <div className="text-xs text-gray-500 mt-1">
              +{pedido.productos.length - 3} más...
            </div>
          )}
        </div>
      </div>

      {/* Botón de acción */}
      <div className="ml-3 flex-shrink-0">
        {tipo === "primeros" ? (
          <button
            onClick={() => onStatusChange(pedido.id, "listo")}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2.5 px-4 rounded-md transition-colors duration-200 shadow-sm"
          >
            Listo
          </button>
        ) : (
          <button
            onClick={() => onStatusChange(pedido.id, "realizado")}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 px-4 rounded-md transition-colors duration-200 shadow-sm"
          >
            Realizado
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
    getPedidosPendientes,
    getPedidosEnPreparacion,
    getPedidosListos,
  } = usePedidosCocina();

  // Cargar pedidos al montar el componente
  useEffect(() => {
    console.log("🍳 Cocina: Montando componente, fetching pedidos...");
    fetchPedidos();
  }, []);

  // Función para cambiar el estado de un pedido
  const handleStatusChange = async (pedidoId, nuevoEstado) => {
    try {
      if (nuevoEstado === "listo") {
        // Cambiar estado a "listo" (se mueve a "Pedidos Hechos")
        // La API automáticamente actualizará el estado de la mesa a "servido"
        await actualizarEstadoPedido(pedidoId, "listo");
      } else if (nuevoEstado === "realizado") {
        // Marcar pedido como completamente realizado (se elimina)
        await actualizarEstadoPedido(pedidoId, "realizado");
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
              </div>

              {/* Botón para recargar pedidos */}
              <div className="text-center mb-8">
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
              </div>

              {/* Contenedor principal */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sección: Primeros Pedidos */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full shadow-lg mr-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      En Preparación
                    </h2>
                    <div className="ml-3 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {pedidosPrimeros.length}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {pedidosPrimeros.length > 0 ? (
                      pedidosPrimeros.map((pedido) => (
                        <PedidoCard
                          key={pedido.id}
                          pedido={pedido}
                          onStatusChange={handleStatusChange}
                          tipo="primeros"
                        />
                      ))
                    ) : (
                      <div className="bg-white/70 rounded-xl p-8 border border-orange-200 shadow-sm">
                        <div className="text-center">
                          <div className="text-orange-400 text-4xl mb-3">🍽️</div>
                          <p className="text-orange-700 font-medium">Sin pedidos pendientes</p>
                          <p className="text-orange-500 text-sm mt-1">Los nuevos pedidos aparecerán aquí</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sección: Pedidos Hechos */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full shadow-lg mr-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Listos para Servir
                    </h2>
                    <div className="ml-3 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {pedidosHechos.length}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {pedidosHechos.length > 0 ? (
                      pedidosHechos.map((pedido) => (
                        <PedidoCard
                          key={pedido.id}
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
