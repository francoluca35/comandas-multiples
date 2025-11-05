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

      // Crear un documento que representa la apertura de sesión
      // Contiene horaApertura y queda abierto hasta que se registre horaCierre
      await addDoc(historialRef, {
        usuarioId,
        usuarioEmail,
        usuarioNombre,
        rol,
        fecha: new Date().toISOString(),
        horaApertura: new Date(),
        timestamp: new Date(),
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
      // Buscamos el último documento abierto para este usuario (el que no tiene horaCierre)
      const q = query(
        historialRef,
        where("usuarioId", "==", usuarioId),
        orderBy("timestamp", "desc"),
        limit(10)
      );

      const snapshot = await getDocs(q);
      let encontrado = false;

      for (const documento of snapshot.docs) {
        const datos = documento.data();
        // Consideramos abierto si no tiene horaCierre definida
        if (!datos.horaCierre) {
          const docRef = doc(
            db,
            "restaurantes",
            restauranteId,
            "historialEmpleados",
            documento.id
          );
          await updateDoc(docRef, {
            horaCierre: new Date(),
            cierreTimestamp: new Date(),
          });
          encontrado = true;
          console.log(
            `✅ Actualizado documento ${documento.id} con horaCierre`
          );
          break;
        }
      }

      // Si no encontramos un documento abierto, creamos uno nuevo con horaCierre
      if (!encontrado) {
        await addDoc(historialRef, {
          usuarioId,
          usuarioEmail,
          usuarioNombre,
          fecha: new Date().toISOString(),
          horaApertura: null,
          horaCierre: new Date(),
          timestamp: new Date(),
        });
        console.log(
          "⚠️ No se encontró apertura previa: creado documento de cierre"
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
