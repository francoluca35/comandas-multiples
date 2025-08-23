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
    <div className="flex h-screen bg-gray-900 overflow-hidden">
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
         <div className="p-4 h-full">
          {isAdmin ? (
            // Dashboard completo para ADMIN
            <>
                             <div className="grid grid-cols-2 gap-4 h-full auto-rows-fr">
                 {/* Primera fila: 2 tarjetas */}
                 <div className="flex flex-col">
                   <TurnoCard />
                 </div>
                 <div className="flex flex-col">
                   <VentasCard />
                 </div>

                 {/* Segunda fila: 2 tarjetas */}
                 <div className="flex flex-col">
                   <DineroCard />
                 </div>
                 <div className="flex flex-col">
                   <StockCard />
                 </div>

                 {/* Tercera fila: 1 tarjeta centrada */}
                 <div className="col-span-2 flex flex-col">
                   <DispositivosCard />
                 </div>
               </div>


            </>
          ) : (
                         // Dashboard limitado para MESERO, COCINA y USUARIO
             <>
               <div className="grid grid-cols-2 gap-4 h-full max-w-4xl mx-auto">
                 {/* Solo turno y ventas */}
                 <div className="flex flex-col">
                   <TurnoCard />
                 </div>
                 <div className="flex flex-col">
                   <VentasCard />
                 </div>
               </div>


            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TurnoView() {
  const { isExpanded, toggleSidebar } = useSidebar();

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      <Sidebar />

      {/* Overlay para cerrar sidebar cuando está abierto */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content - Solo muestra el componente de turno */}
      <div
        className={`flex-1 transition-all duration-300 overflow-auto ${
          isExpanded
            ? "ml-56 sm:ml-64 md:ml-72 lg:ml-80 xl:ml-96 2xl:ml-[420px]"
            : "ml-16 sm:ml-20"
        }`}
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            <TurnoCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const { turnoAbierto } = useTurno();

  // Si el turno está cerrado, solo mostrar la vista de turno
  if (!turnoAbierto) {
    return <TurnoView />;
  }

  // Si el turno está abierto, mostrar el dashboard completo
  return <DashboardContent />;
}

function Home() {
  return (
    <RestaurantGuard>
      <SidebarProvider>
        <HomeContent />
      </SidebarProvider>
    </RestaurantGuard>
  );
}

export default Home;
