"use client";
import React, { useState } from "react";

function CashAccountSelectionModal({
  isOpen,
  onClose,
  onSelect,
  monto,
  tipoVenta = "Venta Mesa",
}) {
  const [selectedAccount, setSelectedAccount] = useState(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedAccount) {
      onSelect(selectedAccount);
      setSelectedAccount(null);
    }
  };

  const handleCancel = () => {
    setSelectedAccount(null);
    onClose();
  };

  const accounts = [
    {
      id: "caja",
      name: "Cuenta Efectivo",
      description: "Ingreso Efectivo",
      icon: "💵",
      color: "bg-green-600",
      hoverColor: "hover:bg-green-700",
    },
    {
      id: "cuenta_restaurante",
      name: "Cuenta Virtual",
      description: "Ingreso Virtual",
      icon: "💳",
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <svg
              className="w-6 h-6 text-white"
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
            <span className="text-white font-bold text-lg">
              ¿Dónde guardamos el dinero?
            </span>
          </div>
        </div>

        {/* Información del monto */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Monto a guardar:</span>
            <span className="text-white font-bold text-xl">
              ${monto?.toLocaleString() || "0"}
            </span>
          </div>
        </div>

        {/* Opciones de cuenta */}
        <div className="space-y-3 mb-6">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => setSelectedAccount(account.id)}
              className={`w-full rounded-lg p-4 flex items-center space-x-4 transition-all duration-200 border-2 ${
                selectedAccount === account.id
                  ? `${account.color} border-white shadow-lg transform scale-105`
                  : "bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500"
              }`}
            >
              <div className="text-3xl">{account.icon}</div>
              <div className="flex-1 text-left">
                <div
                  className={`font-semibold text-lg ${
                    selectedAccount === account.id
                      ? "text-white"
                      : "text-white"
                  }`}
                >
                  {account.name}
                </div>
                <div
                  className={`text-sm ${
                    selectedAccount === account.id
                      ? "text-white opacity-90"
                      : "text-gray-300"
                  }`}
                >
                  {account.description}
                </div>
              </div>
              {selectedAccount === account.id && (
                <svg
                  className="w-6 h-6 text-white"
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
              )}
            </button>
          ))}
        </div>

        {/* Mensaje informativo */}
        <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-3 mb-6">
          <div className="flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-yellow-200 text-sm">
              Selecciona dónde quieres guardar el dinero recibido. Si el cliente
              pagó sin avisar por dinero virtual, selecciona "Cuenta Virtual".
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedAccount}
            className={`flex-1 rounded-lg px-4 py-3 font-semibold transition-all ${
              selectedAccount
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CashAccountSelectionModal;

