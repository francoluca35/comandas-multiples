"use client";
import { useState, useEffect, useCallback } from "react";
import { useRestaurant } from "../app/context/RestaurantContext";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, query, where, doc, updateDoc } from "firebase/firestore";

const useDeliveryDeliveredNotifications = () => {
  const { restauranteActual: restaurant } = useRestaurant();
  const [notifications, setNotifications] = useState([]);
  const [isEnabled, setIsEnabled] = useState(true);

  // Función para reproducir sonido
  const playSonido = useCallback(async () => {
    try {
      const audio = new Audio('/Audio/sonido1.mp3');
      audio.volume = 0.7;
      await audio.play();
      console.log("🎵 Sonido reproducido para notificación de pedido entregado");
    } catch (error) {
      console.error("Error reproduciendo sonido:", error);
    }
  }, []);

  // Función para vibrar el dispositivo
  const vibrateDevice = useCallback(() => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([300, 150, 300, 150, 300]);
        console.log("📳 Vibración enviada al dispositivo");
      } catch (error) {
        console.error("Error al vibrar dispositivo:", error);
      }
    }
  }, []);

  // Función para mostrar notificación de pedido entregado
  const showDeliveryDeliveredNotification = useCallback((notificationData) => {
    if (!isEnabled) return;

    const { pedido } = notificationData;
    const cliente = pedido?.cliente || "Cliente";
    const total = pedido?.total || 0;
    
    // Crear mensaje
    const message = `Pedido del cliente "${cliente}" se entregó`;

    // Crear nueva notificación
    const newNotification = {
      id: Date.now() + Math.random(),
      message,
      type: "delivery-delivered",
      timestamp: new Date(),
      pedido,
      cliente
    };

    // Agregar a la lista de notificaciones (máximo 5)
    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 5);
      return updated;
    });

    // Reproducir sonido y vibrar
    playSonido();
    vibrateDevice();

    // Limpiar notificación después de 1 minuto
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 60000);

    console.log("🔔 Notificación de pedido entregado mostrada:", message);
  }, [isEnabled, playSonido, vibrateDevice]);

  // Función para marcar notificación como leída
  const markNotificationAsRead = useCallback(async (notificationId) => {
    if (!restaurant?.id) return;
    
    try {
      const docRef = doc(db, `restaurantes/${restaurant.id}/notificaciones`, notificationId);
      await updateDoc(docRef, { 
        leida: true,
        leidaAt: new Date()
      });
      console.log("✅ Notificación marcada como leída:", notificationId);
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
    }
  }, [restaurant?.id]);

  // Escuchar notificaciones de pedidos entregados desde Firestore
  useEffect(() => {
    if (!restaurant?.id) return;

    console.log("🔔 Iniciando escucha de notificaciones de pedidos entregados...");

    const notificationsRef = collection(db, `restaurantes/${restaurant.id}/notificaciones`);
    
    const q = query(
      notificationsRef,
      where("type", "==", "delivery-delivered")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          try {
            const notificationData = {
              id: change.doc.id,
              ...change.doc.data()
            };
            
            // Solo procesar notificaciones no leídas
            if (!notificationData.leida) {
              console.log("🔔 Nueva notificación de pedido entregado recibida:", notificationData);
              showDeliveryDeliveredNotification(notificationData);

              // Intentar marcar como leída después de un segundo
              setTimeout(() => {
                markNotificationAsRead(change.doc.id).catch(error => {
                  console.warn("No se pudo marcar notificación como leída:", error);
                });
              }, 1000);
            }
          } catch (processError) {
            console.error("Error procesando notificación:", processError);
          }
        }
      });
    }, (error) => {
      console.error("Error escuchando notificaciones de pedidos entregados:", error);
    });

    return () => {
      console.log("🔔 Deteniendo escucha de notificaciones de pedidos entregados");
      unsubscribe();
    };
  }, [restaurant?.id, showDeliveryDeliveredNotification, markNotificationAsRead]);

  // Función para limpiar notificación manualmente
  const clearNotification = useCallback((notificationId) => {
    if (notificationId) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } else {
      setNotifications([]);
    }
  }, []);

  // Función para limpiar todas las notificaciones
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    lastDeliveryDeliveredNotification: notifications[0] || null,
    isEnabled,
    setIsEnabled,
    clearNotification,
    clearAllNotifications
  };
};

export default useDeliveryDeliveredNotifications;

