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
        
        // Si está en la página de login, verificar si ya hay un usuario específico logueado
        // Después del prelogin, solo se guardan datos del restaurante, no del usuario específico
        if (isOnLoginPage) {
          // Verificar que realmente hay un usuario específico logueado (no solo datos del restaurante)
          const usuarioId = localStorage.getItem("usuarioId");
          const nombreCompleto = localStorage.getItem("nombreCompleto");
          const usuarioEspecifico = localStorage.getItem("usuario");
          const rolEspecifico = localStorage.getItem("rol");
          
          if (usuarioId && nombreCompleto && usuarioEspecifico && rolEspecifico) {
            console.log("🔄 Usuario ya autenticado, redirigiendo a home");
            redirectingRef.current = true;
            router.push("/home-comandas/home");
            return;
          } else {
            console.log("ℹ️ Datos de restaurante disponibles, pero no hay usuario específico logueado - permitir selección de usuario");
          }
        }
        
        // Si está en home pero no está autenticado, redirigir a login
        if (isOnHomePage) {
          const usuarioId = localStorage.getItem("usuarioId");
          const nombreCompleto = localStorage.getItem("nombreCompleto");
          
          if (!usuario || !rol || !restauranteId || !nombreResto || !usuarioId || !nombreCompleto) {
            console.log("🔄 Usuario no autenticado, redirigiendo a login");
            redirectingRef.current = true;
            router.push("/home-comandas/login");
            return;
          }
        }
      }
    };

    // Verificar inmediatamente
    checkAuthAndRedirect();
    
    // Verificar cada 10 segundos para cambios en localStorage (menos frecuente para evitar bucles)
    const interval = setInterval(() => {
      // Solo verificar si no estamos en proceso de redirección
      if (!redirectingRef.current) {
        checkAuthAndRedirect();
      }
    }, 10000);
    
    return () => {
      clearInterval(interval);
      redirectingRef.current = false;
    };
  }, [router]);

  return null;
};
