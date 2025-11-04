"use client";
import React, { useState } from "react";
import { RestaurantGuard } from "../../../components/RestaurantGuard";
import RoleGuard from "../../../components/RoleGuard";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";
import DineroActual from "./components/DineroActual";
import Egresos from "./components/Egresos";
import InventarioStats from "./components/InventarioStats";
import Rendimiento from "./components/Rendimiento";
// import PaymentHistory from "./components/PaymentHistory"; // Componente eliminado - no funcionaba
import { usePagosOptimizado } from "../../../hooks/usePagosOptimizado";

function PagosContent() {
  const { isExpanded, toggleSidebar } = useSidebar();

  // Hook optimizado para todos los datos de pagos
  const {
    data,
    loading,
    error,
    fetchAllPagosData,
    formatDinero,
    getEfectivoTotal,
    getVirtualTotal,
    getTotalIngresos,
    getTotalEgresos,
    getEgresosEfectivo,
    getEgresosVirtual,
    getVentasEfectivo,
    getVentasVirtual,
  } = usePagosOptimizado();

  // Debug: Log del estado de loading
  console.log("🔍 PagosContent - loading:", loading, "error:", error);

  // Estados para controlar la visibilidad de cada sección
  const [sections, setSections] = useState({
    dineroActual: true,
    egresos: true,
    inventarioStats: true,
    rendimiento: true,
  });

  // Función para alternar la visibilidad de una sección
  const toggleSection = (sectionName) => {
    setSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar />

      {/* Overlay para cerrar sidebar cuando está abierto */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-10"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`flex-1 flex flex-col bg-slate-800 transition-all duration-300
  ${
    isExpanded
      ? "sm:ml-64 md:ml-72 lg:ml-80 xl:ml-96 2xl:ml-[420px]"
      : "sm:ml-16"
  }
`}
      >
        {/* Header */}
        <div className="bg-slate-900/50 border-b border-slate-700/50">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Pagos
            </h1>
            <p className="text-slate-400 mt-1 text-base">
              Gestiona el dinero, egresos, ingresos y rendimiento del
              restaurante
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 sm:ml-0 ml-4 overflow-auto bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
          <div className="w-auto sm:ml-30 ml-10   sm:max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col gap-6 sm:gap-8">
              {/* Dinero Actual Section */}
              <div className="w-full">
                <DineroActual
                  onToggle={() => toggleSection("dineroActual")}
                  isExpanded={sections.dineroActual}
                  data={data}
                  loading={loading}
                  error={error}
                  fetchAllPagosData={fetchAllPagosData}
                  formatDinero={formatDinero}
                  getEfectivoTotal={getEfectivoTotal}
                  getVirtualTotal={getVirtualTotal}
                  getVentasEfectivo={getVentasEfectivo}
                  getVentasVirtual={getVentasVirtual}
                  getEgresosEfectivo={getEgresosEfectivo}
                  getEgresosVirtual={getEgresosVirtual}
                />
              </div>

              {/* Egresos Section */}
              <div className="w-full">
                <Egresos
                  onToggle={() => toggleSection("egresos")}
                  isExpanded={sections.egresos}
                  data={data}
                  loading={loading}
                  error={error}
                  fetchAllPagosData={fetchAllPagosData}
                  formatDinero={formatDinero}
                  getTotalEgresos={getTotalEgresos}
                />
              </div>

              {/* Estadísticas de Inventario Section */}
              <div className="w-full">
                <InventarioStats
                  onToggle={() => toggleSection("inventarioStats")}
                  isExpanded={sections.inventarioStats}
                  formatDinero={formatDinero}
                />
              </div>

              {/* Rendimiento Section */}
              <div className="w-full">
                <Rendimiento
                  onToggle={() => toggleSection("rendimiento")}
                  isExpanded={sections.rendimiento}
                  data={data}
                  formatDinero={formatDinero}
                  getEfectivoTotal={getEfectivoTotal}
                  getVirtualTotal={getVirtualTotal}
                  getTotalIngresos={getTotalIngresos}
                  getTotalEgresos={getTotalEgresos}
                  getVentasEfectivo={getVentasEfectivo}
                  getVentasVirtual={getVentasVirtual}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PagosPage = () => {
  return (
    <RestaurantGuard>
      <RoleGuard
        requiredPermission="canAccessPagos"
        fallback={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-red-400 mb-2">
                Acceso Denegado
              </h1>
              <p className="text-slate-400 mb-4">
                No tienes permisos para acceder a la gestión de pagos.
              </p>
              <p className="text-slate-500 text-sm">
                Solo los administradores pueden gestionar los pagos del
                restaurante.
              </p>
            </div>
          </div>
        }
      >
        <div className="min-h-screen bg-slate-900 text-white">
          <SidebarProvider>
            <PagosContent />
          </SidebarProvider>
        </div>
      </RoleGuard>
    </RestaurantGuard>
  );
};

export default PagosPage;
