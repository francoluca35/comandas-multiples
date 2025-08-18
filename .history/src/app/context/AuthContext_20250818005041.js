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

    // Prevenir ejecuciones simultáneas
    if (isChecking) {
      console.log("🔍 AuthContext - Verificación ya en progreso, saltando...");
      return;
    }

    setIsChecking(true);

    // Solicitar permisos de notificación
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    const currentPath = window.location.pathname;
    const isSuperAdminSystem = currentPath.includes("/home-master");
    const isRestaurantSystem = currentPath.includes("/home-comandas");

    console.log("🔍 AuthContext.checkAuth - Iniciando verificación:", {
      currentPath,
      isSuperAdminSystem,
      isRestaurantSystem,
      timestamp: new Date().toISOString(),
    });

    if (isSuperAdminSystem) {
      // Para superadmin, verificar Firebase Auth
      const user = auth.currentUser;
      console.log("🔍 AuthContext - Verificando superadmin:", {
        currentPath,
        isSuperAdminSystem,
        hasFirebaseUser: !!user,
        userEmail: user?.email,
      });

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
              console.log("✅ Superadmin autenticado - Estado actualizado");
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

      console.log("🔍 Verificando restaurante (sin Firebase Auth):", {
        restauranteId,
        usuarioLocal,
        rolLocal,
        currentPath,
        isRestaurantSystem,
      });

      if (restauranteId && usuarioLocal) {
        setUsuario({
          usuario: usuarioLocal,
          rol: rolLocal,
          restauranteId: restauranteId,
          tipo: "restaurante",
        });
        setRol(rolLocal);
        console.log(
          "✅ Usuario de restaurante autenticado (sin Firebase Auth):",
          { usuario: usuarioLocal, rol: rolLocal, restauranteId }
        );
      } else {
        console.log("❌ Datos de restaurante faltantes:", {
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

    console.log("🔍 AuthContext.checkAuth - Verificación completada:", {
      currentPath: window.location.pathname,
      finalUsuario: usuario,
      finalRol: rol,
      loading: false,
      timestamp: new Date().toISOString(),
    });

    setLoading(false);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    console.log("🔍 AuthContext - Inicializando autenticación...");

    // Ejecutar verificación inicial
    checkAuth();

    // Escuchar cambios en Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("🔍 AuthContext - Firebase Auth state changed:", {
        hasUser: !!user,
        userEmail: user?.email,
        timestamp: new Date().toISOString(),
      });
      checkAuth();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, rol, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
