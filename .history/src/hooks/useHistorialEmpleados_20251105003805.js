import { db } from "../firebase";
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
  const registrarInicioSesion = async () => {
    try {
      const usuarioId = localStorage.getItem("usuarioId");
      const usuarioEmail = localStorage.getItem("usuario");
      const usuarioNombre = localStorage.getItem("nombreCompleto");
      const rol = localStorage.getItem("rol");
      const restauranteId = localStorage.getItem("restauranteId"); // 👈 lo tomamos dinámicamente

      if (!usuarioId || !restauranteId)
        throw new Error("Falta usuario o restaurante identificado");

      // ✅ colección anidada dentro del restaurante actual
      const historialRef = collection(
        db,
        `restaurantes/${restauranteId}/historialEmpleados`
      );

      // Buscar si ya hay un turno abierto
      const q = query(
        historialRef,
        where("usuarioId", "==", usuarioId),
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
        console.log("🔹 Ya existe un turno abierto, no se crea otro");
        return;
      }

      // Crear nuevo turno
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

      console.log("✅ Turno abierto correctamente");
    } catch (error) {
      console.error("❌ Error al registrar apertura:", error);
    }
  };

  const registrarCierreSesion = async () => {
    try {
      const usuarioId = localStorage.getItem("usuarioId");
      const restauranteId = localStorage.getItem("restauranteId");

      if (!usuarioId || !restauranteId)
        throw new Error("Falta usuario o restaurante identificado");

      // ✅ colección anidada dentro del restaurante actual
      const historialRef = collection(
        db,
        `restaurantes/${restauranteId}/historialEmpleados`
      );

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

      if (data.horaCierre) {
        console.log("🔹 El turno ya estaba cerrado");
        return;
      }

      // ✅ Actualizamos el documento directamente
      await updateDoc(docSnap.ref, {
        horaCierre: new Date(),
      });

      console.log("✅ Turno cerrado correctamente");
    } catch (error) {
      console.error("❌ Error al registrar cierre:", error);
    }
  };

  return {
    registrarInicioSesion,
    registrarCierreSesion,
  };
};
