"use client";
import React, { useState, useEffect } from "react";
import { usePaymentStatus } from "../hooks/usePaymentStatus";
import { useRestaurant } from "../app/context/RestaurantContext";

const PaymentStatusModal = ({ 
  isOpen, 
  onClose, 
  externalReference, 
  onPaymentComplete 
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const { restauranteActual: restaurant } = useRestaurant();
  
  const { 
    paymentStatus, 
    loading, 
    error, 
    isApproved, 
    isPending, 
    isRejected,
    checkPaymentStatus 
  } = usePaymentStatus(externalReference);

  const handleManualVerification = async () => {
    if (!externalReference || !restaurant?.id) {
      alert("No hay información suficiente para verificar el pago");
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const response = await fetch("/api/pagos/verificar-pago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          externalReference,
          restaurantId: restaurant.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVerificationResult(data);
        
        if (data.status === "approved") {
          // Notificar que el pago se completó
          if (onPaymentComplete) {
            onPaymentComplete(data);
          }
          
          // Mostrar notificación
          alert("✅ Pago verificado y aprobado! La mesa ha sido liberada.");
        } else {
          alert(`Estado del pago: ${data.status}`);
        }
      } else {
        setVerificationResult({ error: data.error });
        alert("Error verificando pago: " + data.error);
      }
    } catch (error) {
      console.error("Error en verificación manual:", error);
      setVerificationResult({ error: error.message });
      alert("Error verificando pago: " + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "rejected":
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
      default:
        return "Desconocido";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Estado del Pago
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Verificando estado del pago...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Error: {error}</p>
          </div>
        )}

        {paymentStatus && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Estado:</span>
                <span className={`font-bold ${getStatusColor(paymentStatus.status)}`}>
                  {getStatusText(paymentStatus.status)}
                </span>
              </div>
              
              {paymentStatus.amount && (
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium text-gray-700">Monto:</span>
                  <span className="font-bold text-green-600">
                    ${paymentStatus.amount}
                  </span>
                </div>
              )}

              {paymentStatus.externalReference && (
                <div className="mt-2">
                  <span className="font-medium text-gray-700">Referencia:</span>
                  <p className="text-sm text-gray-600 break-all">
                    {paymentStatus.externalReference}
                  </p>
                </div>
              )}
            </div>

            {isApproved && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p className="font-medium">✅ Pago aprobado exitosamente!</p>
                <p className="text-sm mt-1">La mesa ha sido liberada automáticamente.</p>
              </div>
            )}

            {isPending && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <p className="font-medium">⏳ Pago pendiente</p>
                <p className="text-sm mt-1">El pago está siendo procesado. Puedes verificar manualmente.</p>
              </div>
            )}

            {isRejected && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="font-medium">❌ Pago rechazado</p>
                <p className="text-sm mt-1">El pago no pudo ser procesado.</p>
              </div>
            )}
          </div>
        )}

        {verificationResult && (
          <div className="mt-4 p-4 rounded-lg border">
            <h3 className="font-medium text-gray-800 mb-2">Resultado de verificación:</h3>
            {verificationResult.error ? (
              <p className="text-red-600">{verificationResult.error}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-green-600 font-medium">{verificationResult.message}</p>
                {verificationResult.paymentData && (
                  <div className="text-sm text-gray-600">
                    <p>ID: {verificationResult.paymentData.id}</p>
                    <p>Estado: {verificationResult.paymentData.status}</p>
                    <p>Monto: ${verificationResult.paymentData.amount}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleManualVerification}
            disabled={isVerifying || !externalReference}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? "Verificando..." : "Verificar Manualmente"}
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusModal;
