"use client";
import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaTimes, FaSave } from "react-icons/fa";

const CompraModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    cantidad: "",
    precioUnitario: "",
    esConsumoFinal: false,
    categoria: "",
    subcategoria: "",
    precioVenta: "",
    uso: "",
  });

  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(false);

  // Subcategorías predefinidas
  const subcategoriasData = {
    bebida: ["Gaseosas", "Aguas", "Jugos", "Cervezas", "Vinos", "Licores", "Café", "Té"],
    comida: ["Carnes", "Pescados", "Verduras", "Frutas", "Lácteos", "Panadería", "Condimentos", "Otros"],
  };

  // Limpiar formulario cuando se abre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: "",
        cantidad: "",
        precioUnitario: "",
        esConsumoFinal: false,
        categoria: "",
        subcategoria: "",
        precioVenta: "",
        uso: "",
      });
      setSubcategorias([]);
    }
  }, [isOpen]);

  // Actualizar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (formData.categoria && subcategoriasData[formData.categoria]) {
      setSubcategorias(subcategoriasData[formData.categoria]);
      setFormData(prev => ({ ...prev, subcategoria: "" }));
    } else {
      setSubcategorias([]);
    }
  }, [formData.categoria]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar campos requeridos
      if (!formData.nombre || !formData.cantidad || !formData.precioUnitario) {
        alert("Por favor completa todos los campos requeridos");
        return;
      }

      if (formData.esConsumoFinal && !formData.categoria) {
        alert("Si es consumo final, debes seleccionar una categoría");
        return;
      }

      if (formData.esConsumoFinal && !formData.precioVenta) {
        alert("Si es consumo final, debes especificar el precio de venta");
        return;
      }

      if (!formData.esConsumoFinal && !formData.uso) {
        alert("Si no es consumo final, debes especificar para qué se va a usar");
        return;
      }

      // Preparar datos para guardar
      const compraData = {
        ...formData,
        cantidad: Number(formData.cantidad),
        precioUnitario: Number(formData.precioUnitario),
        precioVenta: formData.esConsumoFinal ? Number(formData.precioVenta) : 0,
        fechaCompra: new Date().toISOString(),
        tipo: formData.esConsumoFinal ? "consumo_final" : "materia_prima",
      };

      await onSave(compraData);
      onClose();
    } catch (error) {
      console.error("Error guardando compra:", error);
      alert("Error al guardar la compra");
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
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FaShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nueva Compra</h2>
              <p className="text-slate-400 text-sm">Registra una nueva compra de inventario</p>
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
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre del producto *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Coca Cola 2L"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cantidad *
              </label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Precio unitario *
              </label>
              <input
                type="number"
                name="precioUnitario"
                value={formData.precioUnitario}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Precio total
              </label>
              <input
                type="text"
                value={formData.cantidad && formData.precioUnitario ? 
                  (Number(formData.cantidad) * Number(formData.precioUnitario)).toFixed(2) : "0.00"}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                readOnly
              />
            </div>
          </div>

          {/* Tipo de consumo */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="esConsumoFinal"
                checked={formData.esConsumoFinal}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
              />
              <span className="text-white font-medium">¿Es consumo final? (Se vende directamente al cliente)</span>
            </label>
          </div>

          {/* Campos condicionales según tipo de consumo */}
          {formData.esConsumoFinal ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="bebida">Bebida</option>
                    <option value="comida">Comida</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Subcategoría *
                  </label>
                  <select
                    name="subcategoria"
                    value={formData.subcategoria}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!formData.categoria}
                  >
                    <option value="">Seleccionar subcategoría</option>
                    {subcategorias.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Precio de venta al público *
                </label>
                <input
                  type="number"
                  name="precioVenta"
                  value={formData.precioVenta}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  Este precio aparecerá en el menú para las meseras
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ¿Para qué se va a usar? *
              </label>
              <textarea
                name="uso"
                value={formData.uso}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Para preparar hamburguesas, para limpieza, etc."
                rows="3"
                required
              />
            </div>
          )}

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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  <span>Guardar Compra</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompraModal;
