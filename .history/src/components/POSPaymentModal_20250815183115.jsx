"use client";
import React, { useState, useEffect } from "react";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";

function POSPaymentModal({ isOpen, onClose, orderData, onPaymentComplete }) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [externalReference, setExternalReference] = useState(null);
  const [paymentInstructions, setPaymentInstructions] = useState("");

  // Hook para monitorear estado del pago
  const { paymentStatus, isApproved, isPending, isRejected } =
    usePaymentStatus(externalReference);

  // Generar external reference cuando se abre el modal
  useEffect(() => {
    if (isOpen && orderData) {
      const restaurantId = localStorage.getItem("restauranteId");
      const ref = `${restaurantId}_${Date.now()}`;
      setExternalReference(ref);
      setIsWaiting(true);

      // Generar instrucciones de pago
      setPaymentInstructions(
        `Mesa ${orderData.mesa} - $${orderData.monto?.toLocaleString()}`
      );
    }
  }, [isOpen, orderData]);

  // Efecto para manejar cuando el pago se aprueba
  useEffect(() => {
    if (isApproved && externalReference) {
      setIsWaiting(false);
      if (onPaymentComplete) {
        onPaymentComplete("tarjeta");
      }
      onClose();
    }
  }, [isApproved, externalReference, onPaymentComplete, onClose]);

  // Efecto para manejar cuando el pago se rechaza
  useEffect(() => {
    if (isRejected && externalReference) {
      setIsWaiting(false);
      alert("El pago fue rechazado. Por favor, inténtalo nuevamente.");
    }
  }, [isRejected, externalReference]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
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
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Pago con Tarjeta
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="space-y-4">
          {/* Información del pedido */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Mesa:</span>
              <span className="font-semibold">{orderData?.mesa}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-semibold">
                {orderData?.cliente || "Sin nombre"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-lg text-blue-600">
                ${orderData?.monto?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Instrucciones para el POS */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-white"
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
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">
                  Instrucciones para el POS:
                </h3>
                <div className="text-blue-700 text-sm space-y-2">
                  <p>
                    1. Ingresa el monto en el POS:{" "}
                    <strong>${orderData?.monto?.toLocaleString()}</strong>
                  </p>
                  <p>2. Procesa el pago con la tarjeta del cliente</p>
                  <p>3. Confirma que el pago fue exitoso</p>
                  <p>4. La mesa se liberará automáticamente</p>
                </div>
              </div>
            </div>
          </div>

          {/* Estado del pago */}
          {isWaiting && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    Esperando confirmación del pago...
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    El sistema está monitoreando el estado del pago
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Estado específico del pago */}
          {paymentStatus && (
            <div
              className={`rounded-lg p-4 ${
                isApproved
                  ? "bg-green-50 border border-green-200"
                  : isRejected
                  ? "bg-red-50 border border-red-200"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                {isApproved ? (
                  <svg
                    className="w-6 h-6 text-green-600"
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
                ) : isRejected ? (
                  <svg
                    className="w-6 h-6 text-red-600"
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
                ) : (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                )}
                <div>
                  <h3
                    className={`font-semibold ${
                      isApproved
                        ? "text-green-800"
                        : isRejected
                        ? "text-red-800"
                        : "text-blue-800"
                    }`}
                  >
                    {isApproved
                      ? "¡Pago Aprobado!"
                      : isRejected
                      ? "Pago Rechazado"
                      : "Monitoreando pago..."}
                  </h3>
                  <p
                    className={`text-sm ${
                      isApproved
                        ? "text-green-700"
                        : isRejected
                        ? "text-red-700"
                        : "text-blue-700"
                    }`}
                  >
                    {isApproved
                      ? "La mesa se liberará automáticamente"
                      : isRejected
                      ? "Por favor, inténtalo nuevamente"
                      : "Esperando confirmación del POS..."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            {isApproved && (
              <button
                onClick={() => {
                  if (onPaymentComplete) {
                    onPaymentComplete("tarjeta");
                  }
                  onClose();
                }}
                className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 transition-colors"
              >
                Confirmar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default POSPaymentModal;
