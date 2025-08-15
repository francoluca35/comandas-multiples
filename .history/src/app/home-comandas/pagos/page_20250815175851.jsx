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
              {/* Debug Section */}
              <div className="w-full">
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-slate-900/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/25">
                        <svg
                          className="w-5 h-5 text-white"
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
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        Debug Finanzas
                      </h2>
                    </div>
                    <button
                      onClick={() => toggleSection("debug")}
                      className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
                      title={
                        sections.debug ? "Ocultar sección" : "Mostrar sección"
                      }
                    >
                      <svg
                        className={`w-5 h-5 text-white transition-transform duration-300 ${
                          sections.debug ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  {sections.debug && <FinanzasDebug />}
                </div>
              </div>

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
