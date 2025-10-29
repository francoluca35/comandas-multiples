"use client";
import React, { useState } from "react";
import { collection, addDoc, serverTimestamp, updateDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../../../../../lib/firebase"; 

function RetirarEfectivoModal({ isOpen, onClose, onSuccess, data, formatDinero }) {
  const [formData, setFormData] = useState({
    monto: "",
    motivo: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const monto = parseFloat(formData.monto);
      if (isNaN(monto) || monto <= 0) {
        throw new Error("El monto debe ser un número válido mayor a 0");
      }

      // Verificar que hay suficiente efectivo (dinero actual + ventas)
      const efectivoDisponible = (data?.dineroActual?.efectivo || 0) + (data?.ventas?.efectivo || 0);
      if (monto > efectivoDisponible) {
        throw new Error(`No hay suficiente efectivo. Disponible: ${formatDinero(efectivoDisponible)}`);
      }

      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) {
        throw new Error("No hay restaurante seleccionado");
      }

      // Crear el egreso
      const egresoData = {
        monto: monto.toString(),
        motivo: formData.motivo || "Retiro de efectivo",
        tipo: "retiro_efectivo",
        formaPago: "efectivo",
        restauranteId,
        fecha: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      // Guardar en la colección de egresos
      await addDoc(collection(db, "restaurantes", restauranteId, "Egresos"), egresoData);

      // No actualizar la caja registradora aquí
      // El egreso se registra y la API calcula el dinero actual correctamente
      console.log("✅ Egreso registrado, el dinero actual se calculará automáticamente");

      console.log("✅ Retiro de efectivo registrado exitosamente");
      onSuccess();
      onClose();
      
      // Limpiar formulario
      setFormData({ monto: "", motivo: "" });
    } catch (err) {
      console.error("❌ Error al registrar retiro:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const efectivoDisponible = data?.dineroActual?.efectivo || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Retirar Efectivo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Efectivo Disponible */}
        <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-sm">Efectivo Disponible:</span>
            <span className="text-green-400 font-bold text-lg">
              {formatDinero(efectivoDisponible)}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Monto a Retirar
            </label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              max={efectivoDisponible}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Motivo del Retiro
            </label>
            <input
              type="text"
              name="motivo"
              value={formData.motivo}
              onChange={handleInputChange}
              placeholder="Ej: Retiro para gastos personales"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.monto}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Retirar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RetirarEfectivoModal;
