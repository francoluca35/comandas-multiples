"use client";
import React from "react";
import Sidebar, { useSidebar, SidebarProvider } from "./components/Sidebar";
import DemoCard from "./components/DemoCard";
import TurnoCerradoCard from "./components/TurnoCerradoCard";
import VentasCard from "./components/VentasCard";
import DineroCard from "./components/DineroCard";
import StockCard from "./components/StockCard";
import DispositivosCard from "./components/DispositivosCard";
import { RestaurantGuard } from "../../../components/RestaurantGuard";

function HomeContent() {
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

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 overflow-auto ${
          isExpanded ? "ml-0" : "ml-0"
        }`}
      >
        {/* Responsive padding and grid */}
        <div className="p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 2xl:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 2xl:gap-10">
            {/* Demo Card - Span 2 columns on larger screens */}
            <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
              <DemoCard />
            </div>

            {/* Turno Cerrado Card */}
            <div className="sm:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
              <TurnoCerradoCard />
            </div>

            {/* Ventas Card - Span 2 columns on larger screens */}
            <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
              <VentasCard />
            </div>

            {/* Dinero Card */}
            <div className="sm:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
              <DineroCard />
            </div>

            {/* Stock Card */}
            <div className="sm:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
              <StockCard />
            </div>

            {/* Dispositivos Card */}
            <div className="sm:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
              <DispositivosCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
