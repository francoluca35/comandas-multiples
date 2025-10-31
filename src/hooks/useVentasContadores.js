"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export const useVentasContadores = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contadores, setContadores] = useState({
    salon: 0,
    takeaway: 0,
    delivery: 0,
  });

  // Obtener el restauranteId del localStorage
  const getRestaurantId = () => {
    const restauranteId = localStorage.getItem("restauranteId");
    if (!restauranteId) {
      throw new Error("No hay restaurante seleccionado");
    }
    return restauranteId;
  };

  // Obtener el mes actual en formato YYYY-MM
  const getMesActual = () => {
    const ahora = new Date();
    return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
  };

  // Cargar contadores del mes actual
  const cargarContadores = async () => {
    try {
      setLoading(true);
      setError(null);

      const restauranteId = getRestaurantId();
      const mesActual = getMesActual();
      const contadoresRef = doc(db, "restaurantes", restauranteId, "contadoresVentas", mesActual);

      const contadoresSnap = await getDoc(contadoresRef);

      if (contadoresSnap.exists()) {
        const data = contadoresSnap.data();
        setContadores({
          salon: data.salon || 0,
          takeaway: data.takeaway || 0,
          delivery: data.delivery || 0,
        });
      } else {
        // Inicializar contadores para el mes actual
        await setDoc(contadoresRef, {
          salon: 0,
          takeaway: 0,
          delivery: 0,
          mes: mesActual,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setContadores({ salon: 0, takeaway: 0, delivery: 0 });
      }
    } catch (err) {
      console.error("Error cargando contadores:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Incrementar contador de venta
  const incrementarContador = async (tipo) => {
    try {
      const restauranteId = getRestaurantId();
      const mesActual = getMesActual();
      const contadoresRef = doc(db, "restaurantes", restauranteId, "contadoresVentas", mesActual);

      // Verificar si existe el documento
      const contadoresSnap = await getDoc(contadoresRef);

      if (contadoresSnap.exists()) {
        // Incrementar el contador correspondiente
        const data = contadoresSnap.data();
        const nuevoValor = (data[tipo] || 0) + 1;

        await updateDoc(contadoresRef, {
          [tipo]: nuevoValor,
          updatedAt: serverTimestamp(),
        });

        // Actualizar estado local
        setContadores((prev) => ({
          ...prev,
          [tipo]: nuevoValor,
        }));
      } else {
        // Crear documento inicial
        await setDoc(contadoresRef, {
          salon: tipo === "salon" ? 1 : 0,
          takeaway: tipo === "takeaway" ? 1 : 0,
          delivery: tipo === "delivery" ? 1 : 0,
          mes: mesActual,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Actualizar estado local
        setContadores((prev) => ({
          ...prev,
          [tipo]: 1,
        }));
      }
    } catch (err) {
      console.error("Error incrementando contador:", err);
      throw err;
    }
  };

  // Resetear contadores del mes actual
  const resetearContadores = async () => {
    try {
      const restauranteId = getRestaurantId();
      const mesActual = getMesActual();
      const contadoresRef = doc(db, "restaurantes", restauranteId, "contadoresVentas", mesActual);

      await setDoc(contadoresRef, {
        salon: 0,
        takeaway: 0,
        delivery: 0,
        mes: mesActual,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setContadores({ salon: 0, takeaway: 0, delivery: 0 });
    } catch (err) {
      console.error("Error reseteando contadores:", err);
      throw err;
    }
  };

  // Obtener contadores de un mes específico
  const obtenerContadoresMes = async (mes) => {
    try {
      const restauranteId = getRestaurantId();
      const contadoresRef = doc(db, "restaurantes", restauranteId, "contadoresVentas", mes);

      const contadoresSnap = await getDoc(contadoresRef);

      if (contadoresSnap.exists()) {
        const data = contadoresSnap.data();
        return {
          salon: data.salon || 0,
          takeaway: data.takeaway || 0,
          delivery: data.delivery || 0,
        };
      }

      return { salon: 0, takeaway: 0, delivery: 0 };
    } catch (err) {
      console.error("Error obteniendo contadores del mes:", err);
      throw err;
    }
  };

  // Cargar contadores al montar
  useEffect(() => {
    cargarContadores();
  }, []);

  return {
    contadores,
    loading,
    error,
    cargarContadores,
    incrementarContador,
    resetearContadores,
    obtenerContadoresMes,
    getMesActual,
  };
};

