"use client";
import React, { useState } from "react";
import { FaShoppingCart, FaSearch, FaFilter, FaCalendar } from "react-icons/fa";
import { useCompras } from "../../../../hooks/useCompras";

const HistorialCompras = () => {
  const { compras, loading, getComprasStats, searchCompras } = useCompras();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Todas");

  const stats = getComprasStats();
  const filteredCompras = searchCompras(searchTerm).filter(compra => {
    if (filterType === "Todas") return true;
    if (filterType === "Consumo Final") return compra.esConsumoFinal;
    if (filterType === "Materia Prima") return !compra.esConsumoFinal;
    return true;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-slate-900/50">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
          <FaShoppingCart className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Historial de Compras</h2>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
          <div className="flex items-center space-x-2 mb-2">
            <FaShoppingCart className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400 text-sm">Total Compras</span>
          </div>
          <p className="text-xl font-bold text-blue-400">{stats.totalCompras}</p>
        </div>

        <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
          <div className="flex items-center space-x-2 mb-2">
            <FaShoppingCart className="w-4 h-4 text-green-400" />
            <span className="text-slate-400 text-sm">Total Gastado</span>
          </div>
          <p className="text-xl font-bold text-green-400">{formatCurrency(stats.totalGastado)}</p>
        </div>

        <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
          <div className="flex items-center space-x-2 mb-2">
            <FaShoppingCart className="w-4 h-4 text-orange-400" />
            <span className="text-slate-400 text-sm">Consumo Final</span>
          </div>
          <p className="text-xl font-bold text-orange-400">{stats.comprasConsumoFinal}</p>
        </div>

        <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
          <div className="flex items-center space-x-2 mb-2">
            <FaShoppingCart className="w-4 h-4 text-purple-400" />
            <span className="text-slate-400 text-sm">Materia Prima</span>
          </div>
          <p className="text-xl font-bold text-purple-400">{stats.comprasMateriaPrima}</p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar compras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 pr-8 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="Todas">Todas las compras</option>
            <option value="Consumo Final">Consumo Final</option>
            <option value="Materia Prima">Materia Prima</option>
          </select>
        </div>
      </div>

      {/* Lista de compras */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredCompras.length === 0 ? (
          <div className="text-center py-8">
            <FaShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">No se encontraron compras</p>
          </div>
        ) : (
          filteredCompras.map((compra) => (
            <div
              key={compra.id}
              className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50 hover:bg-slate-700/70 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{compra.nombre}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  compra.esConsumoFinal 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-blue-500/20 text-blue-400"
                }`}>
                  {compra.esConsumoFinal ? "Consumo Final" : "Materia Prima"}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-slate-400">Cantidad:</span>
                  <span className="text-white ml-1">{compra.cantidad}</span>
                </div>
                <div>
                  <span className="text-slate-400">Precio unitario:</span>
                  <span className="text-white ml-1">{formatCurrency(compra.precioUnitario)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Total:</span>
                  <span className="text-green-400 ml-1 font-semibold">{formatCurrency(compra.precioTotal)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Fecha:</span>
                  <span className="text-white ml-1">{formatDate(compra.fechaCompra)}</span>
                </div>
              </div>

              {compra.esConsumoFinal && (
                <div className="mt-2 pt-2 border-t border-slate-600">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-400">Categoría:</span>
                      <span className="text-white ml-1 capitalize">{compra.categoria}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Precio venta:</span>
                      <span className="text-orange-400 ml-1 font-semibold">{formatCurrency(compra.precioVenta)}</span>
                    </div>
                  </div>
                </div>
              )}

              {!compra.esConsumoFinal && compra.uso && (
                <div className="mt-2 pt-2 border-t border-slate-600">
                  <div className="text-sm">
                    <span className="text-slate-400">Uso:</span>
                    <span className="text-white ml-1">{compra.uso}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistorialCompras;
