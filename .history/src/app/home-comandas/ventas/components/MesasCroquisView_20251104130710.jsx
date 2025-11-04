"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTables } from "../../../../hooks/useTables";
import { useRestaurantZones } from "../../../../hooks/useRestaurantZones";
import { useRole } from "../../../../app/context/RoleContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";
import ZoneConfigModal from "../../../../components/ZoneConfigModal";

// Función para obtener el restaurantId desde localStorage
const getRestaurantId = () => {
  if (typeof window !== "undefined") {
    const restaurantId = localStorage.getItem("restauranteId");
    if (!restaurantId) {
      throw new Error("No se encontró el ID del restaurante");
    }
    return restaurantId;
  }
  return null;
};

function MesasCroquisView({ onMesaClick }) {
  const { tables, loading, error, fetchTables } = useTables();
  const { zonesConfig, getCurrentConfig, fetchZonesConfig } = useRestaurantZones();
  const { permissions, isAdmin } = useRole();
  const [locationFilter, setLocationFilter] = useState("todas");
  const [mesaSizes, setMesaSizes] = useState({});
  const [showZoneConfig, setShowZoneConfig] = useState(false);

  // Cargar mesas y configuración al montar el componente
  useEffect(() => {
    fetchTables();
    fetchZonesConfig();
  }, []);

  // Cargar tamaños de mesa
  useEffect(() => {
    if (tables.length > 0) {
      const sizes = {};
      tables.forEach(mesa => {
        sizes[mesa.id] = mesa.tamaño || "normal";
      });
      setMesaSizes(sizes);
    }
  }, [tables]);


  const handleMesaClick = (mesa) => {
    onMesaClick(mesa);
  };


  const getStatusColor = (estado) => {
    switch (estado) {
      case "libre":
        return "bg-green-600 hover:bg-green-500";
      case "ocupado":
        return "bg-yellow-600 hover:bg-yellow-500";
      case "servido":
        return "bg-red-600 hover:bg-red-500";
      case "pagado":
        return "bg-green-600 hover:bg-green-500";
      default:
        return "bg-gray-600 hover:bg-gray-500";
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case "libre":
        return "Libre";
      case "ocupado":
        return "En Cocina";
      case "servido":
        return "Listo";
      case "pagado":
        return "Pagado";
      default:
        return "Libre";
    }
  };

  const handleLiberarMesaManual = async (mesa, e) => {
    e.stopPropagation();

    if (
      !confirm(
        `¿Estás seguro de que quieres liberar manualmente la Mesa ${mesa.numero}? Esta acción la marcará como disponible y eliminará todos los datos del pedido.`
      )
    ) {
      return;
    }

    try {
      const mesaRef = doc(
        db,
        `restaurantes/${getRestaurantId()}/tables/${mesa.id}`
      );

      await updateDoc(mesaRef, {
        estado: "libre",
        cliente: "",
        productos: [],
        total: 0,
        updatedAt: new Date(),
      });

      console.log(`Mesa ${mesa.numero} liberada manualmente`);
      alert(`Mesa ${mesa.numero} liberada exitosamente`);

      fetchTables();
    } catch (error) {
      console.error("Error al liberar mesa:", error);
      alert("Error al liberar la mesa. Inténtalo de nuevo.");
    }
  };

  // Obtener configuración actual de zonas
  const currentConfig = zonesConfig ? getCurrentConfig() : { zones: ["adentro", "afuera"], labels: { adentro: "Adentro", afuera: "Afuera" } };

  // Filtrar mesas según la ubicación seleccionada
  const filteredTables = tables.filter((mesa) => {
    if (locationFilter === "todas") return true;
    return mesa.lugar === locationFilter;
  });

  // Separar mesas por ubicación usando la configuración actual
  const mesasPorZona = {};
  currentConfig.zones.forEach(zone => {
    mesasPorZona[zone] = filteredTables.filter(mesa => mesa.lugar === zone);
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Cargando mesas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-white">{error}</p>
        </div>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No hay mesas disponibles
          </h3>
          <p className="text-gray-400 mb-6">
            Ve a "Gestión Mesas" para crear las primeras mesas
          </p>
          <a
            href="/home-comandas/mesas"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Crear Mesas
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#1a1a1a] p-2 sm:p-3 md:p-4 lg:p-6 max-w-full overflow-y-auto">
      {/* Botonera de ubicación y controles */}
      <div className="flex flex-col gap-3 mb-3 sm:mb-4 sticky top-0 bg-[#1a1a1a] z-10 pb-2">
        <div className="flex flex-wrap justify-center items-center gap-2">
          {/* Filtros de ubicación */}
          <div className="bg-[#2a2a2a] rounded-xl p-1 flex flex-wrap justify-center gap-1 shadow-lg max-w-full overflow-x-auto">
            <button
              onClick={() => setLocationFilter("todas")}
              className={`px-2.5 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap min-w-[60px] ${
                locationFilter === "todas"
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "text-gray-300 hover:text-white hover:bg-[#3a3a3a]"
              }`}
            >
              Todas
            </button>
            {currentConfig.zones.map((zone) => (
              <button
                key={zone}
                onClick={() => setLocationFilter(zone)}
                className={`px-2.5 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap min-w-[60px] ${
                  locationFilter === zone
                    ? "bg-blue-600 text-white shadow-lg transform scale-105"
                    : "text-gray-300 hover:text-white hover:bg-[#3a3a3a]"
                }`}
              >
                {currentConfig.labels[zone] || zone}
              </button>
            ))}
          </div>

          {/* Botón de configuración de zonas - Solo visible para admin */}
          {isAdmin && permissions?.canConfigZones && (
            <button
              onClick={() => setShowZoneConfig(true)}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 shadow-lg shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Configurar Zonas</span>
            </button>
          )}
        </div>

        {/* Instrucciones */}
        <div className="text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            📋 Haz click en una mesa para seleccionarla
          </p>
        </div>
      </div>

      {/* Vista Grid */}
      <div className="w-full">
        <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2 sm:gap-3 md:gap-4">
          {filteredTables.map((mesa) => {
            const currentSize = mesaSizes[mesa.id] || "normal";
            
            return (
              <div
                key={mesa.id}
                className="group relative"
              >
                <button
                  onClick={() => handleMesaClick(mesa)}
                  className={`${getStatusColor(
                    mesa.estado
                  )} text-white rounded-2xl p-4 text-center transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-white/20 w-full h-24 flex flex-col items-center justify-center transform hover:scale-105`}
                >
                  <div className="text-lg font-bold drop-shadow-lg">
                    {mesa.numero}
                  </div>
                  <div className="text-xs opacity-90 font-medium drop-shadow-md">
                    {getStatusText(mesa.estado)}
                  </div>
                  <div className="text-xs opacity-75 font-semibold drop-shadow-sm mt-1">
                    {currentConfig.labels[mesa.lugar] || mesa.lugar || "Sin ubicación"}
                  </div>
                  {currentSize === "familiar" && (
                    <div className="text-xs opacity-75 font-semibold drop-shadow-sm">
                      👨‍👩‍👧‍👦
                    </div>
                  )}
                </button>

                {/* Botón Liberar Mesa Manual */}
                {(mesa.estado === "ocupado" || mesa.estado === "servido" || mesa.estado === "pagado") && (
                  <button
                    onClick={(e) => handleLiberarMesaManual(mesa, e)}
                    className="absolute -top-2 -right-2 bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1 rounded-full transition-all duration-200 transform hover:scale-110 shadow-xl z-20 border-2 border-white"
                    title="Liberar Mesa Manual"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mensaje cuando no hay mesas con el filtro seleccionado */}
      {filteredTables.length === 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-400 text-lg">
            No hay mesas en la ubicación "
            {locationFilter === "todas"
              ? "todas"
              : currentConfig.labels[locationFilter] || locationFilter}
            "
          </p>
        </div>
      )}

      {/* Modal de Configuración de Zonas */}
      <ZoneConfigModal
        isOpen={showZoneConfig}
        onClose={() => setShowZoneConfig(false)}
        onConfigChange={async (newConfig) => {
          await fetchZonesConfig();
          await fetchTables(); // Recargar mesas después de la migración
          setShowZoneConfig(false);
        }}
      />
    </div>
  );
}

export default MesasCroquisView;
