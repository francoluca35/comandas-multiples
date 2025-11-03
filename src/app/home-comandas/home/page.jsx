"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar, { useSidebar, SidebarProvider } from "./components/Sidebar";

import TurnoCard from "./components/TurnoCerradoCard";
import VentasCard from "./components/VentasCard";
import DineroCard from "./components/DineroCard";
import StockCard from "./components/StockCard";
import DispositivosCard from "./components/DispositivosCard";

import { RestaurantGuard } from "../../../components/RestaurantGuard";
import { useTurno } from "@/app/context/TurnoContext";
import { useRole } from "@/app/context/RoleContext";
import useOrderReadyNotifications from "../../../hooks/useOrderReadyNotifications";
import OrderReadyNotification from "../../../components/OrderReadyNotification";
import MultipleOrderReadyNotifications from "../../../components/MultipleOrderReadyNotifications";
import useDeliveryDeliveredNotifications from "../../../hooks/useDeliveryDeliveredNotifications";
import MultipleDeliveryDeliveredNotifications from "../../../components/MultipleDeliveryDeliveredNotifications";
import { useStockAlertManager } from "../../../hooks/useStockAlertManager";
import StockLowAlert from "../../../components/StockLowAlert";

function DashboardContent() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { turnoInfo } = useTurno();
  const { permissions, isAdmin, isMesero } = useRole();
  
  // Hook para notificaciones de pedidos listos
  const {
    notifications,
    lastOrderReadyNotification,
    clearNotification,
    clearAllNotifications
  } = useOrderReadyNotifications();

  // Hook para notificaciones de pedidos entregados
  const {
    notifications: deliveredNotifications,
    clearNotification: clearDeliveredNotification,
    clearAllNotifications: clearAllDeliveredNotifications
  } = useDeliveryDeliveredNotifications();

  // Hook para alertas de stock bajo
  const {
    showAlert,
    stockBajo,
    handleCloseAlert,
    handleRememberLater,
    handleDontRemind,
    resetAlerts,
  } = useStockAlertManager();

  return (
    <div className="flex h-screen bg-[#1a1a1a] overflow-hidden">
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
          isExpanded
            ? "ml-56 sm:ml-64 md:ml-72 lg:ml-80 xl:ml-96"
            : "ml-16 sm:ml-20"
        }`}
      >
        {/* Dashboard Container */}
        <div className="p-4 sm:p-6 lg:p-8 min-h-full">
          {isAdmin ? (
            // Dashboard completo para ADMIN
            <div className="space-y-6">
              {/* Primera fila - 2 tarjetas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="min-h-[300px]">
                  <TurnoCard />
                </div>
                <div className="min-h-[300px]">
                  <VentasCard />
                </div>
              </div>
              
              {/* Segunda fila - 2 tarjetas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="min-h-[300px]">
                  <DineroCard />
                </div>
                <div className="min-h-[300px]">
                  <StockCard />
                </div>
              </div>
              
              {/* Tercera fila - Dispositivos */}
              <div className="min-h-[200px]">
                <DispositivosCard />
              </div>
            </div>
          ) : isMesero && permissions?.canAccessHomeLimited ? (
            // Dashboard limitado para MESERA: solo turno y mensaje
            <div className="flex items-center justify-center min-h-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-4xl w-full">
                <div className="min-h-[300px]">
                  <TurnoCard />
                </div>
                <div className="min-h-[300px]">
                  <DispositivosCard />
                </div>
              </div>
            </div>
          ) : (
            // Dashboard limitado para COCINA y USUARIO
            <div className="flex items-center justify-center min-h-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-4xl w-full">
                <div className="min-h-[300px]">
                  <TurnoCard />
                </div>
                <div className="min-h-[300px]">
                  <VentasCard />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notificaciones de pedidos listos */}
      <MultipleOrderReadyNotifications
        notifications={notifications}
        onClose={clearNotification}
      />

      {/* Notificaciones de pedidos entregados */}
      <MultipleDeliveryDeliveredNotifications
        notifications={deliveredNotifications}
        onClose={clearDeliveredNotification}
      />

      {/* Alerta de stock bajo */}
      <StockLowAlert
        isOpen={showAlert}
        onClose={handleCloseAlert}
        onRememberLater={handleRememberLater}
        onDontRemind={handleDontRemind}
      />
    </div>
  );
}

function TurnoView() {
  const { isExpanded, toggleSidebar } = useSidebar();

  return (
    <div className="flex h-screen bg-[#1a1a1a] overflow-hidden">
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
          isExpanded
            ? "ml-56 sm:ml-64 md:ml-72 lg:ml-80 xl:ml-96"
            : "ml-16 sm:ml-20"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 h-full flex items-center justify-center">
          <div className="w-full max-w-md">
            <TurnoCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const { turnoAbierto } = useTurno();
  const { isCocina, isRepartidor } = useRole();
  const router = useRouter();

  // Si es rol repartidor, redirigir directamente a su dashboard
  useEffect(() => {
    const rol = (localStorage.getItem("rol") || "").toLowerCase();
    if (rol === "repartidor" || isRepartidor) {
      router.push("/repartidor/dashboard");
    }
  }, [isRepartidor, router]);

  // Si es rol cocina, redirigir directamente a cocina
  useEffect(() => {
    if (isCocina) {
      router.push("/home-comandas/cocina");
    }
  }, [isCocina, router]);

  console.log("🏠 Home renderizando - turnoAbierto:", turnoAbierto);

  // Si es repartidor, no renderizar nada (se redirige a dashboard de repartidor)
  const rol = typeof window !== "undefined" ? (localStorage.getItem("rol") || "").toLowerCase() : "";
  if (rol === "repartidor" || isRepartidor) {
    return (
      <div className="flex h-screen bg-[#1a1a1a] items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Redirigiendo a dashboard de repartidor...</p>
        </div>
      </div>
    );
  }

  // Si es cocina, no renderizar nada (se redirige a cocina)
  if (isCocina) {
    return (
      <div className="flex h-screen bg-[#1a1a1a] items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Redirigiendo a cocina...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <RestaurantGuard>
        {turnoAbierto ? <DashboardContent /> : <TurnoView />}
      </RestaurantGuard>
    </SidebarProvider>
  );
}

export default Home;
