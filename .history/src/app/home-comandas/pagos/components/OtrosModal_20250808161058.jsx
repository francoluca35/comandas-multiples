"use client";
import React, { useState } from "react";
import { useIngresos } from "../../../../hooks/useIngresos";

function OtrosModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    motivo: "",
    monto: "",
    descripcion: "",
    tipo: "efectivo",
  });
  const [loading, setLoading] = useState(false);
  const { fetchIngresos } = useIngresos();

  const tiposIngreso = [
    { id: "efectivo", name: "Efectivo", icon: "💵" },
    { id: "mercadopago", name: "Mercado Pago", icon: "📱" },
    { id: "tarjeta", name: "Tarjeta", icon: "💳" },
    { id: "transferencia", name: "Transferencia", icon: "🏦" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.motivo || !formData.monto) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    setLoading(true);
    try {
      // Aquí deberías conectar con tu API para crear el ingreso
      const ingresoData = {
        ...formData,
        monto: parseFloat(formData.monto),
        fecha: new Date(),
        categoria: "otros",
      };

      console.log("Creando ingreso extra:", ingresoData);

      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Limpiar formulario
      setFormData({
        motivo: "",
        monto: "",
        descripcion: "",
        tipo: "efectivo",
      });

      // Cerrar modal y notificar éxito
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al crear ingreso:", error);
      alert("Error al crear el ingreso. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4"
      style={{ zIndex: 99999 }}
    >
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Ingreso Extra</h2>
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
              Motivo *
            </label>
            <input
              type="text"
              name="motivo"
              value={formData.motivo}
              onChange={handleInputChange}
              placeholder="Ej: Venta de equipamiento, Comisión, etc."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Monto *
            </label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Descripción adicional (opcional)"
              rows="3"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Tipo de Pago */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 gap-2">
              {tiposIngreso.map((tipo) => (
                <button
                  key={tipo.id}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, tipo: tipo.id }))
                  }
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-all duration-300 ${
                    formData.tipo === tipo.id
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  <span>{tipo.icon}</span>
                  <span className="text-sm font-medium">{tipo.name}</span>
                </button>
              ))}
            </div>
          </div>

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
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creando...</span>
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>Crear Ingreso</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OtrosModal;
