"use client";
import React, { useState, useEffect } from "react";
import { FaTrash, FaTimes, FaSearch } from "react-icons/fa";
import { useStock } from "../../../../hooks/useStock";

const DestruirStockModal = ({ isOpen, onClose, onDestroy }) => {
  const { productos } = useStock();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);

  // Filtrar productos por búsqueda
  const filteredProductos = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Limpiar formulario cuando se abre
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSelectedProduct(null);
      setCantidad("");
      setMotivo("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedProduct) {
        alert("Por favor selecciona un producto");
        return;
      }

      if (!cantidad || Number(cantidad) <= 0) {
        alert("Por favor ingresa una cantidad válida");
        return;
      }

      if (Number(cantidad) > selectedProduct.stock) {
        alert("La cantidad a eliminar no puede ser mayor al stock disponible");
        return;
      }

      if (!motivo.trim()) {
        alert("Por favor especifica el motivo de la eliminación");
        return;
      }

      const destroyData = {
        productoId: selectedProduct.id,
        productoNombre: selectedProduct.nombre,
        cantidad: Number(cantidad),
        stockAnterior: selectedProduct.stock,
        stockNuevo: selectedProduct.stock - Number(cantidad),
        motivo: motivo.trim(),
        fecha: new Date().toISOString(),
      };

      await onDestroy(destroyData);
      onClose();
    } catch (error) {
      console.error("Error eliminando stock:", error);
      alert("Error al eliminar el stock");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <FaTrash className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Eliminar Stock</h2>
              <p className="text-slate-400 text-sm">Reduce el stock de un producto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Búsqueda de productos */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Buscar producto
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Buscar producto..."
              />
            </div>
          </div>

          {/* Lista de productos */}
          {searchTerm && (
            <div className="max-h-48 overflow-y-auto border border-slate-600 rounded-lg">
              {filteredProductos.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  No se encontraron productos
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredProductos.map((producto) => (
                    <button
                      key={producto.id}
                      type="button"
                      onClick={() => setSelectedProduct(producto)}
                      className={`w-full p-3 text-left hover:bg-slate-700 transition-colors ${
                        selectedProduct?.id === producto.id
                          ? "bg-red-500/20 border-l-4 border-red-500"
                          : "bg-slate-700/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{producto.nombre}</div>
                          <div className="text-sm text-slate-400">
                            Stock actual: {producto.stock}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-400">
                            ${producto.precio || 0}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Producto seleccionado */}
          {selectedProduct && (
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <h3 className="font-medium text-white mb-2">Producto seleccionado:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Nombre:</span>
                  <div className="text-white font-medium">{selectedProduct.nombre}</div>
                </div>
                <div>
                  <span className="text-slate-400">Stock actual:</span>
                  <div className="text-white font-medium">{selectedProduct.stock}</div>
                </div>
                <div>
                  <span className="text-slate-400">Precio:</span>
                  <div className="text-white font-medium">${selectedProduct.precio || 0}</div>
                </div>
                <div>
                  <span className="text-slate-400">Categoría:</span>
                  <div className="text-white font-medium capitalize">{selectedProduct.categoria || "N/A"}</div>
                </div>
              </div>
            </div>
          )}

          {/* Cantidad a eliminar */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Cantidad a eliminar *
            </label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="0"
              min="0"
              max={selectedProduct?.stock || 0}
              step="0.01"
              required
              disabled={!selectedProduct}
            />
            {selectedProduct && (
              <p className="text-xs text-slate-400 mt-1">
                Stock disponible: {selectedProduct.stock} | 
                Stock restante: {selectedProduct.stock - (Number(cantidad) || 0)}
              </p>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Motivo de la eliminación *
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ej: Producto vencido, dañado, pérdida, etc."
              rows="3"
              required
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !selectedProduct || !cantidad || !motivo}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <FaTrash className="w-4 h-4" />
                  <span>Eliminar Stock</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DestruirStockModal;
