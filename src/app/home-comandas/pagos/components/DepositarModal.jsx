"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function DepositarModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    motivo: "",
    dinero: "",
    cuenta: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Limpiar formulario al abrir
  useEffect(() => {
    if (isOpen) {
      setFormData({
        motivo: "",
        dinero: "",
        cuenta: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!formData.motivo.trim()) {
      setError("El motivo es requerido");
      return;
    }
    if (!formData.dinero || parseFloat(formData.dinero) <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }
    if (!formData.cuenta) {
      setError("Debes seleccionar una cuenta");
      return;
    }

    setLoading(true);
    try {
      // Aquí deberías conectar con tu API para registrar el depósito
      const depositoData = {
        ...formData,
        dinero: parseFloat(formData.dinero),
        fecha: new Date(),
      };

      console.log("Registrando depósito:", depositoData);

      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess();
      onClose();
    } catch (error) {
      setError("Error al registrar el depósito: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 999999 }}
    >
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-400"
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
            </div>
            <h3 className="text-lg font-bold text-white">Depositar Dinero</h3>
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
              placeholder="Ej: Depósito de ventas, Transferencia, etc."
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>

          {/* Dinero */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Dinero
            </label>
            <input
              type="number"
              name="dinero"
              value={formData.dinero}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>

          {/* Cuenta */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Cuenta
            </label>
            <select
              name="cuenta"
              value={formData.cuenta}
              onChange={handleInputChange}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            >
              <option value="">Selecciona una cuenta</option>
              <option value="banco">Banco</option>
              <option value="mp">Mercado Pago</option>
            </select>
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
              className="flex-1 bg-blue-500 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? "Registrando..." : "Registrar Depósito"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body);
}
