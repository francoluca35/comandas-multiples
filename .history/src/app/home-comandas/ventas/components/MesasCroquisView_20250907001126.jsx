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
  const [editMode, setEditMode] = useState(false);
  const [draggedMesa, setDraggedMesa] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mesaPositions, setMesaPositions] = useState({});
  const [savedLayout, setSavedLayout] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [mesaSizes, setMesaSizes] = useState({});
  const [viewMode, setViewMode] = useState("croquis"); // "croquis" o "grid"
  const containerRef = useRef(null);

  // Cargar mesas al montar el componente
  useEffect(() => {
    fetchTables();
  }, []);

  // Cargar posiciones guardadas de las mesas
  useEffect(() => {
    if (tables.length > 0) {
      const positions = {};
      const savedPositions = {};
      const sizes = {};
      
      // Separar mesas por ubicación
      const mesasAdentro = tables.filter(mesa => mesa.lugar === "adentro");
      const mesasAfuera = tables.filter(mesa => mesa.lugar === "afuera");
      const hasAfuera = mesasAfuera.length > 0;
      
      tables.forEach(mesa => {
        // Cargar posición
        if (mesa.position) {
          positions[mesa.id] = mesa.position;
          savedPositions[mesa.id] = mesa.position;
        } else {
          // Posición por defecto basada en la ubicación
          let defaultPos;
          
          if (mesa.lugar === "adentro") {
            // Mesas adentro en el lado izquierdo (mitad izquierda)
            const mitad = hasAfuera ? 400 : 800; // 400px si hay afuera, 800px si no
            defaultPos = { 
              x: Math.random() * mitad, 
              y: Math.random() * 300 
            };
          } else if (mesa.lugar === "afuera") {
            // Mesas afuera en el lado derecho (mitad derecha)
            defaultPos = { 
              x: 400 + Math.random() * 400, // Empieza en la mitad
              y: Math.random() * 300 
            };
          } else {
            // Fallback para mesas sin ubicación
            defaultPos = { x: Math.random() * 400, y: Math.random() * 300 };
          }
          
          positions[mesa.id] = defaultPos;
          savedPositions[mesa.id] = defaultPos;
        }

        // Cargar tamaño
        sizes[mesa.id] = mesa.tamaño || "normal";
      });
      
      setMesaPositions(positions);
      setSavedLayout(savedPositions);
      setMesaSizes(sizes);
    }
  }, [tables]);

  // Función para obtener el tamaño de una mesa
  const getMesaSize = (mesaId) => {
    const size = mesaSizes[mesaId] || "normal";
    switch (size) {
      case "familiar":
        return { width: 120, height: 80 };
      case "normal":
      default:
        return { width: 80, height: 80 };
    }
  };

  // Función para verificar colisiones y límites de sección
  const checkCollision = (mesaId, newX, newY) => {
    const margin = 10; // Margen mínimo entre mesas
    const currentMesaSize = getMesaSize(mesaId);
    
    // Encontrar la mesa que se está moviendo
    const mesa = tables.find(m => m.id === mesaId);
    if (!mesa) return true;
    
    // Verificar límites de sección - mitad y mitad
    if (hasAfuera) {
      // Obtener el ancho del contenedor para calcular la mitad
      const containerWidth = containerRef.current?.getBoundingClientRect().width || 800;
      const mitad = containerWidth / 2;
      
      if (mesa.lugar === "adentro" && newX > mitad) {
        return true; // Mesa adentro no puede ir a la sección afuera
      }
      if (mesa.lugar === "afuera" && newX < mitad) {
        return true; // Mesa afuera no puede ir a la sección adentro
      }
    }
    
    // Verificar colisiones con otras mesas
    for (const [otherMesaId, position] of Object.entries(mesaPositions)) {
      if (otherMesaId === mesaId) continue;
      
      const otherMesaSize = getMesaSize(otherMesaId);
      
      // Calcular distancia entre centros
      const distanceX = Math.abs(newX + currentMesaSize.width/2 - (position.x + otherMesaSize.width/2));
      const distanceY = Math.abs(newY + currentMesaSize.height/2 - (position.y + otherMesaSize.height/2));
      
      // Verificar si hay colisión (rectángulos se superponen)
      if (distanceX < (currentMesaSize.width + otherMesaSize.width)/2 + margin &&
          distanceY < (currentMesaSize.height + otherMesaSize.height)/2 + margin) {
        return true; // Hay colisión
      }
    }
    return false; // No hay colisión
  };

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

    // Aplicar límites de sección si hay mesas afuera - mitad y mitad
    if (hasAfuera) {
      const containerWidth = containerRef.current?.getBoundingClientRect().width || 800;
      const mitad = containerWidth / 2;
      
      if (draggedMesa.lugar === "adentro") {
        clampedX = Math.min(clampedX, mitad); // Límite en la mitad para mesas adentro
      } else if (draggedMesa.lugar === "afuera") {
        clampedX = Math.max(clampedX, mitad); // Límite en la mitad para mesas afuera
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

        {/* Controles de vista */}
        <div className="bg-[#2a2a2a] rounded-xl p-1 flex shadow-lg">
          <button
            onClick={() => setViewMode("croquis")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
              viewMode === "croquis"
                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                : "text-gray-300 hover:text-white hover:bg-[#3a3a3a]"
            }`}
            title="Vista croquis"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>Croquis</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
              viewMode === "grid"
                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                : "text-gray-300 hover:text-white hover:bg-[#3a3a3a]"
            }`}
            title="Vista grid"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Grid</span>
          </button>
        </div>

        {/* Controles de edición - Solo en vista croquis */}
        {viewMode === "croquis" && (
          <div className="bg-[#2a2a2a] rounded-xl p-1 flex shadow-lg">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 bg-orange-600 text-white shadow-lg transform scale-105"
                title="Editar layout del restaurante"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Editar Layout</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveLayout}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 bg-green-600 text-white shadow-lg transform scale-105 disabled:opacity-50"
                  title="Guardar layout"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span>{isSaving ? "Guardando..." : "Guardar"}</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 bg-red-600 text-white shadow-lg transform scale-105 ml-2"
                  title="Cancelar edición"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancelar</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Instrucciones */}
      <div className="text-center mb-4">
        {editMode ? (
          <div className="text-orange-400 text-sm font-medium">
            <p>✏️ Modo edición: Arrastra las mesas para organizarlas. Las mesas no pueden superponerse ni cambiar de sección.</p>
            <p className="text-xs mt-1">💡 Click derecho en una mesa para cambiar su tamaño (Normal/Familiar)</p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            🏪 Vista del restaurante: Haz click en "Editar Layout" para reorganizar las mesas
          </p>
        )}
      </div>

      {/* Contenedor del croquis */}
      <div 
        ref={containerRef}
        className={`relative w-full h-[calc(100vh-150px)] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl border-2 overflow-hidden ${
          editMode ? 'border-orange-500' : 'border-slate-700'
        }`}
        style={{ minHeight: '600px' }}
      >
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Línea divisoria si hay mesas afuera */}
        {hasAfuera && (
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gradient-to-b from-transparent via-slate-500 to-transparent transform -translate-x-1/2 z-10"></div>
        )}

        {/* Etiquetas de sección */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-green-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg border-2 border-green-400">
            <span className="text-lg font-bold">ADENTRO</span>
          </div>
        </div>
        
        {hasAfuera && (
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-orange-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg border-2 border-orange-400">
              <span className="text-lg font-bold">AFUERA</span>
            </div>
          </div>
        )}

        {/* Mesas posicionadas */}
        {filteredTables.map((mesa) => {
          const position = mesaPositions[mesa.id] || { x: 0, y: 0 };
          const isDragging = draggedMesa?.id === mesa.id;
          const mesaSize = getMesaSize(mesa.id);
          const currentSize = mesaSizes[mesa.id] || "normal";
          
          return (
            <div
              key={mesa.id}
              className={`absolute select-none transition-all duration-200 ${
                editMode ? 'cursor-move' : 'cursor-pointer'
              } ${
                isDragging ? 'z-50 scale-110 shadow-2xl' : 'z-10 hover:scale-105'
              }`}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: isDragging ? 'rotate(5deg)' : 'rotate(0deg)'
              }}
              onMouseDown={(e) => handleMouseDown(e, mesa)}
              onContextMenu={(e) => handleMesaRightClick(e, mesa)}
            >
              <button
                onClick={() => !editMode && handleMesaClick(mesa)}
                className={`${getStatusColor(
                  mesa.estado
                )} text-white rounded-xl p-3 sm:p-4 text-center transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-white/20 flex flex-col items-center justify-center ${
                  editMode ? 'pointer-events-none' : ''
                }`}
                style={{
                  width: `${mesaSize.width}px`,
                  height: `${mesaSize.height}px`
                }}
              >
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg">
                  {mesa.numero}
                </div>
                <div className="text-xs opacity-90 font-medium drop-shadow-md">
                  {getStatusText(mesa.estado)}
                </div>
                {currentSize === "familiar" && (
                  <div className="text-xs opacity-75 font-semibold drop-shadow-sm mt-1">
                    👨‍👩‍👧‍👦
                  </div>
                )}
              </button>

              {/* Botón Liberar Mesa Manual - Solo en modo visualización */}
              {!editMode && (mesa.estado === "ocupado" || mesa.estado === "servido" || mesa.estado === "pagado") && (
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

        {/* Indicador de arrastrando */}
        {draggedMesa && editMode && (
          <div className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-2 rounded-lg shadow-lg z-50">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-sm font-medium">
                Arrastrando Mesa {draggedMesa.numero}
              </span>
            </div>
          </div>
        )}

        {/* Indicador de modo edición */}
        {editMode && (
          <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-2 rounded-lg shadow-lg z-50">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm font-medium">Modo Edición</span>
            </div>
          </div>
        )}

        {/* Menú contextual para cambiar tamaño de mesa */}
        {selectedMesa && editMode && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl z-50 p-4">
            <div className="text-center">
              <h3 className="text-white font-semibold mb-3">
                Cambiar tamaño - Mesa {selectedMesa.numero}
              </h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleChangeMesaSize(selectedMesa.id, "normal")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    mesaSizes[selectedMesa.id] === "normal"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  <div className="w-8 h-8 bg-green-600 rounded mx-auto mb-1"></div>
                  Normal
                </button>
                <button
                  onClick={() => handleChangeMesaSize(selectedMesa.id, "familiar")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    mesaSizes[selectedMesa.id] === "familiar"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  <div className="w-12 h-8 bg-green-600 rounded mx-auto mb-1"></div>
                  Familiar
                </button>
              </div>
              <button
                onClick={() => setSelectedMesa(null)}
                className="mt-3 px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
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
