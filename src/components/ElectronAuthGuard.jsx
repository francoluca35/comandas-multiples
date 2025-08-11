"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const ElectronAuthGuard = ({ children, requiredAuth = true }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = () => {
      const currentPath = window.location.pathname;
      const isRestaurantSystem = currentPath.includes("/home-comandas");

      if (isRestaurantSystem) {
        const restauranteId = localStorage.getItem("restauranteId");
        const usuario = localStorage.getItem("usuario");
        const rol = localStorage.getItem("rol");

        console.log("🔍 ElectronAuthGuard - Verificando autenticación:", {
          restauranteId,
          usuario,
          rol,
          currentPath,
        });

        if (restauranteId && usuario && rol) {
          console.log("✅ ElectronAuthGuard - Usuario autenticado");
          setIsAuthenticated(true);
        } else {
          console.log("❌ ElectronAuthGuard - Usuario no autenticado");
          setIsAuthenticated(false);
          if (requiredAuth) {
            // Solo redirigir si no estamos ya en una página de login
            if (
              !currentPath.includes("/login") &&
              !currentPath.includes("/prelogin")
            ) {
              router.push("/comandas/prelogin");
            }
          }
        }
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    // Solo verificar una vez al cargar la página
    checkAuthentication();
  }, []); // Removido router y requiredAuth de las dependencias

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="text-white text-lg">Verificando autenticación...</div>
      </div>
    );
  }

  if (requiredAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="text-white text-lg">Redirigiendo...</div>
      </div>
    );
  }

  return children;
};
