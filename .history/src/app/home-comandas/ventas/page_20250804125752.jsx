"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "../home/components/Sidebar";
import NavigationBar from "./components/NavigationBar";
import MesasView from "./components/MesasView";
import PedidoView from "./components/PedidoView";
import MesaOcupadaView from "./components/MesaOcupadaView";
import TakeawayView from "./components/TakeawayView";
import DeliveryView from "./components/DeliveryView";

function VentasPage() {
  const [currentView, setCurrentView] = useState("mesas"); // "mesas", "pedido", "mesaOcupada", "takeaway", "delivery"
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [activeMode, setActiveMode] = useState("salon");
  const [mesasOcupadas, setMesasOcupadas] = useState(new Set());
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

  const handleMesaOcupadaClick = (mesa) => {
    setSelectedMesa(mesa);
    setCurrentView("mesaOcupada");
  };

  const handleMesaOcupada = (numeroMesa) => {
    console.log(`Mesa ${numeroMesa} marcada como ocupada`);
    setMesasOcupadas((prev) => new Set([...prev, numeroMesa]));
  };

  const handleMesaCobrada = (numeroMesa) => {
    console.log(`Mesa ${numeroMesa} cobrada y liberada`);
    setMesasOcupadas((prev) => {
      const newSet = new Set(prev);
      newSet.delete(numeroMesa);
      return newSet;
    });
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
            activeMode={activeMode}
            mesasOcupadas={mesasOcupadas}
            onMesaOcupada={handleMesaOcupada}
            onMesaOcupadaClick={handleMesaOcupadaClick}
          />
        );
      case "pedido":
        return (
          <PedidoView
            mesa={selectedMesa}
            onBack={handleBackToMesas}
            onMesaOcupada={handleMesaOcupada}
          />
        );
      case "mesaOcupada":
        return (
          <MesaOcupadaView
            mesa={selectedMesa}
            onBack={handleBackToMesas}
            onMesaCobrada={handleMesaCobrada}
          />
        );
      case "takeaway":
        return <TakeawayView onBack={handleBackToMesas} />;
      case "delivery":
        return <DeliveryView onBack={handleBackToMesas} />;
      default:
        return (
          <MesasView
            onMesaClick={handleMesaClick}
            activeMode={activeMode}
            mesasOcupadas={mesasOcupadas}
            onMesaOcupada={handleMesaOcupada}
            onMesaOcupadaClick={handleMesaOcupadaClick}
          />
        );
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
        <div className="flex-1">{renderContent()}</div>
      </div>
    </div>
  );
}

export default VentasPage;
