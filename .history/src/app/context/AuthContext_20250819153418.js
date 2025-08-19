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
        // Usuario autenticado en sistema de restaurantes
        const userInfo = {
          id: usuarioLocal,
          usuario: usuarioLocal,
          nombreCompleto: nombreCompleto || usuarioLocal,
          imagen: userImage || "",
          restauranteId: restauranteId,
          tipo: "restaurante",
        };

        setUsuario(userInfo);
        setRol(rolLocal);
        console.log("✅ Usuario de restaurante autenticado:", {
          usuario: userInfo,
          rol: rolLocal,
        });
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

  // Escuchar cambios en Firebase Auth solo para superadmin
  useEffect(() => {
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    const isSuperAdminSystem = currentPath.includes("/home-master");

    if (isSuperAdminSystem) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log("🔄 Firebase Auth state changed:", user?.email);
        if (!isChecking) {
          checkAuth();
        }
      });

      return () => unsubscribe();
    }
  }, [checkAuth, isChecking]);

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

      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [checkAuth]);

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
