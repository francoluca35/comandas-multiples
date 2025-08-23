"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const AutoRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return;

    const checkAuthAndRedirect = () => {
      const currentPath = window.location.pathname;
      const isRestaurantSystem = currentPath.includes("/home-comandas");
      
      if (isRestaurantSystem) {
        const usuario = localStorage.getItem("usuario");
        const rol = localStorage.getItem("rol");
        const restauranteId = localStorage.getItem("restauranteId");
        
        const isOnLoginPage = currentPath === "/home-comandas" || currentPath === "/home-comandas/login";
        const isOnHomePage = currentPath === "/home-comandas/home";
        
        // Si está en la página de login pero ya está autenticado, redirigir a home
        if (isOnLoginPage && usuario && rol && restauranteId) {
          console.log("🔄 Usuario ya autenticado, redirigiendo a home");
          router.push("/home-comandas/home");
          return;
        }
        
        // Si está en home pero no está autenticado, redirigir a login
        if (isOnHomePage && (!usuario || !rol || !restauranteId)) {
          console.log("🔄 Usuario no autenticado, redirigiendo a login");
          router.push("/home-comandas/login");
          return;
        }
      }
    };

    // Verificar inmediatamente
    checkAuthAndRedirect();
    
    // Verificar cada 2 segundos para cambios en localStorage
    const interval = setInterval(checkAuthAndRedirect, 2000);
    
    return () => clearInterval(interval);
  }, [router]);

  return null;
};
