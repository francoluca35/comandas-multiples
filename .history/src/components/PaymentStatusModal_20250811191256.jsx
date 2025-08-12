"use client";
import React, { useEffect, useState } from "react";
import { usePaymentProcessor } from "@/hooks/usePaymentProcessor";

function PaymentStatusModal({
  isOpen,
  onClose,
  paymentId,
  orderData,
  onPaymentComplete,
}) {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { checkPaymentStatus } = usePaymentProcessor();

  useEffect(() => {
    if (isOpen && paymentId) {
      checkPaymentStatus(paymentId)
        .then((payment) => {
          setPaymentStatus(payment);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error al verificar pago:", error);
          setIsLoading(false);
        });
    }
  }, [isOpen, paymentId, checkPaymentStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "rejected":
      case "cancelled":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Aprobado";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazado";
      case "cancelled":
        return "Cancelado";
      default:
        return "Desconocido";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return (
          <svg
            className="w-16 h-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "pending":
        return (
          <svg
            className="w-16 h-16 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "rejected":
      case "cancelled":
        return (
          <svg
            className="w-16 h-16 text-red-500"
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
        );
      default:
        return (
          <svg
            className="w-16 h-16 text-gray-500"
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
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-96 max-w-md">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando estado del pago...</p>
          </div>
        ) : paymentStatus ? (
          <div className="text-center">
            {/* Icono de estado */}
            {getStatusIcon(paymentStatus.status)}

            {/* Título */}
            <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-2">
              Pago {getStatusText(paymentStatus.status)}
            </h2>

            {/* Estado */}
            <p
              className={`text-lg font-semibold ${getStatusColor(
                paymentStatus.status
              )} mb-4`}
            >
              {getStatusText(paymentStatus.status)}
            </p>

            {/* Detalles del pago */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Mesa:</span>
                  <p className="font-semibold">{orderData?.mesa}</p>
                </div>
                <div>
                  <span className="text-gray-600">Cliente:</span>
                  <p className="font-semibold">
                    {orderData?.cliente || "Sin nombre"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Total:</span>
                  <p className="font-semibold">
                    ${orderData?.monto?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">ID Pago:</span>
                  <p className="font-semibold text-xs">{paymentStatus.id}</p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              {paymentStatus.status === "approved" ? (
                <button
                  onClick={() => {
                    onPaymentComplete("tarjeta");
                    onClose();
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-semibold transition-colors"
                >
                  Confirmar Pago
                </button>
              ) : paymentStatus.status === "pending" ? (
                <button
                  onClick={() => {
                    // Recargar para verificar estado actualizado
                    window.location.reload();
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold transition-colors"
                >
                  Verificar Nuevamente
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-2 font-semibold transition-colors"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">
              No se pudo verificar el estado del pago
            </p>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-2 font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentStatusModal;
