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
          isExpanded ? "ml-56 sm:ml-64 md:ml-72 lg:ml-80 xl:ml-96 2xl:ml-[420px]" : "ml-16 sm:ml-20"
        }`}
      >
        {/* Responsive padding and grid */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            {/* Primera fila: 3 tarjetas */}
            <DemoCard />
            <TurnoCerradoCard />
            <VentasCard />

            {/* Segunda fila: 3 tarjetas */}
            <DineroCard />
            <StockCard />
            <DispositivosCard />
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
