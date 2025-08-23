"use client";
import React from "react";
import Sidebar, { useSidebar, SidebarProvider } from "./components/Sidebar";

import TurnoCard from "./components/TurnoCerradoCard";
import VentasCard from "./components/VentasCard";
import DineroCard from "./components/DineroCard";
import StockCard from "./components/StockCard";
import DispositivosCard from "./components/DispositivosCard";

import { RestaurantGuard } from "../../../components/RestaurantGuard";
import { useTurno } from "@/app/context/TurnoContext";
import { useRole } from "@/app/context/RoleContext";

function DashboardContent() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { turnoInfo } = useTurno();
  const { permissions, isAdmin } = useRole();

  return (
    <div className="flex h-screen bg-[#1a1a1a] overflow-hidden">
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
            ? "ml-56 sm:ml-64 md:ml-72 lg:ml-80 xl:ml-96"
            : "ml-16 sm:ml-20"
        }`}
      >
        {/* Dashboard Container */}
        <div className="p-4 sm:p-6 lg:p-8 h-full">
          {isAdmin ? (
            // Dashboard completo para ADMIN
            <div className="h-full flex flex-col">
              {/* Grid principal */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 flex-1">
                {/* Primera fila */}
                <div className="space-y-4 lg:space-y-6">
                  <TurnoCard />
                  <DineroCard />
                </div>
                
                {/* Segunda fila */}
                <div className="space-y-4 lg:space-y-6">
                  <VentasCard />
                  <StockCard />
                </div>
              </div>
              
              {/* Tercera fila - Dispositivos */}
              <div className="mt-4 lg:mt-6">
                <DispositivosCard />
              </div>
            </div>
          ) : (
            // Dashboard limitado para MESERO, COCINA y USUARIO
            <div className="h-full flex flex-col justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-4xl mx-auto w-full">
                <TurnoCard />
                <VentasCard />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TurnoView() {
  const { isExpanded, toggleSidebar } = useSidebar();

  return (
    <div className="flex h-screen bg-[#1a1a1a] overflow-hidden">
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
            ? "ml-56 sm:ml-64 md:ml-72 lg:ml-80 xl:ml-96"
            : "ml-16 sm:ml-20"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 h-full flex items-center justify-center">
          <div className="w-full max-w-md">
            <TurnoCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const { turnoAbierto } = useTurno();

  return (
    <SidebarProvider>
      <RestaurantGuard>
        {turnoAbierto ? <DashboardContent /> : <TurnoView />}
      </RestaurantGuard>
    </SidebarProvider>
  );
}

export default Home;
