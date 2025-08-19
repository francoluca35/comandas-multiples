"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../app/context/AuthContext";
import { auth } from "../../lib/firebase";

export default function AuthDebugger() {
  const { usuario, rol, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const updateDebugInfo = () => {
      const currentPath = window.location.pathname;

      const info = {
        currentPath,
        isSuperAdminSystem,
        authContext: {
          usuario,
          rol,
          loading,
          hasUsuario: !!usuario,
          isSuperAdmin: rol === "superadmin",
        },
        firebaseAuth: {
          currentUser: auth.currentUser,
          hasCurrentUser: !!auth.currentUser,
          userEmail: auth.currentUser?.email,
        },
        localStorage: {
          superAdminUser: localStorage.getItem("superAdminUser"),
          superAdminRole: localStorage.getItem("superAdminRole"),
          hasSuperAdminUser: !!localStorage.getItem("superAdminUser"),
          hasSuperAdminRole: !!localStorage.getItem("superAdminRole"),
        },
      };

      setDebugInfo(info);
      console.log("🔍 AuthDebugger - Estado actual:", info);
    };

    updateDebugInfo();

    // Actualizar cada segundo para debugging
    const interval = setInterval(updateDebugInfo, 1000);

    return () => clearInterval(interval);
  }, [usuario, rol, loading]);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debugger</h3>
      <div className="space-y-1">
        <div>
          <strong>Path:</strong> {debugInfo.currentPath}
        </div>
        <div>
          <strong>Loading:</strong>{" "}
          {debugInfo.authContext?.loading ? "Yes" : "No"}
        </div>
        <div>
          <strong>Has Usuario:</strong>{" "}
          {debugInfo.authContext?.hasUsuario ? "Yes" : "No"}
        </div>
        <div>
          <strong>Is SuperAdmin:</strong>{" "}
          {debugInfo.authContext?.isSuperAdmin ? "Yes" : "No"}
        </div>
        <div>
          <strong>Firebase User:</strong>{" "}
          {debugInfo.firebaseAuth?.hasCurrentUser ? "Yes" : "No"}
        </div>
        <div>
          <strong>LocalStorage User:</strong>{" "}
          {debugInfo.localStorage?.hasSuperAdminUser ? "Yes" : "No"}
        </div>
        <div>
          <strong>LocalStorage Role:</strong>{" "}
          {debugInfo.localStorage?.hasSuperAdminRole ? "Yes" : "No"}
        </div>
      </div>
    </div>
  );
}
