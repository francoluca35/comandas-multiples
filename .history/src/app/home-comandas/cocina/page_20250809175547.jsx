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
    fetchPedidos();
  }, []);

  // Función para cambiar el estado de un pedido
  const handleStatusChange = async (pedidoId, nuevoEstado) => {
    try {
      if (nuevoEstado === "listo") {
        // Cambiar estado a "listo" (se mueve a "Pedidos Hechos")
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
              <div className="text-center mb-6">
                <button
                  onClick={() => fetchPedidos()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  🔄 Recargar Pedidos
                </button>
              </div>

              {/* Contenedor principal */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sección: Primeros Pedidos */}
                <div className="bg-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm">
                  <h2 className="text-xl font-bold text-blue-900 mb-5 text-center">
                    🔄 Primeros Pedidos ({pedidosPrimeros.length})
                  </h2>
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
                      <PedidoCard
                        pedido={{}}
                        onStatusChange={handleStatusChange}
                        tipo="primeros"
                      />
                    )}
                  </div>
                </div>

                {/* Sección: Pedidos Hechos */}
                <div className="bg-green-100 rounded-xl p-6 border border-green-200 shadow-sm">
                  <h2 className="text-xl font-bold text-green-900 mb-5 text-center">
                    ✅ Pedidos Hechos ({pedidosHechos.length})
                  </h2>
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
                      <PedidoCard
                        pedido={{}}
                        onStatusChange={handleStatusChange}
                        tipo="hechos"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="mt-6 text-center text-slate-300 bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <p className="text-sm">
                  Los pedidos se mueven automáticamente de "Primeros Pedidos" a
                  "Pedidos Hechos" cuando se marca como "Listo", y se eliminan
                  cuando se marca como "Realizado".
                </p>
                <p className="text-base font-medium mt-2 text-blue-300">
                  Total de pedidos activos:{" "}
                  <span className="text-white">
                    {pedidosPrimeros.length + pedidosHechos.length}
                  </span>
                </p>
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
