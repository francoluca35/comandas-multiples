import { useState, useEffect } from "react";
import { useRestaurant } from "../app/context/RestaurantContext";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";

export const usePaymentStatus = (externalReference = null) => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { restauranteActual: restaurant } = useRestaurant();

  // Función para liberar mesa localmente
  const liberarMesaLocal = async (paymentData) => {
    try {
      if (!paymentData.orderData || !restaurant?.id) {
        console.warn("⚠️ No hay información suficiente para liberar la mesa");
        return;
      }

      const orderData = paymentData.orderData;
      let mesaId = null;

      // Buscar la mesa por ID o número
      if (orderData.mesaId) {
        mesaId = orderData.mesaId;
      } else if (orderData.mesa) {
        // Buscar por número de mesa
        const tablesRef = collection(db, "restaurantes", restaurant.id, "tables");
        const tablesSnapshot = await getDocs(tablesRef);
        
        tablesSnapshot.forEach((doc) => {
          const mesaData = doc.data();
          if (mesaData.numero == orderData.mesa) {
            mesaId = doc.id;
          }
        });
      }

      if (mesaId) {
        console.log("🎯 Liberando mesa localmente:", mesaId);
        
        const mesaRef = doc(db, "restaurantes", restaurant.id, "tables", mesaId);
        await updateDoc(mesaRef, {
          estado: "libre",
          cliente: "",
          productos: {},
          total: 0,
          fechaPago: new Date(),
          externalReference: paymentData.externalReference,
          updatedAt: new Date(),
        });

        console.log(`✅ Mesa ${mesaId} liberada localmente`);
      } else {
        console.warn("⚠️ No se pudo identificar la mesa para liberar");
      }
    } catch (error) {
      console.error("❌ Error liberando mesa localmente:", error);
      throw error;
    }
  };

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
      async (snapshot) => {
        try {
          if (!snapshot.empty) {
            const latestPayment = snapshot.docs[0].data();
            setPaymentStatus(latestPayment);

            // Si el pago fue aprobado, mostrar notificación y liberar mesa
            if (latestPayment.status === "approved") {
              console.log("✅ Pago aprobado automáticamente:", latestPayment);
              
              // Intentar liberar la mesa localmente también
              try {
                await liberarMesaLocal(latestPayment);
              } catch (error) {
                console.warn("⚠️ No se pudo liberar la mesa localmente:", error);
              }
              
              // Aquí podrías mostrar una notificación al usuario
              if (typeof window !== "undefined") {
                // Mostrar notificación del navegador
                if (
                  "Notification" in window &&
                  Notification.permission === "granted"
                ) {
                  new Notification("Pago Aprobado", {
                    body: `El pago de $${latestPayment.amount} ha sido aprobado. La mesa ha sido liberada automáticamente.`,
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
        } catch (snapshotError) {
          console.error("Error procesando snapshot:", snapshotError);
          setError("Error procesando datos del pago");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error listening to payment status:", err);
        
        // Manejar específicamente el error de índice faltante
        if (err.message && err.message.includes("requires an index")) {
          console.warn("⚠️ Índice de Firestore faltante. Creando consulta alternativa...");
          // Intentar una consulta más simple sin ordenamiento
          const simpleQuery = query(
            paymentsRef,
            where("restaurantId", "==", restaurant.id),
            limit(1)
          );
          
          const simpleUnsubscribe = onSnapshot(
            simpleQuery,
            (simpleSnapshot) => {
              if (!simpleSnapshot.empty) {
                const latestPayment = simpleSnapshot.docs[0].data();
                setPaymentStatus(latestPayment);
              } else {
                setPaymentStatus(null);
              }
              setLoading(false);
            },
            (simpleErr) => {
              console.error("Error en consulta simple:", simpleErr);
              setError("Error conectando con la base de datos");
              setLoading(false);
            }
          );
          
          return () => simpleUnsubscribe();
        }
        
        setError("Error conectando con la base de datos");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [restaurant?.id, externalReference]);

  // Función para verificar manualmente el estado de un pago
  const checkPaymentStatus = async (paymentId) => {
    try {
      const response = await fetch(
        `/api/pagos?payment_id=${paymentId}&restaurant_id=${restaurant.id}`
      );

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
