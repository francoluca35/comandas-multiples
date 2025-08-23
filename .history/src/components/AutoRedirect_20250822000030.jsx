"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export const AutoRedirect = () => {
  const router = useRouter();
  const redirectingRef = useRef(false);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return;

    const checkAuthAndRedirect = () => {
      // Evitar múltiples redirecciones simultáneas
      if (redirectingRef.current) return;

      const currentPath = window.location.pathname;
      const isRestaurantSystem = currentPath.includes("/home-comandas");
      
      if (isRestaurantSystem) {
        const usuario = localStorage.getItem("usuario");
        const rol = localStorage.getItem("rol");
        const restauranteId = localStorage.getItem("restauranteId");
        const nombreResto = localStorage.getItem("nombreResto");
        
        const isOnLoginPage = currentPath === "/home-comandas" || currentPath === "/home-comandas/login";
        const isOnHomePage = currentPath === "/home-comandas/home";
        
        console.log("🔍 AutoRedirect - Verificando:", {
          currentPath,
          usuario: !!usuario,
          rol: !!rol,
          restauranteId: !!restauranteId,
          nombreResto: !!nombreResto,
          isOnLoginPage,
          isOnHomePage
        });
        
        // Si está en la página de login pero ya está autenticado, redirigir a home
        if (isOnLoginPage && usuario && rol && restauranteId && nombreResto) {
          console.log("🔄 Usuario ya autenticado, redirigiendo a home");
          redirectingRef.current = true;
          router.push("/home-comandas/home");
          return;
        }
        
        // Si está en home pero no está autenticado, redirigir a login
        if (isOnHomePage && (!usuario || !rol || !restauranteId || !nombreResto)) {
          console.log("🔄 Usuario no autenticado, redirigiendo a login");
          redirectingRef.current = true;
          router.push("/home-comandas/login");
          return;
        }
      }
    };

    // Verificar inmediatamente
    checkAuthAndRedirect();
    
    // Verificar cada 3 segundos para cambios en localStorage
    const interval = setInterval(() => {
      redirectingRef.current = false; // Reset flag
      checkAuthAndRedirect();
    }, 3000);
    
    return () => {
      clearInterval(interval);
      redirectingRef.current = false;
    };
  }, [router]);

  return null;
};
