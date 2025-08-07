"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const currentPath = window.location.pathname;
      const isSuperAdminSystem = currentPath.includes("/home-master");
      const isRestaurantSystem = currentPath.includes("/home-comandas");

      if (isSuperAdminSystem) {
        // Para superadmin, verificar Firebase Auth
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

        console.log("🔍 Verificando restaurante (sin Firebase Auth):", {
          restauranteId,
          usuarioLocal,
          rolLocal,
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
            "✅ Usuario de restaurante autenticado (sin Firebase Auth)"
          );
        } else {
          console.log("❌ Datos de restaurante faltantes");
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
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, rol, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
