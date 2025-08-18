"use client";
import { useState, useEffect } from "react";
import {
  FaTimes,
  FaUpload,
  FaSave,
  FaEdit,
  FaWineBottle,
  FaCarrot,
} from "react-icons/fa";

export default function ProductoModal({
  isOpen,
  onClose,
  producto = null,
  onSave,
  categorias = [],
}) {
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "", // "bebida" o "alimento"
    categoria: "",
    subcategoria: "", // "con alcohol" o "sin alcohol" (solo para bebidas)
    stock: "",
    precio: "",
    costo: "",
    imagen: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoriaDropdown, setShowCategoriaDropdown] = useState(false);

  // Cargar datos del producto si es edición
  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || "",
        tipo:
          producto.tipo || producto.tipoProducto === "materiaPrima"
            ? "alimento"
            : "bebida",
        categoria: producto.categoria || "",
        subcategoria: producto.subcategoria || "",
        stock: producto.stock?.toString() || "",
        precio: producto.precio?.toString() || "",
        costo: producto.costo?.toString() || "",
        imagen: producto.imagen || "",
      });
    } else {
      setFormData({
        nombre: "",
        tipo: "",
        categoria: "",
        subcategoria: "",
        stock: "",
        precio: "",
        costo: "",
        imagen: "",
      });
    }
    setErrors({});
    setShowCategoriaDropdown(false);
  }, [producto, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.tipo.trim()) {
      newErrors.tipo = "El tipo es requerido";
    }

    // Solo validar categoría si NO es bebida
    if (formData.tipo !== "bebida" && !formData.categoria.trim()) {
      newErrors.categoria = "La categoría es requerida";
    }

    if (formData.tipo === "bebida" && !formData.subcategoria.trim()) {
      newErrors.subcategoria = "La subcategoría es requerida para bebidas";
    }

    if (
      formData.stock !== "" &&
      (isNaN(formData.stock) || parseInt(formData.stock) < 0)
    ) {
      newErrors.stock = "El stock debe ser un número válido";
    }

    if (
      formData.precio !== "" &&
      (isNaN(formData.precio) || parseFloat(formData.precio) < 0)
    ) {
      newErrors.precio = "El precio debe ser un número válido";
    }

    if (
      formData.costo !== "" &&
      (isNaN(formData.costo) || parseFloat(formData.costo) < 0)
    ) {
      newErrors.costo = "El costo debe ser un número válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const productoData = {
        nombre: formData.nombre.trim(),
        tipo: formData.tipo.trim(),
        categoria:
          formData.tipo === "bebida"
            ? formData.categoria.trim() || "bebidas"
            : formData.categoria.trim(),
        subcategoria: formData.subcategoria.trim(),
        stock: parseInt(formData.stock) || 0,
        precio: parseFloat(formData.precio) || 0,
        costo: parseFloat(formData.costo) || 0,
        imagen: formData.imagen.trim(),
      };

      await onSave(productoData);
      onClose();
    } catch (error) {
      console.error("Error saving producto:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 border border-slate-700/50 w-full max-w-md shadow-2xl rounded-2xl bg-slate-800/90 backdrop-blur-sm">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {producto ? "Editar Producto" : "Agregar Producto"}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/50"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400 backdrop-blur-sm ${
                  errors.nombre ? "border-red-500" : "border-slate-600/50"
                }`}
                placeholder="Ej: Coca Cola"
              />
              {errors.nombre && (
                <p className="text-red-400 text-sm mt-2">{errors.nombre}</p>
              )}
            </div>

            {/* Tipo de Producto */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Tipo de Producto *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange("tipo", "bebida")}
                  className={`px-4 py-3 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 ${
                    formData.tipo === "bebida"
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50"
                  } ${errors.tipo ? "border-red-500" : ""}`}
                >
                  <FaWineBottle className="w-4 h-4" />
                  🥤 Bebida
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("tipo", "alimento")}
                  className={`px-4 py-3 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 ${
                    formData.tipo === "alimento"
                      ? "bg-green-600 border-green-500 text-white"
                      : "bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50"
                  } ${errors.tipo ? "border-red-500" : ""}`}
                >
                  <FaCarrot className="w-4 h-4" />
                  🥕 Materia Prima
                </button>
              </div>
              {errors.tipo && (
                <p className="text-red-400 text-sm mt-2">{errors.tipo}</p>
              )}
            </div>

            {/* Subcategoría para Bebidas */}
            {formData.tipo === "bebida" && (
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Tipo de Bebida *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange("subcategoria", "sin alcohol")
                    }
                    className={`px-4 py-3 rounded-xl border transition-all duration-300 ${
                      formData.subcategoria === "sin alcohol"
                        ? "bg-green-600 border-green-500 text-white"
                        : "bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50"
                    } ${errors.subcategoria ? "border-red-500" : ""}`}
                  >
                    🥤 Sin Alcohol
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange("subcategoria", "con alcohol")
                    }
                    className={`px-4 py-3 rounded-xl border transition-all duration-300 ${
                      formData.subcategoria === "con alcohol"
                        ? "bg-orange-600 border-orange-500 text-white"
                        : "bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50"
                    } ${errors.subcategoria ? "border-red-500" : ""}`}
                  >
                    🍺 Con Alcohol
                  </button>
                </div>
                {errors.subcategoria && (
                  <p className="text-red-400 text-sm mt-2">
                    {errors.subcategoria}
                  </p>
                )}
              </div>
            )}

            {/* Categoría - Para todos los productos */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Categoría {formData.tipo === "bebida" ? "(Opcional)" : "*"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) =>
                    handleInputChange("categoria", e.target.value)
                  }
                  onFocus={() => setShowCategoriaDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowCategoriaDropdown(false), 200)
                  }
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400 backdrop-blur-sm ${
                    errors.categoria ? "border-red-500" : "border-slate-600/50"
                  }`}
                  placeholder={
                    formData.tipo === "bebida"
                      ? "bebidas (por defecto)"
                      : "Escribir o seleccionar categoría"
                  }
                  list="categorias-list"
                />

                {/* Dropdown de categorías existentes */}
                {showCategoriaDropdown && categorias.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {categorias
                      .filter((cat) =>
                        cat
                          .toLowerCase()
                          .includes(formData.categoria.toLowerCase())
                      )
                      .map((cat) => (
                        <div
                          key={cat}
                          className="px-4 py-2 hover:bg-slate-600 cursor-pointer text-white text-sm"
                          onClick={() => {
                            handleInputChange("categoria", cat);
                            setShowCategoriaDropdown(false);
                          }}
                        >
                          {cat}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              {errors.categoria && (
                <p className="text-red-400 text-sm mt-2">{errors.categoria}</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Stock
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400 backdrop-blur-sm ${
                  errors.stock ? "border-red-500" : "border-slate-600/50"
                }`}
                placeholder="0"
                min="0"
              />
              {errors.stock && (
                <p className="text-red-400 text-sm mt-2">{errors.stock}</p>
              )}
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Precio de Venta
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => handleInputChange("precio", e.target.value)}
                className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400 backdrop-blur-sm ${
                  errors.precio ? "border-red-500" : "border-slate-600/50"
                }`}
                placeholder="0.00"
                min="0"
              />
              {errors.precio && (
                <p className="text-red-400 text-sm mt-2">{errors.precio}</p>
              )}
            </div>

            {/* Costo */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Costo
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.costo}
                onChange={(e) => handleInputChange("costo", e.target.value)}
                className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400 backdrop-blur-sm ${
                  errors.costo ? "border-red-500" : "border-slate-600/50"
                }`}
                placeholder="0.00"
                min="0"
              />
              {errors.costo && (
                <p className="text-red-400 text-sm mt-2">{errors.costo}</p>
              )}
            </div>

            {/* Imagen URL */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                URL de Imagen
              </label>
              <input
                type="url"
                value={formData.imagen}
                onChange={(e) => handleInputChange("imagen", e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-400 backdrop-blur-sm"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-600/50 rounded-xl shadow-sm text-sm font-semibold text-slate-300 bg-slate-700/50 hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 focus:ring-offset-slate-800 transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 focus:ring-offset-slate-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    {producto ? (
                      <FaEdit className="w-4 h-4" />
                    ) : (
                      <FaSave className="w-4 h-4" />
                    )}
                    {producto ? "Actualizar" : "Guardar"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
