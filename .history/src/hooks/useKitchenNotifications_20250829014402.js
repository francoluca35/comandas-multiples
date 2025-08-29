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
    // No necesitamos crear un elemento de audio predefinido
    // Usaremos Web Audio API para generar sonidos dinámicamente
    
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
    if (!isEnabled) return;

    try {
      // Crear contexto de audio
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Crear un sonido de notificación profesional
      const createNotificationSound = () => {
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        // Conectar los nodos
        oscillator1.connect(filter);
        oscillator2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configurar filtro
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, audioContext.currentTime);
        
        // Configurar osciladores
        oscillator1.type = 'sine';
        oscillator2.type = 'triangle';
        
        // Frecuencias para crear un sonido de notificación
        oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime);
        
        // Modulación de frecuencia para hacer el sonido más interesante
        oscillator1.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.1);
        oscillator2.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
        
        // Configurar volumen con envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.4, audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(volume * 0.2, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
        
        // Reproducir el sonido
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.4);
        oscillator2.stop(audioContext.currentTime + 0.4);
      };
      
      createNotificationSound();
      console.log("🔔 Sonido de notificación reproducido");
      
    } catch (error) {
      console.error("Error reproduciendo sonido de notificación:", error);
      
      // Fallback: sonido simple
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
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
