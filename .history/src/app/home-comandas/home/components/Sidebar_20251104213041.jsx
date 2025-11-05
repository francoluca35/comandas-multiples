"use client";
import React, { useState, useEffect, createContext, useContext } from "react";
import { db } from "../../../../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useUserProfile } from "../../../../hooks/useUserProfile";
import { useRole } from "../../../context/RoleContext";
import { useTurno } from "../../../context/TurnoContext";
import { useHistorialEmpleados } from "@/hooks/useHistorialEmpleados";
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
  const { permissions, roleInfo } = useRole();
  const { cerrarTurno } = useTurno();
  const { registrarInicioSesion, registrarCierreSesion } =
    useHistorialEmpleados();

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
    } else if (pathname === "/home-comandas/promociones") {
      setActiveItem("promociones");
    } else if (pathname === "/home-comandas/reportes") {
      setActiveItem("reportes");
    } else if (pathname === "/home-comandas/cocina") {
      setActiveItem("cocina");
    } else if (pathname === "/home-comandas/configuracion") {
      setActiveItem("configuracion");
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

  // Marcar online al montar y en eventos de cierre de pestaña
  useEffect(() => {
    const restauranteId =
      typeof window !== "undefined"
        ? localStorage.getItem("restauranteId")
        : null;
    const userId =
      typeof window !== "undefined" ? localStorage.getItem("usuario") : null;
    const markOnline = async (online) => {
      try {
        if (restauranteId && userId) {
          await updateDoc(
            doc(db, `restaurantes/${restauranteId}/users`, userId),
            {
              online,
              ultimaActividad: new Date().toISOString(),
            }
          );
        }
      } catch (e) {
        console.log("Error actualizando presencia:", e);
      }
    };

    // Al entrar a la app marcar online y registrar inicio de sesión
    markOnline(true);
    registrarInicioSesion();

    const handleBeforeUnload = () => {
      navigator.sendBeacon &&
        restauranteId &&
        userId &&
        navigator.sendBeacon(
          `/api/presencia`,
          JSON.stringify({ restauranteId, userId, online: false })
        );
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      markOnline(false);
      registrarCierreSesion();
    };
  }, []);

  const handleLogoClick = async () => {
    if (isExpanded) {
      // Si el sidebar está abierto, cerrar turno y cerrar sesión
      try {
        await cerrarTurno();
        try {
          const restauranteId = localStorage.getItem("restauranteId");
          const userId = localStorage.getItem("usuario");
          if (restauranteId && userId) {
            await updateDoc(
              doc(db, `restaurantes/${restauranteId}/users`, userId),
              { online: false, ultimaActividad: new Date().toISOString() }
            );
          }
          // Registrar cierre de sesión
          await registrarCierreSesion();
        } catch (e) {
          console.log("Error actualizando estado online (logo)", e);
        }
      } catch (error) {
        console.log("Error al cerrar turno:", error);
      }

      // Solo limpiar información de sesión del usuario, no todo el localStorage
      localStorage.removeItem("usuario");
      localStorage.removeItem("rol");
      localStorage.removeItem("usuarioId");
      localStorage.removeItem("userImage");
      localStorage.removeItem("imagen");
      router.push("/home-comandas/login");
    } else {
      // Si está cerrado, abrir el sidebar
      toggleSidebar();
    }
  };

  const handleLogout = async () => {
    // Cerrar turno antes de cerrar sesión
    try {
      await cerrarTurno();
      try {
        const restauranteId = localStorage.getItem("restauranteId");
        const userId = localStorage.getItem("usuario");
        if (restauranteId && userId) {
          await updateDoc(
            doc(db, `restaurantes/${restauranteId}/users`, userId),
            { online: false, ultimaActividad: new Date().toISOString() }
          );
        }
      } catch (e) {
        console.log("Error actualizando estado online (logout)", e);
      }
    } catch (error) {
      console.log("Error al cerrar turno:", error);
    }

    // Solo limpiar información de sesión del usuario, no todo el localStorage
    localStorage.removeItem("usuario");
    localStorage.removeItem("rol");
    localStorage.removeItem("usuarioId");
    localStorage.removeItem("userImage");
    localStorage.removeItem("imagen");
    router.push("/home-comandas/login");
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

  return (
    <div
      className={`${
        isExpanded ? "w-56 sm:w-64 md:w-72 lg:w-80 xl:w-96" : "w-16 sm:w-20"
      } fixed left-0 top-0 bg-slate-900 border-r border-slate-700/50 flex flex-col items-center py-3 sm:py-4 lg:py-6 space-y-2 sm:space-y-3 lg:space-y-4 transition-all duration-300 ease-in-out shadow-2xl shadow-slate-900/50 h-screen max-h-screen overflow-hidden z-20`}
    >
      {/* Foto de perfil del usuario */}
      <div
        className="cursor-pointer p-1 sm:p-2 rounded-full hover:bg-slate-700/30 transition-all duration-300 mb-1 sm:mb-2 md:mb-3 lg:mb-4"
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
      {isExpanded && roleInfo && (
        <div
          className={`px-3 py-2 rounded-lg ${roleInfo.bgColor} ${roleInfo.borderColor} border mb-3 w-full text-center`}
        >
          <div className={`text-sm font-semibold ${roleInfo.color}`}>
            {roleInfo.name}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {roleInfo.description}
          </div>
        </div>
      )}

      {/* Navigation Icons */}
      <div className="flex flex-col items-center space-y-1 sm:space-y-2 md:space-y-3 w-full px-1 sm:px-2 md:px-3 flex-1 overflow-y-auto">
        {/* Home - Todos los roles pueden acceder */}
        {permissions.canAccessHome && (
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

        {/* Ventas - Solo ADMIN, MESERO y COCINA */}
        {permissions.canAccessVentas && (
          <div
            className={getItemClasses("mesas")}
            onClick={() => handleItemClick("mesas", "/home-comandas/ventas")}
          >
            <svg
              className={`w-5 h-5 ${
                activeItem === "mesas" ? "text-white" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {/* Carrito de compras */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
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
        )}

        {/* Gestión Mesas - Solo ADMIN */}
        {permissions.canAccessMesas && (
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
              {/* Icono de gestión/edición de mesas */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
              {/* Mesa pequeña dentro */}
              <circle cx="7" cy="9" r="1.5" strokeWidth="1.5" />
            </svg>
            {isExpanded && (
              <span
                className={`ml-3 font-semibold ${
                  activeItem === "gestionMesas"
                    ? "text-white"
                    : "text-slate-300"
                }`}
              >
                Gestión Mesas
              </span>
            )}
          </div>
        )}

        {/* Productos - Solo ADMIN */}
        {permissions.canAccessProductos && (
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
              {/* Icono de plato */}
              <ellipse cx="12" cy="12" rx="8" ry="4" strokeWidth="2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v8"
              />
              <circle cx="8" cy="12" r="1.5" strokeWidth="1.5" />
              <circle cx="16" cy="12" r="1.5" strokeWidth="1.5" />
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

        {/* Inventario - Solo ADMIN */}
        {permissions.canAccessInventario && (
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
        )}

        {/* Promociones - Solo ADMIN */}
        {permissions.canAccessPromociones && (
          <div
            className={getItemClasses("promociones")}
            onClick={() =>
              handleItemClick("promociones", "/home-comandas/promociones")
            }
          >
            <svg
              className={`w-5 h-5 ${
                activeItem === "promociones" ? "text-white" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {/* Icono de etiqueta/promoción */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8l-1 6 6-1"
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
        )}

        {/* Reportes - Solo ADMIN */}
        {permissions.canAccessReportes && (
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
        )}

        {/* Ver Cocina - Solo ADMIN y COCINA */}
        {permissions.canAccessCocina && (
          <div
            className={getItemClasses("cocina")}
            onClick={() => handleItemClick("cocina", "/home-comandas/cocina")}
          >
            <svg
              className={`w-5 h-5 ${
                activeItem === "cocina" ? "text-white" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {/* Icono de horno */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4h16v12H4V4z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M8 4v4m8-4v4"
              />
              <circle cx="12" cy="14" r="2" strokeWidth="2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 14h4"
              />
            </svg>
            {isExpanded && (
              <span
                className={`ml-3 font-semibold ${
                  activeItem === "cocina" ? "text-white" : "text-slate-300"
                }`}
              >
                Ver Cocina
              </span>
            )}
          </div>
        )}

        {/* Pagos - Solo ADMIN */}
        {permissions.canAccessPagos && (
          <div
            className={getItemClasses("pagos")}
            onClick={() => handleItemClick("pagos", "/home-comandas/pagos")}
          >
            <svg
              className={`w-5 h-5 ${
                activeItem === "pagos" ? "text-white" : ""
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
                  activeItem === "pagos" ? "text-white" : "text-slate-300"
                }`}
              >
                Pagos
              </span>
            )}
          </div>
        )}

        {/* Configuración - Solo ADMIN */}
        {permissions.canAccessConfiguracion && (
          <div
            className={getItemClasses("configuracion")}
            onClick={() =>
              handleItemClick("configuracion", "/home-comandas/configuracion")
            }
          >
            <svg
              className={`w-5 h-5 ${
                activeItem === "configuracion" ? "text-white" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {isExpanded && (
              <span
                className={`ml-3 font-semibold ${
                  activeItem === "configuracion"
                    ? "text-white"
                    : "text-slate-300"
                }`}
              >
                Configuración
              </span>
            )}
          </div>
        )}
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
