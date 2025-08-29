"use client";
import { useState, useEffect, useCallback } from "react";
import { useRestaurant } from "../app/context/RestaurantContext";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, query, where, orderBy, limit, doc, updateDoc } from "firebase/firestore";

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
        // Patrón de vibración más notorio: vibrar 4 veces con pausas
        navigator.vibrate([300, 150, 300, 150, 300, 150, 300]);
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
    
    // Crear mensaje personalizado basado en el tipo de pedido
    let message = "";
    let cliente = pedido?.cliente || "Cliente";
    let mesa = pedido?.mesa || "";
    let tipo = pedido?.tipo || "";
    let productos = pedido?.productos || [];
    let totalItems = productos.length;

    if (tipo === "takeaway" || mesa === "TAKEAWAY") {
      message = `Pedido TAKEAWAY de ${cliente} listo para recoger`;
    } else if (tipo === "delivery" || mesa === "DELIVERY") {
      message = `Pedido DELIVERY de ${cliente} listo para entregar`;
    } else {
      message = `Pedido MESA ${mesa} listo para servir`;
    }

    // Agregar información de productos
    message += ` - ${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`;

    // Mostrar notificación en la interfaz (siempre funciona)
    setLastOrderReadyNotification({
      id: Date.now(),
      message,
      type: "order-ready",
      timestamp: new Date(),
      pedido
    });

    // Reproducir sonido y vibrar
    console.log("🔊 Reproduciendo sonido y vibración...");
    playSonido1();
    vibrateDevice();
    console.log("✅ Sonido y vibración ejecutados");

    // Limpiar notificación después de 1 minuto
    setTimeout(() => {
      setLastOrderReadyNotification(null);
    }, 60000); // 1 minuto = 60000ms

    console.log("🔔 Notificación de pedido listo mostrada:", message);
  }, [isEnabled, playSonido1, vibrateDevice]);

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

  // Escuchar notificaciones de pedidos listos
  useEffect(() => {
    if (!restaurant?.id) return;

    console.log("🔔 Iniciando escucha de notificaciones de pedidos listos...");

    const notificationsRef = collection(db, `restaurantes/${restaurant.id}/notificaciones`);
    
    // Consulta simplificada para evitar problemas de índices
    const q = query(
      notificationsRef,
      where("type", "==", "order-ready")
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
              console.log("🔔 Nueva notificación de pedido listo recibida:", notificationData);
              showOrderReadyNotification(notificationData);

              // Intentar marcar como leída, pero no fallar si hay error
              setTimeout(() => {
                markNotificationAsRead(change.doc.id).catch(error => {
                  console.warn("No se pudo marcar notificación como leída:", error);
                });
              }, 1000);
            }
          } catch (processError) {
            console.error("Error procesando notificación:", processError);
            // Continuar con otras notificaciones
          }
        }
      });
    }, (error) => {
      console.error("Error escuchando notificaciones de pedidos listos:", error);
      // Si hay error de índice, usar consulta más simple
      console.log("🔄 Intentando con consulta simplificada...");
    });

    return () => {
      console.log("🔔 Deteniendo escucha de notificaciones de pedidos listos");
      unsubscribe();
    };
  }, [restaurant?.id, showOrderReadyNotification, markNotificationAsRead]);

  // Solicitar permisos de notificación al montar
  useEffect(() => {
    // Solo intentar solicitar permisos si estamos en el navegador
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          Notification.requestPermission().then(permission => {
            console.log("🔔 Permisos de notificación:", permission);
          }).catch(error => {
            console.warn("🔔 Error solicitando permisos de notificación:", error);
          });
        } catch (error) {
          console.warn("🔔 Error con notificaciones del navegador:", error);
        }
      }
    }
  }, []);

  // Función para limpiar notificación manualmente
  const clearNotification = useCallback(() => {
    setLastOrderReadyNotification(null);
  }, []);

  // Función para testear vibración
  const testVibration = useCallback(() => {
    console.log("🧪 Probando vibración...");
    vibrateDevice();
    console.log("🧪 Test de vibración completado");
  }, [vibrateDevice]);

  return {
    lastOrderReadyNotification,
    isEnabled,
    setIsEnabled,
    clearNotification,
    showOrderReadyNotification,
    testVibration
  };
};

export default useOrderReadyNotifications;
