"use client";
import React, { useState, useEffect } from "react";
import { useTables } from "../../../../hooks/useTables";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";

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

function MesasView({ onMesaClick }) {
  const { tables, loading, error, fetchTables } = useTables();
  const [locationFilter, setLocationFilter] = useState("todas"); // "todas", "afuera", "adentro"

  // Cargar mesas al montar el componente
  useEffect(() => {
    fetchTables();
  }, []);

  const handleMesaClick = (mesa) => {
    onMesaClick(mesa);
  };

  const handleLiberarMesaPagada = async (mesa, e) => {
    e.stopPropagation(); // Evitar que se active el click de la mesa

    if (
      !confirm(
        `¿Estás seguro de que quieres liberar la Mesa ${mesa.numero}? Esta acción la marcará como disponible.`
      )
    ) {
      return;
    }

    try {
      // Actualizar la mesa en Firestore para liberarla
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

      console.log(`Mesa ${mesa.numero} liberada exitosamente`);
      alert(`Mesa ${mesa.numero} liberada exitosamente`);

      // Recargar las mesas para mostrar los cambios
      fetchTables();
    } catch (error) {
      console.error("Error al liberar mesa:", error);
      alert("Error al liberar la mesa. Inténtalo de nuevo.");
    }
  };

  const handleMesaServida = async (mesa, e) => {
    e.stopPropagation(); // Evitar que se active el click de la mesa

    if (
      !confirm(
        `¿Confirmar que la comida de la Mesa ${mesa.numero} ya fue servida?`
      )
    ) {
      return;
    }

    try {
      // Actualizar la mesa en Firestore para marcarla como servida
      const mesaRef = doc(
        db,
        `restaurantes/${getRestaurantId()}/tables/${mesa.id}`
      );

      await updateDoc(mesaRef, {
        estado: "servido",
        updatedAt: new Date(),
      });

      console.log(`Mesa ${mesa.numero} marcada como servida`);
      alert(`Mesa ${mesa.numero} marcada como servida`);

      // Recargar las mesas para mostrar los cambios
      fetchTables();
    } catch (error) {
      console.error("Error al marcar mesa como servida:", error);
      alert("Error al marcar la mesa como servida. Inténtalo de nuevo.");
    }
  };

  const handleEliminarComandas = async (mesa, e) => {
    e.stopPropagation(); // Evitar que se active el click de la mesa

    if (
      !confirm(
        `¿Estás seguro de que quieres eliminar las comandas de la Mesa ${mesa.numero}? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      // Actualizar la mesa en Firestore para liberarla
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

      console.log(`Comandas eliminadas de la Mesa ${mesa.numero}`);
      alert(`Comandas eliminadas exitosamente de la Mesa ${mesa.numero}`);

      // Recargar las mesas para mostrar los cambios
      fetchTables();
    } catch (error) {
      console.error("Error al eliminar comandas:", error);
      alert("Error al eliminar las comandas. Inténtalo de nuevo.");
    }
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
        return "Desconocido";
    }
  };

  // Filtrar mesas según la ubicación seleccionada
  const filteredTables = tables.filter((mesa) => {
    if (locationFilter === "todas") return true;
    return mesa.lugar === locationFilter;
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
    <div className="h-full bg-[#1a1a1a] p-4 sm:p-6 lg:p-8">
      {/* Botonera de ubicación en el centro */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="bg-[#2a2a2a] rounded-xl p-1 flex shadow-lg">
          <button
            onClick={() => setLocationFilter("todas")}
            className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
              locationFilter === "todas"
                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                : "text-gray-300 hover:text-white hover:bg-[#3a3a3a] hover:scale-105"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setLocationFilter("adentro")}
            className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
              locationFilter === "adentro"
                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                : "text-gray-300 hover:text-white hover:bg-[#3a3a3a] hover:scale-105"
            }`}
          >
            Adentro
          </button>
          <button
            onClick={() => setLocationFilter("afuera")}
            className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
              locationFilter === "afuera"
                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                : "text-gray-300 hover:text-white hover:bg-[#3a3a3a] hover:scale-105"
            }`}
          >
            Afuera
          </button>
        </div>
      </div>

      {/* Grid de mesas optimizado para tablets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
        {filteredTables.map((mesa) => (
          <div key={mesa.id} className="relative group">
            <button
              onClick={() => handleMesaClick(mesa)}
              className={`${getStatusColor(
                mesa.estado
              )} text-white rounded-xl p-4 sm:p-5 lg:p-6 text-center transition-all duration-300 transform hover:scale-105 w-full h-full min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] shadow-lg hover:shadow-xl border-2 border-transparent hover:border-white/20`}
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 drop-shadow-lg">{mesa.numero}</div>
              <div className="text-sm sm:text-base lg:text-lg opacity-90 font-medium drop-shadow-md">
                {getStatusText(mesa.estado)}
              </div>
              {mesa.lugar && (
                <div className="text-xs sm:text-sm opacity-75 mt-1 sm:mt-2 drop-shadow-sm">
                  {mesa.lugar === "adentro" ? "Adentro" : "Afuera"}
                </div>
              )}
              {mesa.cliente && (
                <div className="text-xs sm:text-sm opacity-75 mt-1 sm:mt-2 truncate drop-shadow-sm">
                  Cliente: {mesa.cliente}
                </div>
              )}
              {mesa.total > 0 && (
                <div className="text-xs sm:text-sm opacity-75 mt-1 sm:mt-2 font-semibold drop-shadow-sm">
                  Total: ${mesa.total}
                </div>
              )}
            </button>

            {/* Botón Eliminar Comandas - Solo para mesas ocupadas */}
            {mesa.estado === "ocupado" && (
              <button
                onClick={(e) => handleEliminarComandas(mesa, e)}
                className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-red-600 hover:bg-red-700 text-white text-xs px-2 sm:px-3 py-1 sm:py-2 rounded-full transition-all duration-200 transform hover:scale-110 shadow-2xl z-10 border-2 border-white/80 backdrop-blur-sm"
                title="Eliminar Comandas"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 drop-shadow-sm"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}

            {/* Botón Liberar Mesa - Solo para mesas pagadas */}
            {mesa.estado === "pagado" && (
              <button
                onClick={(e) => handleLiberarMesaPagada(mesa, e)}
                className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-green-600 hover:bg-green-700 text-white text-xs px-2 sm:px-3 py-1 sm:py-2 rounded-full transition-all duration-200 transform hover:scale-110 shadow-2xl z-10 border-2 border-white/80 backdrop-blur-sm"
                title="Liberar Mesa"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 drop-shadow-sm"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            )}
            {mesa.estado === "servido" && (
              <button
                onClick={(e) => handleMesaServida(mesa, e)}
                className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-red-600 hover:bg-red-700 text-white text-xs px-2 sm:px-3 py-1 sm:py-2 rounded-full transition-all duration-200 transform hover:scale-110 shadow-2xl z-10 border-2 border-white/80 backdrop-blur-sm"
                title="Confirmar Servido"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 drop-shadow-sm"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Mensaje cuando no hay mesas con el filtro seleccionado */}
      {filteredTables.length === 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-400 text-lg">
            No hay mesas en la ubicación "
            {locationFilter === "todas"
              ? "todas"
              : locationFilter === "adentro"
              ? "adentro"
              : "afuera"}
            "
          </p>
        </div>
      )}
    </div>
  );
}

export default MesasView;
