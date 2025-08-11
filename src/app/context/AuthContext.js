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

  const checkAuth = useCallback(async () => {
    const currentPath = window.location.pathname;
    const isSuperAdminSystem = currentPath.includes("/home-master");
    const isRestaurantSystem = currentPath.includes("/home-comandas");

    if (isSuperAdminSystem) {
      // Para superadmin, verificar Firebase Auth
      const user = auth.currentUser;
      if (user) {
        console.log("🔍 Firebase Auth detectó usuario:", user.email);

        try {
          const docRef = doc(db, "usuarios", user.email);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            const userData = snap.data();
            console.log("📋 Datos superadmin:", userData);

            if (userData.rol === "superadmin") {
              setUsuario({
                email: user.email,
                rol: "superadmin",
                tipo: "superadmin",
              });
              setRol("superadmin");
              console.log("✅ Superadmin autenticado");
            } else {
              console.log("❌ Usuario no es superadmin");
              setUsuario(null);
              setRol(null);
            }
          } else {
            console.log("❌ Documento superadmin no encontrado");
            setUsuario(null);
            setRol(null);
          }
        } catch (error) {
          console.error("Error verificando superadmin:", error);
          setUsuario(null);
          setRol(null);
        }
      } else {
        console.log("❌ No hay usuario de Firebase Auth para superadmin");
        setUsuario(null);
        setRol(null);
      }
    } else if (isRestaurantSystem) {
      // Para restaurantes, verificar solo datos en localStorage (sin Firebase Auth)
      const restauranteId = localStorage.getItem("restauranteId");
      const usuarioLocal = localStorage.getItem("usuario");
      const rolLocal = localStorage.getItem("rol");

      console.log("🔍 AuthContext - Verificando restaurante:", {
        restauranteId,
        usuarioLocal,
        rolLocal,
        currentPath,
      });

      if (restauranteId && usuarioLocal && rolLocal) {
        setUsuario({
          usuario: usuarioLocal,
          rol: rolLocal,
          restauranteId: restauranteId,
          tipo: "restaurante",
        });
        setRol(rolLocal);
        console.log("✅ AuthContext - Usuario de restaurante autenticado:", {
          usuario: usuarioLocal,
          rol: rolLocal,
          restauranteId,
        });
      } else {
        console.log("❌ AuthContext - Datos de restaurante faltantes:", {
          restauranteId: !!restauranteId,
          usuarioLocal: !!usuarioLocal,
          rolLocal: !!rolLocal,
        });
        setUsuario(null);
        setRol(null);
      }
    } else {
      // Sistema no reconocido
      console.log("❌ Sistema no reconocido:", currentPath);
      setUsuario(null);
      setRol(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    // Ejecutar inmediatamente
    checkAuth();

    // También escuchar cambios en Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, checkAuth);

    // Escuchar cambios en localStorage para restaurantes (solo entre tabs)
    const handleStorageChange = (e) => {
      if (e.key === "usuario" || e.key === "rol" || e.key === "restauranteId") {
        console.log("🔄 AuthContext - Storage change detectado");
        setTimeout(checkAuth, 100);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ usuario, rol, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
