"use client";
import React, { useState, useEffect } from "react";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";
import { useTables } from "../../../hooks/useTables";
import NavigationBar from "./components/NavigationBar";
import MesasView from "./components/MesasView";
import PedidoView from "./components/PedidoView";
import MesaOcupadaView from "./components/MesaOcupadaView";
import TakeawayView from "./components/TakeawayView";
import DeliveryView from "./components/DeliveryView";

function VentasContent() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const {
    tables,
    loading,
    fetchTables,
    updateTableStatus,
    addProductsToTable,
    clearTable,
  } = useTables();

  const [activeMode, setActiveMode] = useState("salon");
  const [currentView, setCurrentView] = useState("mesas");
  const [selectedMesa, setSelectedMesa] = useState(null);

  // Cargar mesas al montar el componente
  useEffect(() => {
    fetchTables();
  }, []);

  const handleMesaClick = (mesa) => {
    if (mesa.estado === "libre") {
      // Mesa libre - crear nuevo pedido
      setSelectedMesa(mesa);
      setCurrentView("pedido");
    } else if (mesa.estado === "ocupado") {
      // Mesa ocupada - ver pedido existente
      setSelectedMesa(mesa);
      setCurrentView("mesaOcupada");
    }
  };

  const handleMesaOcupada = async (mesa) => {
    try {
      // Marcar la mesa como ocupada
      await updateTableStatus(mesa.id, "ocupado");
      // Recargar las mesas para actualizar el estado
      await fetchTables();
      // Volver a la vista de mesas
      setCurrentView("mesas");
      setSelectedMesa(null);
    } catch (error) {
      console.error("Error al marcar mesa como ocupada:", error);
    }
  };

  const handleMesaCobrada = async (mesa) => {
    try {
      // Limpiar la mesa (resetear a estado libre)
      await clearTable(mesa.id);
      // Recargar las mesas para actualizar el estado
      await fetchTables();
      // Volver a la vista de mesas
      setCurrentView("mesas");
      setSelectedMesa(null);
    } catch (error) {
      console.error("Error al cobrar mesa:", error);
    }
  };

  const handleBackToMesas = () => {
    setCurrentView("mesas");
    setSelectedMesa(null);
  };

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    setCurrentView("mesas");
    setSelectedMesa(null);
  };

  const renderView = () => {
    switch (currentView) {
      case "mesas":
        if (activeMode === "salon") {
          return <MesasView onMesaClick={handleMesaClick} />;
        } else if (activeMode === "takeaway") {
          return <TakeawayView onBack={handleBackToMesas} />;
        } else if (activeMode === "delivery") {
          return <DeliveryView onBack={handleBackToMesas} />;
        }
        break;
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
      default:
        return <MesasView onMesaClick={handleMesaClick} />;
    }
  };

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
      
      <div
        className={`flex-1 flex flex-col bg-slate-800 transition-all duration-300 ${
          isExpanded
            ? "ml-56 sm:ml-64 md:ml-72 lg:ml-80 xl:ml-96 2xl:ml-[420px]"
            : "ml-16 sm:ml-20"
        }`}
      >
        {/* Navigation Bar */}
        <NavigationBar
          activeMode={activeMode}
          onModeChange={handleModeChange}
          showFilters={activeMode === "salon"}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">{renderView()}</div>
      </div>
    </div>
  );
}

function VentasPage() {
  return (
    <SidebarProvider>
      <VentasContent />
    </SidebarProvider>
  );
}

export default VentasPage;
