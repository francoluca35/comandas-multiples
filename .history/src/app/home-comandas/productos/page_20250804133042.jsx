"use client";
import React, { useState, useEffect } from 'react';
import { useProducts } from '../../../hooks/useProducts';
import Sidebar from '../home/components/Sidebar';

function ProductosPage() {
  const {
    products,
    categories,
    loading,
    error,
    fetchCategories,
    fetchAllProducts,
    createCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    calculateDiscountedPrice,
    clearError
  } = useProducts();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discount: '0',
    description: '',
    categoryId: ''
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData.categoryId, formData);
      } else {
        await createProduct(formData);
      }
      
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      await createCategory(categoryFormData.name);
      setCategoryFormData({ name: '' });
      setShowCategoryForm(false);
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.nombre,
      price: product.precio.toString(),
      discount: product.descuento?.toString() || '0',
      description: product.descripcion || '',
      categoryId: product.categoryId
    });
    setShowForm(true);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${product.nombre}"?`)) {
      try {
        await deleteProduct(product.id, product.categoryId);
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      discount: '0',
      description: '',
      categoryId: selectedCategory
    });
    setEditingProduct(null);
  };

  const filteredProducts = selectedCategory 
    ? products.filter(product => product.categoryId === selectedCategory)
    : products;

  const getIcon = (iconName) => {
    switch (iconName) {
      case "add":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case "edit":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case "delete":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case "close":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Gestión de Productos</h1>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCategoryForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
              >
                {getIcon("add")}
                <span>Nueva Categoría</span>
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
              >
                {getIcon("add")}
                <span>Nuevo Producto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="text-white hover:text-gray-200">
                {getIcon("close")}
              </button>
            </div>
          )}

          {/* Category Filter */}
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-4">
              <label className="text-white font-medium">Filtrar por categoría:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4">Cargando productos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-white font-semibold text-lg">{product.nombre}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {getIcon("edit")}
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="text-red-400 hover:text-red-300"
                      >
                        {getIcon("delete")}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-gray-300">
                    <p><span className="font-medium">Categoría:</span> {product.categoryId}</p>
                    <p><span className="font-medium">Precio:</span> ${product.precio}</p>
                    {product.descuento > 0 && (
                      <p><span className="font-medium">Descuento:</span> {product.descuento}%</p>
                    )}
                    {product.descuento > 0 && (
                      <p className="text-green-400 font-medium">
                        Precio final: ${calculateDiscountedPrice(product.precio, product.descuento).toFixed(2)}
                      </p>
                    )}
                    {product.descripcion && (
                      <p><span className="font-medium">Descripción:</span> {product.descripcion}</p>
                    )}
                    <p>
                      <span className="font-medium">Estado:</span> 
                      <span className={`ml-2 ${product.activo ? 'text-green-400' : 'text-red-400'}`}>
                        {product.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center text-gray-400 py-12">
              <p className="text-xl">No hay productos en esta categoría</p>
              <p className="mt-2">Crea un nuevo producto para comenzar</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white"
              >
                {getIcon("close")}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Categoría *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Nombre *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Precio *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Descuento (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="Descripción del producto (opcional)"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Nueva Categoría</h2>
              <button
                onClick={() => setShowCategoryForm(false)}
                className="text-gray-400 hover:text-white"
              >
                {getIcon("close")}
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Nombre de la categoría *</label>
                <input
                  type="text"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryInputChange}
                  required
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="Ej: Bebidas, Comidas, Postres"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductosPage;
