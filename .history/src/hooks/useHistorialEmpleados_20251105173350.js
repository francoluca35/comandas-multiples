// hooks/useHistorialEmpleados.js
"use client";

import { useRef, useState } from "react";
import { db } from "../../lib/firebase"; // ajustá la ruta si cambia
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";

export const useHistorialEmpleados = () => {
  const isProcessing = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRestaurantId = () => {
    return localStorage.getItem("restauranteId");
  };

  const getUserId = () => {
    return localStorage.getItem("usuarioId");
  };

  // guarda el id de la sesión abierta en localStorage para asegurar que
  // registrarCierreSesion actualice exactamente el mismo documento.
  const setSesionDocId = (id) => {
    if (id) localStorage.setItem("sesionDocId", id);
    else localStorage.removeItem("sesionDocId");
  };

  const getSesionDocId = () => {
    return localStorage.getItem("sesionDocId");
  };

  const registrarInicioSesion = async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setLoading(true);

    try {
      const usuarioId = getUserId();
      const restauranteId = getRestaurantId();
      const rol = localStorage.getItem("rol")?.toLowerCase() || "";
      const usuario = localStorage.getItem("usuario") || "";

      // Solo registrar para roles admin y mesera/mesero
      if (rol !== "admin" && rol !== "mesera" && rol !== "mesero") {
        console.log("ℹ️ Historial de empleados solo para admin y mesera/mesero. Rol actual:", rol);
        isProcessing.current = false;
        setLoading(false);
        return;
      }

      if (!usuarioId || !restauranteId || !usuario) {
        throw new Error("Falta usuarioId, restauranteId o usuario en localStorage");
      }

      // Si ya tenemos sesionDocId guardado, no crear otra
      const existingSesionId = getSesionDocId();
      if (existingSesionId) {
        console.log("⚠️ Sesión ya guardada localmente:", existingSesionId);
        isProcessing.current = false;
        setLoading(false);
        return;
      }

      const historialRef = collection(
        db,
        `restaurantes/${restauranteId}/historialEmpleados`
      );

      // Buscar si ya hay un turno abierto (horaCierre == null) para este usuario
      const qOpen = query(
        historialRef,
        where("usuarioId", "==", usuarioId),
        where("horaCierre", "==", null),
        orderBy("timestamp", "desc"),
        limit(1)
      );

      const snapOpen = await getDocs(qOpen);

      if (!snapOpen.empty) {
        // Reusar documento abierto y guardar su id en localStorage
        const docOpen = snapOpen.docs[0];
        setSesionDocId(docOpen.id);
        console.log("🔁 Reusando sesión abierta existente:", docOpen.id);
        isProcessing.current = false;
        setLoading(false);
        return;
      }

      // No hay sesión abierta: crear nuevo documento con horaCierre = null
      const ahora = new Date();
      const newDocRef = await addDoc(historialRef, {
        usuarioId,
        usuario: usuario, // Campo usuario (nombre de usuario)
        usuarioEmail: localStorage.getItem("email") || "",
        usuarioNombre:
          localStorage.getItem("nombreCompleto") ||
          usuario ||
          "Usuario",
        rol: localStorage.getItem("rol") || "Empleado",
        fecha: ahora.toISOString().split("T")[0], // YYYY-MM-DD (útil para filtrado)
        horaApertura: ahora.toISOString(),
        horaCierre: null,
        timestamp: serverTimestamp(),
      });

      // Guardar id de sesión para cerrar después
      setSesionDocId(newDocRef.id);

      console.log("✅ Nuevo turno creado (apertura):", newDocRef.id);
    } catch (err) {
      console.error("❌ Error registrarInicioSesion:", err);
      setError(err.message || err.toString());
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
      const usuarioId = getUserId();
      const restauranteId = getRestaurantId();
      const rol = localStorage.getItem("rol")?.toLowerCase() || "";

      // Solo registrar para roles admin y mesera/mesero
      if (rol !== "admin" && rol !== "mesera" && rol !== "mesero") {
        console.log("ℹ️ Historial de empleados solo para admin y mesera/mesero. Rol actual:", rol);
        isProcessing.current = false;
        setLoading(false);
        return;
      }

      if (!usuarioId || !restauranteId) {
        throw new Error("Falta usuarioId o restauranteId en localStorage");
      }

      const historialRef = collection(
        db,
        `restaurantes/${restauranteId}/historialEmpleados`
      );

      // 1) Preferimos actualizar usando el sesionDocId guardado
      const sesionDocId = getSesionDocId();
      if (sesionDocId) {
        // Buscar el doc por query para confirmar que existe y aún no tenga horaCierre
        const qById = query(
          historialRef,
          where("__name__", "==", sesionDocId), // notación: buscar por ID en queries no siempre permitida; alternativa: obtenerlo con getDoc si quieres
          limit(1)
        );

        // Para mayor seguridad: usamos getDocs sobre q que busca por usuarioId y horaCierre==null si la búsqueda por id falla
        let docToClose = null;

        try {
          const snap = await getDocs(
            query(
              historialRef,
              where("usuarioId", "==", usuarioId),
              where("__name__", "==", sesionDocId),
              limit(1)
            )
          );
          if (!snap.empty) docToClose = snap.docs[0];
        } catch (err) {
          // si la query por __name__ falla por permisos, lo resolvemos buscando por usuarioId/horaCierre
          console.warn(
            "Query por __name__ falló, se buscará por usuarioId/horaCierre"
          );
        }

        if (!docToClose) {
          // fallback: buscar el doc abierto (horaCierre == null)
          const qOpen = query(
            historialRef,
            where("usuarioId", "==", usuarioId),
            where("horaCierre", "==", null),
            orderBy("timestamp", "desc"),
            limit(1)
          );
          const snapOpen = await getDocs(qOpen);
          if (!snapOpen.empty) docToClose = snapOpen.docs[0];
        }

        if (docToClose) {
          // Si el documento ya tiene horaCierre, salimos
          const data = docToClose.data();
          if (data.horaCierre) {
            console.log("🔹 El turno ya estaba cerrado (por sesionDocId)");
            setSesionDocId(null);
            isProcessing.current = false;
            setLoading(false);
            return;
          }

          await updateDoc(docToClose.ref, {
            horaCierre: new Date().toISOString(),
          });
          console.log("✅ Turno cerrado (usando sesionDocId):", docToClose.id);
          setSesionDocId(null);
          isProcessing.current = false;
          setLoading(false);
          return;
        } else {
          console.warn(
            "⚠️ SesionDocId presente pero no se encontró doc. Se intentará buscar turno abierto."
          );
          // continuar a búsqueda normal abajo
        }
      }

      // 2) Si no hay sesionDocId o no encontramos el doc, buscar el turno abierto (horaCierre == null)
      const qOpen2 = query(
        historialRef,
        where("usuarioId", "==", usuarioId),
        where("horaCierre", "==", null),
        orderBy("timestamp", "desc"),
        limit(1)
      );

      const snapOpen2 = await getDocs(qOpen2);

      if (!snapOpen2.empty) {
        const docOpen = snapOpen2.docs[0];
        // doble chequeo: si horaCierre ya existe, no actualizar
        const data = docOpen.data();
        if (data.horaCierre) {
          console.log("🔹 El turno ya estaba cerrado (busqueda abierta).");
          setSesionDocId(null);
          isProcessing.current = false;
          setLoading(false);
          return;
        }

        await updateDoc(docOpen.ref, { horaCierre: new Date().toISOString() });
        console.log("✅ Turno cerrado (buscando turno abierto):", docOpen.id);
        setSesionDocId(null);
        isProcessing.current = false;
        setLoading(false);
        return;
      }

      // 3) Fallback seguro: no hay doc abierto -> no creamos automáticamente otro con solo horaCierre
      console.log(
        "⚠️ No se encontró turno abierto para cerrar. No se crea documento nuevo por seguridad."
      );
    } catch (err) {
      console.error("❌ Error registrarCierreSesion:", err);
      setError(err.message || err.toString());
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
