import { useState, useEffect } from "react";
import { useRestaurant } from "../app/context/RestaurantContext";
import { db } from "../../lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";

export const usePaymentStatus = (externalReference = null) => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { restauranteActual: restaurant } = useRestaurant();

  useEffect(() => {
    if (!restaurant?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Crear query para escuchar pagos del restaurante
    const paymentsRef = collection(db, "payments");
    let q;

    if (externalReference) {
      // Si tenemos external_reference, escuchar solo ese pago
      q = query(
        paymentsRef,
        where("restaurantId", "==", restaurant.id),
        where("externalReference", "==", externalReference),
        orderBy("date", "desc"),
        limit(1)
      );
    } else {
      // Escuchar todos los pagos recientes del restaurante
      q = query(
        paymentsRef,
        where("restaurantId", "==", restaurant.id),
        orderBy("date", "desc"),
        limit(10)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const latestPayment = snapshot.docs[0].data();
          setPaymentStatus(latestPayment);
          
          // Si el pago fue aprobado, mostrar notificación
          if (latestPayment.status === "approved") {
            console.log("✅ Pago aprobado automáticamente:", latestPayment);
            // Aquí podrías mostrar una notificación al usuario
            if (typeof window !== "undefined") {
              // Mostrar notificación del navegador
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Pago Aprobado", {
                  body: `El pago de $${latestPayment.amount} ha sido aprobado. La mesa ha sido liberada.`,
                  icon: "/favicon.ico",
                });
              }
              
              // Mostrar alerta
              alert(`✅ Pago aprobado! Mesa liberada automáticamente.`);
            }
          }
        } else {
          setPaymentStatus(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to payment status:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [restaurant?.id, externalReference]);

  // Función para verificar manualmente el estado de un pago
  const checkPaymentStatus = async (paymentId) => {
    try {
      const response = await fetch(`/api/pagos?payment_id=${paymentId}&restaurant_id=${restaurant.id}`);
      
      if (!response.ok) {
        throw new Error("Error al verificar el estado del pago");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error checking payment status:", err);
      setError(err.message);
      return null;
    }
  };

  return {
    paymentStatus,
    loading,
    error,
    checkPaymentStatus,
    isApproved: paymentStatus?.status === "approved",
    isPending: paymentStatus?.status === "pending",
    isRejected: paymentStatus?.status === "rejected",
    isCancelled: paymentStatus?.status === "cancelled",
  };
};
