"use client";

import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRole } from "../../../context/RoleContext";

const DebugAuth = () => {
  const { usuario, rol, loading } = useAuth();
  const { permissions, roleInfo, currentRole } = useRole();

  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
      <h3 className="text-red-400 font-bold mb-2">🔍 Debug: Estado de Autenticación</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Loading:</strong> {loading ? "Sí" : "No"}
        </div>
        
        <div>
          <strong>Usuario (AuthContext):</strong> {JSON.stringify(usuario)}
        </div>
        
        <div>
          <strong>Rol (AuthContext):</strong> {rol || "null"}
        </div>
        
        <div>
          <strong>Rol (RoleContext):</strong> {currentRole || "null"}
        </div>
        
        <div>
          <strong>Permisos:</strong> {JSON.stringify(permissions)}
        </div>
        
        <div>
          <strong>RoleInfo:</strong> {JSON.stringify(roleInfo)}
        </div>
        
        <div>
          <strong>localStorage:</strong>
          <ul className="ml-4 mt-1">
            <li>usuario: {localStorage.getItem("usuario") || "null"}</li>
            <li>rol: {localStorage.getItem("rol") || "null"}</li>
            <li>restauranteId: {localStorage.getItem("restauranteId") || "null"}</li>
            <li>usuarioId: {localStorage.getItem("usuarioId") || "null"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;
