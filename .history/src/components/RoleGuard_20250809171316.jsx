"use client";

import { useRole } from "../app/context/RoleContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RoleGuard = ({ 
  children, 
  requiredPermission, 
  fallback = null,
  redirectTo = "/home-comandas/home"
}) => {
  const { permissions, loading } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && permissions && !permissions[requiredPermission]) {
      console.log(`Acceso denegado: Se requiere permiso "${requiredPermission}"`);
      router.push(redirectTo);
    }
  }, [permissions, requiredPermission, redirectTo, router, loading]);

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no tiene el permiso requerido, mostrar fallback o redirigir
  if (!permissions || !permissions[requiredPermission]) {
    if (fallback) {
      return fallback;
    }
    return null;
  }

  // Si tiene el permiso, mostrar el contenido
  return children;
};

export default RoleGuard;
