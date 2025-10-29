"use client";
import React, { useState, useEffect } from "react";
import { useStockAlerts } from "@/hooks/useStockAlerts";

function StockLowAlert({ isOpen, onClose, onRememberLater, onDontRemind }) {
  const { stockBajo, getProductosCriticos, getProductosMuyBajo, getProductosBajo } = useStockAlerts();
  const [productosCriticos, setProductosCriticos] = useState([]);
  const [productosMuyBajo, setProductosMuyBajo] = useState([]);
  const [productosBajo, setProductosBajo] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setProductosCriticos(getProductosCriticos());
      setProductosMuyBajo(getProductosMuyBajo());
      setProductosBajo(getProductosBajo());
    }
  }, [isOpen, getProductosCriticos, getProductosMuyBajo, getProductosBajo]);

  if (!isOpen) return null;

  const handleRememberLater = () => {
    // Guardar en localStorage que se recordó más tarde
    const rememberTime = new Date().getTime() + (30 * 60 * 1000); // 30 minutos
    localStorage.setItem('stockAlertRememberLater', rememberTime.toString());
    onRememberLater();
  };

  const handleDontRemind = () => {
    // Guardar en localStorage que no se debe recordar hasta reponer
    localStorage.setItem('stockAlertDontRemind', 'true');
    onDontRemind();
  };

  const getStockColor = (stock) => {
    if (stock === 1) return "text-red-500";
    if (stock === 2) return "text-orange-500";
    if (stock === 3) return "text-yellow-500";
    return "text-blue-500";
  };

  const getStockIcon = (stock) => {
    if (stock === 1) return "🚨";
    if (stock === 2) return "⚠️";
    if (stock === 3) return "⚡";
    return "📦";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Stock Bajo</h2>
              <p className="text-gray-600">Algunos productos están por agotarse</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Productos Críticos (Stock = 1) */}
        {productosCriticos.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center">
              <span className="mr-2">🚨</span>
              Crítico - Solo 1 unidad
            </h3>
            <div className="space-y-2">
              {productosCriticos.map((producto) => (
                <div key={`critico-${producto.id}`} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{producto.nombre}</p>
                      <p className="text-sm text-gray-600 capitalize">{producto.categoria}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getStockColor(producto.stock)}`}>
                        {getStockIcon(producto.stock)} {producto.stock}
                      </p>
                      <p className="text-sm text-gray-500">unidades</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Productos Muy Bajo (Stock = 2-3) */}
        {productosMuyBajo.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-orange-600 mb-3 flex items-center">
              <span className="mr-2">⚠️</span>
              Muy Bajo - 2-3 unidades
            </h3>
            <div className="space-y-2">
              {productosMuyBajo.map((producto) => (
                <div key={`muy-bajo-${producto.id}`} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{producto.nombre}</p>
                      <p className="text-sm text-gray-600 capitalize">{producto.categoria}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getStockColor(producto.stock)}`}>
                        {getStockIcon(producto.stock)} {producto.stock}
                      </p>
                      <p className="text-sm text-gray-500">unidades</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Productos Bajo (Stock = 4) */}
        {productosBajo.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-yellow-600 mb-3 flex items-center">
              <span className="mr-2">⚡</span>
              Bajo - 4 unidades
            </h3>
            <div className="space-y-2">
              {productosBajo.map((producto) => (
                <div key={`bajo-${producto.id}`} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{producto.nombre}</p>
                      <p className="text-sm text-gray-600 capitalize">{producto.categoria}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getStockColor(producto.stock)}`}>
                        {getStockIcon(producto.stock)} {producto.stock}
                      </p>
                      <p className="text-sm text-gray-500">unidades</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleRememberLater}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Recordar más tarde</span>
          </button>
          
          <button
            onClick={handleDontRemind}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
            <span>No recordar hasta reponer</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default StockLowAlert;
