import { useState, useEffect, useRef } from "react";

const usePedidosCocina = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const pollingIntervalRef = useRef(null);
  const lastPedidosRef = useRef([]);

  // Función para obtener el restaurantId desde localStorage
  const getRestaurantId = () => {
    if (typeof window !== "undefined") {
      const restaurantId = localStorage.getItem("restauranteId");
      if (!restaurantId) {
        throw new Error("No se encontró el ID del restaurante");
      }
      return restaurantId;
    }
    return null;
  };

  // Obtener todos los pedidos de cocina
  const fetchPedidos = async (estado = null) => {
    try {
      setLoading(true);
      setError(null);

      const restauranteId = getRestaurantId();
      let url = `/api/pedidos-cocina?restauranteId=${restauranteId}`;

      if (estado) {
        url += `&estado=${estado}`;
      }

      console.log("🔍 Fetching pedidos desde:", url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Error al obtener los pedidos");
      }

      const data = await response.json();
      console.log("📊 Pedidos obtenidos:", data.length, "pedidos");
      console.log("📋 Datos completos:", data);
      
      // Detectar nuevos pedidos comparando con el estado anterior
      const nuevosPedidos = detectarNuevosPedidos(data);
      if (nuevosPedidos.length > 0) {
        console.log("🆕 Nuevos pedidos detectados:", nuevosPedidos);
      }
      
      setPedidos(data);
      setLastUpdate(new Date());
      lastPedidosRef.current = data;
    } catch (err) {
      setError(err.message);
      console.error("Error al obtener pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para detectar nuevos pedidos
  const detectarNuevosPedidos = (nuevosPedidos) => {
    if (lastPedidosRef.current.length === 0) {
      return [];
    }

    const pedidosAnteriores = lastPedidosRef.current;
    const nuevos = nuevosPedidos.filter(nuevo => {
      // Buscar si el pedido ya existía en la lista anterior
      const existe = pedidosAnteriores.find(anterior => anterior.id === nuevo.id);
      return !existe;
    });

    return nuevos;
  };

  // Iniciar polling automático
  const startPolling = () => {
    console.log("🔄 Iniciando polling automático de pedidos...");
    
    // Limpiar intervalo existente si hay uno
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Polling cada 3 segundos
    pollingIntervalRef.current = setInterval(() => {
      console.log("🔄 Polling: Actualizando pedidos...");
      fetchPedidos();
    }, 3000);
  };

  // Detener polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      console.log("🛑 Deteniendo polling automático...");
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Crear un nuevo pedido de cocina
  const crearPedido = async (pedidoData) => {
    try {
      setLoading(true);
      setError(null);

      const restauranteId = getRestaurantId();

      const response = await fetch("/api/pedidos-cocina", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          ...pedidoData,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear el pedido");
      }

      const data = await response.json();

      // Agregar el nuevo pedido a la lista
      setPedidos((prev) => [data, ...prev]);

      return data;
    } catch (err) {
      setError(err.message);
      console.error("Error al crear pedido:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estado de un pedido
  const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      setLoading(true);
      setError(null);

      const restauranteId = getRestaurantId();

      const response = await fetch("/api/pedidos-cocina", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          pedidoId,
          nuevoEstado,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el pedido");
      }

      // Actualizar el pedido en el estado local
      setPedidos((prev) =>
        prev.map((pedido) =>
          pedido.id === pedidoId
            ? { ...pedido, estado: nuevoEstado, updatedAt: new Date() }
            : pedido
        )
      );

      return true;
    } catch (err) {
      setError(err.message);
      console.error("Error al actualizar pedido:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener pedidos por estado
  const getPedidosPorEstado = (estado) => {
    return pedidos.filter((pedido) => pedido.estado === estado);
  };

  // Obtener pedidos pendientes (para "Primeros Pedidos")
  const getPedidosPendientes = () => {
    return getPedidosPorEstado("pendiente");
  };

  // Obtener pedidos en preparación (para "Primeros Pedidos")
  const getPedidosEnPreparacion = () => {
    return getPedidosPorEstado("en_preparacion");
  };

  // Obtener pedidos listos (para "Pedidos Hechos")
  const getPedidosListos = () => {
    return getPedidosPorEstado("listo");
  };

  // Efecto para iniciar polling al montar el componente
  useEffect(() => {
    console.log("🍳 Hook usePedidosCocina: Iniciando...");
    fetchPedidos();
    startPolling();

    // Cleanup al desmontar
    return () => {
      stopPolling();
    };
  }, []);

  return {
    pedidos,
    loading,
    error,
    lastUpdate,
    fetchPedidos,
    crearPedido,
    actualizarEstadoPedido,
    getPedidosPorEstado,
    getPedidosPendientes,
    getPedidosEnPreparacion,
    getPedidosListos,
    startPolling,
    stopPolling,
  };
};

export default usePedidosCocina;
