"use client";
import React, { useState, useEffect } from "react";
import { useIngresos } from "../../../../hooks/useIngresos";

export default function IngresoModal({ isOpen, onClose, onSuccess }) {
  const { crearIngreso, getTiposIngreso, loading } = useIngresos();

  const [formData, setFormData] = useState({
    tipoIngreso: "",
    motivo: "",
    monto: "",
    formaIngreso: "",
    fecha: new Date().toISOString().slice(0, 16), // Formato YYYY-MM-DDTHH:MM
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState("");

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
        fecha: new Date().toISOString().slice(0, 16), // Formato YYYY-MM-DDTHH:MM
      });
      setError("");
      setShowPaymentOptions(false);
      setSelectedPaymentOption("");
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Si cambia la forma de ingreso, mostrar opciones correspondientes
    if (name === "formaIngreso") {
      if (value === "Cuenta" || value === "Efectivo") {
        setShowPaymentOptions(true);
        setSelectedPaymentOption("");
      } else {
        setShowPaymentOptions(false);
        setSelectedPaymentOption("");
      }
    }
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

    // Validar opción de pago si es requerida
    if (showPaymentOptions && !selectedPaymentOption) {
      setError("Debes seleccionar una opción de ingreso");
      return;
    }

    try {
      await crearIngreso(
        formData.tipoIngreso.trim(),
        formData.motivo.trim(),
        parseFloat(formData.monto),
        formData.formaIngreso.trim(),
        new Date(formData.fecha), // Convertir string a Date
        selectedPaymentOption // Pasar la opción de pago seleccionada
      );

      // Limpiar formulario y cerrar modal
      setFormData({
        tipoIngreso: "",
        motivo: "",
        monto: "",
        formaIngreso: "",
        fecha: new Date().toISOString().slice(0, 16), // Formato YYYY-MM-DDTHH:MM
      });
      setShowPaymentOptions(false);
      setSelectedPaymentOption("");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError("Error al crear el ingreso: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-6 w-full max-w-md shadow-2xl">
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
              placeholder="Descripción del ingreso..."
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
            />
          </div>

          {/* Fecha (editable) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Fecha de Ingreso
            </label>
            <input
              type="datetime-local"
              name="fecha"
              value={formData.fecha}
              onChange={handleInputChange}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">
              Selecciona la fecha y hora del ingreso
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
              <option value="">Seleccionar forma de ingreso</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Cuenta">Cuenta</option>
            </select>
          </div>

          {/* Opciones de Ingreso */}
          {showPaymentOptions && (
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Opción de Ingreso
              </label>

              {formData.formaIngreso === "Efectivo" ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentOption("caja")}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedPaymentOption === "caja"
                        ? "bg-green-500/20 border-green-500/50 text-green-300"
                        : "bg-slate-600/50 border-slate-500/50 text-slate-300 hover:bg-slate-600/70"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
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
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span className="font-medium">
                        Agregar a la caja registradora
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Se sumará al efectivo de la caja
                    </p>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentOption("otra_cuenta")}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedPaymentOption === "otra_cuenta"
                        ? "bg-green-500/20 border-green-500/50 text-green-300"
                        : "bg-slate-600/50 border-slate-500/50 text-slate-300 hover:bg-slate-600/70"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
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
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span className="font-medium">Otra cuenta</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      No se modificará el dinero del restaurante
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPaymentOption("cuenta_restaurante")
                    }
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedPaymentOption === "cuenta_restaurante"
                        ? "bg-green-500/20 border-green-500/50 text-green-300"
                        : "bg-slate-600/50 border-slate-500/50 text-slate-300 hover:bg-slate-600/70"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
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
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span className="font-medium">
                        Agregar a cuenta del restaurante
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Se sumará al dinero virtual
                    </p>
                  </button>
                </div>
              )}
            </div>
          )}

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
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                  <span>Guardar Ingreso</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
