"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const useKitchenNotifications = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [lastNotification, setLastNotification] = useState(null);
  const [soundType, setSoundType] = useState("powerful"); // "powerful", "simple", "alarm", "kitchen"
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

  // Función para crear sonido potente (alarma de cocina)
  const createPowerfulSound = (audioContext) => {
    // Crear múltiples osciladores para un sonido más rico y llamativo
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const oscillator3 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const compressor = audioContext.createDynamicsCompressor();
    
    // Conectar los nodos para un sonido más potente
    oscillator1.connect(filter);
    oscillator2.connect(filter);
    oscillator3.connect(filter);
    filter.connect(compressor);
    compressor.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurar compresor para un sonido más potente y llamativo
    compressor.threshold.setValueAtTime(-24, audioContext.currentTime);
    compressor.knee.setValueAtTime(30, audioContext.currentTime);
    compressor.ratio.setValueAtTime(12, audioContext.currentTime);
    compressor.attack.setValueAtTime(0.003, audioContext.currentTime);
    compressor.release.setValueAtTime(0.25, audioContext.currentTime);
    
    // Configurar filtro para un sonido más agresivo
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3500, audioContext.currentTime);
    filter.Q.setValueAtTime(1.5, audioContext.currentTime);
    
    // Configurar osciladores para un sonido tipo alarma de cocina
    oscillator1.type = 'square';  // Sonido más agresivo y llamativo
    oscillator2.type = 'sawtooth'; // Sonido más rico en armónicos
    oscillator3.type = 'triangle'; // Sonido más suave para balance
    
    // Frecuencias para crear un sonido de alerta potente
    oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime);
    oscillator3.frequency.setValueAtTime(600, audioContext.currentTime);
    
    // Modulación de frecuencia para hacer el sonido más dinámico y llamativo
    oscillator1.frequency.exponentialRampToValueAtTime(1400, audioContext.currentTime + 0.1);
    oscillator2.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
    oscillator3.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.1);
    
    // Segunda modulación para más variación y llamar la atención
    oscillator1.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.2);
    oscillator2.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.2);
    oscillator3.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
    
    // Tercera modulación para un sonido más complejo
    oscillator1.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.3);
    oscillator2.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.3);
    oscillator3.frequency.exponentialRampToValueAtTime(1100, audioContext.currentTime + 0.3);
    
    // Configurar volumen con envelope más agresivo y potente
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.9, audioContext.currentTime + 0.02); // Máximo volumen
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.7, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.5, audioContext.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8); // Duración más larga
    
    // Reproducir el sonido
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator3.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.8);
    oscillator2.stop(audioContext.currentTime + 0.8);
    oscillator3.stop(audioContext.currentTime + 0.8);
  };

  // Función para crear sonido simple
  const createSimpleSound = (audioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.5, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // Función para crear sonido de alarma industrial
  const createAlarmSound = (audioContext) => {
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const compressor = audioContext.createDynamicsCompressor();
    
    oscillator1.connect(compressor);
    oscillator2.connect(compressor);
    compressor.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurar compresor para sonido industrial
    compressor.threshold.setValueAtTime(-30, audioContext.currentTime);
    compressor.ratio.setValueAtTime(20, audioContext.currentTime);
    
    oscillator1.type = 'square';
    oscillator2.type = 'square';
    
    // Frecuencias alternadas para efecto de alarma
    oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime);
    
    // Modulación rápida para efecto de sirena
    oscillator1.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
    oscillator2.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
    oscillator1.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
    oscillator2.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2);
    oscillator1.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.3);
    oscillator2.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
    oscillator1.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.4);
    oscillator2.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.4);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.8, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.6, audioContext.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
    
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.6);
    oscillator2.stop(audioContext.currentTime + 0.6);
  };

  // Función para reproducir sonido de notificación
  const playNotificationSound = useCallback(async () => {
    if (!isEnabled) return;

    try {
      // Crear contexto de audio
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Crear sonido según el tipo seleccionado
      switch (soundType) {
        case "powerful":
          createPowerfulSound(audioContext);
          console.log("🔔 Sonido POTENTE tipo alarma de cocina reproducido");
          break;
        case "simple":
          createSimpleSound(audioContext);
          console.log("🔔 Sonido simple reproducido");
          break;
        case "alarm":
          createAlarmSound(audioContext);
          console.log("🚨 Sonido de alarma industrial reproducido");
          break;
        default:
          createPowerfulSound(audioContext);
          console.log("🔔 Sonido POTENTE tipo alarma de cocina reproducido");
      }
      
    } catch (error) {
      console.error("Error reproduciendo sonido de notificación:", error);
      
      // Fallback: sonido simple pero más potente
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const compressor = audioContext.createDynamicsCompressor();
        
        oscillator.connect(compressor);
        compressor.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configurar compresor para sonido más potente
        compressor.threshold.setValueAtTime(-24, audioContext.currentTime);
        compressor.ratio.setValueAtTime(12, audioContext.currentTime);
        
        oscillator.type = 'square'; // Sonido más agresivo
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1800, audioContext.currentTime + 0.2);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.8, audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
        
        console.log("🔔 Sonido de notificación reproducido (fallback potente)");
      } catch (fallbackError) {
        console.error("Error en fallback de sonido:", fallbackError);
      }
    }
  }, [isEnabled, volume, soundType]);

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
    soundType,
    setSoundType,
    lastNotification,
    playNotificationSound,
    showNotification,
    notifyNewOrder,
    clearNotification,
    testSound,
  };
};

export default useKitchenNotifications;
