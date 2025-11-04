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
import HistorialPedidos from "./components/HistorialPedidos";
import useOrderReadyNotifications from "../../../hooks/useOrderReadyNotifications";
import OrderReadyNotification from "../../../components/OrderReadyNotification";
import MultipleOrderReadyNotifications from "../../../components/MultipleOrderReadyNotifications";

function VentasContent() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const {
    tables,
    loading,
    fetchTables,
    updateTableStatus,
    addProductsToTable,
    clearTable,
    markTableAsPaid,
    setupRealtimeListener,
  } = useTables();

  const [activeMode, setActiveMode] = useState("salon");
  const [currentView, setCurrentView] = useState("mesas");
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [showHistorial, setShowHistorial] = useState(false);

  // Hook para notificaciones de pedidos listos
  const {
    notifications,
    lastOrderReadyNotification,
    clearNotification,
    clearAllNotifications
  } = useOrderReadyNotifications();

  // Cargar mesas al montar el componente
  useEffect(() => {
    console.log("🔄 Cargando mesas inicialmente...");
    fetchTables();
  }, []);

  // Configurar listener en tiempo real para actualizaciones automáticas
  useEffect(() => {
    console.log("🔔 Configurando listener en tiempo real...");
    const unsubscribe = setupRealtimeListener();
    
    return () => {
      if (unsubscribe) {
        console.log("🔕 Desconectando listener en tiempo real");
        unsubscribe();
      }
    };
  }, []);

  // Función para refrescar mesas cuando se actualiza una mesa
  const handleMesaActualizada = () => {
    console.log("🔄 Refrescando mesas después de actualización...");
    fetchTables();
  };

  const handleMesaClick = (mesa) => {
    if (mesa.estado === "libre") {
      // Mesa libre - crear nuevo pedido
      setSelectedMesa(mesa);
      setCurrentView("pedido");
    } else if (mesa.estado === "ocupado") {
      // Mesa ocupada - ver pedido existente
      setSelectedMesa(mesa);
      setCurrentView("mesaOcupada");
    } else if (mesa.estado === "en_preparacion") {
      // Mesa en preparación - ver pedido existente (puede agregar más productos o cobrar)
      setSelectedMesa(mesa);
      setCurrentView("mesaOcupada");
    } else if (mesa.estado === "servido") {
      // Mesa servida - ver pedido existente (puede agregar más productos o cobrar)
      setSelectedMesa(mesa);
      setCurrentView("mesaOcupada");
    } else if (mesa.estado === "pagado") {
      // Mesa pagada - mostrar información y opción de liberar
      alert(
        `Mesa ${mesa.numero} ya está pagada. Usa el botón verde para liberarla.`
      );
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

  const handleMesaCobrada = async (mesa, paymentMethod = "efectivo") => {
    try {
      // Determinar tipo de venta según el modo activo
      const tipoVenta = activeMode || "salon";
      
      // Marcar la mesa como pagada con el método de pago y tipo de venta
      await markTableAsPaid(mesa.id, paymentMethod, mesa.total, tipoVenta);
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

  const handleHistorialClick = () => {
    setShowHistorial(true);
  };

  const handleCloseHistorial = () => {
    setShowHistorial(false);
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
            onMesaActualizada={handleMesaActualizada}
          />
        );
      default:
        return <MesasView onMesaClick={handleMesaClick} />;
    }
  };

  return (
    <div className="flex h-[100dvh] bg-[#1a1a1a] overflow-hidden relative">
      <div className="z-30">
        <Sidebar />
      </div>

      {/* Overlay para cerrar sidebar cuando está abierto */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`flex-1 flex flex-col bg-[#1a1a1a] transition-all duration-300 min-w-0 ${
          isExpanded
            ? "ml-16 sm:ml-56 md:ml-64 lg:ml-72 xl:ml-80"
            : "ml-12 sm:ml-16"
        }`}
      >
        {/* Navigation Bar */}
        <NavigationBar
          activeMode={activeMode}
          onModeChange={handleModeChange}
          onHistorialClick={handleHistorialClick}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative">{renderView()}</div>
      </div>

      {/* Modal de Historial de Pedidos */}
      {showHistorial && (
        <HistorialPedidos onClose={handleCloseHistorial} />
      )}

      {/* Notificaciones de pedidos listos */}
      <MultipleOrderReadyNotifications
        notifications={notifications}
        onClose={clearNotification}
      />
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
