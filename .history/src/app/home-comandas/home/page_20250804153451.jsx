"use client";
import React from "react";
import Sidebar, { useSidebar } from "./components/Sidebar";
import DemoCard from "./components/DemoCard";
import TurnoCerradoCard from "./components/TurnoCerradoCard";
import VentasCard from "./components/VentasCard";
import DineroCard from "./components/DineroCard";
import StockCard from "./components/StockCard";
import DispositivosCard from "./components/DispositivosCard";

function Home() {
  const { isExpanded } = useSidebar();

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />

      {/* Main Content */}
      <div
        className={`flex-1 p-6 transition-all duration-300 ${
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

export default Home;
