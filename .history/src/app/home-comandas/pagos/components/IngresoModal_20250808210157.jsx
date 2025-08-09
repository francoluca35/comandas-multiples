"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useIngresos } from "../../../../hooks/useIngresos";

export default function IngresoModal({ isOpen, onClose, onSuccess }) {
  const { crearIngreso, getTiposIngreso, loading } = useIngresos();

  const [formData, setFormData] = useState({
    tipoIngreso: "",
    motivo: "",
    monto: "",
    formaIngreso: "",
    descripcion: "",
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");

  // Filtrar sugerencias basadas en el input
  useEffect(() => {
    if (formData.tipoIngreso.trim()) {
      const tiposIngreso = getTiposIngreso();
      const filtered = tiposIngreso.filter((tipo) =>
        tipo.toLowerCase().includes(formData.tipoIngreso.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [formData.tipoIngreso]);

  // Limpiar formulario al abrir
  useEffect(() => {
    if (isOpen) {
      setFormData({
        tipoIngreso: "",
        motivo: "",
        monto: "",
        formaIngreso: "",
        descripcion: "",
      });
      setError("");
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      tipoIngreso: suggestion,
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!formData.tipoIngreso.trim()) {
      setError("El tipo de ingreso es requerido");
      return;
    }
    if (!formData.motivo.trim()) {
      setError("El motivo es requerido");
      return;
    }
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }
    if (!formData.formaIngreso.trim()) {
      setError("La forma de ingreso es requerida");
      return;
    }

    try {
      const fecha = new Date();
      const opcionPago = ""; // Por ahora vacío, se puede agregar si es necesario

      await crearIngreso(
        formData.tipoIngreso.trim(),
        formData.motivo.trim(),
        parseFloat(formData.monto),
        formData.formaIngreso.trim(),
        fecha,
        opcionPago
      );
      onSuccess();
      onClose();
    } catch (error) {
      setError("Error al crear el ingreso: " + error.message);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 999999 }}
    >
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-6 w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">Nuevo Ingreso</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Ingreso */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tipo de Ingreso
            </label>
            <input
              type="text"
              name="tipoIngreso"
              value={formData.tipoIngreso}
              onChange={handleInputChange}
              placeholder="Ej: Venta, Propina, Otro..."
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
            />

            {/* Sugerencias */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-slate-700 border border-slate-600 rounded-lg mt-1 max-h-40 overflow-y-auto z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Motivo
            </label>
            <input
              type="text"
              name="motivo"
              value={formData.motivo}
              onChange={handleInputChange}
              placeholder="Ej: Venta extra, Propina, etc."
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
            />
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Monto
            </label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
            />
          </div>

          {/* Forma de Ingreso */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Forma de Ingreso
            </label>
            <select
              name="formaIngreso"
              value={formData.formaIngreso}
              onChange={handleInputChange}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
            >
              <option value="">Selecciona la forma de ingreso</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Mercado Pago">Mercado Pago</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Descripción adicional del ingreso..."
              rows="3"
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-slate-700 transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-500 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? "Creando..." : "Crear Ingreso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body);
}
