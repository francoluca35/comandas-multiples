"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const checkAuth = useCallback(async () => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    // Verificar si estamos en el sistema de restaurantes
    const currentPath = window.location.pathname;
    const isRestaurantSystem = currentPath.includes("/home-comandas");

    console.log("🔍 AuthContext - Verificando sistema:", {
      currentPath,
      isRestaurantSystem,
    });

    if (isRestaurantSystem) {
      // Sistema de restaurantes - cargar desde localStorage
      console.log("🏪 Sistema de restaurantes detectado");

      const restauranteId = localStorage.getItem("restauranteId");
      const usuarioLocal = localStorage.getItem("usuario");
      const rolLocal = localStorage.getItem("rol");
      const nombreCompleto = localStorage.getItem("nombreCompleto");
      const userImage = localStorage.getItem("userImage");

      console.log("📋 Datos de restaurante en localStorage:", {
        restauranteId,
        usuarioLocal,
        rolLocal,
        nombreCompleto,
        userImage,
      });

      if (restauranteId && usuarioLocal && rolLocal) {
        // Verificar que realmente hay un usuario específico logueado (no solo datos del restaurante)
        const usuarioId = localStorage.getItem("usuarioId");
        
        if (usuarioId && nombreCompleto) {
          // Usuario autenticado en sistema de restaurantes
          const userInfo = {
            id: usuarioId,
            usuario: usuarioLocal,
            nombreCompleto: nombreCompleto,
            imagen: userImage || "",
            restauranteId: restauranteId,
            tipo: "restaurante",
            rol: rolLocal,
          };

          setUsuario(userInfo);
          setRol(rolLocal);
          console.log("✅ Usuario de restaurante autenticado:", {
            usuario: userInfo,
            rol: rolLocal,
          });
        } else {
          // Solo hay datos del restaurante, pero no usuario específico logueado
          console.log("ℹ️ Datos de restaurante disponibles, pero no hay usuario específico logueado");
          setUsuario(null);
          setRol(null);
        }
      } else {
        // No hay sesión de restaurante válida
        console.log("❌ No hay sesión de restaurante válida");
        setUsuario(null);
        setRol(null);
      }
    } else {
      // Sistema no reconocido
      console.log("❓ Sistema no reconocido, limpiando autenticación");
      setUsuario(null);
      setRol(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Escuchar cambios en localStorage para restaurantes
  useEffect(() => {
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    const isRestaurantSystem = currentPath.includes("/home-comandas");

    if (isRestaurantSystem) {
      const handleStorageChange = () => {
        console.log(
          "🔄 localStorage changed, verificando autenticación de restaurante"
        );
        checkAuth();
      };

      // Verificar autenticación cada 2 segundos para detectar cambios
      const interval = setInterval(() => {
        const restauranteId = localStorage.getItem("restauranteId");
        const usuarioLocal = localStorage.getItem("usuario");
        const rolLocal = localStorage.getItem("rol");
        
        if (restauranteId && usuarioLocal && rolLocal && !usuario) {
          console.log("🔄 Detectados datos de autenticación, recargando contexto");
          checkAuth();
        }
      }, 2000);

      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
        clearInterval(interval);
      };
    }
  }, [checkAuth, usuario]);

  const value = {
    usuario,
    rol,
    loading,
    isChecking,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};
