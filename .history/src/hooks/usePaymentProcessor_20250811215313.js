import { useState } from "react";
import { useAuth } from "../app/context/AuthContext";
import { useRestaurant } from "../app/context/RestaurantContext";
import { useMercadoPagoConfig } from "./useMercadoPagoConfig";

export const usePaymentProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { restauranteActual: restaurant } = useRestaurant();
  const { isMercadoPagoReady, isSandbox } = useMercadoPagoConfig();

  const processPayment = async (orderData, paymentMethod) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Validar que el restaurante esté disponible
      if (!restaurant?.id) {
        throw new Error("No se pudo identificar el restaurante");
      }

      // Para pagos con tarjeta, validar configuración de Mercado Pago
      if (paymentMethod === "tarjeta") {
        if (!isMercadoPagoReady()) {
          throw new Error(
            "Mercado Pago no está configurado. Por favor, configura las credenciales en la sección de configuración."
          );
        }

        // Mostrar advertencia si es sandbox
        if (isSandbox()) {
          console.warn("⚠️ Usando modo sandbox de Mercado Pago");
        }
      }

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
        restaurantId: restaurant.id,
        restaurantName: restaurant.nombre || "Restaurante",
      };

      const response = await fetch("/api/pagos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar el pago");
      }

      const data = await response.json();

      console.log("Payment method received:", paymentMethod);
      console.log("Payment data received:", data);

      if (paymentMethod === "tarjeta") {
        // Redirigir a Mercado Pago
        const redirectUrl = isSandbox()
          ? data.sandboxInitPoint
          : data.initPoint;
        window.location.href = redirectUrl;
      } else if (paymentMethod === "qr") {
        // Para QR, retornar los datos sin redirección
        console.log("Returning QR data:", {
          success: true,
          method: "qr",
          data,
        });
        console.log("QR data structure:", {
          hasInitPoint: !!data.initPoint,
          hasSandboxInitPoint: !!data.sandboxInitPoint,
          initPoint: data.initPoint,
          sandboxInitPoint: data.sandboxInitPoint,
        });
        
        // Para evitar el error "No podés pagarte a vos mismo", usar sandbox en desarrollo
        const qrData = {
          ...data,
          initPoint: data.sandboxInitPoint || data.initPoint, // Usar sandbox si está disponible
        };
        
        console.log("Using QR data:", qrData);
        return { success: true, method: "qr", data: qrData };
      } else {
        // Para pagos en efectivo, no necesitamos redirección
        console.log("Returning efectivo data:", {
          success: true,
          method: "efectivo",
        });
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
      if (!restaurant?.id) {
        throw new Error("No se pudo identificar el restaurante");
      }

      const response = await fetch(
        `/api/pagos?payment_id=${paymentId}&restaurant_id=${restaurant.id}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al verificar el estado del pago"
        );
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
      if (!restaurantId) {
        throw new Error("ID de restaurante requerido");
      }

      const response = await fetch(
        `/api/pagos/history?restaurant_id=${restaurantId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al obtener el historial de pagos"
        );
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
    isMercadoPagoReady,
    isSandbox,
  };
};
