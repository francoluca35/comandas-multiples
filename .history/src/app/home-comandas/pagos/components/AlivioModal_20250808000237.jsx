"use client";
import React, { useState, useEffect } from "react";
import { useAlivios } from "../../../../hooks/useAlivios";

export default function AlivioModal({ isOpen, onClose, onSuccess }) {
  const { crearAlivio, getNombresServicios, loading } = useAlivios();

  const [formData, setFormData] = useState({
    nombreServicio: "",
    monto: "",
    tipodepago: "",
    fecha: new Date().toISOString().slice(0, 16), // Formato YYYY-MM-DDTHH:MM
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState("");

  // Filtrar sugerencias basadas en el input
  useEffect(() => {
    if (formData.nombreServicio.trim()) {
      const nombresServicios = getNombresServicios();
      const filtered = nombresServicios.filter((nombre) =>
        nombre.toLowerCase().includes(formData.nombreServicio.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [formData.nombreServicio]);

  // Limpiar formulario al abrir
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombreServicio: "",
        monto: "",
        tipodepago: "",
        fecha: new Date().toISOString().slice(0, 16), // Formato YYYY-MM-DDTHH:MM
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
      nombreServicio: suggestion,
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!formData.nombreServicio.trim()) {
      setError("El nombre del servicio es requerido");
      return;
    }
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }
    if (!formData.tipodepago.trim()) {
      setError("El tipo de pago es requerido");
      return;
    }

    try {
      await crearAlivio(
        formData.nombreServicio.trim(),
        parseFloat(formData.monto),
        formData.tipodepago.trim(),
        new Date(formData.fecha) // Convertir string a Date
      );

      // Limpiar formulario y cerrar modal
      setFormData({
        nombreServicio: "",
        monto: "",
        tipodepago: "",
        fecha: new Date().toISOString().slice(0, 16), // Formato YYYY-MM-DDTHH:MM
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError("Error al crear el alivio: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">Nuevo Alivio</h3>
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
          {/* Nombre del Servicio */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nombre del Servicio
            </label>
            <input
              type="text"
              name="nombreServicio"
              value={formData.nombreServicio}
              onChange={handleInputChange}
              placeholder="Ej: Luz, Gas, Internet..."
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
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

          {/* Fecha (editable) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Fecha de Pago
            </label>
            <input
              type="datetime-local"
              name="fecha"
              value={formData.fecha}
              onChange={handleInputChange}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">
              Selecciona la fecha y hora del pago
            </p>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Importe
            </label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
            />
          </div>

          {/* Tipo de Pago */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tipo de Pago
            </label>
            <select
              name="tipodepago"
              value={formData.tipodepago}
              onChange={handleInputChange}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
            >
              <option value="">Seleccionar tipo de pago</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Débito">Débito</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
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
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Guardar Alivio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
