"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

// Componente para mostrar un pedido individual
const PedidoCard = ({ pedido, onStatusChange, tipo }) => {
  const isVacio = !pedido || Object.keys(pedido).length === 0;
  
  if (isVacio) {
    return (
      <div className="bg-gray-200 rounded-lg p-4 h-32 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div className="text-sm">Sin pedidos</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 h-32 flex flex-col justify-between shadow-md">
      <div className="flex-1">
        <div className="font-semibold text-gray-800 mb-2">
          {pedido.mesa ? `Mesa ${pedido.mesa}` : `Pedido #${pedido.id}`}
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          {pedido.items?.map((item, index) => (
            <div key={index} className="flex items-center">
              <span className="font-medium">X{item.cantidad}</span>
              <span className="ml-2">{item.nombre}</span>
              {item.notas && (
                <span className="ml-2 text-xs text-blue-600">({item.notas})</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2">
        {tipo === "primeros" ? (
          <button
            onClick={() => onStatusChange(pedido.id, "listo")}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Listo
          </button>
        ) : (
          <button
            onClick={() => onStatusChange(pedido.id, "realizado")}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Realizado
          </button>
        )}
      </div>
    </div>
  );
};

// Componente principal de la página de cocina
export default function CocinaPage() {
  const { usuario, rol } = useAuth();
  const router = useRouter();
  const [pedidosPrimeros, setPedidosPrimeros] = useState([]);
  const [pedidosHechos, setPedidosHechos] = useState([]);

  // Verificar autenticación y permisos
  useEffect(() => {
    if (!usuario) {
      router.push("/home-comandas/login");
      return;
    }

    // Solo ADMIN y COCINA pueden acceder
    if (rol?.toLowerCase() !== "admin" && rol?.toLowerCase() !== "cocina") {
      router.push("/home-comandas/home");
      return;
    }
  }, [usuario, rol, router]);

  // Simular datos de pedidos (en una implementación real, esto vendría de una API)
  useEffect(() => {
    // Pedidos de ejemplo
    const pedidosEjemplo = [
      {
        id: 1,
        mesa: "001",
        items: [
          { cantidad: 1, nombre: "Pollo con papas", notas: "aderezo extra" },
          { cantidad: 2, nombre: "Coca Cola" },
          { cantidad: 2, nombre: "Sprite" }
        ],
        timestamp: new Date(),
        estado: "en_preparacion"
      }
    ];

    setPedidosPrimeros(pedidosEjemplo);
    setPedidosHechos([]);
  }, []);

  // Función para cambiar el estado de un pedido
  const handleStatusChange = (pedidoId, nuevoEstado) => {
    if (nuevoEstado === "listo") {
      // Mover pedido de primeros a hechos
      const pedido = pedidosPrimeros.find(p => p.id === pedidoId);
      if (pedido) {
        setPedidosPrimeros(prev => prev.filter(p => p.id !== pedidoId));
        setPedidosHechos(prev => [...prev, { ...pedido, estado: "listo" }]);
      }
    } else if (nuevoEstado === "realizado") {
      // Marcar pedido como completamente realizado
      setPedidosHechos(prev => prev.filter(p => p.id !== pedidoId));
    }
  };

  // Función para agregar un pedido de ejemplo (para testing)
  const agregarPedidoEjemplo = () => {
    const nuevoPedido = {
      id: Date.now(),
      mesa: String(Math.floor(Math.random() * 20) + 1).padStart(3, '0'),
      items: [
        { cantidad: Math.floor(Math.random() * 3) + 1, nombre: "Hamburguesa" },
        { cantidad: Math.floor(Math.random() * 2) + 1, nombre: "Papas Fritas" }
      ],
      timestamp: new Date(),
      estado: "en_preparacion"
    };
    setPedidosPrimeros(prev => [...prev, nuevoPedido]);
  };

  if (!usuario) {
    return null;
  }

  return (
    <div className="min-h-screen bg-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Vista de Cocina
          </h1>
          <p className="text-blue-200">
            Gestiona los pedidos y el estado de preparación
          </p>
        </div>

        {/* Botón para agregar pedido de ejemplo (solo para testing) */}
        <div className="text-center mb-6">
          <button
            onClick={agregarPedidoEjemplo}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Agregar Pedido de Ejemplo
          </button>
        </div>

        {/* Contenedor principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sección: Primeros Pedidos */}
          <div className="bg-blue-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
              Primeros Pedidos
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
                // Mostrar 3 tarjetas vacías
                Array.from({ length: 3 }).map((_, index) => (
                  <PedidoCard
                    key={`empty-${index}`}
                    pedido={{}}
                    onStatusChange={handleStatusChange}
                    tipo="primeros"
                  />
                ))
              )}
            </div>
          </div>

          {/* Sección: Pedidos Hechos */}
          <div className="bg-green-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-green-900 mb-6 text-center">
              Pedidos Hechos
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
                // Mostrar 3 tarjetas vacías
                Array.from({ length: 3 }).map((_, index) => (
                  <PedidoCard
                    key={`empty-hechos-${index}`}
                    pedido={{}}
                    onStatusChange={handleStatusChange}
                    tipo="hechos"
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center text-blue-200">
          <p className="text-sm">
            Los pedidos se mueven automáticamente de "Primeros Pedidos" a "Pedidos Hechos" 
            cuando se marca como "Listo", y se eliminan cuando se marca como "Realizado".
          </p>
        </div>
      </div>
    </div>
  );
}
