"use client";
import { QueryProvider } from "./QueryProvider";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuth } from "../app/context/AuthContext";
import { useErrorHandler } from "../hooks/useErrorHandler";

// Configuración de toast notifications
const toastConfig = {
  duration: 5000,
  position: "top-right",
  style: {
    background: "#1f2937",
    color: "#f9fafb",
    border: "1px solid #374151",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
  },
  success: {
    iconTheme: {
      primary: "#10b981",
      secondary: "#f9fafb",
    },
    style: {
      background: "#064e3b",
      color: "#f9fafb",
      border: "1px solid #065f46",
    },
  },
  error: {
    iconTheme: {
      primary: "#ef4444",
      secondary: "#f9fafb",
    },
    style: {
      background: "#7f1d1d",
      color: "#f9fafb",
      border: "1px solid #991b1b",
    },
  },
  loading: {
    iconTheme: {
      primary: "#3b82f6",
      secondary: "#f9fafb",
    },
    style: {
      background: "#1e3a8a",
      color: "#f9fafb",
      border: "1px solid #1e40af",
    },
  },
};

// Componente para manejar autenticación global
const AuthHandler = ({ children }) => {
  const { usuario, loading } = useAuth();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return;

    // Verificar sesión expirada solo si hay usuario y no está cargando
    if (!loading && usuario) {
      const checkSessionExpiry = () => {
        // Para nuestro sistema personalizado, verificamos si existe el restauranteId
        const restauranteId = localStorage.getItem("restauranteId");
        const usuarioLocal = localStorage.getItem("usuario");

        if (!restauranteId || !usuarioLocal) {
          console.log("🔍 Sesión expirada - datos faltantes en localStorage");
          handleError(new Error("Sesión expirada"), "authentication", {
            showToast: true,
          });

          // Limpiar localStorage
          localStorage.removeItem("usuario");
          localStorage.removeItem("rol");
          localStorage.removeItem("usuarioId");
          localStorage.removeItem("restauranteId");
          localStorage.removeItem("nombreResto");
          localStorage.removeItem("emailResto");
          localStorage.removeItem("cantUsuarios");
          localStorage.removeItem("finanzas");
          localStorage.removeItem("logo");

          // Recargar la página para limpiar el estado
          window.location.href = "/comandas/prelogin";
        }
      };

      checkSessionExpiry();

      // Verificar cada 5 minutos en lugar de cada hora
      const interval = setInterval(checkSessionExpiry, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [usuario, loading, handleError]);

  return children;
};

// Componente para manejar errores globales
const GlobalErrorHandler = ({ children }) => {
  const { handleError } = useErrorHandler();

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return;

    // Manejar errores no capturados
    const handleUnhandledError = (event) => {
      handleError(event.error || new Error(event.message), "global", {
        showToast: true,
        duration: 8000,
      });
    };

    // Manejar promesas rechazadas no capturadas
    const handleUnhandledRejection = (event) => {
      handleError(event.reason, "global", {
        showToast: true,
        duration: 8000,
      });
    };

    window.addEventListener("error", handleUnhandledError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleUnhandledError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, [handleError]);

  return children;
};

// Provider principal de la aplicación
export const AppProvider = ({ children }) => {
  return (
    <QueryProvider>
      <GlobalErrorHandler>
        <AuthHandler>
          {children}
          <Toaster {...toastConfig} />
        </AuthHandler>
      </GlobalErrorHandler>
    </QueryProvider>
  );
};

// Hook para acceso fácil a todos los providers
export const useApp = () => {
  return {
    // Aquí puedes agregar hooks adicionales si es necesario
  };
};
