"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    console.log("🔍 AuthContext - Verificando superadmin...");
    
    let user = auth.currentUser;

    // Si no hay usuario actual, esperar un momento para que Firebase se inicialice
    if (!user) {
      console.log("🔍 Esperando inicialización de Firebase Auth...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      user = auth.currentUser;
    }

    if (user) {
      console.log("🔍 Firebase Auth detectó usuario:", user.email);

      try {
        const docRef = doc(db, "usuarios", user.email);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const userData = snap.data();
          console.log("📋 Datos superadmin:", userData);

          if (userData.rol === "superadmin") {
            const userInfo = {
              email: user.email,
              rol: "superadmin",
              tipo: "superadmin",
              imagen: userData.imagen || "",
            };
            setUsuario(userInfo);
            setRol("superadmin");

            // Guardar en localStorage para persistencia
            localStorage.setItem("superadmin_email", user.email);
            localStorage.setItem("superadmin_rol", "superadmin");
            localStorage.setItem("superadmin_image", userData.imagen || "");

            console.log("✅ Superadmin autenticado - Estado actualizado");
          } else {
            console.log("❌ Usuario no es superadmin");
            setUsuario(null);
            setRol(null);
            localStorage.removeItem("superadmin_email");
            localStorage.removeItem("superadmin_rol");
            localStorage.removeItem("superadmin_image");
          }
        } else {
          console.log("❌ Documento superadmin no encontrado");
          setUsuario(null);
          setRol(null);
          localStorage.removeItem("superadmin_email");
          localStorage.removeItem("superadmin_rol");
          localStorage.removeItem("superadmin_image");
        }
      } catch (error) {
        console.error("❌ Error al verificar superadmin:", error);
        setUsuario(null);
        setRol(null);
        localStorage.removeItem("superadmin_email");
        localStorage.removeItem("superadmin_rol");
        localStorage.removeItem("superadmin_image");
      }
    } else {
      console.log("❌ No hay usuario de Firebase Auth");
      setUsuario(null);
      setRol(null);
      localStorage.removeItem("superadmin_email");
      localStorage.removeItem("superadmin_rol");
      localStorage.removeItem("superadmin_image");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Escuchar cambios en Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("🔄 Firebase Auth state changed:", user?.email);
      checkAuth();
    });

    return () => unsubscribe();
  }, [checkAuth]);

  const logout = useCallback(() => {
    setUsuario(null);
    setRol(null);
    localStorage.removeItem("superadmin_email");
    localStorage.removeItem("superadmin_rol");
    localStorage.removeItem("superadmin_image");
    auth.signOut();
  }, []);

  const value = {
    usuario,
    rol,
    loading,
    checkAuth,
    logout,
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
