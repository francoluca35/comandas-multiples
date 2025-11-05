"use client";
import { useState, useRef } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  query,
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

        // Traer todas las sesiones del usuario
        const snapshot = await getDocs(
          query(historialRef, orderBy("horaApertura", "desc"))
        );

        // Buscar en memoria si hay sesión abierta
        const sesionesAbiertas = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((s) => !s.horaCierre);

        if (sesionesAbiertas.length > 0) {
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

        // Traer todas las sesiones del usuario
        const snapshot = await getDocs(
          query(historialRef, orderBy("horaApertura", "desc"))
        );

        // Buscar sesión abierta más reciente en memoria
        const sesionesAbiertas = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((s) => !s.horaCierre);

        if (sesionesAbiertas.length === 0) {
          console.log("No hay sesión abierta para cerrar");
          return;
        }

        const docId = sesionesAbiertas[0].id;
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
