"use client";
import React, { useState, useEffect } from "react";
import { RestaurantGuard } from "../../../components/RestaurantGuard";
import RoleGuard from "../../../components/RoleGuard";
import { usePromociones } from "../../../hooks/usePromociones";
import { useProducts } from "../../../hooks/useProducts";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";

function PromocionesContent() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const {
    promociones,
    loading,
    error,
    fetchPromociones,
    createPromocion,
    updatePromocion,
    deletePromocion,
    clearError,
  } = usePromociones();

  const { products, fetchAllProducts } = useProducts();

  const [showForm, setShowForm] = useState(false);
  const [editingPromocion, setEditingPromocion] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    productos: [], // Array de IDs de productos incluidos
    activo: true,
  });

  useEffect(() => {
    fetchPromociones();
    fetchAllProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProductToggle = (productId) => {
    setFormData((prev) => ({
      ...prev,
      productos: prev.productos.includes(productId)
        ? prev.productos.filter((id) => id !== productId)
        : [...prev.productos, productId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPromocion) {
        await updatePromocion(editingPromocion.id, formData);
      } else {
        await createPromocion(formData);
      }
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Error guardando promoción:", err);
    }
  };

  const handleEdit = (promocion) => {
    setEditingPromocion(promocion);
    setFormData({
      nombre: promocion.nombre || "",
      precio: promocion.precio?.toString() || "",
      descripcion: promocion.descripcion || "",
      productos: promocion.productos || [],
      activo: promocion.activo !== false,
    });
    setShowForm(true);
  };

  const handleDelete = async (promocionId) => {
    if (confirm("¿Estás seguro de eliminar esta promoción?")) {
      try {
        await deletePromocion(promocionId);
      } catch (err) {
        console.error("Error eliminando promoción:", err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      precio: "",
      descripcion: "",
      productos: [],
      activo: true,
    });
    setEditingPromocion(null);
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar />

      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`flex-1 transition-all duration-300 overflow-auto ${
          isExpanded
            ? "ml-56 sm:ml-64 md:ml-72 lg:ml-80 xl:ml-96"
            : "ml-16 sm:ml-20"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 min-h-full bg-slate-800">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Promociones</h1>
                <p className="text-slate-400">Gestiona tus promociones y ofertas especiales</p>
              </div>
              <div className="w-full sm:w-auto">
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Nueva Promoción</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-red-800">{error}</span>
                  <button onClick={clearError} className="text-red-600 hover:text-red-800">
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Promociones List */}
            {loading && promociones.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-slate-400">Cargando promociones...</span>
              </div>
            ) : promociones.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">No hay promociones registradas</p>
                <p className="text-slate-500 text-sm mt-2">Crea tu primera promoción para comenzar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promociones.map((promocion) => (
                  <div
                    key={promocion.id}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{promocion.nombre}</h3>
                        <p className="text-slate-400 text-sm mt-1">{promocion.descripcion}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          promocion.activo !== false
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {promocion.activo !== false ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-400">
                        ${promocion.precio || "0"}
                      </span>
                    </div>
                    {promocion.productos && promocion.productos.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-1">Productos incluidos:</p>
                        <p className="text-sm text-slate-300">
                          {promocion.productos.length} producto(s)
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleEdit(promocion)}
                        className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm text-center"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(promocion.id)}
                        className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm text-center"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000]">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingPromocion ? "Editar Promoción" : "Nueva Promoción"}
              </h3>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="w-8 h-8 bg-slate-800 border border-slate-600/60 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Nombre de la Promoción *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Menú del Día"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Precio *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción de la promoción..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Productos Incluidos
                </label>
                <div className="max-h-48 overflow-y-auto border border-slate-600 rounded-lg bg-slate-800 p-2">
                  {products.length === 0 ? (
                    <p className="text-slate-400 text-sm">No hay productos disponibles</p>
                  ) : (
                    products.map((product) => (
                      <label
                        key={product.id}
                        className="flex items-center space-x-2 p-2 hover:bg-slate-700 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.productos.includes(product.id)}
                          onChange={() => handleProductToggle(product.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-slate-300">
                          {product.nombre} - ${product.precio}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label className="text-sm font-medium text-slate-300">Promoción activa</label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Guardar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PromocionesPage() {
  return (
    <RestaurantGuard>
      <RoleGuard
        requiredPermission="canAccessPromociones"
        fallback={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-red-400 mb-2">Acceso Denegado</h1>
              <p className="text-slate-400 mb-4">No tienes permisos para acceder a promociones.</p>
              <p className="text-slate-500 text-sm">Solo los administradores pueden gestionar promociones.</p>
            </div>
          </div>
        }
      >
        <SidebarProvider>
          <PromocionesContent />
        </SidebarProvider>
      </RoleGuard>
    </RestaurantGuard>
  );
}

export default PromocionesPage;

