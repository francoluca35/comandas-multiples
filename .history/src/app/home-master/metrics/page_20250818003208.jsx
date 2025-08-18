"use client";
import React, { Suspense, lazy, useState } from "react";
import { useMetrics } from "../../../hooks/useMetrics";
import { FaTachometerAlt, FaChartLine, FaExclamationTriangle, FaSync } from "react-icons/fa";

// Lazy load de componentes pesados
const PerformanceDashboard = lazy(() => import("./components/PerformanceDashboard"));
const BusinessDashboard = lazy(() => import("./components/BusinessDashboard"));
const SystemDashboard = lazy(() => import("./components/SystemDashboard"));
const AlertsPanel = lazy(() => import("./components/AlertsPanel"));

// Componente de loading optimizado
const MetricsLoading = ({ message = "Cargando métricas..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  </div>
);

export default function MetricsPage() {
  const {
    metrics,
    loading,
    error,
    lastUpdate,
    getPerformanceStats,
    getBusinessStats,
    getSystemStats,
    getAlerts,
    loadHistoricalMetrics,
    clearMetrics,
  } = useMetrics();

  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("24h");

  const performanceStats = getPerformanceStats();
  const businessStats = getBusinessStats();
  const systemStats = getSystemStats();
  const alerts = getAlerts();

  const handleRefresh = async () => {
    await loadHistoricalMetrics(24, 100);
  };

  const handleClearMetrics = () => {
    if (confirm("¿Estás seguro de que quieres limpiar todas las métricas?")) {
      clearMetrics();
    }
  };

  if (loading) {
    return <MetricsLoading message="Inicializando sistema de métricas..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <div className="text-center p-8">
          <div className="text-red-400 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <FaTachometerAlt className="mr-2" />
              Dashboard de Métricas
            </h1>
            <p className="text-slate-400 text-sm">
              Monitoreo en tiempo real de toda la aplicación
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="1h">Última hora</option>
              <option value="6h">Últimas 6 horas</option>
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 días</option>
            </select>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
              title="Actualizar métricas"
            >
              <FaSync />
            </button>
            <button
              onClick={handleClearMetrics}
              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
              title="Limpiar métricas"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Estado del sistema */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-green-400 text-sm">Estado</div>
            <div className="text-white text-xl font-bold">Activo</div>
            <div className="text-xs text-slate-400">
              {lastUpdate ? `Actualizado: ${lastUpdate.toLocaleTimeString()}` : "Sin datos"}
            </div>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-blue-400 text-sm">Alertas</div>
            <div className="text-white text-xl font-bold">{alerts.length}</div>
            <div className="text-xs text-slate-400">
              {alerts.filter(a => a.severity === "high").length} críticas
            </div>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-purple-400 text-sm">Uptime</div>
            <div className="text-white text-xl font-bold">
              {systemStats?.uptime ? `${Math.floor(systemStats.uptime / 1000 / 60)}m` : "N/A"}
            </div>
            <div className="text-xs text-slate-400">Tiempo activo</div>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-orange-400 text-sm">Memoria</div>
            <div className="text-white text-xl font-bold">
              {systemStats?.memory?.used ? `${Math.round(systemStats.memory.used / 1024 / 1024)}MB` : "N/A"}
            </div>
            <div className="text-xs text-slate-400">Uso actual</div>
          </div>
        </div>

        {/* Alertas críticas */}
        {alerts.filter(a => a.severity === "high").length > 0 && (
          <div className="mb-4">
            <Suspense fallback={<MetricsLoading message="Cargando alertas..." />}>
              <AlertsPanel alerts={alerts.filter(a => a.severity === "high")} />
            </Suspense>
          </div>
        )}
      </div>

      {/* Tabs de navegación */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
          {[
            { id: "overview", label: "Vista General", icon: FaTachometerAlt },
            { id: "performance", label: "Performance", icon: FaChartLine },
            { id: "business", label: "Negocio", icon: FaChartLine },
            { id: "system", label: "Sistema", icon: FaChartLine },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              <tab.icon className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de las tabs */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Overview */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaChartLine className="mr-2" />
                Performance
              </h3>
              {performanceStats ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cargas de página:</span>
                    <span className="text-white font-semibold">{performanceStats.pageLoads.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Llamadas API:</span>
                    <span className="text-white font-semibold">{performanceStats.apiCalls.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tasa de cache:</span>
                    <span className="text-white font-semibold">{performanceStats.cache.hitRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Errores:</span>
                    <span className="text-white font-semibold">{performanceStats.errors.total}</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">Sin datos de performance</p>
              )}
            </div>

            {/* Business Overview */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaChartLine className="mr-2" />
                Negocio
              </h3>
              {businessStats ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pedidos:</span>
                    <span className="text-white font-semibold">{businessStats.orders.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Usuarios activos:</span>
                    <span className="text-white font-semibold">{businessStats.users.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Restaurantes activos:</span>
                    <span className="text-white font-semibold">{businessStats.restaurants.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Items sin stock:</span>
                    <span className="text-white font-semibold">{businessStats.inventory.outOfStock}</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">Sin datos de negocio</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <Suspense fallback={<MetricsLoading message="Cargando dashboard de performance..." />}>
            <PerformanceDashboard stats={performanceStats} />
          </Suspense>
        )}

        {activeTab === "business" && (
          <Suspense fallback={<MetricsLoading message="Cargando dashboard de negocio..." />}>
            <BusinessDashboard stats={businessStats} />
          </Suspense>
        )}

        {activeTab === "system" && (
          <Suspense fallback={<MetricsLoading message="Cargando dashboard del sistema..." />}>
            <SystemDashboard stats={systemStats} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
