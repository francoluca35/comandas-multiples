import { useRole } from "../app/context/RoleContext";

export const useRolePermissions = () => {
  const { permissions, roleInfo, currentRole, isAdmin, isUsuario, isMesero, isCocina } =
    useRole();

  const canAccess = (permission) => {
    return permissions?.[permission] || false;
  };

  const canAccessMultiple = (permissionsList) => {
    return permissionsList.every((permission) => canAccess(permission));
  };

  const canAccessAny = (permissionsList) => {
    return permissionsList.some((permission) => canAccess(permission));
  };

  const getRoleDisplayName = () => {
    return roleInfo?.name || "Usuario";
  };

  const getRoleDescription = () => {
    return roleInfo?.description || "";
  };

  const getRoleColor = () => {
    return roleInfo?.color || "text-gray-400";
  };

  const getRoleBgColor = () => {
    return roleInfo?.bgColor || "bg-gray-500/20";
  };

  const getRoleBorderColor = () => {
    return roleInfo?.borderColor || "border-gray-500/30";
  };

  return {
    // Permisos
    permissions,
    canAccess,
    canAccessMultiple,
    canAccessAny,

    // Información del rol
    roleInfo,
    currentRole,
    getRoleDisplayName,
    getRoleDescription,
    getRoleColor,
    getRoleBgColor,
    getRoleBorderColor,

    // Helpers de rol
    isAdmin,
    isUsuario,
    isMesero,
    isCocina,

    // Permisos específicos (para facilitar el uso)
    canAccessHome: canAccess("canAccessHome"),
    canAccessVentas: canAccess("canAccessVentas"),
    canAccessMesas: canAccess("canAccessMesas"),
    canAccessProductos: canAccess("canAccessProductos"),
    canAccessPagos: canAccess("canAccessPagos"),
    canAccessInventario: canAccess("canAccessInventario"),
    canAccessReportes: canAccess("canAccessReportes"),
    canAccessPromociones: canAccess("canAccessPromociones"),
    canManageTurno: canAccess("canManageTurno"),
    canManageUsers: canAccess("canManageUsers"),
    canManageRestaurant: canAccess("canManageRestaurant"),
    canViewAllData: canAccess("canViewAllData"),
  };
};
