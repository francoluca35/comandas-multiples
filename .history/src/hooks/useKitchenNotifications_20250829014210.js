"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const useKitchenNotifications = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [lastNotification, setLastNotification] = useState(null);
  const audioRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  // Inicializar el audio al montar el componente
  useEffect(() => {
    // Crear el elemento de audio
    audioRef.current = new Audio("/notification-sound.mp3");
    audioRef.current.volume = volume;
    audioRef.current.preload = "auto";
    
    // Manejar errores de carga de audio
    audioRef.current.onerror = () => {
      console.warn("⚠️ No se pudo cargar el archivo de audio, usando sonido generado");
    };
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  // Actualizar volumen cuando cambie
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Función para reproducir sonido de notificación
  const playNotificationSound = useCallback(async () => {
    if (!isEnabled || !audioRef.current) return;

    try {
      // Intentar reproducir el archivo de audio
      if (audioRef.current.readyState >= 2) { // HAVE_CURRENT_DATA o superior
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        console.log("🔔 Sonido de notificación reproducido (archivo)");
      } else {
        // Fallback: generar sonido usando Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Crear un oscilador para generar el sonido
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Conectar los nodos
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configurar el sonido
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Frecuencia inicial
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1); // Subir frecuencia
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2); // Bajar frecuencia
        
        // Configurar el volumen
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        // Reproducir el sonido
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        console.log("🔔 Sonido de notificación reproducido (generado)");
      }
    } catch (error) {
      console.error("Error reproduciendo sonido de notificación:", error);
      
      // Último fallback: sonido simple
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        gainNode.gain.setValueAtTime(volume * 0.2, audioContext.currentTime);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        
        console.log("🔔 Sonido de notificación reproducido (fallback)");
      } catch (fallbackError) {
        console.error("Error en fallback de sonido:", fallbackError);
      }
    }
  }, [isEnabled, volume]);

  // Función para mostrar notificación visual
  const showNotification = useCallback((message, type = "info") => {
    if (!isEnabled) return;

    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
    };

    setLastNotification(notification);

    // Limpiar la notificación después de 5 segundos
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    notificationTimeoutRef.current = setTimeout(() => {
      setLastNotification(null);
    }, 5000);

    // Reproducir sonido
    playNotificationSound();

    console.log("🔔 Notificación mostrada:", notification);
  }, [isEnabled, playNotificationSound]);

  // Función para notificar nuevo pedido
  const notifyNewOrder = useCallback((orderData) => {
    const { mesa, cliente, productos, tipo } = orderData;
    
    let message = "";
    let orderType = "";
    
    if (tipo === "takeaway") {
      orderType = "TAKEAWAY";
      message = `🆕 Nuevo pedido TAKEAWAY para ${cliente}`;
    } else if (tipo === "delivery") {
      orderType = "DELIVERY";
      message = `🆕 Nuevo pedido DELIVERY para ${cliente}`;
    } else {
      orderType = "SALÓN";
      message = `🆕 Nuevo pedido MESA ${mesa}`;
    }

    // Agregar información de productos
    const totalItems = productos?.length || 0;
    message += ` - ${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`;

    showNotification(message, "new-order");
    
    console.log(`🔔 Notificación de nuevo pedido ${orderType}:`, orderData);
  }, [showNotification]);

  // Función para limpiar notificación manualmente
  const clearNotification = useCallback(() => {
    setLastNotification(null);
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
  }, []);

  // Función para probar el sonido
  const testSound = useCallback(() => {
    showNotification("🔊 Prueba de sonido", "test");
  }, [showNotification]);

  return {
    isEnabled,
    setIsEnabled,
    volume,
    setVolume,
    lastNotification,
    playNotificationSound,
    showNotification,
    notifyNewOrder,
    clearNotification,
    testSound,
  };
};

export default useKitchenNotifications;
