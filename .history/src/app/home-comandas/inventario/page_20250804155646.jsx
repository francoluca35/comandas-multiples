"use client";
import React from "react";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";
import StockActual from "./components/StockActual";
import Ingresos from "./components/Ingresos";

function InventarioContent() {
  const { isExpanded } = useSidebar();

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col bg-slate-800 transition-all duration-300 ${
          isExpanded ? "ml-0" : "ml-0"
        }`}
      >
        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Inventario
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              Gestiona el stock y los ingresos del restaurante
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Stock Actual Section */}
              <StockActual />
              
              {/* Ingresos Section */}
              <Ingresos />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InventarioPage() {
  return (
    <SidebarProvider>
      <InventarioContent />
    </SidebarProvider>
  );
}

export default InventarioPage; 