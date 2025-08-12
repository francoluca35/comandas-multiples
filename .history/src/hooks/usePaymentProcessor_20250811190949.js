import { useState } from "react";

export const usePaymentProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const processPayment = async (orderData, paymentMethod) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Crear preferencia de pago
      const response = await fetch("/api/pagos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderData,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar el pago");
      }

      // Redirigir a Mercado Pago para completar el pago
      if (data.sandboxInitPoint) {
        window.location.href = data.sandboxInitPoint;
      } else if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        throw new Error("No se pudo obtener el enlace de pago");
      }

      return data;
    } catch (err) {
      console.error("Error al procesar pago:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = async (paymentId) => {
    try {
      const response = await fetch(`/api/pagos?payment_id=${paymentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al verificar el pago");
      }

      return data.payment;
    } catch (err) {
      console.error("Error al verificar estado del pago:", err);
      throw err;
    }
  };

  return {
    processPayment,
    checkPaymentStatus,
    isProcessing,
    error,
  };
};
