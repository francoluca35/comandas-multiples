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
        const usuarioLocal = localStorage.getItem("usuario");
        const rolLocal = localStorage.getItem("rol");
        const restauranteId = localStorage.getItem("restauranteId");

        console.log("🔍 Verificando autenticación local:", {
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
          console.log("✅ Usuario autenticado localmente");
        } else {
          setUsuario(null);
          setRol(null);
          console.log("❌ No hay usuario autenticado");
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
      if (e.key === "usuario" || e.key === "rol" || e.key === "restauranteId") {
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
