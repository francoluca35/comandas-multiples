"use client";
import React from "react";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";
import DineroActual from "./components/DineroActual";
import Egresos from "./components/Egresos";
import Ingresos from "./components/Ingresos";

function PagosContent() {
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
        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Pagos
            </h1>
            <p className="text-slate-400 mt-1 text-base">
              Gestiona el dinero, egresos e ingresos del restaurante
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Dinero Actual Section */}
              <DineroActual />

              {/* Egresos Section */}
              <Egresos />

              {/* Ingresos Section */}
              <Ingresos />
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
