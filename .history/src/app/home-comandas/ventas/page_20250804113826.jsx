"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "../home/components/Sidebar";
import NavigationBar from "./components/NavigationBar";
import MesasView from "./components/MesasView";
import PedidoView from "./components/PedidoView";
import TakeawayView from "./components/TakeawayView";
import DeliveryView from "./components/DeliveryView";

function VentasPage() {
  const [currentView, setCurrentView] = useState("mesas"); // "mesas", "pedido", "takeaway", "delivery"
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [activeMode, setActiveMode] = useState("salon");
  const searchParams = useSearchParams();

  // Check URL parameters on component mount
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode) {
      setActiveMode(mode);
      if (mode === "takeaway") {
        setCurrentView("takeaway");
      } else if (mode === "delivery") {
        setCurrentView("delivery");
      } else if (mode === "salon") {
        setCurrentView("mesas");
      }
    }
  }, [searchParams]);

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
        return <MesasView onMesaClick={handleMesaClick} activeMode={activeMode} />;
      case "pedido":
        return <PedidoView mesa={selectedMesa} onBack={handleBackToMesas} />;
      case "takeaway":
        return <TakeawayView onBack={handleBackToMesas} />;
      case "delivery":
        return <DeliveryView onBack={handleBackToMesas} />;
      default:
        return <MesasView onMesaClick={handleMesaClick} activeMode={activeMode} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Persistent Navigation Bar */}
        <NavigationBar 
          activeMode={activeMode} 
          onModeChange={handleModeChange}
        />
        {/* Dynamic Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default VentasPage;
