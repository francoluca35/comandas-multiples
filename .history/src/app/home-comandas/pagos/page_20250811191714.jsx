"use client";
import React, { useState } from "react";
import { RestaurantGuard } from "../../../components/RestaurantGuard";
import RoleGuard from "../../../components/RoleGuard";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";
import DineroActual from "./components/DineroActual";
import Egresos from "./components/Egresos";
import Ingresos from "./components/Ingresos";
import Rendimiento from "./components/Rendimiento";
import PaymentHistory from "./components/PaymentHistory";

function PagosContent() {
  const { isExpanded, toggleSidebar } = useSidebar();

  // Estados para controlar la visibilidad de cada sección
  const [sections, setSections] = useState({
    dineroActual: true,
    egresos: true,
    ingresos: true,
    rendimiento: true,
    paymentHistory: true,
  });

  // Función para alternar la visibilidad de una sección
  const toggleSection = (sectionName) => {
    setSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar />

      {/* Overlay para cerrar sidebar cuando está abierto */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-10"
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
        {/* Header */}
        <div className="bg-slate-900/50 border-b border-slate-700/50">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Pagos
            </h1>
            <p className="text-slate-400 mt-1 text-base">
              Gestiona el dinero, egresos, ingresos y rendimiento del
              restaurante
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col gap-8">
              {/* Dinero Actual Section */}
              <div className="w-full">
                <DineroActual
                  onToggle={() => toggleSection("dineroActual")}
                  isExpanded={sections.dineroActual}
                />
              </div>

              {/* Egresos Section */}
              <div className="w-full">
                <Egresos
                  onToggle={() => toggleSection("egresos")}
                  isExpanded={sections.egresos}
                />
              </div>

              {/* Ingresos Section */}
              <div className="w-full">
                <Ingresos
                  onToggle={() => toggleSection("ingresos")}
                  isExpanded={sections.ingresos}
                />
              </div>

              {/* Rendimiento Section */}
              <div className="w-full">
                <Rendimiento
                  onToggle={() => toggleSection("rendimiento")}
                  isExpanded={sections.rendimiento}
                />
              </div>

              {/* Historial de Pagos Section */}
              <div className="w-full">
                <PaymentHistory
                  onToggle={() => toggleSection("paymentHistory")}
                  isExpanded={sections.paymentHistory}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PagosPage = () => {
  return (
    <RestaurantGuard>
      <RoleGuard
        requiredPermission="canAccessPagos"
        fallback={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-red-400 mb-2">
                Acceso Denegado
              </h1>
              <p className="text-slate-400 mb-4">
                No tienes permisos para acceder a la gestión de pagos.
              </p>
              <p className="text-slate-500 text-sm">
                Solo los administradores pueden gestionar los pagos del
                restaurante.
              </p>
            </div>
          </div>
        }
      >
        <div className="min-h-screen bg-slate-900 text-white">
          <SidebarProvider>
            <PagosContent />
          </SidebarProvider>
        </div>
      </RoleGuard>
    </RestaurantGuard>
  );
};

export default PagosPage;
