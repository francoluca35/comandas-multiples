"use client";
import React, { useState, useEffect } from "react";
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
  const [contextsLoaded, setContextsLoaded] = useState(false);

  // Verificar que todos los contextos estén cargados
  useEffect(() => {
    console.log("📊 DashboardContent - Verificando contextos...");
    console.log("  - turnoInfo:", turnoInfo);
    console.log("  - permissions:", permissions);
    console.log("  - isAdmin:", isAdmin);
    
    // Verificar que tenemos todos los datos necesarios
    const hasTurnoData = turnoInfo !== null;
    const hasPermissions = permissions && Object.keys(permissions).length > 0;
    const hasRoleInfo = isAdmin !== undefined;
    
    console.log("  - hasTurnoData:", hasTurnoData);
    console.log("  - hasPermissions:", hasPermissions);
    console.log("  - hasRoleInfo:", hasRoleInfo);
    
    if (hasTurnoData && hasPermissions && hasRoleInfo) {
      console.log("✅ Todos los contextos cargados correctamente");
      setContextsLoaded(true);
    } else {
      console.log("⏳ Esperando que se carguen todos los contextos...");
      // Forzar re-renderizado después de un delay
      setTimeout(() => {
        setContextsLoaded(prev => !prev);
      }, 500);
    }
  }, [turnoInfo, permissions, isAdmin]);

  // Mostrar loading mientras se cargan los contextos
  if (!contextsLoaded) {
    console.log("⏳ DashboardContent - Mostrando loading...");
    return (
      <div className="flex h-screen bg-[#1a1a1a] overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-lg">Cargando dashboard...</div>
        </div>
      </div>
    );
  }

  console.log("✅ DashboardContent - Renderizando dashboard completo");

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
        <div className="p-4 sm:p-6 lg:p-8 min-h-full">
          {isAdmin ? (
            // Dashboard completo para ADMIN
            <div className="space-y-6">
              {/* Primera fila - 2 tarjetas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="min-h-[300px]">
                  <TurnoCard />
                </div>
                <div className="min-h-[300px]">
                  <VentasCard />
                </div>
              </div>
              
              {/* Segunda fila - 2 tarjetas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="min-h-[300px]">
                  <DineroCard />
                </div>
                <div className="min-h-[300px]">
                  <StockCard />
                </div>
              </div>
              
              {/* Tercera fila - Dispositivos */}
              <div className="min-h-[200px]">
                <DispositivosCard />
              </div>
            </div>
          ) : (
            // Dashboard limitado para MESERO, COCINA y USUARIO
            <div className="flex items-center justify-center min-h-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-4xl w-full">
                <div className="min-h-[300px]">
                  <TurnoCard />
                </div>
                <div className="min-h-[300px]">
                  <VentasCard />
                </div>
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
