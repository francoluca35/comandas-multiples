"use client";
import { useState, useEffect } from 'react';

export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si la app está instalada
    const checkIfInstalled = () => {
      if (typeof window !== 'undefined') {
        // Verificar si está en modo standalone (instalada)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        // Verificar si está en modo fullscreen (iOS)
        const isFullscreen = window.navigator.standalone === true;
        setIsInstalled(isStandalone || isFullscreen);
      }
    };

    // Manejar cambios de conectividad
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🟢 Conexión restaurada');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('🔴 Sin conexión - Modo offline');
    };

    // Verificar estado inicial
    setIsOnline(navigator.onLine);
    checkIfInstalled();

    // Agregar event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isInstalled };
};
