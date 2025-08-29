"use client";
import { useState, useEffect, useCallback } from "react";
import { useRestaurant } from "../app/context/RestaurantContext";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";

const useOrderReadyNotifications = () => {
  const { restauranteActual: restaurant } = useRestaurant();
  const [lastOrderReadyNotification, setLastOrderReadyNotification] = useState(null);
  const [isEnabled, setIsEnabled] = useState(true);

  // Función para reproducir sonido 1
  const playSonido1 = useCallback(async () => {
    try {
      const audio = new Audio('/Audio/sonido1.mp3');
      audio.volume = 0.7; // Volumen fijo para notificaciones
      await audio.play();
      console.log("🎵 Sonido 1 reproducido para notificación de pedido listo");
    } catch (error) {
      console.error("Error reproduciendo sonido1:", error);
    }
  }, []);

  // Función para vibrar el dispositivo
  const vibrateDevice = useCallback(() => {
    if ('vibrate' in navigator) {
      try {
        // Patrón de vibración: vibrar 3 veces con pausas
        navigator.vibrate([200, 100, 200, 100, 200]);
        console.log("📳 Vibración enviada al dispositivo para pedido listo");
      } catch (error) {
        console.error("Error al vibrar dispositivo:", error);
      }
    } else {
      console.log("📳 Vibración no soportada en este dispositivo");
    }
  }, []);

  // Función para mostrar notificación de pedido listo
  const showOrderReadyNotification = useCallback((notificationData) => {
    if (!isEnabled) return;

    const { pedido } = notificationData;
    let message = "";
    
    if (pedido.tipo === "takeaway") {
      message = `✅ Pedido TAKEAWAY LISTO para ${pedido.cliente}`;
    } else if (pedido.tipo === "delivery") {
      message = `✅ Pedido DELIVERY LISTO para ${pedido.cliente}`;
    } else {
      message = `✅ Pedido MESA ${pedido.mesa} LISTO para servir`;
    }

    // Agregar información de productos
    const totalItems = pedido.productos?.length || 0;
    message += ` - ${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`;

    // Crear notificación del navegador si está disponible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pedido Listo', {
        body: message,
        icon: '/logo-d.png',
        badge: '/logo-d.png',
        tag: 'order-ready',
        requireInteraction: false,
        silent: false
      });
    }

    // Mostrar notificación en la interfaz
    setLastOrderReadyNotification({
      id: Date.now(),
      message,
      type: "order-ready",
      timestamp: new Date(),
      pedido
    });

    // Reproducir sonido y vibrar
    playSonido1();
    vibrateDevice();

    // Limpiar notificación después de 1 minuto
    setTimeout(() => {
      setLastOrderReadyNotification(null);
    }, 60000); // 1 minuto = 60000ms

    console.log("🔔 Notificación de pedido listo mostrada:", message);
  }, [isEnabled, playSonido1, vibrateDevice]);

  // Escuchar notificaciones de pedidos listos
  useEffect(() => {
    if (!restaurant?.id) return;

    console.log("🔔 Iniciando escucha de notificaciones de pedidos listos...");

    const notificationsRef = collection(db, `restaurantes/${restaurant.id}/notificaciones`);
    const q = query(
      notificationsRef,
      where("type", "==", "order-ready"),
      where("leida", "==", false)
      // Removemos orderBy para evitar necesidad de índice compuesto
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notificationData = {
            id: change.doc.id,
            ...change.doc.data()
          };
          
          console.log("🔔 Nueva notificación de pedido listo recibida:", notificationData);
          showOrderReadyNotification(notificationData);

          // Marcar como leída
          change.doc.ref.update({ leida: true });
        }
      });
    }, (error) => {
      console.error("Error escuchando notificaciones de pedidos listos:", error);
    });

    return () => {
      console.log("🔔 Deteniendo escucha de notificaciones de pedidos listos");
      unsubscribe();
    };
  }, [restaurant?.id, showOrderReadyNotification]);

  // Solicitar permisos de notificación al montar
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Función para limpiar notificación manualmente
  const clearNotification = useCallback(() => {
    setLastOrderReadyNotification(null);
  }, []);

  return {
    lastOrderReadyNotification,
    isEnabled,
    setIsEnabled,
    clearNotification,
    showOrderReadyNotification
  };
};

export default useOrderReadyNotifications;
