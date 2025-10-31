"use client";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export const useDeliveryOrders = () => {
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [pedidosEntregados, setPedidosEntregados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRestaurantId = () => {
    const restauranteId = localStorage.getItem("restauranteId");
    if (!restauranteId) {
      throw new Error("No hay restaurante seleccionado");
    }
    return restauranteId;
  };

  // Obtener pedidos pendientes
  const fetchPedidosPendientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const restaurantId = getRestaurantId();
      const deliveryRef = collection(db, "restaurantes", restaurantId, "delivery");
      
      // Obtener todos los pedidos y filtrar en memoria
      // Esto es necesario porque Firestore no soporta múltiples where con !=
      let q;
      try {
        q = query(
          deliveryRef,
          orderBy("fechaVenta", "desc")
        );
      } catch (e) {
        // Si fechaVenta no está indexado o no existe, obtener sin ordenar
        q = query(deliveryRef);
      }

      const querySnapshot = await getDocs(q);
      const pedidos = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const status = data.status || "pendiente";
        
        // Filtrar solo pedidos que no estén entregados o cancelados
        if (status !== "entregado" && status !== "cancelado") {
          pedidos.push({
            id: doc.id,
            ...data,
            fechaVenta: data.fechaVenta?.toDate() || data.updatedAt?.toDate() || data.timestamp?.toDate() || new Date(),
          });
        }
      });

      // Ordenar por fechaVenta en memoria si es necesario
      pedidos.sort((a, b) => b.fechaVenta.getTime() - a.fechaVenta.getTime());

      setPedidosPendientes(pedidos);
    } catch (err) {
      console.error("Error fetching pedidos pendientes:", err);
      setError("Error al cargar los pedidos pendientes");
    } finally {
      setLoading(false);
    }
  };

  // Obtener pedidos entregados
  const fetchPedidosEntregados = async () => {
    setLoading(true);
    setError(null);
    try {
      const restaurantId = getRestaurantId();
      const deliveryRef = collection(db, "restaurantes", restaurantId, "delivery");
      
      // Filtrar solo pedidos entregados
      const q = query(
        deliveryRef,
        where("status", "==", "entregado"),
        orderBy("fechaVenta", "desc")
      );

      const querySnapshot = await getDocs(q);
      const pedidos = [];
      querySnapshot.forEach((doc) => {
        pedidos.push({
          id: doc.id,
          ...doc.data(),
          fechaVenta: doc.data().fechaVenta?.toDate() || new Date(),
        });
      });

      setPedidosEntregados(pedidos);
    } catch (err) {
      console.error("Error fetching pedidos entregados:", err);
      setError("Error al cargar los pedidos entregados");
    } finally {
      setLoading(false);
    }
  };

  // Configurar listener en tiempo real para pedidos
  const setupRealtimeListener = () => {
    try {
      const restaurantId = getRestaurantId();
      const deliveryRef = collection(db, "restaurantes", restaurantId, "delivery");

      // Listener para pedidos pendientes - obtener todos y filtrar en memoria
      let qPendientes;
      try {
        qPendientes = query(
          deliveryRef,
          orderBy("fechaVenta", "desc")
        );
      } catch (e) {
        // Si fechaVenta no está indexado o no existe, obtener sin ordenar
        qPendientes = query(deliveryRef);
      }

      const unsubscribePendientes = onSnapshot(qPendientes, (snapshot) => {
        const pedidos = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const status = data.status || "pendiente";
          
          // Filtrar solo pedidos que no estén entregados o cancelados
          if (status !== "entregado" && status !== "cancelado") {
            pedidos.push({
              id: doc.id,
              ...data,
              fechaVenta: data.fechaVenta?.toDate() || data.updatedAt?.toDate() || data.timestamp?.toDate() || new Date(),
            });
          }
        });
        
        // Ordenar por fechaVenta en memoria si es necesario
        pedidos.sort((a, b) => b.fechaVenta.getTime() - a.fechaVenta.getTime());
        
        setPedidosPendientes(pedidos);
      }, (error) => {
        console.error("Error en listener de pedidos pendientes:", error);
        // Intentar sin ordenar si hay error
        const qSimple = query(deliveryRef);
        onSnapshot(qSimple, (snapshot) => {
          const pedidos = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            const status = data.status || "pendiente";
            if (status !== "entregado" && status !== "cancelado") {
              pedidos.push({
                id: doc.id,
                ...data,
                fechaVenta: data.fechaVenta?.toDate() || data.updatedAt?.toDate() || data.timestamp?.toDate() || new Date(),
              });
            }
          });
          pedidos.sort((a, b) => b.fechaVenta.getTime() - a.fechaVenta.getTime());
          setPedidosPendientes(pedidos);
        });
      });

      // Listener para pedidos entregados
      const qEntregados = query(
        deliveryRef,
        where("status", "==", "entregado"),
        orderBy("fechaVenta", "desc")
      );

      const unsubscribeEntregados = onSnapshot(qEntregados, (snapshot) => {
        const pedidos = [];
        snapshot.forEach((doc) => {
          pedidos.push({
            id: doc.id,
            ...doc.data(),
            fechaVenta: doc.data().fechaVenta?.toDate() || new Date(),
          });
        });
        setPedidosEntregados(pedidos);
      });

      return () => {
        unsubscribePendientes();
        unsubscribeEntregados();
      };
    } catch (err) {
      console.error("Error configurando listener:", err);
      return null;
    }
  };

  // Marcar pedido como en camino
  const marcarEnCamino = async (pedidoId) => {
    try {
      const restaurantId = getRestaurantId();
      const pedidoRef = doc(db, "restaurantes", restaurantId, "delivery", pedidoId);
      await updateDoc(pedidoRef, {
        status: "listo", // Usar estado "listo" como en_camino (o podrías usar "en_camino" si lo agregas al schema)
        repartidorId: localStorage.getItem("usuarioId"),
        fechaEnCamino: new Date(),
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("Error marcando pedido como en camino:", err);
      throw err;
    }
  };

  // Marcar pedido como entregado
  const marcarEntregado = async (pedidoId) => {
    try {
      const restaurantId = getRestaurantId();
      const pedidoRef = doc(db, "restaurantes", restaurantId, "delivery", pedidoId);
      await updateDoc(pedidoRef, {
        status: "entregado",
        fechaEntrega: new Date(),
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("Error marcando pedido como entregado:", err);
      throw err;
    }
  };

  return {
    pedidosPendientes,
    pedidosEntregados,
    loading,
    error,
    fetchPedidosPendientes,
    fetchPedidosEntregados,
    setupRealtimeListener,
    marcarEnCamino,
    marcarEntregado,
  };
};

