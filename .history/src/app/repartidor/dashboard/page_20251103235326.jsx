"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDeliveryOrders } from "../../../hooks/useDeliveryOrders";
import Swal from "sweetalert2";

export default function RepartidorDashboard() {
  const router = useRouter();
  const {
    pedidosPendientes,
    pedidosEntregados,
    loading,
    fetchPedidosPendientes,
    fetchPedidosEntregados,
    setupRealtimeListener,
  } = useDeliveryOrders();

  const [usuario, setUsuario] = useState("");
  const [fecha, setFecha] = useState("");

  useEffect(() => {
    // Verificar autenticación (case-insensitive)
    const rol = (localStorage.getItem("rol") || "").toLowerCase();
    if (rol !== "repartidor") {
      router.push("/repartidor/login");
      return;
    }

    const nombreCompleto = localStorage.getItem("nombreCompleto") || localStorage.getItem("usuario");
    setUsuario(nombreCompleto || "");
    setFecha(new Date().toLocaleDateString("es-AR", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    }));

    // Cargar pedidos iniciales
    fetchPedidosPendientes();
    fetchPedidosEntregados();

    // Configurar listener en tiempo real
    const unsubscribe = setupRealtimeListener();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleVerMapa = (pedido) => {
    router.push(`/repartidor/mapa/${pedido.id}`);
  };

  const handleVerTodos = () => {
    router.push("/repartidor/pedidos-pendientes");
  };

  const handleCerrarSesion = async () => {
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que deseas cerrar sesión?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      // Limpiar datos de sesión
      const keysToRemove = [
        "usuario",
        "rol",
        "usuarioId",
        "nombreCompleto",
        "userImage",
        "imagen",
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Redirigir al login de repartidores
      router.push("/home-comandas");
    }
  };

  // Mostrar máximo 3 pedidos pendientes
  const pedidosPendientesMostrar = pedidosPendientes.slice(0, 3);
  const hayMasPedidos = pedidosPendientes.length > 3;

  // Mostrar últimos 3 pedidos entregados
  const pedidosEntregadosMostrar = pedidosEntregados.slice(0, 3);

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
      <div className="bg-gray-900 p-4 text-white relative">
        {/* Botón cerrar sesión - arriba a la izquierda - solo icono moderno */}
        <button
          onClick={handleCerrarSesion}
          className="absolute top-4 left-4 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center"
          title="Cerrar Sesión"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>

        {/* Contenido del header centrado */}
        <div className="text-center">
          <h1 className="text-lg font-semibold">
            Bienvenido {usuario}
          </h1>
          <p className="text-sm text-gray-300">{fecha}</p>
        </div>
      </div>

      {/* Pedidos Pendientes */}
      <div className="p-4">
        <h2 className="text-white text-lg font-semibold underline mb-3">
          Pedidos pendientes
        </h2>
        
        {pedidosPendientesMostrar.length === 0 ? (
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-300">No hay pedidos pendientes</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-3">
              {pedidosPendientesMostrar.map((pedido) => (
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
            
            {hayMasPedidos && (
              <button
                onClick={handleVerTodos}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Ver todos los pedidos
              </button>
            )}
          </>
        )}
      </div>

      {/* Pedidos Entregados */}
      <div className="p-4">
        <h2 className="text-white text-lg font-semibold underline mb-3">
          Pedidos entregados
        </h2>
        
        {pedidosEntregadosMostrar.length === 0 ? (
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-300">No hay pedidos entregados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidosEntregadosMostrar.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-green-600 rounded-lg p-4"
              >
                <p className="text-black font-semibold">
                  Cliente: {pedido.cliente || pedido.clientData?.name || "Sin nombre"}
                </p>
                <p className="text-black text-sm">
                  Dirección: {pedido.direccion || pedido.clientData?.address || "Sin dirección"}
                </p>
                <p className="text-black font-bold mt-2">ENTREGADO</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

