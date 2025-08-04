"use client";
import { QueryProvider } from "./QueryProvider";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuth } from "../store";
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
  const { user, isAuthenticated, logout } = useAuth();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    // Verificar sesión expirada
    const checkSessionExpiry = () => {
      if (user?.metadata?.lastSignInTime) {
        const lastSignIn = new Date(user.metadata.lastSignInTime);
        const now = new Date();
        const hoursSinceSignIn = (now - lastSignIn) / (1000 * 60 * 60);

        // Si han pasado más de 24 horas, cerrar sesión
        if (hoursSinceSignIn > 24) {
          handleError(new Error("Sesión expirada"), "authentication", {
            showToast: true,
          });
          logout();
        }
      }
    };

    if (isAuthenticated) {
      checkSessionExpiry();

      // Verificar cada hora
      const interval = setInterval(checkSessionExpiry, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, isAuthenticated, logout, handleError]);

  return children;
};

// Componente para manejar errores globales
const GlobalErrorHandler = ({ children }) => {
  const { handleError } = useErrorHandler();

  useEffect(() => {
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

// Componente para optimizaciones de rendimiento
const PerformanceOptimizer = ({ children }) => {
  useEffect(() => {
    // Preload de recursos críticos
    const preloadCriticalResources = () => {
      // Preload de fuentes críticas
      const fontLink = document.createElement("link");
      fontLink.rel = "preload";
      fontLink.href = "/fonts/inter-var.woff2";
      fontLink.as = "font";
      fontLink.type = "font/woff2";
      fontLink.crossOrigin = "anonymous";
      document.head.appendChild(fontLink);

      // Preload de imágenes críticas
      const imageLink = document.createElement("link");
      imageLink.rel = "preload";
      imageLink.href = "/Assets/LogoApp.png";
      imageLink.as = "image";
      document.head.appendChild(imageLink);
    };

    // Optimizaciones de scroll
    const optimizeScroll = () => {
      let ticking = false;

      const updateScroll = () => {
        // Aquí puedes agregar optimizaciones de scroll
        ticking = false;
      };

      const requestTick = () => {
        if (!ticking) {
          requestAnimationFrame(updateScroll);
          ticking = true;
        }
      };

      window.addEventListener("scroll", requestTick, { passive: true });

      return () => {
        window.removeEventListener("scroll", requestTick);
      };
    };

    // Optimizaciones de resize
    const optimizeResize = () => {
      let resizeTimeout;

      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          // Aquí puedes agregar optimizaciones de resize
        }, 250);
      };

      window.addEventListener("resize", handleResize, { passive: true });

      return () => {
        window.removeEventListener("resize", handleResize);
        clearTimeout(resizeTimeout);
      };
    };

    preloadCriticalResources();
    const cleanupScroll = optimizeScroll();
    const cleanupResize = optimizeResize();

    return () => {
      cleanupScroll();
      cleanupResize();
    };
  }, []);

  return children;
};

// Componente para monitoreo de rendimiento
const PerformanceMonitor = ({ children }) => {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Monitorear Core Web Vitals en desarrollo
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`${entry.name}: ${entry.value}`);
        }
      });

      observer.observe({
        entryTypes: ["navigation", "paint", "largest-contentful-paint"],
      });

      return () => observer.disconnect();
    }
  }, []);

  return children;
};

// Provider principal de la aplicación
export const AppProvider = ({ children }) => {
  return (
    <QueryProvider>
      <GlobalErrorHandler>
        <AuthHandler>
          <PerformanceOptimizer>
            <PerformanceMonitor>
              {children}
              <Toaster {...toastConfig} />
            </PerformanceMonitor>
          </PerformanceOptimizer>
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
