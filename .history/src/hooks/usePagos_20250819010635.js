import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export const usePagos = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todos los restaurantes con información de pagos
  const loadRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener todos los restaurantes
      const restaurantsRef = collection(db, "restaurantes");
      const restaurantsSnapshot = await getDocs(restaurantsRef);

      const restaurantsData = [];

      for (const doc of restaurantsSnapshot.docs) {
        const restaurantData = doc.data();

        // Debug: mostrar los datos del restaurante
        // console.log("Restaurante cargado:", {
        //   id: doc.id,
        //   nombre: restaurantData.nombre,
        //   tipoServicio: restaurantData.tipoServicio,
        //   precio: restaurantData.precio,
        //   periodicidad: restaurantData.periodicidad,
        // });

        // Calcular información de pagos
        const paymentInfo = calculatePaymentInfo(restaurantData);

        restaurantsData.push({
          id: doc.id,
          ...restaurantData,
          ...paymentInfo,
        });
      }

      setRestaurants(restaurantsData);
    } catch (err) {
      console.error("Error loading restaurants:", err);
      setError("Error al cargar los restaurantes");
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular información de pagos para un restaurante
  const calculatePaymentInfo = (restaurantData) => {
    const {
      fechaActivacion,
      tipoServicio,
      periodicidad,
      precio,
      proximoPago,
      cuotasPagadas = 0,
      cuotasTotales = 12, // Por defecto 12 cuotas (1 año)
    } = restaurantData;

    // Calcular días restantes hasta el próximo pago
    const today = new Date();
    const nextPayment = proximoPago ? new Date(proximoPago) : new Date();
    const diffTime = nextPayment - today;
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Determinar estado del pago
    let estadoPago = "alDia";
    if (diasRestantes < 0) {
      estadoPago = "vencido";
    } else if (diasRestantes <= 7) {
      estadoPago = "proximo";
    }

    return {
      diasRestantes,
      estadoPago,
      cuotasPagadas,
      cuotasTotales,
    };
  };

  // Enviar recordatorio de pago
  const sendPaymentReminder = useCallback(
    async (restaurantId) => {
      try {
        // Aquí se implementaría la lógica para enviar email/SMS
        console.log(`Enviando recordatorio a restaurante ${restaurantId}`);

        // Por ahora, solo actualizamos el último recordatorio enviado
        const restaurantRef = doc(db, "restaurantes", restaurantId);
        await updateDoc(restaurantRef, {
          ultimoRecordatorio: new Date(),
        });

        // Recargar datos
        await loadRestaurants();

        return { success: true, message: "Recordatorio enviado exitosamente" };
      } catch (err) {
        console.error("Error sending reminder:", err);
        return { success: false, message: "Error al enviar recordatorio" };
      }
    },
    [loadRestaurants]
  );

  // Marcar pago como realizado
  const markPaymentAsPaid = useCallback(
    async (restaurantId) => {
      try {
        const restaurant = restaurants.find((r) => r.id === restaurantId);
        if (!restaurant) {
          throw new Error("Restaurante no encontrado");
        }

        const restaurantRef = doc(db, "restaurantes", restaurantId);

        // Calcular próximo pago
        const nextPayment = new Date();
        if (restaurant.periodicidad === "mensual") {
          nextPayment.setMonth(nextPayment.getMonth() + 1);
        } else {
          nextPayment.setFullYear(nextPayment.getFullYear() + 1);
        }

        // Actualizar información de pago
        await updateDoc(restaurantRef, {
          ultimoPago: new Date(),
          proximoPago: nextPayment,
          cuotasPagadas: (restaurant.cuotasPagadas || 0) + 1,
          estadoPago: "alDia",
        });

        // Recargar datos
        await loadRestaurants();

        return { success: true, message: "Pago marcado como realizado" };
      } catch (err) {
        console.error("Error marking payment:", err);
        return { success: false, message: "Error al marcar el pago" };
      }
    },
    [restaurants, loadRestaurants]
  );

  // Obtener estadísticas de pagos
  const getPaymentStats = useCallback(() => {
    const total = restaurants.length;
    const alDia = restaurants.filter((r) => r.estadoPago === "alDia").length;
    const vencidos = restaurants.filter(
      (r) => r.estadoPago === "vencido"
    ).length;
    const proximos = restaurants.filter(
      (r) => r.estadoPago === "proximo"
    ).length;
    const ingresosMensuales = restaurants.reduce(
      (sum, r) => sum + (r.precio || 0),
      0
    );

    return { total, alDia, vencidos, proximos, ingresosMensuales };
  }, [restaurants]);

  // Filtrar restaurantes
  const filterRestaurants = useCallback(
    (searchTerm = "", filterStatus = "all") => {
      let filtered = restaurants;

      // Filtrar por búsqueda
      if (searchTerm) {
        filtered = filtered.filter((restaurant) =>
          restaurant.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filtrar por estado
      switch (filterStatus) {
        case "alDia":
          return filtered.filter((r) => r.estadoPago === "alDia");
        case "vencido":
          return filtered.filter((r) => r.estadoPago === "vencido");
        case "proximo":
          return filtered.filter((r) => r.estadoPago === "proximo");
        default:
          return filtered;
      }
    },
    [restaurants]
  );

  // Cargar datos al montar el hook
  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  return {
    restaurants,
    loading,
    error,
    loadRestaurants,
    sendPaymentReminder,
    markPaymentAsPaid,
    getPaymentStats,
    filterRestaurants,
  };
};
