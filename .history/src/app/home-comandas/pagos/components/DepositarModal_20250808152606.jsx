"use client";
import React, { useState } from "react";
import { useIngresos } from "../../../../hooks/useIngresos";

function DepositarModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    motivo: "",
    monto: "",
    cuenta: "banco",
  });
  const [loading, setLoading] = useState(false);
  const { fetchIngresos } = useIngresos();

  const cuentas = [
    { id: "banco", name: "Banco", icon: "🏦" },
    { id: "mercadopago", name: "Mercado Pago", icon: "📱" },
    { id: "otro", name: "Otro", icon: "💳" },
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
      // Aquí deberías conectar con tu API para registrar el depósito
      const depositoData = {
        ...formData,
        monto: parseFloat(formData.monto),
        fecha: new Date(),
        tipo: "deposito",
      };

      console.log("Registrando depósito:", depositoData);

      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Limpiar formulario
      setFormData({
        motivo: "",
        monto: "",
        cuenta: "banco",
      });

      // Cerrar modal y notificar éxito
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al registrar depósito:", error);
      alert("Error al registrar el depósito. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
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
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Depositar</h2>
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
              placeholder="Ej: Depósito bancario, Transferencia, etc."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Monto a Depositar *
            </label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Cuenta */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Cuenta Destino
            </label>
            <div className="grid grid-cols-3 gap-2">
              {cuentas.map((cuenta) => (
                <button
                  key={cuenta.id}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, cuenta: cuenta.id }))
                  }
                  className={`flex flex-col items-center space-y-1 p-3 rounded-lg border transition-all duration-300 ${
                    formData.cuenta === cuenta.id
                      ? "bg-purple-500 border-purple-500 text-white"
                      : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  <span className="text-lg">{cuenta.icon}</span>
                  <span className="text-xs font-medium">{cuenta.name}</span>
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
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Depositando...</span>
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
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Depositar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DepositarModal;
