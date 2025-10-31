"use client";

import { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const { usuario, rol } = useAuth();

  const permissions = useMemo(() => {
    if (!rol) {
      return {};
    }

    const basePermissions = {
      // Todos los roles pueden abrir/cerrar turno
      canManageTurno: true,
    };

    switch (rol.toLowerCase()) {
      case "admin":
        return {
          ...basePermissions,
          // ADMIN: Acceso total sin restricciones
          canAccessHome: true,
          canAccessVentas: true,
          canAccessMesas: true,
          canAccessProductos: true,
          canAccessPagos: true,
          canAccessInventario: true,
          canAccessReportes: true,
          canAccessPromociones: true,
          canAccessCocina: true,
          canAccessGestion: true,
          canAccessConfiguracion: true,
          // Permisos administrativos
          canManageUsers: true,
          canManageRestaurant: true,
          canViewAllData: true,
          // Configurar zonas
          canConfigZones: true,
        };

      case "usuario":
        return {
          ...basePermissions,
          // USUARIO: Solo home (dashboard), turno y ventas (equivalente a MESERO)
          canAccessHome: true,
          canAccessVentas: true,
          canAccessMesas: false,
          canAccessProductos: false,
          canAccessPagos: false,
          canAccessInventario: false,
          canAccessReportes: false,
          canAccessPromociones: false,
          canAccessCocina: false,
          canAccessConfiguracion: false,
          // Sin permisos administrativos
          canManageUsers: false,
          canManageRestaurant: false,
          canViewAllData: false,
          canConfigZones: false,
        };

      case "mesero":
      case "mesera":
        return {
          ...basePermissions,
          // MESERO/MESERA: Home limitado (solo turno y mensaje), ventas, salón (todo menos configurar zonas), cocina
          canAccessHome: true,
          canAccessHomeLimited: true, // Solo turno y mensaje en home
          canAccessVentas: true,
          canAccessMesas: false, // No puede gestionar mesas, pero puede usar ventas/salón
          canAccessProductos: false,
          canAccessPagos: false,
          canAccessInventario: false,
          canAccessReportes: false,
          canAccessPromociones: false,
          canAccessCocina: true,
          canAccessConfiguracion: false,
          // Sin permisos administrativos
          canManageUsers: false,
          canManageRestaurant: false,
          canViewAllData: false,
          // No puede configurar zonas
          canConfigZones: false,
        };

      case "cocina":
        return {
          ...basePermissions,
          // COCINA: Solo acceso a cocina, siempre tiene turno abierto
          canAccessHome: false, // No accede a home, va directo a cocina
          canAccessVentas: false,
          canAccessMesas: false,
          canAccessProductos: false,
          canAccessPagos: false,
          canAccessInventario: false,
          canAccessReportes: false,
          canAccessPromociones: false,
          canAccessCocina: true, // Solo acceso a cocina
          canAccessConfiguracion: false,
          // Sin permisos administrativos
          canManageUsers: false,
          canManageRestaurant: false,
          canViewAllData: false,
          canConfigZones: false,
          // El rol cocina siempre tiene turno abierto (no necesita gestionar turno)
          alwaysHasTurnoOpen: true,
        };

      default:
        // Rol no reconocido, sin permisos
        return {
          ...basePermissions,
          canAccessHome: false,
          canAccessHomeLimited: false,
          canAccessVentas: false,
          canAccessMesas: false,
          canAccessProductos: false,
          canAccessPagos: false,
          canAccessInventario: false,
          canAccessReportes: false,
          canAccessPromociones: false,
          canAccessCocina: false,
          canAccessConfiguracion: false,
          canManageUsers: false,
          canManageRestaurant: false,
          canViewAllData: false,
          canConfigZones: false,
        };
    }
  }, [rol]);

  const roleInfo = useMemo(() => {
    if (!rol) return null;

    const roleConfig = {
      admin: {
        name: "Administrador",
        description: "Acceso total al sistema",
        color: "text-red-400",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-500/30",
      },
      usuario: {
        name: "Usuario",
        description: "Acceso a ventas y dashboard",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
      },
      mesero: {
        name: "Mesero",
        description: "Acceso a ventas, salón y cocina",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
      },
      mesera: {
        name: "Mesera",
        description: "Acceso a ventas, salón y cocina",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
      },
      cocina: {
        name: "Cocina",
        description: "Solo vista de cocina - turno siempre abierto",
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-500/30",
      },
    };

    return (
      roleConfig[rol.toLowerCase()] || {
        name: "Rol Desconocido",
        description: "Sin permisos definidos",
        color: "text-gray-400",
        bgColor: "bg-gray-500/20",
        borderColor: "border-gray-500/30",
      }
    );
  }, [rol]);

  const value = {
    permissions,
    roleInfo,
    currentRole: rol,
    isAdmin: rol?.toLowerCase() === "admin",
    isUsuario: rol?.toLowerCase() === "usuario",
    isMesero: rol?.toLowerCase() === "mesero" || rol?.toLowerCase() === "mesera",
    isCocina: rol?.toLowerCase() === "cocina",
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole debe ser usado dentro de RoleProvider");
  }
  return context;
};
