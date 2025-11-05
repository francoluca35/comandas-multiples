// hooks/useHistorialEmpleados.js
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  doc,
  orderBy,
  limit,
} from "firebase/firestore";

export const useHistorialEmpleados = () => {
  const registrarInicioSesion = async () => {
    try {
      const usuarioId = localStorage.getItem("usuarioId");
      const usuarioEmail = localStorage.getItem("usuario");
      const usuarioNombre = localStorage.getItem("nombreCompleto");
      const rol = localStorage.getItem("rol");

      if (!usuarioId) throw new Error("Usuario no identificado");

      const historialRef = collection(db, "historial_empleados");

      // Buscar si ya tiene un turno abierto HOY
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const q = query(
        historialRef,
        where("usuarioId", "==", usuarioId),
        where("fecha", ">=", hoy),
        orderBy("fecha", "desc"),
        limit(1)
      );

      const snapshot = await getDocs(q);

      let turnoAbierto = null;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.horaCierre) turnoAbierto = { id: docSnap.id, ...data };
      });

      if (turnoAbierto) {
        console.log("🔹 Ya hay un turno abierto para hoy, no se crea otro");
        return;
      }

      // Crear nuevo documento con horaApertura
      await addDoc(historialRef, {
        usuarioId,
        usuarioEmail,
        usuarioNombre,
        rol,
        fecha: new Date(),
        horaApertura: new Date(),
        horaCierre: null,
        timestamp: serverTimestamp(),
      });

      console.log("✅ Turno abierto (inicio de sesión registrado)");
    } catch (error) {
      console.error("Error al registrar inicio:", error);
    }
  };

  const registrarCierreSesion = async () => {
    try {
      const usuarioId = localStorage.getItem("usuarioId");
      if (!usuarioId) throw new Error("Usuario no identificado");

      const historialRef = collection(db, "historial_empleados");

      const q = query(
        historialRef,
        where("usuarioId", "==", usuarioId),
        orderBy("fecha", "desc"),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.warn("⚠️ No se encontró turno abierto para cerrar");
        return;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();

      // Si ya tenía horaCierre, no lo cierres de nuevo
      if (data.horaCierre) {
        console.log("🔹 El turno ya estaba cerrado");
        return;
      }

      await updateDoc(doc(db, "historial_empleados", docSnap.id), {
        horaCierre: new Date(),
      });

      console.log("✅ Turno cerrado correctamente (cierre registrado)");
    } catch (error) {
      console.error("Error al registrar cierre:", error);
    }
  };

  const obtenerHistorial = async () => {
    const snapshot = await getDocs(collection(db, "historial_empleados"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const borrarHistorial = async () => {
    // No borrar todavía, mantenerlo igual que antes
  };

  return {
    registrarInicioSesion,
    registrarCierreSesion,
    obtenerHistorial,
    borrarHistorial,
  };
};
