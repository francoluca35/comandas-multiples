"use client";
import React, { useState } from "react";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../../../lib/firebase"; 

function PagarEmpleadoModal({ isOpen, onClose, onSuccess, data, formatDinero }) {
  const [formData, setFormData] = useState({
    monto: "",
    motivo: "",
    formaPago: "efectivo"
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

      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) {
        throw new Error("No hay restaurante seleccionado");
      }

      // Verificar que hay suficiente dinero según la forma de pago
      if (formData.formaPago === "efectivo") {
        const efectivoDisponible = data?.dineroActual?.efectivo || 0;
        if (monto > efectivoDisponible) {
          throw new Error(`No hay suficiente efectivo. Disponible: ${formatDinero(efectivoDisponible)}`);
        }
      } else {
        const virtualDisponible = data?.dineroActual?.virtual || 0;
        if (monto > virtualDisponible) {
          throw new Error(`No hay suficiente dinero virtual. Disponible: ${formatDinero(virtualDisponible)}`);
        }
      }

      // Crear el egreso
      const egresoData = {
        monto: monto.toString(),
        motivo: formData.motivo || "Pago a empleado",
        tipo: "pago_empleado",
        formaPago: formData.formaPago,
        restauranteId,
        fecha: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      // Guardar en la colección de egresos
      await addDoc(collection(db, "Egresos"), egresoData);

      // Actualizar el dinero actual según la forma de pago
      const dineroActualRef = doc(db, "DineroActual", restauranteId);
      const updateData = {
        fechaActualizacion: serverTimestamp()
      };

      if (formData.formaPago === "efectivo") {
        const efectivoDisponible = data?.dineroActual?.efectivo || 0;
        updateData.efectivo = efectivoDisponible - monto;
      } else {
        const virtualDisponible = data?.dineroActual?.virtual || 0;
        updateData.virtual = virtualDisponible - monto;
      }

      await updateDoc(dineroActualRef, updateData);

      // Si es efectivo, también actualizar la caja
      if (formData.formaPago === "efectivo") {
        const cajaRef = doc(db, "Cajas", `${restauranteId}_caja_principal`);
        await updateDoc(cajaRef, {
          Extraccion: {
            ...data?.dineroActual?.Extraccion || {},
            [new Date().toISOString()]: {
              importe: monto,
              motivo: formData.motivo || "Pago a empleado",
              fecha: serverTimestamp()
            }
          },
          ultimaActualizacion: serverTimestamp()
        });
      }

      console.log("✅ Pago a empleado registrado exitosamente");
      onSuccess();
      onClose();
      
      // Limpiar formulario
      setFormData({ monto: "", motivo: "", formaPago: "efectivo" });
    } catch (err) {
      console.error("❌ Error al registrar pago a empleado:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const efectivoDisponible = data?.dineroActual?.efectivo || 0;
  const virtualDisponible = data?.dineroActual?.virtual || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Pagar Empleado</h2>
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

        {/* Dinero Disponible */}
        <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Efectivo Disponible:</span>
              <span className="text-green-400 font-bold">
                {formatDinero(efectivoDisponible)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Dinero Virtual:</span>
              <span className="text-blue-400 font-bold">
                {formatDinero(virtualDisponible)}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Forma de Pago */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Forma de Pago
            </label>
            <select
              name="formaPago"
              value={formData.formaPago}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="efectivo">Efectivo</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Monto del Pago
            </label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              max={formData.formaPago === "efectivo" ? efectivoDisponible : virtualDisponible}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            />
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Motivo del Pago
            </label>
            <input
              type="text"
              name="motivo"
              value={formData.motivo}
              onChange={handleInputChange}
              placeholder="Ej: Pago de sueldo - Juan Pérez"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg hover:from-yellow-700 hover:to-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
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
                  <span>Pagar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PagarEmpleadoModal;