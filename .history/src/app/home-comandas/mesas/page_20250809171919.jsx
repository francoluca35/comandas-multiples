"use client";

import React, { useState, useEffect } from "react";
import { RestaurantGuard } from "../../../components/RestaurantGuard";
import RoleGuard from "../../../components/RoleGuard";
import Sidebar, { SidebarProvider } from "../home/components/Sidebar";
import { useTables } from "../../../../hooks/useTables";
import { useUserProfile } from "../../../../hooks/useUserProfile";
import { useTurno } from "../../../context/TurnoContext";
import { useMensajesUsuario } from "../../../../hooks/useMensajesUsuario";
import { useErrorHandler } from "../../../../hooks/useErrorHandler";
import { useRolePermissions } from "../../../../hooks/useRolePermissions";
import CloudinaryImage from "../../../../components/CloudinaryImage";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import Modal from "../../../../components/ui/Modal";
import { toast } from "sonner";
import MesasManagement from "./components/MesasManagement";

function MesasContent() {
  const { isExpanded, toggleSidebar } = useSidebar();

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar />

      {/* Overlay para cerrar sidebar cuando está abierto */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`flex-1 flex flex-col bg-slate-800 transition-all duration-300 ${
          isExpanded
            ? "ml-56 sm:ml-64 md:ml-72 lg:ml-80 xl:ml-96 2xl:ml-[420px]"
            : "ml-16 sm:ml-20"
        }`}
      >
        <MesasManagement />
      </div>
    </div>
  );
}

const MesasPage = () => {
  return (
    <RestaurantGuard>
      <RoleGuard 
        requiredPermission="canAccessMesas"
        fallback={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-red-400 mb-2">
                Acceso Denegado
              </h1>
              <p className="text-slate-400 mb-4">
                No tienes permisos para acceder a la gestión de mesas.
              </p>
              <p className="text-slate-500 text-sm">
                Solo los administradores pueden gestionar las mesas del restaurante.
              </p>
            </div>
          </div>
        }
      >
        <div className="min-h-screen bg-slate-900 text-white">
          <MesasContent />
        </div>
      </RoleGuard>
    </RestaurantGuard>
  );
};

export default MesasPage;
