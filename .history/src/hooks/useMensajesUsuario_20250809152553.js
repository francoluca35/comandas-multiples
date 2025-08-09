"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export const useMensajesUsuario = (usuarioId) => {
  const [mensajes, setMensajes] = useState([]);
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener el restauranteId del localStorage
  const getRestaurantId = () => {
    const restauranteId = localStorage.getItem("restauranteId");
    if (!restauranteId) {
      throw new Error("No hay restaurante seleccionado");
    }
    return restauranteId;
  };

  // Obtener mensajes del usuario
  const obtenerMensajes = useCallback(async () => {
    if (!usuarioId) return;

    try {
      const restauranteId = getRestaurantId();
      const mensajesRef = collection(
        db,
        `restaurantes/${restauranteId}/usuarios/${usuarioId}/mensajes`
      );

      const q = query(
        mensajesRef,
        orderBy("timestamp", "desc")
      );

      const snapshot = await getDocs(q);
      const mensajesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMensajes(mensajesData);
      
      // Filtrar mensajes no leídos
      const noLeidos = mensajesData.filter((msg) => !msg.leido);
      setMensajesNoLeidos(noLeidos);

      return mensajesData;
    } catch (error) {
      console.error("❌ Error obteniendo mensajes:", error);
      setError(error.message);
      return [];
    }
  }, [usuarioId]);

  // Marcar mensaje como leído
  const marcarComoLeido = useCallback(async (mensajeId) => {
    if (!usuarioId) return;

    try {
      const restauranteId = getRestaurantId();
      const mensajeRef = doc(
        db,
        `restaurantes/${restauranteId}/usuarios/${usuarioId}/mensajes`,
        mensajeId
      );

      await updateDoc(mensajeRef, {
        leido: true,
        fechaLectura: serverTimestamp(),
      });

      // Actualizar estado local
      setMensajes((prev) =>
        prev.map((msg) =>
          msg.id === mensajeId ? { ...msg, leido: true } : msg
        )
      );

      setMensajesNoLeidos((prev) =>
        prev.filter((msg) => msg.id !== mensajeId)
      );

      console.log("✅ Mensaje marcado como leído");
    } catch (error) {
      console.error("❌ Error marcando mensaje como leído:", error);
      throw error;
    }
  }, [usuarioId]);

  // Marcar todos los mensajes como leídos
  const marcarTodosComoLeidos = useCallback(async () => {
    if (!usuarioId || mensajesNoLeidos.length === 0) return;

    try {
      const restauranteId = getRestaurantId();
      const batch = [];

      mensajesNoLeidos.forEach((mensaje) => {
        const mensajeRef = doc(
          db,
          `restaurantes/${restauranteId}/usuarios/${usuarioId}/mensajes`,
          mensaje.id
        );
        batch.push(
          updateDoc(mensajeRef, {
            leido: true,
            fechaLectura: serverTimestamp(),
          })
        );
      });

      await Promise.all(batch);

      // Actualizar estado local
      setMensajes((prev) =>
        prev.map((msg) => ({ ...msg, leido: true }))
      );
      setMensajesNoLeidos([]);

      console.log("✅ Todos los mensajes marcados como leídos");
    } catch (error) {
      console.error("❌ Error marcando todos los mensajes como leídos:", error);
      throw error;
    }
  }, [usuarioId, mensajesNoLeidos]);

  // Eliminar mensaje
  const eliminarMensaje = useCallback(async (mensajeId) => {
    if (!usuarioId) return;

    try {
      const restauranteId = getRestaurantId();
      const mensajeRef = doc(
        db,
        `restaurantes/${restauranteId}/usuarios/${usuarioId}/mensajes`,
        mensajeId
      );

      await updateDoc(mensajeRef, {
        eliminado: true,
        fechaEliminacion: serverTimestamp(),
      });

      // Actualizar estado local
      setMensajes((prev) =>
        prev.filter((msg) => msg.id !== mensajeId)
      );
      setMensajesNoLeidos((prev) =>
        prev.filter((msg) => msg.id !== mensajeId)
      );

      console.log("✅ Mensaje eliminado");
    } catch (error) {
      console.error("❌ Error eliminando mensaje:", error);
      throw error;
    }
  }, [usuarioId]);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    if (!usuarioId) {
      setLoading(false);
      return;
    }

    const restauranteId = getRestaurantId();
    const mensajesRef = collection(
      db,
      `restaurantes/${restauranteId}/usuarios/${usuarioId}/mensajes`
    );

    const q = query(
      mensajesRef,
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const mensajesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filtrar mensajes no eliminados
        const mensajesActivos = mensajesData.filter((msg) => !msg.eliminado);
        setMensajes(mensajesActivos);

        // Filtrar mensajes no leídos
        const noLeidos = mensajesActivos.filter((msg) => !msg.leido);
        setMensajesNoLeidos(noLeidos);

        setLoading(false);
      },
      (error) => {
        console.error("❌ Error en suscripción a mensajes:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [usuarioId]);

  // Cargar mensajes iniciales
  useEffect(() => {
    if (usuarioId) {
      obtenerMensajes();
    }
  }, [usuarioId, obtenerMensajes]);

  return {
    mensajes,
    mensajesNoLeidos,
    loading,
    error,
    obtenerMensajes,
    marcarComoLeido,
    marcarTodosComoLeidos,
    eliminarMensaje,
    cantidadNoLeidos: mensajesNoLeidos.length,
  };
};
