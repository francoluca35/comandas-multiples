"use client";
import React, { useState, useEffect, createContext, useContext } from "react";
import CloudinaryImage from "../../../../components/CloudinaryImage";

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <SidebarContext.Provider value={{ isExpanded, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Hook personalizado para navegación
const useNavigation = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [activeItem, setActiveItem] = useState("home");

  useEffect(() => {
    const updatePath = () => {
      const path = window.location.pathname;
      setCurrentPath(path);

      // Determinar el item activo basado en la ruta
      if (path === "/home-comandas/home" || path === "/home-comandas") {
        setActiveItem("home");
      } else if (path === "/home-comandas/ventas") {
        setActiveItem("ventas");
      } else if (path === "/home-comandas/productos") {
        setActiveItem("productos");
      } else if (path === "/home-comandas/mesas") {
        setActiveItem("mesas");
      } else if (path === "/home-comandas/inventario") {
        setActiveItem("inventario");
      } else if (path === "/home-comandas/pagos") {
        setActiveItem("pagos");
      } else if (path === "/home-comandas/reportes") {
        setActiveItem("reportes");
      } else if (path === "/home-comandas/cocina") {
        setActiveItem("cocina");
      } else {
        setActiveItem("home");
      }
    };

    // Actualizar inmediatamente
    updatePath();

    // Escuchar cambios de URL
    const handleUrlChange = () => {
      updatePath();
    };

    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("hashchange", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("hashchange", handleUrlChange);
    };
  }, []);

  const navigate = (route) => {
    console.log("🔄 Navegando a:", route);
    window.location.href = route;
  };

  return { currentPath, activeItem, navigate };
};

function Sidebar() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { currentPath, activeItem, navigate } = useNavigation();

  // Obtener datos del usuario desde localStorage
  const usuario =
    typeof window !== "undefined" ? localStorage.getItem("usuario") : null;
  const rol =
    typeof window !== "undefined" ? localStorage.getItem("rol") : null;
  const userImage =
    typeof window !== "undefined" ? localStorage.getItem("userImage") : null;
  const userInitials = usuario ? usuario.charAt(0).toUpperCase() : "U";

  const handleItemClick = (itemId, route) => {
    console.log("🔄 Sidebar - Navegando a:", { itemId, route, currentPath });
    navigate(route);
  };

  const handleLogoClick = () => {
    if (isExpanded) {
      // Si el sidebar está abierto, cerrar sesión
      localStorage.removeItem("usuario");
      localStorage.removeItem("rol");
      localStorage.removeItem("usuarioId");
      localStorage.removeItem("userImage");
      localStorage.removeItem("imagen");
      navigate("/home-comandas/login");
    } else {
      // Si está cerrado, abrir el sidebar
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    // Limpiar información de sesión
    localStorage.removeItem("usuario");
    localStorage.removeItem("rol");
    localStorage.removeItem("usuarioId");
    localStorage.removeItem("userImage");
    localStorage.removeItem("imagen");
    navigate("/home-comandas/login");
  };

  const getItemClasses = (itemId) => {
    const isActive = activeItem === itemId;
    const baseClasses = `${
      isExpanded
        ? "w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8"
        : "w-10 h-10 sm:w-12 sm:h-12"
    } flex items-center justify-center cursor-pointer transition-all duration-300 ${
      isExpanded ? "justify-start" : ""
    }`;

    if (isActive) {
      return `${baseClasses} bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-lg sm:rounded-xl backdrop-blur-sm shadow-lg shadow-blue-500/25`;
    } else {
      return `${baseClasses} text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg sm:rounded-xl backdrop-blur-sm border border-transparent hover:border-slate-600/30 transition-all duration-300`;
    }
  };

  // Función para verificar permisos basada en rol
  const hasPermission = (permission) => {
    const permissions = {
      admin: [
        "canAccessHome",
        "canAccessVentas",
        "canAccessMesas",
        "canAccessProductos",
        "canAccessPagos",
        "canAccessInventario",
        "canAccessReportes",
        "canAccessCocina",
      ],
      mesero: ["canAccessHome", "canAccessVentas"],
      cocina: ["canAccessHome", "canAccessCocina"],
      usuario: ["canAccessHome", "canAccessVentas"],
    };

    const userPermissions = permissions[rol?.toLowerCase()] || [];
    return userPermissions.includes(permission);
  };

  return (
    <div
      className={`${
        isExpanded
          ? "w-56 sm:w-64 md:w-72 lg:w-80 xl:w-96 2xl:w-[420px]"
          : "w-16 sm:w-20"
      } fixed left-0 top-0 bg-slate-900/95 border-r border-slate-700/50 flex flex-col items-center py-3 sm:py-4 md:py-6 space-y-2 sm:space-y-3 md:space-y-4 transition-all duration-300 ease-in-out shadow-2xl shadow-slate-900/50 h-screen max-h-screen overflow-hidden z-20`}
    >
      {/* Foto de perfil del usuario */}
      <div
        className="cursor-pointer p-1 sm:p-2 rounded-full hover:bg-slate-700/30 transition-all duration-300 mb-2 sm:mb-3 md:mb-4"
        onClick={handleLogoClick}
      >
        <CloudinaryImage
          src={userImage}
          alt="Foto de perfil"
          size={50}
          className={
            isExpanded
              ? "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 2xl:w-28 2xl:h-28"
              : "w-10 h-10 sm:w-12 sm:h-12"
          }
          fallbackInitials={userInitials}
          onError={(e) => {
            console.log("Error loading image:", userImage);
          }}
          onLoad={() => {
            console.log("Image loaded successfully:", userImage);
          }}
        />
      </div>

      {/* Indicador de rol del usuario */}
      {isExpanded && rol && (
        <div className="px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 mb-3 w-full text-center">
          <div className="text-sm font-semibold text-blue-400">
            {rol.toUpperCase()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {rol === "admin"
              ? "Administrador"
              : rol === "mesero"
              ? "Mesero"
              : rol === "cocina"
              ? "Cocina"
              : "Usuario"}
          </div>
        </div>
      )}

      {/* Navigation Icons */}
      <div className="flex flex-col items-center space-y-2 sm:space-y-3 w-full px-2 sm:px-3 flex-1 overflow-y-auto">
        {/* Home - Todos los roles pueden acceder */}
        {hasPermission("canAccessHome") && (
          <div
            className={getItemClasses("home")}
            onClick={() => handleItemClick("home", "/home-comandas/home")}
          >
            <svg
              className={`w-5 h-5 ${activeItem === "home" ? "text-white" : ""}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            {isExpanded && (
              <span
                className={`ml-3 font-semibold ${
                  activeItem === "home" ? "text-white" : "text-slate-300"
                }`}
              >
                Inicio
              </span>
            )}
          </div>
        )}

        {/* Ventas */}
        {hasPermission("canAccessVentas") && (
          <div
            className={getItemClasses("ventas")}
            onClick={() => handleItemClick("ventas", "/home-comandas/ventas")}
          >
            <svg
              className={`w-5 h-5 ${
                activeItem === "ventas" ? "text-white" : ""
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            {isExpanded && (
              <span
                className={`ml-3 font-semibold ${
                  activeItem === "ventas" ? "text-white" : "text-slate-300"
                }`}
              >
                Ventas
              </span>
            )}
          </div>
        )}

        {/* Mesas - Solo admin */}
        {hasPermission("canAccessMesas") && (
          <div
            className={getItemClasses("mesas")}
            onClick={() => handleItemClick("mesas", "/home-comandas/mesas")}
          >
            <svg
              className={`w-5 h-5 ${
                activeItem === "mesas" ? "text-white" : ""
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isExpanded && (
              <span
                className={`ml-3 font-semibold ${
                  activeItem === "mesas" ? "text-white" : "text-slate-300"
                }`}
              >
                Mesas
              </span>
            )}
          </div>
        )}

        {/* Productos - Solo admin */}
        {hasPermission("canAccessProductos") && (
          <div
            className={getItemClasses("productos")}
            onClick={() =>
              handleItemClick("productos", "/home-comandas/productos")
            }
          >
            <svg
              className={`w-5 h-5 ${
                activeItem === "productos" ? "text-white" : ""
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            {isExpanded && (
              <span
                className={`ml-3 font-semibold ${
                  activeItem === "productos" ? "text-white" : "text-slate-300"
                }`}
              >
                Productos
              </span>
            )}
          </div>
        )}

        {/* Pagos - Solo admin */}
        {hasPermission("canAccessPagos") && (
          <div
            className={getItemClasses("pagos")}
            onClick={() => handleItemClick("pagos", "/home-comandas/pagos")}
          >
            <svg
              className={`w-5 h-5 ${
                activeItem === "pagos" ? "text-white" : ""
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
            </svg>
            {isExpanded && (
              <span
                className={`ml-3 font-semibold ${
                  activeItem === "pagos" ? "text-white" : "text-slate-300"
                }`}
              >
                Pagos
              </span>
            )}
          </div>
        )}

        {/* Inventario - Solo admin */}
        {hasPermission("canAccessInventario") && (
          <div
            className={getItemClasses("inventario")}
            onClick={() =>
              handleItemClick("inventario", "/home-comandas/inventario")
            }
          >
            <svg
              className={`w-5 h-5 ${
                activeItem === "inventario" ? "text-white" : ""
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            {isExpanded && (
              <span
                className={`ml-3 font-semibold ${
                  activeItem === "inventario" ? "text-white" : "text-slate-300"
                }`}
              >
                Inventario
              </span>
            )}
          </div>
        )}

        {/* Reportes - Solo admin */}
        {hasPermission("canAccessReportes") && (
          <div
            className={getItemClasses("reportes")}
            onClick={() =>
              handleItemClick("reportes", "/home-comandas/reportes")
            }
          >
            <svg
              className={`w-5 h-5 ${
                activeItem === "reportes" ? "text-white" : ""
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            {isExpanded && (
              <span
                className={`ml-3 font-semibold ${
                  activeItem === "reportes" ? "text-white" : "text-slate-300"
                }`}
              >
                Reportes
              </span>
            )}
          </div>
        )}

        {/* Cocina */}
        {hasPermission("canAccessCocina") && (
          <div
            className={getItemClasses("cocina")}
            onClick={() => handleItemClick("cocina", "/home-comandas/cocina")}
          >
            <svg
              className={`w-5 h-5 ${
                activeItem === "cocina" ? "text-white" : ""
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
            {isExpanded && (
              <span
                className={`ml-3 font-semibold ${
                  activeItem === "cocina" ? "text-white" : "text-slate-300"
                }`}
              >
                Cocina
              </span>
            )}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="mt-auto w-full px-2 sm:px-3">
        <div
          className={`${
            isExpanded
              ? "w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8"
              : "w-10 h-10 sm:w-12 sm:h-12"
          } flex items-center justify-center cursor-pointer transition-all duration-300 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg sm:rounded-xl backdrop-blur-sm border border-transparent hover:border-red-500/30 ${
            isExpanded ? "justify-start" : ""
          }`}
          onClick={handleLogout}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
              clipRule="evenodd"
            />
          </svg>
          {isExpanded && (
            <span className="ml-3 font-semibold">Cerrar Sesión</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
