"use client";
import React from "react";
import Sidebar, { useSidebar, SidebarProvider } from "./components/Sidebar";
import DemoCard from "./components/DemoCard";
import TurnoCard from "./components/TurnoCerradoCard";
import VentasCard from "./components/VentasCard";
import DineroCard from "./components/DineroCard";
import StockCard from "./components/StockCard";
import DispositivosCard from "./components/DispositivosCard";
import RoleInfoCard from "./components/RoleInfoCard";
import { ElectronAuthGuard } from "../../../components/ElectronAuthGuard";

function DashboardContent() {
  const { isExpanded, toggleSidebar } = useSidebar();

  // Obtener el rol del localStorage directamente para evitar conflictos
  const rol =
    typeof window !== "undefined" ? localStorage.getItem("rol") : null;
  const isAdmin = rol === "admin";

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
            ? "ml-56 sm:ml-64 md:ml-72 lg:ml-80 xl:ml-[420px]"
            : "ml-16 sm:ml-20"
        }`}
      >
        {/* Responsive padding and grid */}
        <div className="p-4">
          {isAdmin ? (
            // Dashboard completo para ADMIN
            <>
              <div className="grid grid-cols-3 gap-3">
                {/* Primera fila: 3 tarjetas */}
                <DemoCard />
                <TurnoCard />
                <VentasCard />

                {/* Segunda fila: 3 tarjetas */}
                <DineroCard />
                <StockCard />
                <DispositivosCard />
              </div>

              {/* Tercera fila: Información del rol */}
              <div className="mt-6">
                <RoleInfoCard />
              </div>
            </>
          ) : (
            // Dashboard limitado para MESERO, COCINA y USUARIO
            <>
              <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
                {/* Solo turno y ventas */}
                <TurnoCard />
                <VentasCard />
              </div>

              {/* Información del rol */}
              <div className="mt-6 max-w-2xl mx-auto">
                <RoleInfoCard />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Home() {
  return (
    <ElectronAuthGuard>
      <SidebarProvider>
        <DashboardContent />
      </SidebarProvider>
    </ElectronAuthGuard>
  );
}

export default Home;
