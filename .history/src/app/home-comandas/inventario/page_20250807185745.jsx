"use client";
import { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaFilter, FaChartBar } from "react-icons/fa";
import { useStock } from "../../../hooks/useStock";
import ProductoModal from "./components/ProductoModal";
import ProductoCard from "./components/ProductoCard";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";

function InventarioContent() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const {
    productos,
    loading,
    error,
    createProducto,
    updateProducto,
    deleteProducto,
    getStockStats,
    searchProductos,
  } = useStock();

  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("Todas");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState(null);

  // Obtener categorías únicas
  const categorias = ["Todas", ...new Set(productos.map((p) => p.categoria))];

  // Filtrar productos
  const filteredProductos = productos
    .filter((producto) => {
      const matchesSearch = producto.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategoria =
        selectedCategoria === "Todas" ||
        producto.categoria === selectedCategoria;
      return matchesSearch && matchesCategoria;
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Estadísticas
  const stats = getStockStats();

  const handleSave = async (productoData) => {
    try {
      if (editingProducto) {
        await updateProducto(editingProducto.id, productoData);
      } else {
        await createProducto(productoData);
      }
      setShowModal(false);
      setEditingProducto(null);
    } catch (error) {
      console.error("Error saving producto:", error);
    }
  };

  const handleEdit = (producto) => {
    setEditingProducto(producto);
    setShowModal(true);
  };

  const handleDelete = (productoId) => {
    setProductoToDelete(productoId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteProducto(productoToDelete);
      setShowDeleteConfirm(false);
      setProductoToDelete(null);
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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Inventario</h1>
            <p className="text-slate-400 text-sm">
              Administra el stock de productos
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Agregar Producto
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaChartBar className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400 text-sm">Valor en Stock</span>
            </div>
            <p className="text-xl font-bold text-green-400">
              {formatCurrency(stats.valorEnStock)}
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaChartBar className="w-4 h-4 text-orange-400" />
              <span className="text-slate-400 text-sm">Costo Stock</span>
            </div>
            <p className="text-xl font-bold text-orange-400">
              {formatCurrency(stats.costoStock)}
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaChartBar className="w-4 h-4 text-green-400" />
              <span className="text-slate-400 text-sm">Ganancia</span>
            </div>
            <p className="text-xl font-bold text-green-400">
              {formatCurrency(stats.gananciaEstimada)}
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-slate-400 text-sm">Stock Bajo</span>
            </div>
            <p className="text-xl font-bold text-orange-400">
              {stats.stockBajo}
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-slate-400 text-sm">Sin Stock</span>
            </div>
            <p className="text-xl font-bold text-red-400">{stats.sinStock}</p>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="px-6 py-4 border-b border-slate-700/50">
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

      {/* Lista de productos */}
      <div className="px-6 py-6">
        {filteredProductos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No se encontraron productos
            </h3>
            <p className="text-slate-400">
              {searchTerm || selectedCategoria !== "Todas"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Agrega tu primer producto para comenzar"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProductos.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                onEdit={handleEdit}
                onDelete={handleDelete}
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
        }}
        producto={editingProducto}
        onSave={handleSave}
        categorias={categorias.filter((cat) => cat !== "Todas")}
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
  );
}
