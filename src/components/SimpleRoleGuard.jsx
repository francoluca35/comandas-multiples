"use client";

import { useEffect, useState } from "react";

export const SimpleRoleGuard = ({
  children,
  requiredPermission,
  fallback = null,
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = () => {
      const rol = localStorage.getItem("rol");

      if (!rol) {
        setHasPermission(false);
        setIsLoading(false);
        return;
      }

      // Permisos basados en rol
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

      const userPermissions = permissions[rol.toLowerCase()] || [];
      const hasRequiredPermission =
        userPermissions.includes(requiredPermission);

      setHasPermission(hasRequiredPermission);
      setIsLoading(false);
    };

    checkPermission();
  }, [requiredPermission]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Verificando permisos...</div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      fallback || (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-red-400 mb-2">
              Acceso Denegado
            </h1>
            <p className="text-slate-400 mb-4">
              No tienes permisos para acceder a esta sección.
            </p>
          </div>
        </div>
      )
    );
  }

  return children;
};
