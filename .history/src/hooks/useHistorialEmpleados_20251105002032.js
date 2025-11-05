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

  // 👉 Inicia sesión
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

        // Buscar si ya hay una sesión abierta (sin horaCierre)
        const q = query(
          historialRef,
          where("usuarioId", "==", usuarioId),
          where("horaCierre", "==", null),
          orderBy("horaApertura", "desc"),
          limit(1)
        );

        const snapshot = await getDocs(q);

        // Si ya hay una sesión abierta, no crear otra
        if (!snapshot.empty) {
          console.log("⚠️ Ya existe una sesión abierta para este usuario");
          const docAbierto = snapshot.docs[0];
          localStorage.setItem("sesionDocId", docAbierto.id);
          return;
        }

        // Crear nuevo documento
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

  // 👉 Cierra sesión
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

        // Si no hay ID guardado, buscar el último documento abierto
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
          console.log("No hay sesión abierta para cerrar");
          return;
        }

        const docRef = doc(historialRef, sesionDocId);
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
