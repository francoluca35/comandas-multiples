"use client";

import { createContext, useContext, useEffect, useState } from "react";
// import { auth, db } from "../../../lib/firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay datos de usuario en localStorage
    const checkLocalAuth = () => {
      try {
        // Verificar si estamos en el sistema de restaurantes o superadmin
        const currentPath = window.location.pathname;
        const isRestaurantSystem = currentPath.includes("/home-comandas");
        const isSuperAdminSystem = currentPath.includes("/home-master");

        console.log("🔍 Verificando autenticación local:", {
          path: currentPath,
          isRestaurantSystem,
          isSuperAdminSystem,
        });

        if (isRestaurantSystem) {
          // Sistema de restaurantes
          const usuarioLocal = localStorage.getItem("usuario");
          const rolLocal = localStorage.getItem("rol");
          const restauranteId = localStorage.getItem("restauranteId");

          console.log("🔍 Datos de restaurante:", {
            usuario: usuarioLocal,
            rol: rolLocal,
            restauranteId: restauranteId,
          });

          if (usuarioLocal && restauranteId) {
            setUsuario({
              usuario: usuarioLocal,
              rol: rolLocal,
              restauranteId: restauranteId,
            });
            setRol(rolLocal);
            console.log("✅ Usuario de restaurante autenticado");
          } else {
            setUsuario(null);
            setRol(null);
            console.log("❌ No hay usuario de restaurante autenticado");
          }
        } else if (isSuperAdminSystem) {
          // Sistema de superadmin
          const superAdminUser = localStorage.getItem("superAdminUser");
          const superAdminRole = localStorage.getItem("superAdminRole");

          console.log("🔍 Datos de superadmin:", {
            usuario: superAdminUser,
            rol: superAdminRole,
          });

          if (superAdminUser && superAdminRole === "superadmin") {
            setUsuario({
              usuario: superAdminUser,
              rol: superAdminRole,
            });
            setRol(superAdminRole);
            console.log("✅ Superadmin autenticado");
          } else {
            setUsuario(null);
            setRol(null);
            console.log("❌ No hay superadmin autenticado");
          }
        } else {
          // No estamos en ningún sistema específico
          setUsuario(null);
          setRol(null);
          console.log("❌ No estamos en un sistema autenticado");
        }
      } catch (error) {
        console.error("Error al verificar autenticación local:", error);
        setUsuario(null);
        setRol(null);
      } finally {
        setLoading(false);
      }
    };

    // Verificar inmediatamente
    checkLocalAuth();

    // Escuchar cambios en localStorage (opcional)
    const handleStorageChange = (e) => {
      if (
        e.key === "usuario" ||
        e.key === "rol" ||
        e.key === "restauranteId" ||
        e.key === "superAdminUser" ||
        e.key === "superAdminRole"
      ) {
        checkLocalAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, rol, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
