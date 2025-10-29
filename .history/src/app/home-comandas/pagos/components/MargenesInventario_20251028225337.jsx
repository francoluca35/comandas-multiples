"use client";
import React, { useState, useEffect, memo } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";

function MargenesInventario({ onToggle, isExpanded, formatDinero }) {
  const [inventarioData, setInventarioData] = useState({
    valorEnStock: 0,
    costoStock: 0,
    ganancia: 0,
    stockBajo: 0,
    sinStock: 0,
    loading: true,
    error: null
  });

  // Función para obtener el restaurantId
  const getRestaurantId = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("restauranteId");
    }
    return null;
  };

  // Función para calcular métricas del inventario
  const calcularMetricasInventario = async () => {
    try {
      setInventarioData(prev => ({ ...prev, loading: true, error: null }));
      
      const restauranteId = getRestaurantId();
      if (!restauranteId) {
        throw new Error("No se encontró el ID del restaurante");
      }

      console.log("🔍 Calculando métricas de inventario para restaurante:", restauranteId);

      // Obtener bebidas
      const bebidasRef = collection(db, `restaurantes/${restauranteId}/bebidas`);
      const bebidasSnapshot = await getDocs(bebidasRef);
      console.log("📊 Bebidas encontradas:", bebidasSnapshot.size);
      
      // Obtener materia prima
      const materiaPrimaRef = collection(db, `restaurantes/${restauranteId}/materiaPrima`);
      const materiaPrimaSnapshot = await getDocs(materiaPrimaRef);
      console.log("📊 Materia prima encontrada:", materiaPrimaSnapshot.size);

      let valorEnStock = 0;
      let costoStock = 0;
      let stockBajo = 0;
      let sinStock = 0;

      // Procesar bebidas
      bebidasSnapshot.forEach((doc) => {
        const bebida = doc.data();
        const cantidad = parseFloat(bebida.cantidad || 0);
        const precioVenta = parseFloat(bebida.precioVenta || 0);
        const costo = parseFloat(bebida.costo || 0);
        const stockMinimo = parseFloat(bebida.stockMinimo || 0);

        console.log("🍺 Bebida:", bebida.nombre || doc.id, {
          cantidad,
          precioVenta,
          costo,
          stockMinimo
        });

        // Calcular valores
        valorEnStock += cantidad * precioVenta;
        costoStock += cantidad * costo;

        // Verificar stock
        if (cantidad === 0) {
          sinStock++;
        } else if (cantidad <= stockMinimo) {
          stockBajo++;
        }
      });

      // Procesar materia prima
      materiaPrimaSnapshot.forEach((doc) => {
        const materia = doc.data();
        const cantidad = parseFloat(materia.cantidad || 0);
        const precioVenta = parseFloat(materia.precioVenta || 0);
        const costo = parseFloat(materia.costo || 0);
        const stockMinimo = parseFloat(materia.stockMinimo || 0);

        // Calcular valores
        valorEnStock += cantidad * precioVenta;
        costoStock += cantidad * costo;

        // Verificar stock
        if (cantidad === 0) {
          sinStock++;
        } else if (cantidad <= stockMinimo) {
          stockBajo++;
        }
      });

      const ganancia = valorEnStock - costoStock;

      setInventarioData({
        valorEnStock,
        costoStock,
        ganancia,
        stockBajo,
        sinStock,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error("Error calculando métricas de inventario:", error);
      setInventarioData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    calcularMetricasInventario();
  }, []);

  if (inventarioData.loading) {
    return (
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-slate-900/50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3 text-white">Cargando métricas de inventario...</span>
        </div>
      </div>
    );
  }

  if (inventarioData.error) {
    return (
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-slate-900/50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-white">{inventarioData.error}</p>
          <button
            onClick={calcularMetricasInventario}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const metricas = [
    {
      id: "valorEnStock",
      titulo: "Valor en Stock",
      valor: inventarioData.valorEnStock,
      color: "text-green-400",
      icono: "📊",
      descripcion: "Cantidad x Precio de venta"
    },
    {
      id: "costoStock",
      titulo: "Costo Stock",
      valor: inventarioData.costoStock,
      color: "text-orange-400",
      icono: "📊",
      descripcion: "Cantidad x Costo"
    },
    {
      id: "ganancia",
      titulo: "Ganancia",
      valor: inventarioData.ganancia,
      color: inventarioData.ganancia >= 0 ? "text-green-400" : "text-red-400",
      icono: "📈",
      descripcion: "Valor - Costo"
    },
    {
      id: "stockBajo",
      titulo: "Stock Bajo",
      valor: inventarioData.stockBajo,
      color: "text-orange-400",
      icono: "⚠️",
      descripcion: "Productos con stock bajo"
    },
    {
      id: "sinStock",
      titulo: "Sin Stock",
      valor: inventarioData.sinStock,
      color: "text-red-400",
      icono: "❌",
      descripcion: "Productos sin stock"
    }
  ];

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-slate-900/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/25">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Márgenes de Ganancia por Inventario</h2>
        </div>
        <button
          onClick={onToggle}
          className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
          title={isExpanded ? "Ocultar sección" : "Mostrar sección"}
        >
          <svg className={`w-5 h-5 text-white transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Lista de métricas */}
          <div className="space-y-3">
            {metricas.map((metrica) => (
              <div
                key={metrica.id}
                className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{metrica.icono}</div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{metrica.titulo}</h3>
                      <p className="text-slate-400 text-sm">{metrica.descripcion}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${metrica.color}`}>
                      {metrica.id === "stockBajo" || metrica.id === "sinStock" 
                        ? metrica.valor 
                        : formatDinero(metrica.valor)
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botón de actualizar */}
          <div className="pt-4 border-t border-slate-600/30">
            <button
              onClick={calcularMetricasInventario}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Actualizar Métricas</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(MargenesInventario);
