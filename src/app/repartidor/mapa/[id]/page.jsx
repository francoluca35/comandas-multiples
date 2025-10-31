"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDeliveryOrders } from "../../../../hooks/useDeliveryOrders";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";
import Swal from "sweetalert2";

export default function MapaPedido() {
  const router = useRouter();
  const params = useParams();
  const pedidoId = params.id;
  
  const { marcarEnCamino, marcarEntregado } = useDeliveryOrders();
  
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recorridoIniciado, setRecorridoIniciado] = useState(false);
  const [puedeEntregar, setPuedeEntregar] = useState(false);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    // Verificar autenticación (case-insensitive)
    const rol = (localStorage.getItem("rol") || "").toLowerCase();
    if (rol !== "repartidor") {
      router.push("/repartidor/login");
      return;
    }

    // Cargar pedido
    cargarPedido();

    // Limpiar watch cuando se desmonte el componente
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const cargarPedido = async () => {
    try {
      const restaurantId = localStorage.getItem("restauranteId");
      const pedidoRef = doc(db, "restaurantes", restaurantId, "delivery", pedidoId);
      const pedidoDoc = await getDoc(pedidoRef);
      
      if (pedidoDoc.exists()) {
        const pedidoData = {
          id: pedidoDoc.id,
          ...pedidoDoc.data(),
        };
        setPedido(pedidoData);
      } else {
        Swal.fire("Error", "Pedido no encontrado", "error");
        router.push("/repartidor/dashboard");
      }
    } catch (error) {
      console.error("Error cargando pedido:", error);
      Swal.fire("Error", "Error al cargar el pedido", "error");
      router.push("/repartidor/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const iniciarRecorrido = async () => {
    try {
      await marcarEnCamino(pedidoId);
      setRecorridoIniciado(true);
      
      // Obtener ubicación actual
      obtenerUbicacionActual();
      
      // Iniciar seguimiento de ubicación
      iniciarSeguimientoUbicacion();
      
      Swal.fire("¡Recorrido iniciado!", "El pedido ha sido marcado como en camino", "success");
    } catch (error) {
      console.error("Error iniciando recorrido:", error);
      Swal.fire("Error", "Error al iniciar el recorrido", "error");
    }
  };

  const obtenerUbicacionActual = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacionActual({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
        }
      );
    }
  };

  const iniciarSeguimientoUbicacion = () => {
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const nuevaUbicacion = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUbicacionActual(nuevaUbicacion);
          
          // Verificar si está cerca del destino (si tenemos coordenadas del destino)
          // Por ahora, simplemente habilitamos el botón después de unos segundos
          // En producción, aquí se compararían las coordenadas del destino
        },
        (error) => {
          console.error("Error en seguimiento de ubicación:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
      
      setWatchId(id);
      
      // Habilitar botón entregar después de 30 segundos (simulación)
      // En producción, esto se haría cuando las coordenadas coincidan
      setTimeout(() => {
        setPuedeEntregar(true);
      }, 30000);
    }
  };

  const entregarPedido = async () => {
    try {
      const result = await Swal.fire({
        title: "¿Confirmar entrega?",
        text: "¿Estás seguro de que el pedido ha sido entregado?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, entregado",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
      });

      if (result.isConfirmed) {
        await marcarEntregado(pedidoId);
        Swal.fire("¡Entregado!", "El pedido ha sido marcado como entregado", "success");
        router.push("/repartidor/dashboard");
      }
    } catch (error) {
      console.error("Error entregando pedido:", error);
      Swal.fire("Error", "Error al marcar el pedido como entregado", "error");
    }
  };

  const handleCerrar = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    router.push("/repartidor/dashboard");
  };

  if (loading || !pedido) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  // Obtener datos del pedido
  const cliente = pedido.cliente || pedido.clientData?.name || "Sin nombre";
  const direccion = pedido.direccion || pedido.clientData?.address || "Sin dirección";
  const total = pedido.total || pedido.monto || 0;
  const productos = pedido.productos || [];

  // Calcular tiempo estimado (simulación)
  const tiempoEstimado = 27; // minutos
  const distanciaEstimada = 8.3; // millas

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Botón cerrar */}
      <button
        onClick={handleCerrar}
        className="absolute top-4 right-4 z-20 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
      >
        <span className="text-gray-900 text-xl font-bold">×</span>
      </button>

      {/* Mapa (simulado) */}
      <div className="h-1/2 bg-gray-700 relative">
        {/* Simulación de mapa con ruta */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400 text-sm">
            Mapa con ruta al destino
          </div>
          {/* Aquí se podría integrar Google Maps o Mapbox */}
        </div>
        
        {/* Indicador de ubicación */}
        {ubicacionActual && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
          </div>
        )}
      </div>

      {/* Panel de información */}
      <div className="bg-white rounded-t-3xl absolute bottom-0 left-0 right-0 h-1/2 overflow-y-auto">
        <div className="p-6">
          {/* Botón Delivery/Iniciar Recorrido */}
          <button
            onClick={recorridoIniciado ? undefined : iniciarRecorrido}
            disabled={recorridoIniciado}
            className={`w-full py-3 px-4 rounded-full font-semibold mb-4 flex items-center justify-center space-x-2 ${
              recorridoIniciado
                ? "bg-green-600 text-white"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {recorridoIniciado ? (
              <>
                <span>Delivery en curso</span>
              </>
            ) : (
              <>
                <span>Iniciar recorrido</span>
              </>
            )}
          </button>

          {/* Total */}
          <div className="mb-4">
            <p className="text-3xl font-bold text-black mb-1">
              ${total.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Includes expected tip</p>
          </div>

          {/* Tiempo y distancia */}
          <div className="mb-6 flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-black font-semibold">
              {tiempoEstimado} min ({distanciaEstimada} mi) total
            </span>
          </div>

          {/* Origen y destino */}
          <div className="space-y-4 mb-6">
            {/* Origen (restaurante) */}
            <div className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <div className="w-0.5 h-full bg-gray-300 mt-1 mb-1"></div>
              </div>
              <div className="flex-1">
                <p className="text-black font-semibold">Serafina Scarsdale</p>
                <p className="text-sm text-gray-500">Restaurante</p>
              </div>
            </div>

            {/* Destino (cliente) */}
            <div className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-black font-semibold">{cliente}</p>
                <p className="text-sm text-gray-500">{direccion}</p>
              </div>
            </div>
          </div>

          {/* Botón entregar */}
          {recorridoIniciado && (
            <button
              onClick={entregarPedido}
              disabled={!puedeEntregar}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg ${
                puedeEntregar
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } transition-colors`}
            >
              {puedeEntregar ? "Entregar" : "Llegando al destino..."}
            </button>
          )}

          {/* Información adicional */}
          {productos.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Productos:</p>
              <ul className="space-y-1">
                {productos.slice(0, 5).map((producto, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    • {producto.nombre || producto.name} x{producto.cantidad || 1}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

