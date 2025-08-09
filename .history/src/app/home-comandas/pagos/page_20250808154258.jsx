"use client";
import React, { useState } from "react";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";
import DineroActual from "./components/DineroActual";
import Egresos from "./components/Egresos";
import Ingresos from "./components/Ingresos";
import Rendimiento from "./components/Rendimiento";

function PagosContent() {
  const { isExpanded, toggleSidebar } = useSidebar();

  // Estados para controlar la visibilidad de cada sección
  const [sections, setSections] = useState({
    dineroActual: true,
    egresos: true,
    ingresos: true,
    rendimiento: true,
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
        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50">
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
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-3xl font-bold text-white">
                    dinero actual
                  </h2>
                  <button
                    onClick={() => toggleSection("dineroActual")}
                    className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
                    title={
                      sections.dineroActual
                        ? "Ocultar sección"
                        : "Mostrar sección"
                    }
                  >
                    <svg
                      className={`w-5 h-5 text-white transition-transform duration-300 ${
                        sections.dineroActual ? "rotate-180" : ""
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
                {sections.dineroActual && (
                  <div className="w-full max-w-2xl">
                    <DineroActual />
                  </div>
                )}
              </div>

              {/* Egresos Section */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-3xl font-bold text-white">Egresos</h2>
                  <button
                    onClick={() => toggleSection("egresos")}
                    className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
                    title={
                      sections.egresos ? "Ocultar sección" : "Mostrar sección"
                    }
                  >
                    <svg
                      className={`w-5 h-5 text-white transition-transform duration-300 ${
                        sections.egresos ? "rotate-180" : ""
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
                {sections.egresos && (
                  <div className="w-full max-w-2xl">
                    <Egresos />
                  </div>
                )}
              </div>

              {/* Ingresos Section */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-3xl font-bold text-white">Ingresos</h2>
                  <button
                    onClick={() => toggleSection("ingresos")}
                    className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
                    title={
                      sections.ingresos ? "Ocultar sección" : "Mostrar sección"
                    }
                  >
                    <svg
                      className={`w-5 h-5 text-white transition-transform duration-300 ${
                        sections.ingresos ? "rotate-180" : ""
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
                {sections.ingresos && (
                  <div className="w-full max-w-2xl">
                    <Ingresos />
                  </div>
                )}
              </div>

              {/* Rendimiento Section */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-3xl font-bold text-white">Rendimiento</h2>
                  <button
                    onClick={() => toggleSection("rendimiento")}
                    className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
                    title={
                      sections.rendimiento
                        ? "Ocultar sección"
                        : "Mostrar sección"
                    }
                  >
                    <svg
                      className={`w-5 h-5 text-white transition-transform duration-300 ${
                        sections.rendimiento ? "rotate-180" : ""
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
                {sections.rendimiento && (
                  <div className="w-full max-w-2xl">
                    <Rendimiento />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PagosPage() {
  return (
    <SidebarProvider>
      <PagosContent />
    </SidebarProvider>
  );
}

export default PagosPage;
