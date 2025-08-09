"use client";

import React from "react";
import { useRolePermissions } from "../../../../hooks/useRolePermissions";

const RoleInfoCard = () => {
  const {
    getRoleDisplayName,
    getRoleDescription,
    getRoleColor,
    getRoleBgColor,
    getRoleBorderColor,
    currentRole,
    permissions
  } = useRolePermissions();

  if (!currentRole) {
    return null;
  }

  const activePermissions = Object.entries(permissions)
    .filter(([key, value]) => value === true && key !== 'canManageTurno')
    .map(([key]) => key.replace('canAccess', '').toLowerCase());

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm border ${getRoleBorderColor()} rounded-xl p-4 shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-lg font-bold ${getRoleColor()}`}>
          Información del Rol
        </h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBgColor()} ${getRoleColor()}`}>
          {currentRole.toUpperCase()}
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-slate-300 text-sm font-medium">Rol:</p>
          <p className={`text-lg font-semibold ${getRoleColor()}`}>
            {getRoleDisplayName()}
          </p>
        </div>
        
        <div>
          <p className="text-slate-300 text-sm font-medium">Descripción:</p>
          <p className="text-slate-200 text-sm">
            {getRoleDescription()}
          </p>
        </div>
        
        <div>
          <p className="text-slate-300 text-sm font-medium">Permisos activos:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {activePermissions.map((permission, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-md text-xs font-medium ${getRoleBgColor()} ${getRoleColor()}`}
              >
                {permission}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleInfoCard;
