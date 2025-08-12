import { useState, useEffect } from "react";
import { useRestaurant } from "../app/context/RestaurantContext";

export const useMercadoPagoConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { restauranteActual: restaurant } = useRestaurant();

  // Cargar configuración de Mercado Pago
  const loadConfig = async () => {
    if (!restaurant?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/restaurants/${restaurant.id}/mercadopago-config`
      );

      if (!response.ok) {
        throw new Error("Error al cargar configuración");
      }

      const data = await response.json();
      setConfig(data);
    } catch (err) {
      console.error("Error cargando configuración de Mercado Pago:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Validar credenciales
  const validateCredentials = async (accessToken, publicKey) => {
    if (!restaurant?.id) {
      throw new Error("Restaurante no identificado");
    }

    try {
      const response = await fetch("/api/pagos/validate-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken,
          publicKey,
          restaurantId: restaurant.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al validar credenciales");
      }

      return await response.json();
    } catch (err) {
      console.error("Error validando credenciales:", err);
      throw err;
    }
  };

  // Verificar si Mercado Pago está configurado y activo
  const isMercadoPagoReady = () => {
    return config?.isConfigured && config?.isActive;
  };

  // Obtener información del tipo de cuenta
  const getAccountType = () => {
    return config?.accountType || "production";
  };

  // Verificar si es cuenta de sandbox
  const isSandbox = () => {
    return config?.accountType === "sandbox";
  };

  // Cargar configuración cuando cambie el restaurante
  useEffect(() => {
    loadConfig();
  }, [restaurant?.id]);

  return {
    config,
    loading,
    error,
    loadConfig,
    validateCredentials,
    isMercadoPagoReady,
    getAccountType,
    isSandbox,
    clearError: () => setError(null),
  };
};
