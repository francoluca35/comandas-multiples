"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";

function PagarProveedorModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0], // Fecha actual por defecto
    proveedor: "",
    producto: "",
    costo: "",
    metodoPago: "efectivo",
    tipoPago: "contado",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar campos
      if (!formData.fecha) {
        throw new Error("La fecha es requerida");
      }

      if (!formData.proveedor.trim()) {
        throw new Error("El proveedor es requerido");
      }

      if (!formData.producto.trim()) {
        throw new Error("El producto es requerido");
      }

      if (!formData.costo || parseFloat(formData.costo) <= 0) {
        throw new Error("El costo debe ser mayor a 0");
      }

      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) {
        throw new Error("No hay restaurante seleccionado");
      }

      const response = await fetch("/api/pagar-proveedor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          fecha: formData.fecha,
          proveedor: formData.proveedor.trim(),
          producto: formData.producto.trim(),
          costo: parseFloat(formData.costo),
          metodoPago: formData.metodoPago,
          tipoPago: formData.tipoPago,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el pago a proveedor");
      }

      if (data.success) {
        console.log("✅ Pago a proveedor creado exitosamente:", data.data);
        onSuccess(data.data);
        handleClose();
      } else {
        throw new Error(data.error || "Error al crear el pago a proveedor");
      }
    } catch (err) {
      console.error("❌ Error creando pago a proveedor:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fecha: new Date().toISOString().split("T")[0],
      proveedor: "",
      producto: "",
      costo: "",
      metodoPago: "efectivo",
      tipoPago: "contado",
    });
    setError(null);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-6 w-96 max-h-[80vh] overflow-y-auto shadow-2xl shadow-slate-900/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Pagar Proveedor</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-white"
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
          {/* Fecha */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Fecha <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => handleInputChange("fecha", e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
              required
            />
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Proveedor <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.proveedor}
              onChange={(e) => handleInputChange("proveedor", e.target.value)}
              placeholder="Nombre del proveedor"
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
              required
            />
          </div>

          {/* Producto */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Producto <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.producto}
              onChange={(e) => handleInputChange("producto", e.target.value)}
              placeholder="Nombre del producto"
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
              required
            />
          </div>

          {/* Costo */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Costo <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.costo}
              onChange={(e) => handleInputChange("costo", e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
              required
            />
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Método de Pago <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.metodoPago}
              onChange={(e) => handleInputChange("metodoPago", e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
              required
            >
              <option value="efectivo">Efectivo</option>
              <option value="virtual">Cartera Virtual</option>
            </select>
          </div>

          {/* Tipo de Pago */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Tipo de Pago <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.tipoPago}
              onChange={(e) => handleInputChange("tipoPago", e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
              required
            >
              <option value="contado">Contado</option>
              <option value="credito">Crédito</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm flex items-center space-x-2">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
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
                  <span>Procesando...</span>
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span>Pagar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default PagarProveedorModal;
