import { useState } from "react";
import { useAuth } from "../app/context/AuthContext";
import { useRestaurant } from "../app/context/RestaurantContext";

export const usePaymentProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { restaurant } = useRestaurant();

  const processPayment = async (orderData, paymentMethod) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Preparar datos del pedido con información del restaurante
      const paymentData = {
        orderData: {
          title: `Mesa ${orderData.mesa} - ${orderData.cliente || "Cliente"}`,
          unit_price: orderData.monto,
          quantity: 1,
          mesa: orderData.mesa,
          cliente: orderData.cliente,
          productos: orderData.productos,
        },
        restaurantId: restaurant?.id || user?.restaurantId,
        restaurantName: restaurant?.nombre || "Restaurante",
      };

      const response = await fetch("/api/pagos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error("Error al procesar el pago");
      }

      const data = await response.json();

      if (paymentMethod === "tarjeta") {
        // Redirigir a Mercado Pago
        window.location.href = data.sandboxInitPoint || data.initPoint;
      } else {
        // Para pagos en efectivo, no necesitamos redirección
        return { success: true, method: "efectivo" };
      }
    } catch (err) {
      setError(err.message);
      console.error("Error processing payment:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = async (paymentId) => {
    try {
      const restaurantId = restaurant?.id || user?.restaurantId;
      const response = await fetch(
        `/api/pagos?payment_id=${paymentId}&restaurant_id=${restaurantId}`
      );

      if (!response.ok) {
        throw new Error("Error al verificar el estado del pago");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Error checking payment status:", err);
      return null;
    }
  };

  const getPaymentHistory = async (restaurantId) => {
    try {
      const response = await fetch(
        `/api/pagos/history?restaurant_id=${restaurantId}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener el historial de pagos");
      }

      const data = await response.json();
      return data.payments;
    } catch (err) {
      setError(err.message);
      console.error("Error getting payment history:", err);
      return [];
    }
  };

  return {
    processPayment,
    checkPaymentStatus,
    getPaymentHistory,
    isProcessing,
    error,
    clearError: () => setError(null),
  };
};
