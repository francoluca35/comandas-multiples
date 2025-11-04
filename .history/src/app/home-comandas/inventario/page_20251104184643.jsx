"use client";
import { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaChartBar,
  FaWineBottle,
  FaCarrot,
} from "react-icons/fa";
import StatsModal from "./components/StatsModal";
import { useInventario } from "../../../hooks/useInventario";
import ProductoModal from "./components/ProductoModal";
import ProductoCard from "./components/ProductoCard";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";
import { RestaurantGuard } from "../../../components/RestaurantGuard";
import RoleGuard from "../../../components/RoleGuard";

function InventarioContent() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const {
    bebidas,
    materiaPrima,
    loading,
    error,
    createBebida,
    createMateriaPrima,
    updateBebida,
    updateMateriaPrima,
    deleteBebida,
    deleteMateriaPrima,
    getInventarioStats,
    searchProductos,
  } = useInventario();

  const [showModal, setShowModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("Todas");
  const [selectedCategoria, setSelectedCategoria] = useState("Todas");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState(null);
  const [productoType, setProductoType] = useState(null); // "bebida" o "materiaPrima"

  // Obtener categorías únicas de ambos tipos
  const categoriasBebidas = [...new Set(bebidas.map((b) => b.categoria))];
  const categoriasMateriaPrima = [
    ...new Set(materiaPrima.map((mp) => mp.categoria)),
  ];
  const categorias = [
    "Todas",
    ...new Set([...categoriasBebidas, ...categoriasMateriaPrima]),
  ];

  // Combinar todos los productos para filtrado
  const todosLosProductos = [
    ...bebidas.map((b) => ({ ...b, tipoProducto: "bebida" })),
    ...materiaPrima.map((mp) => ({ ...mp, tipoProducto: "materiaPrima" })),
  ];

  // Filtrar productos
  const filteredProductos = todosLosProductos
    .filter((producto) => {
      const matchesSearch = producto.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Lógica para el filtro de tipo
      let matchesTipo = true;
      if (tipoFilter !== "Todas") {
        if (tipoFilter === "Bebidas") {
          matchesTipo = producto.tipoProducto === "bebida";
        } else if (tipoFilter === "Comidas") {
          matchesTipo = producto.tipoProducto === "materiaPrima";
        }
      }

      const matchesCategoria =
        selectedCategoria === "Todas" ||
        producto.categoria === selectedCategoria;

      return matchesSearch && matchesTipo && matchesCategoria;
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Estadísticas
  const stats = getInventarioStats();

  const handleSave = async (productoData) => {
    try {
      if (editingProducto) {
        // Actualizar producto existente
        if (productoType === "bebida") {
          await updateBebida(editingProducto.id, productoData);
        } else {
          await updateMateriaPrima(editingProducto.id, productoData);
        }
      } else {
        // Crear nuevo producto
        if (productoData.tipo === "bebida") {
          await createBebida(productoData);
        } else {
          await createMateriaPrima(productoData);
        }
      }
      setShowModal(false);
      setEditingProducto(null);
      setProductoType(null);
    } catch (error) {
      console.error("Error saving producto:", error);
    }
  };

  const handleEdit = (producto) => {
    setEditingProducto(producto);
    setProductoType(producto.tipoProducto);
    setShowModal(true);
  };

  const handleDelete = (producto, tipo) => {
    setProductoToDelete(producto.id);
    setProductoType(tipo);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (productoType === "bebida") {
        await deleteBebida(productoToDelete);
      } else {
        await deleteMateriaPrima(productoToDelete);
      }
      setShowDeleteConfirm(false);
      setProductoToDelete(null);
      setProductoType(null);
    } catch (error) {
      console.error("Error deleting producto:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
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
        <div className="bg-slate-800/50 border-b border-slate-700/50 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">Inventario</h1>
              <p className="text-slate-400 text-sm">
                Administra bebidas y materia prima
              </p>
            </div>
            <div className="flex w-full sm:w-auto items-center gap-3 justify-end">
              <button
                onClick={() => setShowStatsModal(true)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 justify-center transition-colors"
              >
                <FaChartBar className="w-4 h-4" />
                <span className="hidden sm:inline">Estadísticas</span>
                <span className="sm:hidden">Stats</span>
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 justify-center transition-colors"
              >
                <FaPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Agregar Producto</span>
                <span className="sm:hidden">Agregar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="px-6 py-4 border-b border-slate-700/50">
          <div className="flex flex-col gap-4">
            {/* Filtro por tipo (Todas, Bebidas, Comidas) */}
            <div className="flex justify-center">
              <div className="flex bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
                {["Todas", "Bebidas", "Comidas"].map((tipo) => {
                  // Contar productos por tipo
                  const count =
                    tipo === "Todas"
                      ? todosLosProductos.length
                      : tipo === "Bebidas"
                      ? bebidas.length
                      : materiaPrima.length;

                  return (
                    <button
                      key={tipo}
                      onClick={() => setTipoFilter(tipo)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        tipoFilter === tipo
                          ? "bg-blue-600 text-white shadow-lg"
                          : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                      }`}
                    >
                      {tipo === "Todas" && `🍽️ Todas (${count})`}
                      {tipo === "Bebidas" && `🥤 Bebidas (${count})`}
                      {tipo === "Comidas" && `🥕 Materia Prima (${count})`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Filtro por categoría */}
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                >
                  {categorias.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="flex-1 overflow-auto px-6 py-6">
          {filteredProductos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No se encontraron productos
              </h3>
              <p className="text-slate-400">
                {searchTerm ||
                tipoFilter !== "Todas" ||
                selectedCategoria !== "Todas"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Agrega tu primer producto para comenzar"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProductos.map((producto) => (
                <ProductoCard
                  key={`${producto.tipoProducto}-${producto.id}`}
                  producto={producto}
                  onEdit={handleEdit}
                  onDelete={(producto) =>
                    handleDelete(producto, producto.tipoProducto)
                  }
                  tipoProducto={producto.tipoProducto}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal para agregar/editar producto */}
        <ProductoModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingProducto(null);
            setProductoType(null);
          }}
          producto={editingProducto}
          onSave={handleSave}
          categorias={categorias.filter((cat) => cat !== "Todas")}
        />

        {/* Modal de Estadísticas */}
        <StatsModal
          isOpen={showStatsModal}
          onClose={() => setShowStatsModal(false)}
          stats={stats}
          formatCurrency={formatCurrency}
        />

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Confirmar eliminación
              </h3>
              <p className="text-slate-400 mb-6">
                ¿Estás seguro de que quieres eliminar este producto? Esta acción
                no se puede deshacer.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const InventarioPage = () => {
  return (
    <RestaurantGuard>
      <RoleGuard
        requiredPermission="canAccessInventario"
        fallback={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-red-400 mb-2">
                Acceso Denegado
              </h1>
              <p className="text-slate-400 mb-4">
                No tienes permisos para acceder al inventario.
              </p>
              <p className="text-slate-500 text-sm">
                Solo los administradores pueden gestionar el inventario del
                restaurante.
              </p>
            </div>
          </div>
        }
      >
        <div className="min-h-screen bg-slate-900 text-white">
          <SidebarProvider>
            <InventarioContent />
          </SidebarProvider>
        </div>
      </RoleGuard>
    </RestaurantGuard>
  );
};

export default InventarioPage;
