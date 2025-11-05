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
    const usuarioId = localStorage.getItem("usuarioId");
    const nombre = localStorage.getItem("nombreCompleto") || "Desconocido";
    const email = localStorage.getItem("usuario") || "sin_email";

    const horaActual = new Date();

    // Crear registro nuevo solo si no hay uno abierto
    const q = query(
      collection(db, "historialEmpleados"),
      where("usuarioId", "==", usuarioId),
      where("horaCierre", "==", null)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      console.log("Ya hay un turno abierto para este usuario.");
      return;
    }

    await addDoc(collection(db, "historialEmpleados"), {
      usuarioId,
      usuarioNombre: nombre,
      usuarioEmail: email,
      horaApertura: horaActual,
      horaCierre: null,
      timestamp: horaActual,
    });

    console.log("✅ Inicio de sesión registrado");
  };

  const registrarCierreSesion = async () => {
    const usuarioId = localStorage.getItem("usuarioId");
    const horaActual = new Date();

    // Buscar el registro abierto (sin horaCierre)
    const q = query(
      collection(db, "historialEmpleados"),
      where("usuarioId", "==", usuarioId),
      where("horaCierre", "==", null)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      // Actualizar el documento existente
      const docRef = doc(db, "historialEmpleados", snap.docs[0].id);
      await updateDoc(docRef, { horaCierre: horaActual });
      console.log("✅ Cierre de sesión registrado correctamente");
    } else {
      console.log(
        "⚠️ No se encontró turno abierto para cerrar, se crea uno nuevo."
      );
      // Si no hay abierto, crear uno (fallback)
      await addDoc(collection(db, "historialEmpleados"), {
        usuarioId,
        horaApertura: null,
        horaCierre: horaActual,
        timestamp: horaActual,
      });
    }
  };
  return { loading, error, registrarInicioSesion, registrarCierreSesion };
};
