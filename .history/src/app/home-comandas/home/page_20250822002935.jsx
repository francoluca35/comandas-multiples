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
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#2a2a2a] border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">Dashboard</h1>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-4">
          {isAdmin ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 h-full">
              {/* Primera fila - 2 columnas */}
              <div className="h-64 md:h-72 lg:h-80">
                <TurnoCard />
              </div>
              <div className="h-64 md:h-72 lg:h-80">
                <VentasCard />
              </div>
              
              {/* Segunda fila - 2 columnas */}
              <div className="h-64 md:h-72 lg:h-80">
                <DineroCard />
              </div>
              <div className="h-64 md:h-72 lg:h-80">
                <StockCard />
              </div>
              
              {/* Tercera fila - ancho completo */}
              <div className="md:col-span-2 h-64 md:h-72 lg:h-80">
                <DispositivosCard />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                <div className="h-64 md:h-72 lg:h-80">
                  <TurnoCard />
                </div>
                <div className="h-64 md:h-72 lg:h-80">
                  <VentasCard />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function TurnoView() {
  const { turnoInfo } = useTurno();
  const { permissions, isAdmin } = useRole();

  return (
    <div className="flex h-screen bg-[#1a1a1a] overflow-hidden">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#2a2a2a] border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-4">
          {isAdmin ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 h-full">
              {/* Primera fila - 2 columnas */}
              <div className="h-64 md:h-72 lg:h-80">
                <TurnoCard />
              </div>
              <div className="h-64 md:h-72 lg:h-80">
                <VentasCard />
              </div>
              
              {/* Segunda fila - 2 columnas */}
              <div className="h-64 md:h-72 lg:h-80">
                <DineroCard />
              </div>
              <div className="h-64 md:h-72 lg:h-80">
                <StockCard />
              </div>
              
              {/* Tercera fila - ancho completo */}
              <div className="md:col-span-2 h-64 md:h-72 lg:h-80">
                <DispositivosCard />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                <div className="h-64 md:h-72 lg:h-80">
                  <TurnoCard />
                </div>
                <div className="h-64 md:h-72 lg:h-80">
                  <VentasCard />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Home() {
  return (
    <RestaurantGuard>
      <SidebarProvider>
        <TurnoView />
      </SidebarProvider>
    </RestaurantGuard>
  );
}

export default Home;
