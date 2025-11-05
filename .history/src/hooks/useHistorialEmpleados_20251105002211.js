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
  const isProcessing = useRef(false);

  const getRestaurantId = () => {
    const id = localStorage.getItem("restauranteId");
    if (!id) throw new Error("No hay restaurante seleccionado");
    return id;
  };

  const getUserId = () => {
    const id = localStorage.getItem("usuarioId");
    if (!id) throw new Error("No hay usuario seleccionado");
    return id;
  };

  const registrarInicioSesion = async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setLoading(true);

    try {
      const restauranteId = getRestaurantId();
      const usuarioId = getUserId();
      const historialRef = collection(
        db,
        "restaurantes",
        restauranteId,
        "historialEmpleados"
      );

      // Buscar si ya existe una sesión abierta
      const q = query(
        historialRef,
        where("usuarioId", "==", usuarioId),
        where("horaCierre", "==", null),
        orderBy("horaApertura", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Ya hay sesión abierta
        const docExistente = snapshot.docs[0];
        localStorage.setItem("sesionDocId", docExistente.id);
        console.log("⚠️ Sesión ya abierta, no se crea otra");
        return;
      }

      // Crear nueva sesión
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
      console.log("✅ Inicio de sesión registrado:", newDoc.id);
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      setError(err.message);
    } finally {
      isProcessing.current = false;
      setLoading(false);
    }
  };

  const registrarCierreSesion = async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setLoading(true);

    try {
      const restauranteId = getRestaurantId();
      const usuarioId = getUserId();
      const historialRef = collection(
        db,
        "restaurantes",
        restauranteId,
        "historialEmpleados"
      );

      let sesionDocId = localStorage.getItem("sesionDocId");

      // Buscar documento abierto si no hay ID guardado
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

      console.log("✅ Cierre de sesión actualizado:", sesionDocId);
      localStorage.removeItem("sesionDocId");
    } catch (err) {
      console.error("❌ Error al cerrar sesión:", err);
      setError(err.message);
    } finally {
      isProcessing.current = false;
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    registrarInicioSesion,
    registrarCierreSesion,
  };
};
