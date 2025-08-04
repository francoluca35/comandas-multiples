"use client";
import React, { useState } from "react";
import Sidebar from "../home/components/Sidebar";
import MesasView from "./components/MesasView";
import PedidoView from "./components/PedidoView";

function VentasPage() {
  const [currentView, setCurrentView] = useState("mesas"); // "mesas" o "pedido"
  const [selectedMesa, setSelectedMesa] = useState(null);

  const handleMesaClick = (mesa) => {
    setSelectedMesa(mesa);
    setCurrentView("pedido");
  };

  const handleBackToMesas = () => {
    setCurrentView("mesas");
    setSelectedMesa(null);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1">
        {currentView === "mesas" ? (
          <MesasView onMesaClick={handleMesaClick} />
        ) : (
          <PedidoView 
            mesa={selectedMesa} 
            onBack={handleBackToMesas} 
          />
        )}
      </div>
    </div>
  );
}

export default VentasPage; 