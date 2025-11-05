"use client";
import { useState, useRef } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

export const useHistorialEmpleados = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const processingRef = useRef(false);

  const preventMultipleCalls = async (callback) => {
    if (processingRef.current) return;
    try {
      processingRef.current = true;
      return await callback();
    } finally {
      processingRef.current = false;
    }
  };

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

  // Inicia sesión
  const registrarInicioSesion = async () => {
    return preventMultipleCalls(async () => {
      try {
        const restauranteId = getRestaurantId();
        const usuarioId = getUserId();
        const historialRef = collection(
          db,
          "restaurantes",
          restauranteId,
          "historialEmpleados"
        );

        // Ver si ya hay docId guardado en localStorage
        const existingDocId = localStorage.getItem("sesionDocId");
        if (existingDocId) {
          console.log("Ya hay sesión abierta con docId:", existingDocId);
          return;
        }

        const ahora = new Date();
        const docRef = await addDoc(historialRef, {
          usuarioId,
          usuarioEmail: localStorage.getItem("email") || "",
          usuarioNombre: localStorage.getItem("nombreUsuario") || "Usuario",
          rol:
            localStorage.getItem("rol") ||
            localStorage.getItem("role") ||
            "Empleado",
          fecha: ahora.toISOString(),
          horaApertura: ahora,
          horaCierre: null,
          timestamp: ahora,
        });

        // Guardar docId en localStorage
        localStorage.setItem("sesionDocId", docRef.id);
        console.log("✅ Inicio de sesión registrado correctamente", docRef.id);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    });
  };

  // Cierra sesión
  const registrarCierreSesion = async () => {
    return preventMultipleCalls(async () => {
      try {
        const restauranteId = getRestaurantId();
        const docId = localStorage.getItem("sesionDocId");

        if (!docId) {
          console.log("No hay sesión abierta registrada para cerrar");
          return;
        }

        const docRef = doc(
          db,
          "restaurantes",
          restauranteId,
          "historialEmpleados",
          docId
        );

        await updateDoc(docRef, { horaCierre: new Date() });

        // Limpiar docId de localStorage
        localStorage.removeItem("sesionDocId");
        console.log("✅ Cierre de sesión registrado correctamente", docId);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    });
  };

  return {
    loading,
    error,
    registrarInicioSesion,
    registrarCierreSesion,
  };
};
