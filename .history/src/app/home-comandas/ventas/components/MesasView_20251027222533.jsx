"use client";
import React, { useState, useEffect } from "react";
import { useTables } from "../../../../hooks/useTables";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";
import MesasCroquisView from "./MesasCroquisView";

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
        return "bg-red-600 hover:bg-red-500";
      case "en_preparacion":
        return "bg-yellow-600 hover:bg-yellow-500";
      case "servido":
        return "bg-blue-600 hover:bg-blue-500";
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
        return "Ocupado";
      case "en_preparacion":
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

  return <MesasCroquisView onMesaClick={onMesaClick} />;
}

export default MesasView;
