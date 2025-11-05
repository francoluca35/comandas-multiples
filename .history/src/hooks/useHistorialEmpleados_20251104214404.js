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
  deleteDoc,
  doc,
  updateDoc,
  limit,
} from "firebase/firestore";

export const useHistorialEmpleados = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const processingRef = useRef(false);
  const timeoutRef = useRef(null);

  // Bloqueo para prevenir llamadas rápidas consecutivas
  const preventMultipleCalls = async (callback) => {
    if (processingRef.current) {
      console.log("🚫 Operación en proceso, ignorando llamada duplicada");
      return;
    }
    try {
      processingRef.current = true;
      const result = await callback();
      return result;
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        processingRef.current = false;
      }, 2000); // 2 segundos de bloqueo
    }
  };

  // Helpers de localStorage
  const getRestaurantId = () => {
    const restauranteId = localStorage.getItem("restauranteId");
    if (!restauranteId) throw new Error("No hay restaurante seleccionado");
    return restauranteId;
  };

  const getUserId = () => {
    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) throw new Error("No hay usuario seleccionado");
    return usuarioId;
  };

  // Registrar inicio de sesión
  const registrarInicioSesion = async () => {
    return preventMultipleCalls(async () => {
      try {
        const restauranteId = getRestaurantId();
        const usuarioId = getUserId();
        const usuarioEmail = localStorage.getItem("email") || "";
        const usuarioNombre =
          localStorage.getItem("nombreUsuario") || "Usuario";
        const rol =
          localStorage.getItem("rol") ||
          localStorage.getItem("role") ||
          "Empleado";

        const historialRef = collection(
          db,
          "restaurantes",
          restauranteId,
          "historialEmpleados"
        );
        const ahora = new Date();

        // Buscar sesión abierta reciente del usuario (solo 1)
        const qAbierta = query(
          historialRef,
          where("usuarioId", "==", usuarioId),
          where("horaCierre", "==", null)
        );
        const sesionesAbiertas = await getDocs(qAbierta);

        if (sesionesAbiertas.docs.length > 0) {
          console.log("Ya hay sesión abierta, no se crea un nuevo documento");
          return; // No crear documento duplicado
        }

        // Crear nuevo registro
        await addDoc(historialRef, {
          usuarioId,
          usuarioEmail,
          usuarioNombre,
          rol,
          fecha: ahora.toISOString(),
          horaApertura: ahora,
          horaCierre: null,
          timestamp: ahora,
        });

        console.log("✅ Inicio de sesión registrado correctamente");
      } catch (err) {
        console.error("Error registrando inicio de sesión:", err);
        setError(err.message);
      }
    });
  };

  // Registrar cierre de sesión
  const registrarCierreSesion = async () => {
    return preventMultipleCalls(async () => {
      try {
        const restauranteId = getRestaurantId();
        const usuarioId = getUserId();
        const ahora = new Date();

        const historialRef = collection(
          db,
          "restaurantes",
          restauranteId,
          "historialEmpleados"
        );

        // Traer todas las sesiones del usuario
        const snapshot = await getDocs(
          query(historialRef, where("usuarioId", "==", usuarioId))
        );

        if (snapshot.empty) {
          console.log("No hay historial de sesiones para este usuario");
          return;
        }

        // Filtrar sesiones abiertas
        let ultimaSesion = null;
        snapshot.forEach((docu) => {
          const data = docu.data();
          if (!data.horaCierre) {
            if (
              !ultimaSesion ||
              new Date(data.horaApertura) > new Date(ultimaSesion.horaApertura)
            ) {
              ultimaSesion = { id: docu.id, ...data };
            }
          }
        });

        if (!ultimaSesion) {
          console.log("No hay sesión abierta para cerrar");
          return;
        }

        // Actualizar cierre
        const docRef = doc(
          db,
          "restaurantes",
          restauranteId,
          "historialEmpleados",
          ultimaSesion.id
        );
        await updateDoc(docRef, { horaCierre: ahora });

        console.log("✅ Cierre de sesión registrado correctamente");
      } catch (err) {
        console.error("Error registrando cierre de sesión:", err);
        setError(err.message);
      }
    });
  };

  // Obtener historial
  const obtenerHistorial = async (fechaInicio = null, fechaFin = null) => {
    try {
      setLoading(true);
      setError(null);

      const restauranteId = getRestaurantId();
      const historialRef = collection(
        db,
        "restaurantes",
        restauranteId,
        "historialEmpleados"
      );

      let q = query(historialRef, orderBy("timestamp", "desc"));

      if (fechaInicio && fechaFin) {
        q = query(
          historialRef,
          where("timestamp", ">=", fechaInicio),
          where("timestamp", "<=", fechaFin),
          orderBy("timestamp", "desc")
        );
      }

      const querySnapshot = await getDocs(q);
      const historial = [];

      querySnapshot.forEach((documento) => {
        const datos = documento.data();
        const timestamp = datos.timestamp?.toDate
          ? datos.timestamp.toDate()
          : datos.timestamp instanceof Date
          ? datos.timestamp
          : datos.fecha
          ? new Date(datos.fecha)
          : new Date();

        const horaApertura = datos.horaApertura?.toDate
          ? datos.horaApertura.toDate()
          : datos.horaApertura
          ? new Date(datos.horaApertura)
          : null;

        const horaCierre = datos.horaCierre?.toDate
          ? datos.horaCierre.toDate()
          : datos.horaCierre
          ? new Date(datos.horaCierre)
          : null;

        historial.push({
          id: documento.id,
          ...datos,
          rol: datos.rol || datos.role || null,
          timestamp,
          horaApertura,
          horaCierre,
        });
      });

      return historial;
    } catch (err) {
      console.error("Error obteniendo historial:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Borrar historial
  const borrarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);

      const restauranteId = getRestaurantId();
      const historialRef = collection(
        db,
        "restaurantes",
        restauranteId,
        "historialEmpleados"
      );

      const querySnapshot = await getDocs(historialRef);

      for (const documento of querySnapshot.docs) {
        try {
          await deleteDoc(
            doc(
              db,
              "restaurantes",
              restauranteId,
              "historialEmpleados",
              documento.id
            )
          );
          console.log(`Documento ${documento.id} borrado exitosamente`);
        } catch (err) {
          console.error(`Error borrando documento ${documento.id}:`, err);
        }
      }

      console.log("✅ Historial borrado exitosamente");
    } catch (err) {
      console.error("Error borrando historial:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    registrarInicioSesion,
    registrarCierreSesion,
    obtenerHistorial,
    borrarHistorial,
  };
};
