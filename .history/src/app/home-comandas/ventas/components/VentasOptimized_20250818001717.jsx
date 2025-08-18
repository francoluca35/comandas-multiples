"use client";
import React, { Suspense, lazy, useState, useMemo } from 'react';
import { useSalesOptimized } from '../../../../hooks/useSalesOptimized';
import { FaSearch, FaSync, FaChartBar, FaTable } from 'react-icons/fa';

// Lazy load de componentes pesados
const PedidoView = lazy(() => import('./PedidoView'));
const MesasGrid = lazy(() => import('../../../mesas/components/MesasGrid'));
const PerformanceStats = lazy(() => import('./PerformanceStats'));

// Componente de loading optimizado
const OptimizedLoading = ({ message = "Cargando..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  </div>
);

export default function VentasOptimized() {
  const {
    tables,
    products,
    loading,
    error,
    productsByCategory,
    enabledSubCategories,
    searchProducts,
    filterBySubCategory,
    getTableById,
    updateTable,
    createOrder,
    refreshData,
    performanceStats
  } = useSalesOptimized();

  const [selectedTable, setSelectedTable] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [showStats, setShowStats] = useState(false);

  // Memoizar productos filtrados para performance
  const filteredProducts = useMemo(() => {
    let filtered = searchProducts(searchQuery, selectedCategory === 'todos' ? null : selectedCategory);
    
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(product => product.categoria === selectedCategory);
    }
    
    return filtered;
  }, [searchProducts, searchQuery, selectedCategory]);

  // Memoizar categorías disponibles
  const availableCategories = useMemo(() => {
    const categories = new Set(products.map(p => p.categoria).filter(Boolean));
    return ['todos', ...Array.from(categories)];
  }, [products]);

  // Memoizar mesas ocupadas
  const occupiedTables = useMemo(() => {
    return tables.filter(table => table.estado === 'ocupado');
  }, [tables]);

  // Memoizar mesas libres
  const freeTables = useMemo(() => {
    return tables.filter(table => table.estado === 'libre');
  }, [tables]);

  // Manejar selección de mesa
  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setSearchQuery('');
    setSelectedCategory('todos');
  };

  // Manejar búsqueda optimizada
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Manejar cambio de categoría
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  // Manejar creación de pedido
  const handleCreateOrder = async (orderData) => {
    if (!selectedTable) return;

    try {
      await createOrder(selectedTable.id, orderData);
      setSelectedTable(null);
    } catch (error) {
      console.error('Error creando pedido:', error);
    }
  };

  // Manejar actualización de mesa
  const handleTableUpdate = async (tableId, updates) => {
    try {
      await updateTable(tableId, updates);
    } catch (error) {
      console.error('Error actualizando mesa:', error);
    }
  };

  if (loading) {
    return <OptimizedLoading message="Cargando sistema de ventas..." />;
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
          <h1 className="text-2xl font-bold text-white">Ventas Optimizadas</h1>
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
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-blue-400 text-sm">Mesas Ocupadas</div>
            <div className="text-white text-xl font-bold">{occupiedTables.length}</div>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-green-400 text-sm">Mesas Libres</div>
            <div className="text-white text-xl font-bold">{freeTables.length}</div>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-purple-400 text-sm">Productos</div>
            <div className="text-white text-xl font-bold">{products.length}</div>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="text-orange-400 text-sm">Categorías</div>
            <div className="text-white text-xl font-bold">{availableCategories.length - 1}</div>
          </div>
        </div>

        {/* Estadísticas detalladas */}
        {showStats && (
          <Suspense fallback={<OptimizedLoading message="Cargando estadísticas..." />}>
            <PerformanceStats stats={performanceStats} />
          </Suspense>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Mesas */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <FaTable className="mr-2" />
                Mesas
              </h2>
              <span className="text-slate-400 text-sm">
                {tables.length} total
              </span>
            </div>

            <Suspense fallback={<OptimizedLoading message="Cargando mesas..." />}>
              <MesasGrid
                tables={tables}
                onTableSelect={handleTableSelect}
                onTableUpdate={handleTableUpdate}
                selectedTableId={selectedTable?.id}
              />
            </Suspense>
          </div>
        </div>

        {/* Panel de Productos y Pedidos */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-lg p-4">
            {selectedTable ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    Pedido - Mesa {selectedTable.numero}
                  </h2>
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Filtros de productos */}
                <div className="mb-4 space-y-3">
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

                  {/* Categorías */}
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map(category => (
                      <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedCategory === category
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {category === 'todos' ? 'Todos' : category}
                      </button>
                    ))}
                  </div>
                </div>

                <Suspense fallback={<OptimizedLoading message="Cargando productos..." />}>
                  <PedidoView
                    table={selectedTable}
                    products={filteredProducts}
                    subCategories={enabledSubCategories}
                    onOrderCreate={handleCreateOrder}
                    onTableUpdate={handleTableUpdate}
                  />
                </Suspense>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-slate-400 text-6xl mb-4">🍽️</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Selecciona una Mesa
                </h3>
                <p className="text-slate-400">
                  Elige una mesa para comenzar a tomar pedidos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
