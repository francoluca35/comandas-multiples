"use client";
import React, { useEffect, useState } from "react";

export const AuthDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const updateDebugInfo = () => {
      const authData = {
        usuario: localStorage.getItem("usuario"),
        rol: localStorage.getItem("rol"),
        restauranteId: localStorage.getItem("restauranteId"),
        nombreResto: localStorage.getItem("nombreResto"),
        codActivacion: localStorage.getItem("codActivacion"),
        emailResto: localStorage.getItem("emailResto"),
        cantUsuarios: localStorage.getItem("cantUsuarios"),
        finanzas: localStorage.getItem("finanzas"),
        logo: localStorage.getItem("logo"),
        usuarioId: localStorage.getItem("usuarioId"),
        nombreCompleto: localStorage.getItem("nombreCompleto"),
        userImage: localStorage.getItem("userImage"),
        imagen: localStorage.getItem("imagen"),
      };

      const currentPath = window.location.pathname;
      const isRestaurantSystem = currentPath.includes("/home-comandas");
      const hasMinimalData = authData.usuario && authData.rol && authData.restauranteId;
      const shouldBeAuthenticated = isRestaurantSystem && hasMinimalData;
      const isOnLoginPage = currentPath === "/home-comandas" || currentPath === "/home-comandas/login";
      const isOnHomePage = currentPath === "/home-comandas/home";

      setDebugInfo({
        authData,
        currentPath,
        isRestaurantSystem,
        hasMinimalData,
        shouldBeAuthenticated,
        isOnLoginPage,
        isOnHomePage,
        problem: shouldBeAuthenticated && isOnLoginPage ? "Usuario autenticado pero en login" : 
                !shouldBeAuthenticated && isOnHomePage ? "Usuario no autenticado pero en home" : 
                "Estado correcto"
      });
    };

    updateDebugInfo();
    
    // Actualizar cada segundo
    const interval = setInterval(updateDebugInfo, 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debug</h3>
      <div className="space-y-1">
        <div><strong>Ruta:</strong> {debugInfo.currentPath}</div>
        <div><strong>Problema:</strong> {debugInfo.problem}</div>
        <div><strong>Autenticado:</strong> {debugInfo.shouldBeAuthenticated ? "✅" : "❌"}</div>
        <div><strong>Usuario:</strong> {debugInfo.authData?.usuario || "No"}</div>
        <div><strong>Rol:</strong> {debugInfo.authData?.rol || "No"}</div>
        <div><strong>Restaurante ID:</strong> {debugInfo.authData?.restauranteId || "No"}</div>
      </div>
    </div>
  );
};
