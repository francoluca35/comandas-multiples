"use client";
import React, { useState, useEffect, useRef } from "react";
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

function MesasCroquisView({ onMesaClick }) {
  const { tables, loading, error, fetchTables } = useTables();
  const [locationFilter, setLocationFilter] = useState("todas");
  const [mesaSizes, setMesaSizes] = useState({});

  // Cargar mesas al montar el componente
  useEffect(() => {
    fetchTables();
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

  const handleMesaRightClick = (e, mesa) => {
    if (!editMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    setSelectedMesa(mesa);
  };

  const handleChangeMesaSize = (mesaId, newSize) => {
    setMesaSizes(prev => ({
      ...prev,
      [mesaId]: newSize
    }));
    setSelectedMesa(null);
  };

  const handleMouseDown = (e, mesa) => {
    if (!editMode) return; // Solo permitir arrastre en modo edición
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    setDraggedMesa(mesa);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!draggedMesa || !containerRef.current || !editMode) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;

    // Limitar el movimiento dentro del contenedor
    const maxX = containerRect.width - 80; // 80px es el ancho aproximado de una mesa
    const maxY = containerRect.height - 80; // 80px es el alto aproximado de una mesa

    let clampedX = Math.max(0, Math.min(newX, maxX));
    let clampedY = Math.max(0, Math.min(newY, maxY));

    // Aplicar límites de sección si hay mesas afuera - mitad vertical
    if (hasAfuera) {
      const containerHeight = containerRef.current?.getBoundingClientRect().height || 600;
      const mitad = containerHeight / 2;
      const margen = 50; // Margen para evitar que las mesas toquen la línea divisoria
      
      if (draggedMesa.lugar === "adentro") {
        clampedY = Math.min(clampedY, mitad - margen); // Límite en la mitad vertical para mesas adentro
      } else if (draggedMesa.lugar === "afuera") {
        clampedY = Math.max(clampedY, mitad + margen); // Límite en la mitad vertical para mesas afuera
      }
    }

    // Verificar colisiones antes de actualizar la posición
    if (!checkCollision(draggedMesa.id, clampedX, clampedY)) {
      setMesaPositions(prev => ({
        ...prev,
        [draggedMesa.id]: { x: clampedX, y: clampedY }
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggedMesa(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Función para guardar el layout
  const handleSaveLayout = async () => {
    setIsSaving(true);
    
    try {
      // Guardar todas las posiciones y tamaños en la base de datos
      const promises = Object.entries(mesaPositions).map(([mesaId, position]) => {
        const mesaRef = doc(
          db,
          `restaurantes/${getRestaurantId()}/tables/${mesaId}`
        );
        
        return updateDoc(mesaRef, {
          position: position,
          tamaño: mesaSizes[mesaId] || "normal",
          updatedAt: new Date(),
        });
      });

      await Promise.all(promises);
      
      // Actualizar el layout guardado
      setSavedLayout({ ...mesaPositions });
      setEditMode(false);
      setSelectedMesa(null);
      
      console.log("Layout guardado exitosamente");
      alert("Layout del restaurante guardado exitosamente");
    } catch (error) {
      console.error("Error al guardar layout:", error);
      alert("Error al guardar el layout. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setMesaPositions({ ...savedLayout });
    setEditMode(false);
    setSelectedMesa(null);
    // Recargar los tamaños originales
    fetchTables();
  };

  // Agregar event listeners para el drag
  useEffect(() => {
    if (draggedMesa) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedMesa, dragOffset, mesaPositions]);

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

  // Filtrar mesas según la ubicación seleccionada
  const filteredTables = tables.filter((mesa) => {
    if (locationFilter === "todas") return true;
    return mesa.lugar === locationFilter;
  });

  // Separar mesas por ubicación
  const mesasAdentro = filteredTables.filter(mesa => mesa.lugar === "adentro");
  const mesasAfuera = filteredTables.filter(mesa => mesa.lugar === "afuera");
  const hasAfuera = mesasAfuera.length > 0;

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
    <div className="h-full bg-[#1a1a1a] p-3 sm:p-4 md:p-6 lg:p-8 max-w-full overflow-hidden">
      {/* Botonera de ubicación y controles */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4 sm:mb-6 lg:mb-8">
        {/* Filtros de ubicación */}
        <div className="bg-[#2a2a2a] rounded-xl p-1 flex shadow-lg">
          <button
            onClick={() => setLocationFilter("todas")}
            className={`px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 whitespace-nowrap ${
              locationFilter === "todas"
                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                : "text-gray-300 hover:text-white hover:bg-[#3a3a3a] hover:scale-105"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setLocationFilter("adentro")}
            className={`px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 whitespace-nowrap ${
              locationFilter === "adentro"
                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                : "text-gray-300 hover:text-white hover:bg-[#3a3a3a] hover:scale-105"
            }`}
          >
            Adentro
          </button>
          <button
            onClick={() => setLocationFilter("afuera")}
            className={`px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 whitespace-nowrap ${
              locationFilter === "afuera"
                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                : "text-gray-300 hover:text-white hover:bg-[#3a3a3a] hover:scale-105"
            }`}
          >
            Afuera
          </button>
        </div>

      </div>

      {/* Instrucciones */}
      <div className="text-center mb-4">
        <p className="text-gray-400 text-sm">
          📋 Haz click en una mesa para seleccionarla
        </p>
      </div>

      {/* Vista Grid */}
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
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
                    {mesa.lugar === "adentro" ? "Adentro" : "Afuera"}
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

export default MesasCroquisView;
