"use client";
import { useState, useRef } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

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

        // Verificar si hay docId en localStorage
        let sesionDocId = localStorage.getItem("sesionDocId");
        if (sesionDocId) {
          const docRef = doc(historialRef, sesionDocId);
          const snap = await getDoc(docRef);
          if (snap.exists() && !snap.data().horaCierre) {
            console.log("Ya hay sesión abierta en este docId");
            return;
          } else {
            // Si no existe o ya cerrada, borrar docId
            localStorage.removeItem("sesionDocId");
          }
        }

        // Buscar sesión abierta en Firestore por usuario
        const q = query(
          historialRef,
          orderBy("horaApertura", "desc"),
          limit(1)
        );
        const snapshot = await getDoc(doc(historialRef, usuarioId));

        // Crear nuevo documento si no hay sesión abierta
        const ahora = new Date();
        const newDoc = await addDoc(historialRef, {
          usuarioId,
          usuarioEmail: localStorage.getItem("email") || "",
          usuarioNombre: localStorage.getItem("nombreUsuario") || "Usuario",
          rol: localStorage.getItem("rol") || "Empleado",
          fecha: ahora.toISOString(),
          horaApertura: ahora,
          horaCierre: null,
          timestamp: ahora,
        });

        localStorage.setItem("sesionDocId", newDoc.id);
        console.log("✅ Inicio de sesión registrado correctamente");
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
        const usuarioId = getUserId();
        const historialRef = collection(
          db,
          "restaurantes",
          restauranteId,
          "historialEmpleados"
        );

        let sesionDocId = localStorage.getItem("sesionDocId");
        if (!sesionDocId) {
          console.log(
            "No hay docId en localStorage, no se puede cerrar sesión"
          );
          return;
        }

        const docRef = doc(historialRef, sesionDocId);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          console.log("Documento no existe, limpiando docId");
          localStorage.removeItem("sesionDocId");
          return;
        }

        await updateDoc(docRef, { horaCierre: new Date() });
        console.log("✅ Cierre de sesión registrado correctamente");
        localStorage.removeItem("sesionDocId");
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
