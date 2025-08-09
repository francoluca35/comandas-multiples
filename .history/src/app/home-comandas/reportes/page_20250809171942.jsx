"use client";
import React, { useState, useEffect } from "react";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";
import ReportesGenerator from "./components/ReportesGenerator";
import ReportStats from "./components/ReportStats";
import { RestaurantGuard } from "../../../components/RestaurantGuard";
import RoleGuard from "../../../components/RoleGuard";
import { useUserProfile } from "../../../../hooks/useUserProfile";
import { useTurno } from "../../../context/TurnoContext";
import { useMensajesUsuario } from "../../../../hooks/useMensajesUsuario";
import { useErrorHandler } from "../../../../hooks/useErrorHandler";
import { useRolePermissions } from "../../../../hooks/useRolePermissions";
import CloudinaryImage from "../../../../components/CloudinaryImage";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import Modal from "../../../../components/ui/Modal";
import { toast } from "sonner";

function ReportesContent() {
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

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 overflow-auto ${
          isExpanded
            ? "ml-56 sm:ml-64 md:ml-72 lg:ml-80 xl:ml-96 2xl:ml-[420px]"
            : "ml-16 sm:ml-20"
        }`}
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Reportes
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                  Genera reportes detallados de tu restaurante en formato Excel
                  para análisis y control
                </p>
              </div>

              {/* Estadísticas de Reportes */}
              <ReportStats />

              {/* Reportes Generator Component */}
              <ReportesGenerator />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ReportesPage = () => {
  return (
    <RestaurantGuard>
      <RoleGuard
        requiredPermission="canAccessReportes"
        fallback={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-red-400 mb-2">
                Acceso Denegado
              </h1>
              <p className="text-slate-400 mb-4">
                No tienes permisos para acceder a los reportes.
              </p>
              <p className="text-slate-500 text-sm">
                Solo los administradores pueden ver los reportes del
                restaurante.
              </p>
            </div>
          </div>
        }
      >
        <SidebarProvider>
          <ReportesContent />
        </SidebarProvider>
      </RoleGuard>
    </RestaurantGuard>
  );
};

export default ReportesPage;
