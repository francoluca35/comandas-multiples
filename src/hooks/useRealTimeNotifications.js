"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const useRealTimeNotifications = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const onNewOrderCallbackRef = useRef(null);

  // Función para obtener el restaurantId
  const getRestaurantId = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("restauranteId");
    }
    return null;
  };

  // Función para conectar al SSE
  const connect = useCallback(() => {
    const restauranteId = getRestaurantId();
    if (!restauranteId) {
      console.error("❌ No se encontró restauranteId");
      return;
    }

    // Cerrar conexión existente si hay una
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      console.log("🔌 Conectando a SSE...");
      setConnectionStatus("connecting");

      const eventSource = new EventSource(`/api/pedidos-cocina/events?restauranteId=${restauranteId}`);
      eventSourceRef.current = eventSource;

      // Evento de conexión abierta
      eventSource.onopen = () => {
        console.log("✅ SSE: Conexión establecida");
        setIsConnected(true);
        setConnectionStatus("connected");
      };

      // Evento de mensaje recibido
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 SSE: Mensaje recibido:", data);

          switch (data.type) {
            case "connected":
              console.log("✅ SSE: Conexión confirmada");
              break;
            
            case "new-order":
              console.log("🔔 SSE: Nuevo pedido recibido:", data.data);
              if (onNewOrderCallbackRef.current) {
                onNewOrderCallbackRef.current(data.data);
              }
              break;
            
            case "error":
              console.error("❌ SSE: Error del servidor:", data.message);
              break;
            
            default:
              console.log("📨 SSE: Mensaje desconocido:", data);
          }
        } catch (error) {
          console.error("❌ SSE: Error parseando mensaje:", error);
        }
      };

      // Evento de error
      eventSource.onerror = (error) => {
        console.error("❌ SSE: Error de conexión:", error);
        setIsConnected(false);
        setConnectionStatus("error");
        
        // Intentar reconectar después de 5 segundos
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 SSE: Intentando reconectar...");
          connect();
        }, 5000);
      };

    } catch (error) {
      console.error("❌ SSE: Error iniciando conexión:", error);
      setConnectionStatus("error");
    }
  }, []);

  // Función para desconectar
  const disconnect = useCallback(() => {
    console.log("🔌 SSE: Desconectando...");
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus("disconnected");
  }, []);

  // Función para establecer callback de nuevo pedido
  const onNewOrder = useCallback((callback) => {
    onNewOrderCallbackRef.current = callback;
  }, []);

  // Conectar al montar el componente
  useEffect(() => {
    console.log("🚀 Hook useRealTimeNotifications: Iniciando...");
    connect();

    // Cleanup al desmontar
    return () => {
      console.log("🧹 Hook useRealTimeNotifications: Limpiando...");
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    onNewOrder,
  };
};

export default useRealTimeNotifications;
