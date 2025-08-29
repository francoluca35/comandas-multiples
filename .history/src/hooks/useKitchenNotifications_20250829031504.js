"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRestaurant } from "../app/context/RestaurantContext";
import { db } from "../../lib/firebase"; 
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";

const useKitchenNotifications = () => {
  const { restauranteActual: restaurant } = useRestaurant();
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [lastNotification, setLastNotification] = useState(null);
  const [soundType, setSoundType] = useState("simple"); // "simple", "kitchen", "sonido1", "sonido2"
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  // Cargar configuración desde Firestore al montar
  useEffect(() => {
    if (restaurant?.id) {
      loadConfiguration();
    }
  }, [restaurant?.id]);

  // Función para cargar configuración desde Firestore
  const loadConfiguration = async () => {
    try {
      setIsLoading(true);
      const configDoc = await getDoc(doc(db, "restaurantes", restaurant.id, "configuracion", "notificaciones"));
      
      if (configDoc.exists()) {
        const config = configDoc.data();
        console.log("🎵 Configuración cargada desde BD:", config);
        
        // Aplicar configuración guardada
        if (config.isEnabled !== undefined) setIsEnabled(config.isEnabled);
        if (config.volume !== undefined) setVolume(config.volume);
        if (config.soundType !== undefined) setSoundType(config.soundType);
        
        // Validar que el tipo de sonido sea válido
        const validSoundTypes = ["simple", "kitchen", "sonido1", "sonido2"];
        if (!validSoundTypes.includes(config.soundType)) {
          console.log("🎵 Tipo de sonido inválido, usando simple por defecto");
          setSoundType("simple");
        }
      } else {
        console.log("🎵 No hay configuración guardada, usando valores por defecto");
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para guardar configuración en Firestore
  const saveConfiguration = async (config = {}) => {
    if (!restaurant?.id) {
      console.error("No hay restaurante seleccionado para guardar configuración");
      return false;
    }

    try {
      const configToSave = {
        isEnabled: config.isEnabled !== undefined ? config.isEnabled : isEnabled,
        volume: config.volume !== undefined ? config.volume : volume,
        soundType: config.soundType !== undefined ? config.soundType : soundType,
        updatedAt: new Date(),
      };

      await setDoc(doc(db, "restaurantes", restaurant.id, "configuracion", "notificaciones"), configToSave);
      console.log("🎵 Configuración guardada en BD:", configToSave);
      return true;
    } catch (error) {
      console.error("Error guardando configuración:", error);
      return false;
    }
  };

  // Inicializar el audio al montar el componente
  useEffect(() => {
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

  // Función para crear sonido de cocina tradicional
  const createKitchenSound = (audioContext) => {
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const oscillator3 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const compressor = audioContext.createDynamicsCompressor();
    
    oscillator1.connect(filter);
    oscillator2.connect(filter);
    oscillator3.connect(filter);
    filter.connect(compressor);
    compressor.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurar compresor para sonido de cocina
    compressor.threshold.setValueAtTime(-20, audioContext.currentTime);
    compressor.ratio.setValueAtTime(8, audioContext.currentTime);
    
    // Configurar filtro para sonido más cálido
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, audioContext.currentTime);
    filter.Q.setValueAtTime(0.8, audioContext.currentTime);
    
    // Configurar osciladores para sonido de cocina tradicional
    oscillator1.type = 'triangle';  // Sonido más suave
    oscillator2.type = 'sine';      // Sonido base
    oscillator3.type = 'triangle';  // Sonido armónico
    
    // Frecuencias para crear un sonido de cocina tradicional
    oscillator1.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator2.frequency.setValueAtTime(900, audioContext.currentTime);
    oscillator3.frequency.setValueAtTime(1200, audioContext.currentTime);
    
    // Modulación suave para sonido de cocina
    oscillator1.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.2);
    oscillator2.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
    oscillator3.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.2);
    
    oscillator1.frequency.exponentialRampToValueAtTime(750, audioContext.currentTime + 0.4);
    oscillator2.frequency.exponentialRampToValueAtTime(750, audioContext.currentTime + 0.4);
    oscillator3.frequency.exponentialRampToValueAtTime(1050, audioContext.currentTime + 0.4);
    
    // Configurar volumen con envelope suave
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.6, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.4, audioContext.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.2, audioContext.currentTime + 0.4);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.7);
    
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator3.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.7);
    oscillator2.stop(audioContext.currentTime + 0.7);
    oscillator3.stop(audioContext.currentTime + 0.7);
  };

  // Función para reproducir sonido1.mp3
  const playSonido1 = async (audioContext) => {
    try {
      const audio = new Audio('/Audio/sonido1.mp3');
      audio.volume = volume;
      await audio.play();
      console.log("🎵 Sonido 1 reproducido");
    } catch (error) {
      console.error("Error reproduciendo sonido1:", error);
      // Fallback: usar sonido simple
      createSimpleSound(audioContext);
    }
  };

  // Función para reproducir sonido2.mp3
  const playSonido2 = async (audioContext) => {
    try {
      const audio = new Audio('/Audio/sonido2.mp3');
      audio.volume = volume;
      await audio.play();
      console.log("🎵 Sonido 2 reproducido");
    } catch (error) {
      console.error("Error reproduciendo sonido2:", error);
      // Fallback: usar sonido simple
      createSimpleSound(audioContext);
    }
  };

  // Función para reproducir sonido de notificación
  const playNotificationSound = useCallback(async () => {
    if (!isEnabled) return;

    try {
      // Crear contexto de audio
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Crear sonido según el tipo seleccionado
      switch (soundType) {
        case "simple":
          createSimpleSound(audioContext);
          console.log("🔔 Sonido simple reproducido");
          break;
        case "kitchen":
          createKitchenSound(audioContext);
          console.log("🍳 Sonido de cocina tradicional reproducido");
          break;
        case "sonido1":
          await playSonido1(audioContext);
          console.log("🎵 Sonido 1 reproducido");
          break;
        case "sonido2":
          await playSonido2(audioContext);
          console.log("🎵 Sonido 2 reproducido");
          break;
        default:
          createSimpleSound(audioContext);
          console.log("🔔 Sonido simple reproducido");
      }
      
    } catch (error) {
      console.error("Error reproduciendo sonido de notificación:", error);
      
      // Fallback: sonido simple
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        createSimpleSound(audioContext);
        console.log("🔔 Sonido de notificación reproducido (fallback)");
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

  // Función para probar el sonido actual
  const testSound = useCallback(() => {
    showNotification("🔊 Prueba de sonido", "test");
  }, [showNotification]);

  // Función para probar un sonido específico
  const testSpecificSound = useCallback((soundTypeToTest) => {
    if (!isEnabled) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      switch (soundTypeToTest) {
        case "simple":
          createSimpleSound(audioContext);
          console.log("🔊 Probando sonido SIMPLE");
          break;
        case "kitchen":
          createKitchenSound(audioContext);
          console.log("🔊 Probando sonido COCINA");
          break;
        case "sonido1":
          playSonido1(audioContext);
          console.log("🔊 Probando Sonido 1");
          break;
        case "sonido2":
          playSonido2(audioContext);
          console.log("🔊 Probando Sonido 2");
          break;
        default:
          createSimpleSound(audioContext);
          console.log("🔊 Probando sonido SIMPLE");
      }
    } catch (error) {
      console.error("Error probando sonido específico:", error);
    }
  }, [isEnabled, volume]);

  // Función para vibrar el dispositivo (si está soportado)
  const vibrateDevice = useCallback(() => {
    if ('vibrate' in navigator) {
      try {
        // Patrón de vibración: vibrar 3 veces con pausas
        navigator.vibrate([200, 100, 200, 100, 200]);
        console.log("📳 Vibración enviada al dispositivo");
      } catch (error) {
        console.error("Error al vibrar dispositivo:", error);
      }
    } else {
      console.log("📳 Vibración no soportada en este dispositivo");
    }
  }, []);

  // Función para notificar que un pedido está listo
  const notifyOrderReady = useCallback((orderData) => {
    const { mesa, cliente, productos, tipo } = orderData;
    
    let message = "";
    let orderType = "";
    
    if (tipo === "takeaway") {
      orderType = "TAKEAWAY";
      message = `✅ Pedido TAKEAWAY LISTO para ${cliente}`;
    } else if (tipo === "delivery") {
      orderType = "DELIVERY";
      message = `✅ Pedido DELIVERY LISTO para ${cliente}`;
    } else {
      orderType = "SALÓN";
      message = `✅ Pedido MESA ${mesa} LISTO para servir`;
    }

    // Agregar información de productos
    const totalItems = productos?.length || 0;
    message += ` - ${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`;

    // Mostrar notificación visual
    showNotification(message, "order-ready");
    
    // Vibrar dispositivo
    vibrateDevice();
    
    console.log(`🔔 Notificación de pedido listo ${orderType}:`, orderData);
  }, [showNotification, vibrateDevice]);

  return {
    // Estado
    isEnabled,
    volume,
    soundType,
    isLoading,
    lastNotification,
    
    // Funciones de actualización (con guardado automático)
    setIsEnabled: useCallback(async (enabled) => {
      setIsEnabled(enabled);
      if (restaurant?.id) {
        try {
          const configToSave = {
            isEnabled: enabled,
            volume: volume,
            soundType: soundType,
            updatedAt: new Date(),
          };

          await setDoc(doc(db, "restaurantes", restaurant.id, "configuracion", "notificaciones"), configToSave);
          console.log("✅ Estado de notificaciones guardado:", enabled);
        } catch (error) {
          console.error("Error guardando estado de notificaciones:", error);
        }
      }
    }, [restaurant?.id, volume, soundType]),
    
    setVolume: useCallback(async (newVolume) => {
      setVolume(newVolume);
      if (restaurant?.id) {
        try {
          const configToSave = {
            isEnabled: isEnabled,
            volume: newVolume,
            soundType: soundType,
            updatedAt: new Date(),
          };

          await setDoc(doc(db, "restaurantes", restaurant.id, "configuracion", "notificaciones"), configToSave);
          console.log("✅ Volumen guardado:", newVolume);
        } catch (error) {
          console.error("Error guardando volumen:", error);
        }
      }
    }, [restaurant?.id, isEnabled, soundType]),
    
    setSoundType: useCallback(async (newSoundType) => {
      setSoundType(newSoundType);
      if (restaurant?.id) {
        try {
          const configToSave = {
            isEnabled: isEnabled,
            volume: volume,
            soundType: newSoundType,
            updatedAt: new Date(),
          };

          await setDoc(doc(db, "restaurantes", restaurant.id, "configuracion", "notificaciones"), configToSave);
          console.log("✅ Tipo de sonido guardado:", newSoundType);
        } catch (error) {
          console.error("Error guardando tipo de sonido:", error);
        }
      }
    }, [restaurant?.id, isEnabled, volume]),
    
    // Funciones de notificación
    playNotificationSound,
    showNotification,
    notifyNewOrder,
    clearNotification,
    testSound,
    testSpecificSound,
    notifyOrderReady, // Agregar la nueva función
    
    // Funciones de configuración
    saveConfiguration,
    loadConfiguration,
  };
};

export default useKitchenNotifications;
