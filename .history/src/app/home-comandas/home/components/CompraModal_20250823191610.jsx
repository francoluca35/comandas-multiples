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
    subSubcategoria: "",
    precioVenta: "",
    uso: "",
  });

  const [subcategorias, setSubcategorias] = useState([]);
  const [subSubcategorias, setSubSubcategorias] = useState([]);
  const [loading, setLoading] = useState(false);

  // Subcategorías predefinidas
  const subcategoriasData = {
    bebida: ["Gaseosas", "Aguas", "Jugos", "Cervezas", "Vinos", "Licores", "Café", "Té"],
    comida: ["Carnes", "Pescados", "Verduras", "Frutas", "Lácteos", "Panadería", "Condimentos", "Otros"],
  };

  // Sub-subcategorías (con/sin alcohol)
  const subSubcategoriasData = {
    bebida: {
      "Gaseosas": ["Con alcohol", "Sin alcohol"],
      "Aguas": ["Sin alcohol"],
      "Jugos": ["Sin alcohol"],
      "Cervezas": ["Con alcohol"],
      "Vinos": ["Con alcohol"],
      "Licores": ["Con alcohol"],
      "Café": ["Sin alcohol"],
      "Té": ["Sin alcohol"],
    },
    comida: {
      "Carnes": ["Con alcohol", "Sin alcohol"],
      "Pescados": ["Con alcohol", "Sin alcohol"],
      "Verduras": ["Sin alcohol"],
      "Frutas": ["Sin alcohol"],
      "Lácteos": ["Sin alcohol"],
      "Panadería": ["Sin alcohol"],
      "Condimentos": ["Con alcohol", "Sin alcohol"],
      "Otros": ["Con alcohol", "Sin alcohol"],
    },
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
        subSubcategoria: "",
        precioVenta: "",
        uso: "",
      });
      setSubcategorias([]);
      setSubSubcategorias([]);
    }
  }, [isOpen]);

  // Actualizar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (formData.categoria && subcategoriasData[formData.categoria]) {
      setSubcategorias(subcategoriasData[formData.categoria]);
      setFormData(prev => ({ ...prev, subcategoria: "", subSubcategoria: "" }));
      setSubSubcategorias([]);
    } else {
      setSubcategorias([]);
      setSubSubcategorias([]);
    }
  }, [formData.categoria]);

  // Actualizar sub-subcategorías cuando cambia la subcategoría
  useEffect(() => {
    if (formData.categoria && formData.subcategoria && 
        subSubcategoriasData[formData.categoria] && 
        subSubcategoriasData[formData.categoria][formData.subcategoria]) {
      setSubSubcategorias(subSubcategoriasData[formData.categoria][formData.subcategoria]);
      setFormData(prev => ({ ...prev, subSubcategoria: "" }));
    } else {
      setSubSubcategorias([]);
    }
  }, [formData.subcategoria, formData.categoria]);

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

       if (formData.esConsumoFinal && !formData.subcategoria) {
         alert("Si es consumo final, debes seleccionar una subcategoría");
         return;
       }

       if (formData.esConsumoFinal && !formData.subSubcategoria) {
         alert("Si es consumo final, debes seleccionar si es con alcohol o sin alcohol");
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
              <div className="space-y-6">
                {/* Tipo de Producto */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Tipo de Producto *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, categoria: "bebida", subcategoria: "", subSubcategoria: "" }))}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                        formData.categoria === "bebida"
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2a2 2 0 01-2-2zM12 8a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        <span className="font-medium">Bebida</span>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, categoria: "comida", subcategoria: "", subSubcategoria: "" }))}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                        formData.categoria === "comida"
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                        <span className="font-medium">Materia Prima</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Subcategorías */}
                {formData.categoria && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      {formData.categoria === "bebida" ? "Tipo de Bebida" : "Tipo de Comida"} *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {subcategorias.map(sub => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, subcategoria: sub, subSubcategoria: "" }))}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                            formData.subcategoria === sub
                              ? "border-blue-500 bg-blue-500/10 text-blue-400"
                              : "border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500"
                          }`}
                        >
                          <span className="text-sm font-medium">{sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tipo de Alcohol */}
                {formData.subcategoria && subSubcategorias.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Tipo de Alcohol *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {subSubcategorias.map(subSub => (
                        <button
                          key={subSub}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, subSubcategoria: subSub }))}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                            formData.subSubcategoria === subSub
                              ? "border-blue-500 bg-blue-500/10 text-blue-400"
                              : "border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {subSub === "Con alcohol" ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2a2 2 0 01-2-2zM12 8a2 2 0 100-4 2 2 0 000 4z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            <span className="font-medium">{subSub}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
