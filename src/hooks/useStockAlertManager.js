"use client";
import { useState, useEffect, useCallback } from "react";
import { useStockAlerts } from "./useStockAlerts";

export const useStockAlertManager = () => {
  const { stockBajo, tieneStockBajo, fetchStockBajo } = useStockAlerts();
  const [showAlert, setShowAlert] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  // Verificar si debe mostrar la alerta
  const shouldShowAlert = useCallback(() => {
    // Si no hay stock bajo, no mostrar
    if (!tieneStockBajo()) return false;

    // Verificar si se dijo "no recordar hasta reponer"
    const dontRemind = localStorage.getItem('stockAlertDontRemind');
    if (dontRemind === 'true') return false;

    // Verificar si se dijo "recordar más tarde"
    const rememberLater = localStorage.getItem('stockAlertRememberLater');
    if (rememberLater) {
      const rememberTime = parseInt(rememberLater);
      const now = new Date().getTime();
      
      // Si aún no ha pasado el tiempo, no mostrar
      if (now < rememberTime) return false;
      
      // Si ya pasó el tiempo, limpiar el localStorage
      localStorage.removeItem('stockAlertRememberLater');
    }

    // Verificar si ya se mostró recientemente (últimos 5 minutos)
    if (lastCheck) {
      const timeSinceLastCheck = new Date().getTime() - lastCheck;
      if (timeSinceLastCheck < 5 * 60 * 1000) return false; // 5 minutos
    }

    return true;
  }, [tieneStockBajo, lastCheck]);

  // Verificar alertas periódicamente
  const checkAlerts = useCallback(async () => {
    await fetchStockBajo();
    
    if (shouldShowAlert()) {
      setShowAlert(true);
      setLastCheck(new Date().getTime());
    }
  }, [fetchStockBajo, shouldShowAlert]);

  // Manejar cierre de alerta
  const handleCloseAlert = () => {
    setShowAlert(false);
    setLastCheck(new Date().getTime());
  };

  // Manejar "recordar más tarde"
  const handleRememberLater = () => {
    const rememberTime = new Date().getTime() + (30 * 60 * 1000); // 30 minutos
    localStorage.setItem('stockAlertRememberLater', rememberTime.toString());
    setShowAlert(false);
    setLastCheck(new Date().getTime());
  };

  // Manejar "no recordar hasta reponer"
  const handleDontRemind = () => {
    localStorage.setItem('stockAlertDontRemind', 'true');
    setShowAlert(false);
    setLastCheck(new Date().getTime());
  };

  // Resetear alertas (cuando se repone stock)
  const resetAlerts = () => {
    localStorage.removeItem('stockAlertDontRemind');
    localStorage.removeItem('stockAlertRememberLater');
    setLastCheck(null);
  };

  // Verificar alertas al cargar
  useEffect(() => {
    checkAlerts();
  }, [checkAlerts]);

  // Verificar cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      checkAlerts();
    }, 2 * 60 * 1000); // 2 minutos

    return () => clearInterval(interval);
  }, [checkAlerts]);

  return {
    showAlert,
    stockBajo,
    handleCloseAlert,
    handleRememberLater,
    handleDontRemind,
    resetAlerts,
    checkAlerts,
  };
};
