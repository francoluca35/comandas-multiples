"use client";
import React, { useState } from "react";
import { RestaurantGuard } from "../../../components/RestaurantGuard";
import RoleGuard from "../../../components/RoleGuard";
import FranchiseManager from "../../../components/FranchiseManager";
import DigitalRemitoSystem from "../../../components/DigitalRemitoSystem";
import TabletNetworkManager from "../../../components/TabletNetworkManager";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";

function GestionContent() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const [showFranchiseManager, setShowFranchiseManager] = useState(false);
  const [showRemitoSystem, setShowRemitoSystem] = useState(false);
  const [showTabletManager, setShowTabletManager] = useState(false);

  const managementCards = [
    {
      id: 'franchises',
      title: 'Gestión de Franquicias',
      description: 'Administra franquicias y sucursales del sistema',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => setShowFranchiseManager(true)
    },
    {
      id: 'remitos',
      title: 'Remitos Digitales',
      description: 'Sistema de remitos entre sucursales y pedidos de reposición',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => setShowRemitoSystem(true)
    },
    {
      id: 'tablets',
      title: 'Gestión de Tablets',
      description: 'Tablets conectadas por Wi-Fi interno sin internet',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => setShowTabletManager(true)
    },
    {
      id: 'reports',
      title: 'Reportes Centralizados',
      description: 'Reportes consolidados de todas las sucursales',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'bg-orange-600 hover:bg-orange-700',
      onClick: () => alert('Próximamente: Sistema de Reportes Centralizados')
    }
  ];

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />

      <div
        className={`flex-1 flex flex-col bg-slate-800 transition-all duration-300 ${
          isExpanded
            ? "ml-56 sm:ml-64 md:ml-72 lg:ml-80 xl:ml-96 2xl:ml-[420px]"
            : "ml-16 sm:ml-20"
        }`}
      >
        {/* Overlay para cerrar sidebar */}
        {isExpanded && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
            onClick={toggleSidebar}
          />
        )}

        {/* Header */}
        <div className="bg-slate-800 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Gestión Centralizada
              </h1>
              <p className="text-slate-400 mt-1">
                Administra franquicias, sucursales y operaciones del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {managementCards.map((card) => (
              <div
                key={card.id}
                onClick={card.onClick}
                className={`${card.color} text-white rounded-lg p-6 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {card.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm opacity-90">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Franquicias Activas</p>
                  <p className="text-2xl font-bold text-white">-</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Sucursales</p>
                  <p className="text-2xl font-bold text-white">-</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Remitos Pendientes</p>
                  <p className="text-2xl font-bold text-white">-</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Sistema de gestión centralizada inicializado</p>
                  <p className="text-slate-400 text-xs">Hace unos momentos</p>
                </div>
              </div>
              <div className="text-center py-8 text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">No hay actividad reciente</p>
                <p className="text-xs mt-1">Las acciones del sistema aparecerán aquí</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FranchiseManager
        isOpen={showFranchiseManager}
        onClose={() => setShowFranchiseManager(false)}
      />

      <DigitalRemitoSystem
        isOpen={showRemitoSystem}
        onClose={() => setShowRemitoSystem(false)}
      />
    </div>
  );
}

const GestionPage = () => {
  return (
    <RestaurantGuard>
      <RoleGuard
        requiredPermission="canAccessGestion"
        fallback={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-red-400 mb-2">
                Acceso Denegado
              </h1>
              <p className="text-slate-400 mb-4">
                No tienes permisos para acceder a la gestión centralizada.
              </p>
              <p className="text-slate-500 text-sm">
                Solo los administradores pueden acceder a estas funcionalidades.
              </p>
            </div>
          </div>
        }
      >
        <div className="min-h-screen bg-slate-900 text-white">
          <SidebarProvider>
            <GestionContent />
          </SidebarProvider>
        </div>
      </RoleGuard>
    </RestaurantGuard>
  );
};

export default GestionPage;
