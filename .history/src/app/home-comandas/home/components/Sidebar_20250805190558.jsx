"use client";
import React, { useState, useEffect, createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useUserProfile } from "../../../../hooks/useUserProfile";
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

function Sidebar() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const [activeItem, setActiveItem] = useState("home");
  const pathname = usePathname();
  const router = useRouter();
  const { userImage, userInitials } = useUserProfile();

  useEffect(() => {
    if (pathname === "/home-comandas/home" || pathname === "/home-comandas") {
      setActiveItem("home");
    } else if (pathname === "/home-comandas/ventas") {
      setActiveItem("mesas");
    } else if (pathname === "/home-comandas/productos") {
      setActiveItem("productos");
    } else if (pathname === "/home-comandas/mesas") {
      setActiveItem("gestionMesas");
    } else if (pathname === "/home-comandas/inventario") {
      setActiveItem("inventario");
    } else if (pathname === "/home-comandas/pagos") {
      setActiveItem("pagos");
    } else {
      setActiveItem("home");
    }
  }, [pathname]);

  const handleItemClick = (itemId, route) => {
    setActiveItem(itemId);
    if (route) {
      router.push(route);
    }
  };

  const getItemClasses = (itemId) => {
    const isActive = activeItem === itemId;
    const baseClasses = `${
      isExpanded ? "w-full px-4" : "w-12 h-12"
    } flex items-center justify-center cursor-pointer transition-all duration-300 ${
      isExpanded ? "justify-start" : ""
    }`;

    if (isActive) {
      return `${baseClasses} bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-xl backdrop-blur-sm shadow-lg shadow-blue-500/25`;
    } else {
      return `${baseClasses} text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-xl backdrop-blur-sm border border-transparent hover:border-slate-600/30 transition-all duration-300`;
    }
  };

  return (
    <div
      className={`${
        isExpanded ? "w-72" : "w-20"
      } bg-slate-900/80 backdrop-blur-sm border-r border-slate-700/50 flex flex-col items-center py-6 space-y-4 transition-all duration-300 ease-in-out shadow-2xl shadow-slate-900/50 h-screen max-h-screen overflow-hidden`}
    >
      {/* Foto de perfil del usuario */}
      <div
        className="cursor-pointer p-2 rounded-lg hover:bg-slate-700/30 transition-all duration-300 mb-4"
        onClick={toggleSidebar}
      >
        <CloudinaryImage
          src={userImage}
          alt="Foto de perfil"
          size={150}
          fallbackInitials={userInitials}
          onError={(e) => {
            console.log("Error loading image:", userImage);
          }}
          onLoad={() => {
            console.log("Image loaded successfully:", userImage);
          }}
        />
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col items-center space-y-3 w-full px-3 flex-1 overflow-y-auto">
        {/* Home */}
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

        {/* Mesas */}
        <div
          className={getItemClasses("mesas")}
          onClick={() => handleItemClick("mesas", "/home-comandas/ventas")}
        >
          <svg
            className={`w-5 h-5 ${activeItem === "mesas" ? "text-white" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {/* Mesa */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 8h12M6 8v8M18 8v8"
            />
            {/* Pata central de la mesa */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v8"
            />
            {/* Silla izquierda */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10c0-1.1.9-2 2-2s2 .9 2 2v4c0 1.1-.9 2-2 2s-2-.9-2-2v-4z"
            />
            {/* Silla derecha */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 10c0-1.1.9-2 2-2s2 .9 2 2v4c0 1.1-.9 2-2 2s-2-.9-2-2v-4z"
            />
          </svg>
          {isExpanded && (
            <span
              className={`ml-3 font-semibold ${
                activeItem === "mesas" ? "text-white" : "text-slate-300"
              }`}
            >
              Ventas
            </span>
          )}
        </div>

        {/* Gestión Mesas */}
        <div
          className={getItemClasses("gestionMesas")}
          onClick={() =>
            handleItemClick("gestionMesas", "/home-comandas/mesas")
          }
        >
          <svg
            className={`w-5 h-5 ${
              activeItem === "gestionMesas" ? "text-white" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          {isExpanded && (
            <span
              className={`ml-3 font-semibold ${
                activeItem === "gestionMesas" ? "text-white" : "text-slate-300"
              }`}
            >
              Gestión Mesas
            </span>
          )}
        </div>

        {/* Productos */}
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
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
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

        {/* Dollar Sign */}
        <div
          className={getItemClasses("pagos")}
          onClick={() => handleItemClick("pagos", "/home-comandas/pagos")}
        >
          <svg
            className={`w-5 h-5 ${activeItem === "pagos" ? "text-white" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
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

        {/* Cube */}
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
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
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

        {/* Bar Chart */}
        <div
          className={getItemClasses("reportes")}
          onClick={() => handleItemClick("reportes")}
        >
          <svg
            className={`w-5 h-5 ${
              activeItem === "reportes" ? "text-white" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
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

        {/* Diamond */}
        <div
          className={getItemClasses("promociones")}
          onClick={() => handleItemClick("promociones")}
        >
          <svg
            className={`w-5 h-5 ${
              activeItem === "promociones" ? "text-white" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
          {isExpanded && (
            <span
              className={`ml-3 font-semibold ${
                activeItem === "promociones" ? "text-white" : "text-slate-300"
              }`}
            >
              Promociones
            </span>
          )}
        </div>

        {/* Arrow Right */}
        <div
          className={getItemClasses("exportar")}
          onClick={() => handleItemClick("exportar")}
        >
          <svg
            className={`w-5 h-5 ${
              activeItem === "exportar" ? "text-white" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
          {isExpanded && (
            <span
              className={`ml-3 font-semibold ${
                activeItem === "exportar" ? "text-white" : "text-slate-300"
              }`}
            >
              Exportar
            </span>
          )}
        </div>
      </div>

      {/* Logout */}
      <div
        className={`${getItemClasses("logout")}`}
        onClick={() => handleItemClick("logout")}
      >
        <svg
          className={`w-5 h-5 ${activeItem === "logout" ? "text-white" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        {isExpanded && (
          <span
            className={`ml-3 font-semibold ${
              activeItem === "logout" ? "text-white" : "text-slate-300"
            }`}
          >
            Cerrar Sesión
          </span>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
