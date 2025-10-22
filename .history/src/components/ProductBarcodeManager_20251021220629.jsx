"use client";
import React, { useState, useEffect } from 'react';
import BarcodeScanner from './BarcodeScanner';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const ProductBarcodeManager = ({ 
  isOpen, 
  onClose, 
  product = null, 
  onProductUpdate 
}) => {
  const [productData, setProductData] = useState({
    nombre: '',
    precio: 0,
    codigoBarras: '',
    codigoBalanza: '',
    categoria: '',
    descripcion: '',
    stock: 0,
    proveedor: '',
    costo: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const {
    isScannerOpen,
    lastScannedCode,
    openScanner,
    closeScanner,
    handleScanSuccess,
    handleScanError
  } = useBarcodeScanner();

  useEffect(() => {
    if (product) {
      setProductData({
        nombre: product.nombre || '',
        precio: product.precio || 0,
        codigoBarras: product.codigoBarras || '',
        codigoBalanza: product.codigoBalanza || '',
        categoria: product.categoria || '',
        descripcion: product.descripcion || '',
        stock: product.stock || 0,
        proveedor: product.proveedor || '',
        costo: product.costo || 0
      });
    }
  }, [product]);

  useEffect(() => {
    if (lastScannedCode) {
      handleBarcodeScanned(lastScannedCode.code);
    }
  }, [lastScannedCode]);

  const handleBarcodeScanned = async (barcode) => {
    setIsSearching(true);
    setError(null);
    
    try {
      // Buscar producto existente por código de barra
      const restaurantId = localStorage.getItem('restauranteId');
      if (!restaurantId) {
        throw new Error('No se encontró el ID del restaurante');
      }

      // Buscar en la colección de productos
      const productRef = doc(db, 'restaurantes', restaurantId, 'productos', barcode);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const existingProduct = productSnap.data();
        setProductData(prev => ({
          ...prev,
          ...existingProduct,
          codigoBarras: barcode
        }));
        setSuccess(`Producto encontrado: ${existingProduct.nombre}`);
      } else {
        // Producto no encontrado, llenar solo el código de barra
        setProductData(prev => ({
          ...prev,
          codigoBarras: barcode
        }));
        setError('Producto no encontrado. Puedes crear uno nuevo con este código.');
      }
    } catch (err) {
      console.error('Error buscando producto:', err);
      setError('Error al buscar el producto: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!productData.nombre.trim() || !productData.precio) {
      setError('Nombre y precio son obligatorios');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const restaurantId = localStorage.getItem('restauranteId');
      if (!restaurantId) {
        throw new Error('No se encontró el ID del restaurante');
      }

      const productId = productData.codigoBarras || Date.now().toString();
      const productRef = doc(db, 'restaurantes', restaurantId, 'productos', productId);

      const productToSave = {
        ...productData,
        precio: parseFloat(productData.precio),
        stock: parseInt(productData.stock) || 0,
        costo: parseFloat(productData.costo) || 0,
        fechaCreacion: product?.fechaCreacion || new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        activo: true
      };

      await setDoc(productRef, productToSave, { merge: true });

      setSuccess('Producto guardado exitosamente');
      onProductUpdate?.(productToSave);
      
      // Limpiar formulario si es producto nuevo
      if (!product) {
        setProductData({
          nombre: '',
          precio: 0,
          codigoBarras: '',
          codigoBalanza: '',
          categoria: '',
          descripcion: '',
          stock: 0,
          proveedor: '',
          costo: 0
        });
      }
    } catch (err) {
      console.error('Error guardando producto:', err);
      setError('Error al guardar el producto: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setProductData({
      nombre: '',
      precio: 0,
      codigoBarras: '',
      codigoBalanza: '',
      categoria: '',
      descripcion: '',
      stock: 0,
      proveedor: '',
      costo: 0
    });
    setError(null);
    setSuccess(null);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-gray-800 font-bold text-lg">
                {product ? 'Editar Producto' : 'Nuevo Producto'}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-800 font-medium">{success}</span>
              </div>
            </div>
          )}

          {/* Barcode Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Código de Barra</h3>
              <button
                onClick={openScanner}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Escanear</span>
              </button>
            </div>
            <input
              type="text"
              value={productData.codigoBarras}
              onChange={(e) => handleInputChange('codigoBarras', e.target.value)}
              placeholder="Código de barra o código de balanza"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="mt-2 flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Buscando producto...</span>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={productData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre del producto"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
              <input
                type="number"
                step="0.01"
                value={productData.precio}
                onChange={(e) => handleInputChange('precio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código de Balanza</label>
              <input
                type="text"
                value={productData.codigoBalanza}
                onChange={(e) => handleInputChange('codigoBalanza', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Código de balanza"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <input
                type="text"
                value={productData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Categoría del producto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                value={productData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo</label>
              <input
                type="number"
                step="0.01"
                value={productData.costo}
                onChange={(e) => handleInputChange('costo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
              <input
                type="text"
                value={productData.proveedor}
                onChange={(e) => handleInputChange('proveedor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre del proveedor"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={productData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción del producto"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Guardar Producto</span>
                </>
              )}
            </button>

            <button
              onClick={handleClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={closeScanner}
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
        title="Escanear Código de Barra del Producto"
      />
    </>
  );
};

export default ProductBarcodeManager;

