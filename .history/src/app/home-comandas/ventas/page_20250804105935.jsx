"use client";
import React, { useState } from "react";
import Sidebar from "../home/components/Sidebar";
import MesasView from "./components/MesasView";
import PedidoView from "./components/PedidoView";
import TakeawayView from "./components/TakeawayView";
import DeliveryView from "./components/DeliveryView";

function VentasPage() {
  const [currentView, setCurrentView] = useState("mesas"); // "mesas", "pedido", "takeaway", "delivery"
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [activeMode, setActiveMode] = useState("salon");

  const handleMesaClick = (mesa) => {
    setSelectedMesa(mesa);
    setCurrentView("pedido");
  };

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    if (mode === "takeaway") {
      setCurrentView("takeaway");
    } else if (mode === "delivery") {
      setCurrentView("delivery");
    } else {
      setCurrentView("mesas");
    }
  };

  const handleBackToMesas = () => {
    setCurrentView("mesas");
    setSelectedMesa(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case "mesas":
        return (
          <MesasView
            onMesaClick={handleMesaClick}
            onModeChange={handleModeChange}
          />
        );
      case "pedido":
        return <PedidoView mesa={selectedMesa} onBack={handleBackToMesas} />;
      case "takeaway":
        return <TakeawayView onBack={handleBackToMesas} />;
      case "delivery":
        return <DeliveryView onBack={handleBackToMesas} />;
      default:
        return (
          <MesasView
            onMesaClick={handleMesaClick}
            onModeChange={handleModeChange}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1">{renderContent()}</div>
    </div>
  );
}

export default VentasPage;
