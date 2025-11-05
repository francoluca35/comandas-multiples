"use client";
import { useState, useEffect } from "react";
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

  // Obtener el restauranteId del localStorage
  const getRestaurantId = () => {
    const restauranteId = localStorage.getItem("restauranteId");
    if (!restauranteId) {
      throw new Error("No hay restaurante seleccionado");
    }
    return restauranteId;
  };

  // Obtener el usuarioId del localStorage
  const getUserId = () => {
    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
      throw new Error("No hay usuario seleccionado");
    }
    return usuarioId;
  };

  // Registrar inicio de sesión
  const registrarInicioSesion = async () => {
    try {
      const restauranteId = getRestaurantId();
      const usuarioId = getUserId();
      const usuarioEmail = localStorage.getItem("email") || "";
      const usuarioNombre = localStorage.getItem("nombreUsuario") || "Usuario";
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

      // Primero verificar si hay sesiones abiertas y cerrarlas
      const qAbiertos = query(
        historialRef,
        where("usuarioId", "==", usuarioId),
        where("horaCierre", "==", null)
      );

      const sesionesAbiertas = await getDocs(qAbiertos);
      for (const docAbierto of sesionesAbiertas.docs) {
        const docRef = doc(
          db,
          "restaurantes",
          restauranteId,
          "historialEmpleados",
          docAbierto.id
        );
        await updateDoc(docRef, {
          horaCierre: ahora,
        });
        console.log(
          `Cerrando sesión anterior automáticamente: ${docAbierto.id}`
        );
      }

      // Crear nuevo documento de apertura
      const docRef = await addDoc(historialRef, {
        usuarioId,
        usuarioEmail,
        usuarioNombre,
        rol,
        fecha: ahora.toISOString(),
        horaApertura: ahora,
        horaCierre: null,
        timestamp: ahora,
      });

      console.log("✅ Inicio de sesión registrado");
    } catch (err) {
      console.error("Error registrando inicio de sesión:", err);
    }
  };

  // Registrar cierre de sesión
  const registrarCierreSesion = async () => {
    try {
      const restauranteId = getRestaurantId();
      const usuarioId = getUserId();
      const usuarioEmail = localStorage.getItem("email") || "";
      const usuarioNombre = localStorage.getItem("nombreUsuario") || "Usuario";

      const historialRef = collection(
        db,
        "restaurantes",
        restauranteId,
        "historialEmpleados"
      );

      const ahora = new Date();

      // Buscar documentos sin horaCierre para este usuario
      const q = query(
        historialRef,
        where("usuarioId", "==", usuarioId),
        where("horaCierre", "==", null)
      );

      const snapshot = await getDocs(q);
      let actualizado = false;

      // Cerrar todas las sesiones abiertas (por si hubiera más de una)
      for (const documento of snapshot.docs) {
        const docRef = doc(
          db,
          "restaurantes",
          restauranteId,
          "historialEmpleados",
          documento.id
        );
        await updateDoc(docRef, {
          horaCierre: ahora
        });
        console.log(`✅ Cerrada sesión: ${documento.id}`);
        actualizado = true;
      }

      // Si no había ninguna sesión abierta, creamos un registro de cierre
      if (!actualizado) {
        const docRef = await addDoc(historialRef, {
          usuarioId,
          usuarioEmail,
          usuarioNombre,
          fecha: ahora.toISOString(),
          horaApertura: ahora, // Ponemos la misma hora como apertura
          horaCierre: ahora,
          timestamp: ahora
        });
        console.log(
          `⚠️ No se encontró sesión abierta, creado registro de cierre: ${docRef.id}`
        );
      }

      console.log("✅ Cierre de sesión registrado");
    } catch (err) {
      console.error("Error registrando cierre de sesión:", err);
    }
  };

  // Obtener todo el historial
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
      // Evitar duplicados: comprobar si ya existe un documento abierto para este usuario

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
        // Convertir posibles Timestamps de Firestore a Date
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

      console.log("Datos obtenidos:", historial); // Para debugging

      return historial;
    } catch (err) {
      console.error("Error obteniendo historial:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Borrar todo el historial
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

      console.log("Iniciando borrado de historial..."); // Para debugging
      const querySnapshot = await getDocs(historialRef);
      console.log(`Encontrados ${querySnapshot.size} documentos para borrar`); // Para debugging

      // Borrar cada documento individualmente
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
          console.log(`Documento ${documento.id} borrado exitosamente`); // Para debugging
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
