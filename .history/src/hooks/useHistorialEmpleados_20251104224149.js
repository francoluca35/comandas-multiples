"use client";
import { useState, useRef } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  updateDoc,
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

        // Revisar si ya hay sesión abierta
        const q = query(
          historialRef,
          where("usuarioId", "==", usuarioId),
          where("horaCierre", "==", null),
          orderBy("horaApertura", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          console.log("Ya existe sesión abierta, no se crea otro documento");
          return;
        }

        // Crear documento de inicio
        const ahora = new Date();
        await addDoc(historialRef, {
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

        console.log("✅ Inicio de sesión registrado correctamente");
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    });
  };

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

        // Buscar la sesión abierta más reciente
        const q = query(
          historialRef,
          where("usuarioId", "==", usuarioId),
          where("horaCierre", "==", null),
          orderBy("horaApertura", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.log("No hay sesión abierta para cerrar");
          return;
        }

        const docId = snapshot.docs[0].id;
        const docRef = doc(historialRef, docId);

        await updateDoc(docRef, { horaCierre: new Date() });

        console.log("✅ Cierre de sesión registrado correctamente");
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
