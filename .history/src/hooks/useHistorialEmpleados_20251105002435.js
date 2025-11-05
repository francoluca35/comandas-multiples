"use client";
import { useState, useRef } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

export const useHistorialEmpleados = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bloqueando = useRef(false);

  const getRestaurantId = () => localStorage.getItem("restauranteId");
  const getUserId = () => localStorage.getItem("usuarioId");

  const registrarInicioSesion = async () => {
    if (bloqueando.current) return;
    bloqueando.current = true;
    setLoading(true);

    try {
      const restauranteId = getRestaurantId();
      const usuarioId = getUserId();
      if (!restauranteId || !usuarioId) throw new Error("Datos incompletos");

      const historialRef = collection(
        db,
        "restaurantes",
        restauranteId,
        "historialEmpleados"
      );

      // 🔍 Primero, buscar sesión abierta en localStorage
      const sesionLocal = localStorage.getItem("sesionDocId");
      if (sesionLocal) {
        console.log("⚠️ Sesión ya guardada localmente, no se crea otra.");
        setLoading(false);
        bloqueando.current = false;
        return;
      }

      // 🔍 Buscar sesión abierta en Firestore (sin horaCierre)
      const q = query(
        historialRef,
        where("usuarioId", "==", usuarioId),
        where("horaCierre", "==", null),
        orderBy("horaApertura", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docExistente = snapshot.docs[0];
        console.log("⚠️ Reusando sesión abierta:", docExistente.id);
        localStorage.setItem("sesionDocId", docExistente.id);
        setLoading(false);
        bloqueando.current = false;
        return;
      }

      // 🆕 Crear nueva sesión si no hay ninguna abierta
      const ahora = new Date();
      const newDoc = await addDoc(historialRef, {
        usuarioId,
        usuarioEmail: localStorage.getItem("email") || "",
        usuarioNombre: localStorage.getItem("nombreUsuario") || "Usuario",
        rol: localStorage.getItem("rol") || "Empleado",
        fecha: ahora.toISOString().split("T")[0],
        horaApertura: ahora.toISOString(),
        horaCierre: null,
        timestamp: ahora,
      });

      localStorage.setItem("sesionDocId", newDoc.id);
      console.log("✅ Nueva sesión creada:", newDoc.id);
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      bloqueando.current = false;
    }
  };

  const registrarCierreSesion = async () => {
    if (bloqueando.current) return;
    bloqueando.current = true;
    setLoading(true);

    try {
      const restauranteId = getRestaurantId();
      const usuarioId = getUserId();
      if (!restauranteId || !usuarioId) throw new Error("Datos incompletos");

      const historialRef = collection(
        db,
        "restaurantes",
        restauranteId,
        "historialEmpleados"
      );

      let sesionDocId = localStorage.getItem("sesionDocId");

      // Buscar sesión abierta si no hay ID guardado
      if (!sesionDocId) {
        const q = query(
          historialRef,
          where("usuarioId", "==", usuarioId),
          where("horaCierre", "==", null),
          orderBy("horaApertura", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          sesionDocId = snapshot.docs[0].id;
        }
      }

      if (!sesionDocId) {
        console.log("⚠️ No hay sesión abierta para cerrar");
        return;
      }

      const docRef = doc(historialRef, sesionDocId);
      await updateDoc(docRef, { horaCierre: new Date().toISOString() });

      console.log("✅ Sesión cerrada correctamente:", sesionDocId);
      localStorage.removeItem("sesionDocId");
    } catch (err) {
      console.error("❌ Error al cerrar sesión:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      bloqueando.current = false;
    }
  };

  return { loading, error, registrarInicioSesion, registrarCierreSesion };
};
