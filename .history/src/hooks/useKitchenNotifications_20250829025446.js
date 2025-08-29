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
  const [soundType, setSoundType] = useState("powerful"); // "powerful", "simple", "alarm", "kitchen", "custom"
  const [customAudioFile, setCustomAudioFile] = useState(null);
  const [customAudioUrl, setCustomAudioUrl] = useState(null);
  const [customAudioData, setCustomAudioData] = useState(null); // Para guardar en BD
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
        
        // Cargar archivo personalizado si existe
        if (config.customAudioData && config.soundType === "custom") {
          try {
            // Convertir base64 de vuelta a archivo
            const byteCharacters = atob(config.customAudioData.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: config.customAudioMimeType || 'audio/mp3' });
            const file = new File([blob], config.customAudioName || 'custom-audio.mp3', { type: config.customAudioMimeType || 'audio/mp3' });
            
            setCustomAudioFile(file);
            setCustomAudioData(config.customAudioData);
            const url = URL.createObjectURL(file);
            setCustomAudioUrl(url);
            
            console.log("🎵 Archivo personalizado cargado desde BD:", file.name);
          } catch (error) {
            console.error("Error cargando archivo personalizado:", error);
            // Si falla, usar sonido por defecto
            setSoundType("powerful");
          }
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
        customAudioData: config.customAudioData !== undefined ? config.customAudioData : customAudioData,
        customAudioName: config.customAudioName !== undefined ? config.customAudioName : customAudioFile?.name,
        customAudioMimeType: config.customAudioMimeType !== undefined ? config.customAudioMimeType : customAudioFile?.type,
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
      // Limpiar URL del archivo personalizado
      if (customAudioUrl) {
        URL.revokeObjectURL(customAudioUrl);
      }
    };
  }, [customAudioUrl]);

  // Actualizar volumen cuando cambie
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Función para manejar archivo de audio personalizado
  const handleCustomAudioFile = useCallback(async (file) => {
    // Validar que sea un archivo de audio
    if (!file.type.startsWith('audio/')) {
      console.error('El archivo debe ser un archivo de audio');
      return false;
    }

    try {
      // Convertir archivo a base64 para guardar en BD
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        setCustomAudioData(base64Data);
        
        // Limpiar URL anterior si existe
        if (customAudioUrl) {
          URL.revokeObjectURL(customAudioUrl);
        }

        // Crear nueva URL para el archivo
        const url = URL.createObjectURL(file);
        setCustomAudioFile(file);
        setCustomAudioUrl(url);
        setSoundType("custom");
        
        // Guardar en BD
        await saveConfiguration({
          soundType: "custom",
          customAudioData: base64Data,
          customAudioName: file.name,
          customAudioMimeType: file.type,
        });
        
        console.log("🎵 Archivo de audio personalizado cargado y guardado:", file.name);
      };
      reader.readAsDataURL(file);
      
      return true;
    } catch (error) {
      console.error("Error procesando archivo personalizado:", error);
      return false;
    }
  }, [customAudioUrl, saveConfiguration]);

  // Función para actualizar configuración y guardar en BD
  const updateConfiguration = useCallback(async (updates) => {
    try {
      // Aplicar cambios localmente
      if (updates.isEnabled !== undefined) setIsEnabled(updates.isEnabled);
      if (updates.volume !== undefined) setVolume(updates.volume);
      if (updates.soundType !== undefined) setSoundType(updates.soundType);
      
      // Guardar en BD
      const success = await saveConfiguration(updates);
      
      if (success) {
        console.log("🎵 Configuración actualizada y guardada:", updates);
        return true;
      } else {
        console.error("Error guardando configuración");
        return false;
      }
    } catch (error) {
      console.error("Error actualizando configuración:", error);
      return false;
    }
  }, [saveConfiguration]);

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

  // Función para crear sonido de notificación de WhatsApp
  const createAlarmSound = (audioContext) => {
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const compressor = audioContext.createDynamicsCompressor();
    
    oscillator1.connect(filter);
    oscillator2.connect(filter);
    filter.connect(compressor);
    compressor.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurar compresor para sonido de WhatsApp
    compressor.threshold.setValueAtTime(-20, audioContext.currentTime);
    compressor.ratio.setValueAtTime(8, audioContext.currentTime);
    compressor.attack.setValueAtTime(0.005, audioContext.currentTime);
    compressor.release.setValueAtTime(0.1, audioContext.currentTime);
    
    // Configurar filtro para sonido limpio y claro
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4000, audioContext.currentTime);
    filter.Q.setValueAtTime(0.8, audioContext.currentTime);
    
    // Configurar osciladores para sonido de WhatsApp
    oscillator1.type = 'sine';      // Sonido principal limpio
    oscillator2.type = 'triangle';  // Sonido armónico suave
    
    const baseTime = audioContext.currentTime;
    
    // Patrón de WhatsApp: tres tonos ascendentes + tono final más bajo
    // Primer tono (más bajo)
    oscillator1.frequency.setValueAtTime(800, baseTime);
    oscillator2.frequency.setValueAtTime(1200, baseTime);
    
    // Segundo tono (medio)
    oscillator1.frequency.exponentialRampToValueAtTime(1000, baseTime + 0.15);
    oscillator2.frequency.exponentialRampToValueAtTime(1500, baseTime + 0.15);
    
    // Tercer tono (alto)
    oscillator1.frequency.exponentialRampToValueAtTime(1200, baseTime + 0.3);
    oscillator2.frequency.exponentialRampToValueAtTime(1800, baseTime + 0.3);
    
    // Tono final (más bajo, característico de WhatsApp)
    oscillator1.frequency.exponentialRampToValueAtTime(600, baseTime + 0.45);
    oscillator2.frequency.exponentialRampToValueAtTime(900, baseTime + 0.45);
    
    // Configurar volumen con envelope característico de WhatsApp
    gainNode.gain.setValueAtTime(0, baseTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.6, baseTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.8, baseTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.7, baseTime + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.9, baseTime + 0.25);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.8, baseTime + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.9, baseTime + 0.4);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.7, baseTime + 0.45);
    gainNode.gain.exponentialRampToValueAtTime(0.001, baseTime + 0.6);
    
    // Reproducir el sonido
    oscillator1.start(baseTime);
    oscillator2.start(baseTime);
    oscillator1.stop(baseTime + 0.6);
    oscillator2.stop(baseTime + 0.6);
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

  // Función para reproducir archivo de audio personalizado
  const playCustomAudio = async (audioContext) => {
    if (!customAudioUrl) {
      console.error("No hay archivo de audio personalizado cargado");
      return;
    }

    try {
      // Crear elemento de audio para el archivo personalizado
      const audio = new Audio(customAudioUrl);
      audio.volume = volume;
      
      // Reproducir el audio
      await audio.play();
      
      console.log("🎵 Archivo de audio personalizado reproducido");
    } catch (error) {
      console.error("Error reproduciendo archivo personalizado:", error);
      
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
          console.log("💬 Sonido de WhatsApp reproducido");
          break;
        case "kitchen":
          createKitchenSound(audioContext);
          console.log("🍳 Sonido de cocina tradicional reproducido");
          break;
        case "custom":
          await playCustomAudio(audioContext);
          console.log("🎵 Archivo de audio personalizado reproducido");
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
  }, [isEnabled, volume, soundType, customAudioUrl]);

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
        case "powerful":
          createPowerfulSound(audioContext);
          console.log("🔊 Probando sonido POTENTE");
          break;
        case "simple":
          createSimpleSound(audioContext);
          console.log("🔊 Probando sonido SIMPLE");
          break;
        case "alarm":
          createAlarmSound(audioContext);
          console.log("🔊 Probando sonido ALARMA");
          break;
        case "kitchen":
          createKitchenSound(audioContext);
          console.log("🔊 Probando sonido COCINA");
          break;
        case "custom":
          playCustomAudio(audioContext);
          console.log("🔊 Probando archivo personalizado");
          break;
        default:
          createPowerfulSound(audioContext);
          console.log("🔊 Probando sonido POTENTE");
      }
    } catch (error) {
      console.error("Error probando sonido específico:", error);
    }
  }, [isEnabled, volume, customAudioUrl]);

  return {
    // Estado
    isEnabled,
    volume,
    soundType,
    customAudioFile,
    customAudioUrl,
    isLoading,
    lastNotification,
    
    // Funciones de actualización (con guardado automático)
    setIsEnabled: useCallback(async (enabled) => {
      // Actualizar estado inmediatamente
      setIsEnabled(enabled);
      // Guardar en BD de forma asíncrona
      if (restaurant?.id) {
        try {
          const configToSave = {
            isEnabled: enabled,
            volume: volume,
            soundType: soundType,
            customAudioData: customAudioData,
            customAudioName: customAudioFile?.name,
            customAudioMimeType: customAudioFile?.type,
            updatedAt: new Date(),
          };
          await setDoc(doc(db, "restaurantes", restaurant.id, "configuracion", "notificaciones"), configToSave);
          console.log("✅ Estado de notificaciones guardado:", enabled);
        } catch (error) {
          console.error("Error guardando estado de notificaciones:", error);
        }
      }
    }, [restaurant?.id, volume, soundType, customAudioData, customAudioFile]),
    
    setVolume: useCallback(async (newVolume) => {
      // Actualizar estado inmediatamente
      setVolume(newVolume);
      // Guardar en BD de forma asíncrona
      if (restaurant?.id) {
        try {
          const configToSave = {
            isEnabled: isEnabled,
            volume: newVolume,
            soundType: soundType,
            customAudioData: customAudioData,
            customAudioName: customAudioFile?.name,
            customAudioMimeType: customAudioFile?.type,
            updatedAt: new Date(),
          };
          await setDoc(doc(db, "restaurantes", restaurant.id, "configuracion", "notificaciones"), configToSave);
          console.log("✅ Volumen guardado:", newVolume);
        } catch (error) {
          console.error("Error guardando volumen:", error);
        }
      }
    }, [restaurant?.id, isEnabled, soundType, customAudioData, customAudioFile]),
    
    setSoundType: useCallback(async (newSoundType) => {
      // Actualizar estado inmediatamente
      setSoundType(newSoundType);
      // Guardar en BD de forma asíncrona
      if (restaurant?.id) {
        try {
          const configToSave = {
            isEnabled: isEnabled,
            volume: volume,
            soundType: newSoundType,
            customAudioData: customAudioData,
            customAudioName: customAudioFile?.name,
            customAudioMimeType: customAudioFile?.type,
            updatedAt: new Date(),
          };
          await setDoc(doc(db, "restaurantes", restaurant.id, "configuracion", "notificaciones"), configToSave);
          console.log("✅ Tipo de sonido guardado:", newSoundType);
        } catch (error) {
          console.error("Error guardando tipo de sonido:", error);
        }
      }
    }, [restaurant?.id, isEnabled, volume, customAudioData, customAudioFile]),
    
    // Funciones de archivo personalizado
    handleCustomAudioFile,
    
    // Funciones de notificación
    playNotificationSound,
    showNotification,
    notifyNewOrder,
    clearNotification,
    testSound,
    testSpecificSound,
    
    // Funciones de configuración
    saveConfiguration,
    loadConfiguration,
  };
};

export default useKitchenNotifications;
