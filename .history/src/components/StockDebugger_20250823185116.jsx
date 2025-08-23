"use client";
import React, { useState, useEffect } from "react";
import { useStock } from "../hooks/useStock";

function StockDebugger() {
  const { productos, getStockStats } = useStock();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const stats = getStockStats();
    setDebugInfo({
      stats,
      productosCount: productos.length,
      productos: productos.slice(0, 5), // Solo mostrar los primeros 5
    });
  }, [productos, getStockStats]);

  if (productos.length === 0) {
    return (
      <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-4">
        <h3 className="text-red-400 font-bold mb-2">🔍 Debug Stock - Sin Productos</h3>
        <p className="text-red-300">No hay productos cargados en el stock</p>
      </div>
    );
  }

  return (
    <div className="bg-yellow-900/50 border border-yellow-500/50 rounded-lg p-4 mb-4">
      <h3 className="text-yellow-400 font-bold mb-2">🔍 Debug Stock</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-yellow-300 font-semibold">Estadísticas:</h4>
          <ul className="text-yellow-200 text-sm">
            <li>Total Productos: {debugInfo.stats?.totalProductos || 0}</li>
            <li>Total Stock: {debugInfo.stats?.totalStock || 0}</li>
            <li>Stock Bajo: {debugInfo.stats?.stockBajo || 0}</li>
            <li>Sin Stock: {debugInfo.stats?.sinStock || 0}</li>
            <li>En Stock: {debugInfo.stats?.enStock || 0}</li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-yellow-300 font-semibold">Valores Financieros:</h4>
          <ul className="text-yellow-200 text-sm">
            <li>Valor en Stock: ${debugInfo.stats?.valorEnStock || 0}</li>
            <li>Costo Stock: ${debugInfo.stats?.costoStock || 0}</li>
            <li>Ganancia: ${debugInfo.stats?.gananciaEstimada || 0}</li>
          </ul>
        </div>
      </div>

      <div>
        <h4 className="text-yellow-300 font-semibold mb-2">Primeros 5 Productos:</h4>
        <div className="space-y-2">
          {debugInfo.productos?.map((producto, index) => (
            <div key={producto.id} className="bg-yellow-800/30 rounded p-2">
              <div className="text-yellow-200 text-sm font-medium">{producto.nombre}</div>
              <div className="text-yellow-300 text-xs grid grid-cols-3 gap-2">
                <span>Stock: {producto.stock} ({typeof producto.stock})</span>
                <span>Precio: {producto.precio} ({typeof producto.precio})</span>
                <span>Costo: {producto.costo} ({typeof producto.costo})</span>
              </div>
              {(!producto.stock || isNaN(producto.stock)) && (
                <div className="text-red-400 text-xs mt-1">⚠️ Problema con stock</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StockDebugger;
