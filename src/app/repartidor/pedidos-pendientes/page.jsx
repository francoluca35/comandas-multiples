"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDeliveryOrders } from "../../../hooks/useDeliveryOrders";

export default function PedidosPendientes() {
  const router = useRouter();
  const {
    pedidosPendientes,
    loading,
    fetchPedidosPendientes,
    setupRealtimeListener,
  } = useDeliveryOrders();

  useEffect(() => {
    // Verificar autenticación (case-insensitive)
    const rol = (localStorage.getItem("rol") || "").toLowerCase();
    if (rol !== "repartidor") {
      router.push("/repartidor/login");
      return;
    }

    // Cargar pedidos
    fetchPedidosPendientes();

    // Configurar listener en tiempo real
    const unsubscribe = setupRealtimeListener();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleVerMapa = (pedido) => {
    router.push(`/repartidor/mapa/${pedido.id}`);
  };

  const handleVolver = () => {
    router.push("/repartidor/dashboard");
  };

  if (loading && pedidosPendientes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Cargando pedidos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 pb-20">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between">
        <button
          onClick={handleVolver}
          className="text-white text-lg font-semibold"
        >
          ← Volver
        </button>
        <h1 className="text-white text-lg font-semibold">
          Todos los pedidos pendientes
        </h1>
        <div className="w-12"></div>
      </div>

      {/* Lista de pedidos */}
      <div className="p-4">
        {pedidosPendientes.length === 0 ? (
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-300">No hay pedidos pendientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidosPendientes.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-black font-semibold">
                    Cliente: {pedido.cliente || pedido.clientData?.name || "Sin nombre"}
                  </p>
                  <p className="text-black text-sm">
                    Dirección: {pedido.direccion || pedido.clientData?.address || "Sin dirección"}
                  </p>
                  {pedido.total && (
                    <p className="text-black text-sm mt-1">
                      Total: ${pedido.total.toFixed(2)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleVerMapa(pedido)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold ml-3 hover:bg-green-700 transition-colors"
                >
                  maps
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

