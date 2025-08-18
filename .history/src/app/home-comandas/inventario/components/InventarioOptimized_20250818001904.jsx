"use client";
import React, { Suspense, lazy, useState, useMemo } from 'react';
import { useInventarioOptimized } from '../../../../hooks/useInventarioOptimized';
import { FaSearch, FaSync, FaChartBar, FaBox, FaExclamationTriangle } from 'react-icons/fa';

// Lazy load de componentes pesados
const ProductoModal = lazy(() => import('./ProductoModal'));
const ProductoCard = lazy(() => import('./ProductoCard'));
const FinancialStats = lazy(() => import('./FinancialStats'));

// Componente de loading optimizado
const OptimizedLoading = ({ message = "Cargando..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  </div>
);

export default function InventarioOptimized() {
  const {
    bebidas,
    materiaPrima,
    loading,
    error,
    financialStats,
    itemsByType,
    lowStockItems,
    outOfStockItems,
    searchItems,
    filterByCategory,
    createBebida,
    createMateriaPrima,
    updateItem,
    deleteItem,
    refreshData,
    performanceStats
  } = useInventarioOptimized();

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('todos');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [showStats, setShowStats] = useState(false);

  // Memoizar items filtrados para performance
  const filteredItems = useMemo(() => {
    let filtered = searchItems(searchQuery, selectedType === 'todos' ? null : selectedType);
    
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(item => item.categoria === selectedCategory);
    }
    
    return filtered;
  }, [searchItems, searchQuery, selectedType, selectedCategory]);

  // Memoizar categorías disponibles
  const availableCategories = useMemo(() => {
    const allItems = [...bebidas, ...materiaPrima];
    const categories = new Set(allItems.map(item => item.categoria).filter(Boolean));
    return ['todos', ...Array.from(categories)];
  }, [bebidas, materiaPrima]);

  // Memoizar tipos disponibles
  const availableTypes = useMemo(() => {
    return [
      { value: 'todos', label: 'Todos', count: bebidas.length + materiaPrima.length },
      { value: 'bebida', label: 'Bebidas', count: bebidas.length },
      { value: 'alimento', label: 'Alimentos', count: materiaPrima.length },
    ];
  }, [bebidas.length, materiaPrima.length]);

  // Manejar búsqueda optimizada
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Manejar cambio de tipo
  const handleTypeChange = (type) => {
    setSelectedType(type);
    setSearchQuery('');
  };

  // Manejar cambio de categoría
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  // Manejar creación/edición de item
  const handleSave = async (itemData) => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id, itemData, editingItem.tipo);
      } else {
        if (itemData.tipoProducto === 'bebida') {
          await createBebida(itemData);
        } else {
          await createMateriaPrima(itemData);
        }
      }
      
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error guardando item:', error);
    }
  };

  // Manejar eliminación de item
  const handleDelete = async (item) => {
    try {
      await deleteItem(item.id, item.tipo);
    } catch (error) {
      console.error('Error eliminando item:', error);
    }
  };

  // Manejar edición de item
  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  if (loading) {
    return <OptimizedLoading message="Cargando inventario..." />;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-400 text-6xl mb-4">❌</div>
        <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
        <p className="text-slate-400 mb-4">{error}</p>
        <button
          onClick={refreshData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      {/* Header con estadísticas */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">Inventario Optimizado</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-slate-700 text-white p-2 rounded-lg hover:bg-slate-600 transition-colors"
              title="Ver estadísticas"
            >
              <FaChartBar />
            </button>
            <button
              onClick={refreshData}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
              title="Actualizar datos"
            >
              <FaSync />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              + Agregar Producto
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-blue-400 text-sm">Total Items</div>
            <div className="text-white text-xl font-bold">{performanceStats.totalItems}</div>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-purple-400 text-sm">Bebidas</div>
            <div className="text-white text-xl font-bold">{performanceStats.bebidas}</div>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-orange-400 text-sm">Materia Prima</div>
            <div className="text-white text-xl font-bold">{performanceStats.materiaPrima}</div>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-yellow-400 text-sm">Stock Bajo</div>
            <div className="text-white text-xl font-bold">{performanceStats.lowStock}</div>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-red-400 text-sm">Sin Stock</div>
            <div className="text-white text-xl font-bold">{performanceStats.outOfStock}</div>
          </div>
        </div>

        {/* Alertas de stock */}
        {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
          <div className="mb-4 space-y-2">
            {outOfStockItems.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-red-400 mr-2" />
                  <span className="text-red-400 font-semibold">
                    {outOfStockItems.length} producto(s) sin stock
                  </span>
                </div>
              </div>
            )}
            {lowStockItems.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-yellow-400 mr-2" />
                  <span className="text-yellow-400 font-semibold">
                    {lowStockItems.length} producto(s) con stock bajo
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estadísticas financieras */}
        {showStats && (
          <Suspense fallback={<OptimizedLoading message="Cargando estadísticas..." />}>
            <FinancialStats stats={financialStats} />
          </Suspense>
        )}
      </div>

      {/* Filtros */}
      <div className="mb-6 space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Filtros de tipo y categoría */}
        <div className="flex flex-wrap gap-4">
          {/* Tipos */}
          <div className="flex flex-wrap gap-2">
            {availableTypes.map(type => (
              <button
                key={type.value}
                onClick={() => handleTypeChange(type.value)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedType === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {type.label} ({type.count})
              </button>
            ))}
          </div>

          {/* Categorías */}
          <div className="flex flex-wrap gap-2">
            {availableCategories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {category === 'todos' ? 'Todas las categorías' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <Suspense key={item.id} fallback={<OptimizedLoading message="Cargando producto..." />}>
              <ProductoCard
                producto={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                tipoProducto={item.tipo}
              />
            </Suspense>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-slate-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No se encontraron productos
            </h3>
            <p className="text-slate-400">
              {searchQuery ? 'Intenta con otros términos de búsqueda' : 'No hay productos en el inventario'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de producto */}
      {showModal && (
        <Suspense fallback={<OptimizedLoading message="Cargando modal..." />}>
          <ProductoModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditingItem(null);
            }}
            onSave={handleSave}
            producto={editingItem}
          />
        </Suspense>
      )}
    </div>
  );
}
