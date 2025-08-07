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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 p-6 transition-all duration-300 overflow-auto ${
          isExpanded ? "ml-0" : "ml-0"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DemoCard />
          <TurnoCerradoCard />
          <VentasCard />
          <DineroCard />
          <StockCard />
          <DispositivosCard />
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
