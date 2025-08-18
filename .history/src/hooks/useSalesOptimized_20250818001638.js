import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCache } from './useCache';
import apiClient from '../lib/apiClient';

export const useSalesOptimized = () => {
  const { tablesCache, productsCache, smartCache } = useCache();
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Cache keys
  const CACHE_KEYS = {
    TABLES: 'sales_tables',
    PRODUCTS: 'sales_products',
    CATEGORIES: 'sales_categories',
    SUB_CATEGORIES: 'sales_subcategories',
  };

  // Cargar datos con cache inteligente
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar mesas y productos en paralelo con cache
      const [tablesResult, productsResult] = await Promise.allSettled([
        tablesCache(CACHE_KEYS.TABLES, async () => {
          const response = await apiClient.get('/api/mesas');
          return response.json();
        }),
        productsCache(CACHE_KEYS.PRODUCTS, async () => {
          const response = await apiClient.get('/api/products');
          return response.json();
        })
      ]);

      // Procesar resultados
      if (tablesResult.status === 'fulfilled') {
        setTables(tablesResult.value.data || []);
      }

      if (productsResult.status === 'fulfilled') {
        setProducts(productsResult.value.data || []);
      }

      setLastUpdate(new Date());
      setLoading(false);

    } catch (error) {
      console.error('Error cargando datos de ventas:', error);
      setError(error.message);
      setLoading(false);
    }
  }, [tablesCache, productsCache]);

  // Cargar datos al montar
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Memoizar productos por categoría para performance
  const productsByCategory = useMemo(() => {
    const categorized = {};
    
    products.forEach(product => {
      const category = product.categoria || 'general';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(product);
    });

    return categorized;
  }, [products]);

  // Memoizar subcategorías habilitadas
  const enabledSubCategories = useMemo(() => {
    const subCategories = new Set();
    
    products.forEach(product => {
      if (product.subcategoria && product.habilitada) {
        subCategories.add(product.subcategoria);
      }
    });

    return Array.from(subCategories);
  }, [products]);

  // Buscar productos optimizada
  const searchProducts = useCallback((query, category = null) => {
    if (!query.trim()) {
      return category ? productsByCategory[category] || [] : products;
    }

    const searchTerm = query.toLowerCase();
    const filtered = products.filter(product => {
      const matchesQuery = product.nombre.toLowerCase().includes(searchTerm) ||
                          product.descripcion?.toLowerCase().includes(searchTerm);
      
      const matchesCategory = !category || product.categoria === category;
      
      return matchesQuery && matchesCategory && product.habilitada;
    });

    return filtered;
  }, [products, productsByCategory]);

  // Filtrar productos por subcategoría
  const filterBySubCategory = useCallback((subCategory) => {
    if (!subCategory) return products;
    
    return products.filter(product => 
      product.subcategoria === subCategory && product.habilitada
    );
  }, [products]);

  // Obtener mesa por ID con cache
  const getTableById = useCallback((tableId) => {
    return tables.find(table => table.id === tableId);
  }, [tables]);

  // Actualizar mesa optimizada
  const updateTable = useCallback(async (tableId, updates) => {
    try {
      // Actualización optimista
      setTables(prevTables => 
        prevTables.map(table => 
          table.id === tableId ? { ...table, ...updates } : table
        )
      );

      // Actualizar en servidor
      const response = await apiClient.put(`/api/mesas/${tableId}`, updates);
      
      if (!response.ok) {
        throw new Error('Error actualizando mesa');
      }

      // Limpiar cache de mesas
      apiClient.clearCache('tables');
      
      return true;
    } catch (error) {
      console.error('Error actualizando mesa:', error);
      
      // Revertir cambios en caso de error
      loadData();
      
      throw error;
    }
  }, [loadData]);

  // Crear pedido optimizado
  const createOrder = useCallback(async (tableId, orderData) => {
    try {
      // Validación local
      if (!orderData.productos || orderData.productos.length === 0) {
        throw new Error('El pedido debe contener al menos un producto');
      }

      // Calcular total localmente
      const total = orderData.productos.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productoId);
        return sum + (product?.precio || 0) * item.cantidad;
      }, 0);

      const orderWithTotal = { ...orderData, total };

      // Crear pedido en servidor
      const response = await apiClient.post('/api/pedidos', {
        mesaId: tableId,
        ...orderWithTotal
      });

      if (!response.ok) {
        throw new Error('Error creando pedido');
      }

      // Actualizar estado local
      const newOrder = await response.json();
      
      setTables(prevTables => 
        prevTables.map(table => 
          table.id === tableId 
            ? { 
                ...table, 
                productos: [...(table.productos || []), newOrder],
                estado: 'ocupado',
                total: (table.total || 0) + total
              }
            : table
        )
      );

      return newOrder;
    } catch (error) {
      console.error('Error creando pedido:', error);
      throw error;
    }
  }, [products]);

  // Estadísticas de performance
  const performanceStats = useMemo(() => {
    return {
      totalTables: tables.length,
      totalProducts: products.length,
      categories: Object.keys(productsByCategory).length,
      subCategories: enabledSubCategories.length,
      lastUpdate: lastUpdate?.toLocaleTimeString(),
      cacheHitRate: apiClient.getMetrics().cacheHitRate,
    };
  }, [tables.length, products.length, productsByCategory, enabledSubCategories, lastUpdate]);

  // Refrescar datos
  const refreshData = useCallback(async () => {
    // Limpiar cache para forzar recarga
    apiClient.clearCache('tables');
    apiClient.clearCache('products');
    
    await loadData();
  }, [loadData]);

  return {
    // Estado
    tables,
    products,
    loading,
    error,
    
    // Datos memoizados
    productsByCategory,
    enabledSubCategories,
    
    // Funciones optimizadas
    searchProducts,
    filterBySubCategory,
    getTableById,
    updateTable,
    createOrder,
    refreshData,
    
    // Estadísticas
    performanceStats,
  };
};
