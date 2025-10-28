"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";

export const useRestaurantUsers = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener usuarios del restaurante actual
  const obtenerUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);

      const restauranteId = localStorage.getItem("restauranteId");
      const nombreResto = localStorage.getItem("nombreResto");

      console.log("🔍 Obteniendo usuarios para restauranteId:", restauranteId);
      console.log("🔍 Nombre del restaurante:", nombreResto);

      if (!restauranteId || restauranteId === "" || restauranteId === "null") {
        console.log("⏳ No hay restaurante seleccionado, saltando obtención de usuarios");
        setUsuarios([]);
        setLoading(false);
        return;
      }

      // Verificar que el restauranteId coincide con el nombre del restaurante
      const expectedRestauranteId = nombreResto
        ? nombreResto
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_|_$/g, "")
        : null;

      console.log("🔍 RestauranteId esperado:", expectedRestauranteId);
      console.log("🔍 RestauranteId actual:", restauranteId);

      if (expectedRestauranteId && expectedRestauranteId !== restauranteId) {
        console.error(
          "❌ RestauranteId no coincide con el nombre del restaurante"
        );
        console.error("Esperado:", expectedRestauranteId);
        console.error("Actual:", restauranteId);
        throw new Error("ID del restaurante no válido");
      }

      console.log(
        "Buscando usuarios en:",
        `restaurantes/${restauranteId}/users`
      );

      const usersRef = collection(db, `restaurantes/${restauranteId}/users`);
      const snapshot = await getDocs(usersRef);
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        biometricEnabled: doc.data().biometricEnabled || false,
        biometricSetupDate: doc.data().biometricSetupDate || null,
        biometricCredentials: doc.data().biometricCredentials || null,
      }));

      console.log("✅ Usuarios encontrados para", nombreResto, ":", usersData);
      setUsuarios(usersData);
    } catch (err) {
      setError(err.message);
      console.error("Error al obtener usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo usuario
  const crearUsuario = async (userData) => {
    try {
      setError(null);

      const restauranteId = localStorage.getItem("restauranteId");
      console.log("🔍 Creando usuario para restauranteId:", restauranteId);

      if (!restauranteId || restauranteId === "") {
        console.error(
          "❌ RestauranteId no válido para crear usuario:",
          restauranteId
        );
        throw new Error("No hay restaurante seleccionado o el ID es inválido");
      }

      console.log("Creando usuario en:", `restaurantes/${restauranteId}/users`);
      console.log("Datos del usuario:", userData);

      // Usar el nombre de usuario como ID del documento
      const userDocRef = doc(
        db,
        `restaurantes/${restauranteId}/users/${userData.usuario}`
      );
      await setDoc(userDocRef, {
        ...userData,
        fechaCreacion: new Date().toISOString(),
        activo: true,
      });

      console.log("Usuario creado con ID:", userData.usuario);

      // Recargar usuarios
      await obtenerUsuarios();

      return docRef.id;
    } catch (err) {
      setError(err.message);
      console.error("Error al crear usuario:", err);
      throw err;
    }
  };

  // Actualizar usuario
  const actualizarUsuario = async (userId, userData) => {
    try {
      setError(null);

      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) {
        throw new Error("No hay restaurante seleccionado");
      }

      const userRef = doc(db, `restaurantes/${restauranteId}/users`, userId);
      await updateDoc(userRef, {
        ...userData,
        fechaActualizacion: new Date().toISOString(),
      });

      // Recargar usuarios
      await obtenerUsuarios();
    } catch (err) {
      setError(err.message);
      console.error("Error al actualizar usuario:", err);
      throw err;
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async (userId) => {
    try {
      setError(null);

      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) {
        throw new Error("No hay restaurante seleccionado");
      }

      const userRef = doc(db, `restaurantes/${restauranteId}/users`, userId);
      await deleteDoc(userRef);

      // Recargar usuarios
      await obtenerUsuarios();
    } catch (err) {
      setError(err.message);
      console.error("Error al eliminar usuario:", err);
      throw err;
    }
  };

  // Verificar y crear subcolección users si no existe
  const verificarSubcoleccionUsers = async () => {
    try {
      const restauranteId = localStorage.getItem("restauranteId");
      console.log(
        "🔍 Verificando subcolección users para restauranteId:",
        restauranteId
      );

      if (!restauranteId || restauranteId === "null" || restauranteId === "") {
        console.log("⏳ No hay restaurante seleccionado, saltando verificación de subcolección");
        return;
      }

      // Intentar obtener la subcolección users
      const usersRef = collection(db, `restaurantes/${restauranteId}/users`);
      console.log("Buscando en:", `restaurantes/${restauranteId}/users`);

      const snapshot = await getDocs(usersRef);

      // Si no hay documentos, crear uno inicial
      if (snapshot.empty) {
        console.log("📝 Creando subcolección users inicial...");
        await setDoc(doc(usersRef, "admin"), {
          usuario: "admin",
          password: localStorage.getItem("password") || "admin",
          rol: "admin",
          imagen: localStorage.getItem("logo") || "",
          fechaCreacion: new Date().toISOString(),
          activo: true,
          esAdmin: true,
        });
        console.log("✅ Subcolección users creada exitosamente");
      } else {
        console.log(
          "✅ Subcolección users ya existe con",
          snapshot.size,
          "documentos"
        );
      }
    } catch (error) {
      console.error("❌ Error al verificar subcolección users:", error);
    }
  };

  // Función de debug para listar todos los restaurantes
  const debugRestaurantes = async () => {
    try {
      console.log("🔍 DEBUG: Listando todos los restaurantes...");
      const restaurantesRef = collection(db, "restaurantes");
      const snapshot = await getDocs(restaurantesRef);

      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Restaurante:", {
          id: doc.id,
          nombre: data.nombre,
          codigoActivacion: data.codigoActivacion,
          email: data.email,
        });
      });
    } catch (error) {
      console.error("Error al listar restaurantes:", error);
    }
  };

  // Función para limpiar datos de otros restaurantes
  const limpiarDatosOtrosRestaurantes = () => {
    const restauranteId = localStorage.getItem("restauranteId");
    const nombreResto = localStorage.getItem("nombreResto");

    if (restauranteId && nombreResto) {
      const expectedRestauranteId = nombreResto
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");

      if (expectedRestauranteId !== restauranteId) {
        console.log("🧹 Limpiando datos de restaurante incorrecto");
        console.log("Esperado:", expectedRestauranteId);
        console.log("Actual:", restauranteId);

        // Limpiar localStorage
        localStorage.removeItem("restauranteId");
        localStorage.removeItem("nombreResto");
        localStorage.removeItem("emailResto");
        localStorage.removeItem("cantUsuarios");
        localStorage.removeItem("finanzas");
        localStorage.removeItem("logo");
        localStorage.removeItem("usuario");
        localStorage.removeItem("rol");
        localStorage.removeItem("usuarioId");

        return true; // Indicar que se limpió
      }
    }
    return false; // No se limpió nada
  };

  // Función de debug para verificar la creación de usuarios
  const debugCrearUsuario = async () => {
    try {
      const restauranteId = localStorage.getItem("restauranteId");
      console.log("🔍 DEBUG CREAR USUARIO:");
      console.log("- RestauranteId en localStorage:", restauranteId);
      console.log("- Tipo de restauranteId:", typeof restauranteId);
      console.log("- Es válido:", restauranteId && restauranteId !== "");

      if (restauranteId && restauranteId !== "") {
        const usersRef = collection(db, `restaurantes/${restauranteId}/users`);
        console.log(
          "- Ruta de la subcolección:",
          `restaurantes/${restauranteId}/users`
        );

        // Intentar obtener la subcolección
        const snapshot = await getDocs(usersRef);
        console.log("- Documentos en la subcolección:", snapshot.size);

        snapshot.forEach((doc) => {
          console.log("  - Usuario:", doc.id, doc.data());
        });
      }
    } catch (error) {
      console.error("Error en debugCrearUsuario:", error);
    }
  };

  // Cargar usuarios al inicializar
  useEffect(() => {
    const inicializar = async () => {
      // Esperar a que el restauranteId esté disponible
      const checkRestauranteId = () => {
        const restauranteId = localStorage.getItem("restauranteId");
        return restauranteId && restauranteId !== "null" && restauranteId !== "";
      };

      // Si no hay restauranteId, esperar un poco y reintentar
      if (!checkRestauranteId()) {
        console.log("⏳ Esperando restauranteId...");
        setTimeout(() => {
          if (checkRestauranteId()) {
            inicializar();
          } else {
            console.log("❌ No se encontró restauranteId después de esperar");
            setLoading(false);
            setError("No hay restaurante seleccionado");
          }
        }, 1000);
        return;
      }

      // Primero verificar si hay datos de otros restaurantes
      const seLimpio = limpiarDatosOtrosRestaurantes();

      if (seLimpio) {
        console.log("🔄 Datos limpiados, redirigiendo al prelogin");
        window.location.href = "/comandas/prelogin";
        return;
      }

      try {
        await debugRestaurantes(); // Debug: listar restaurantes
        await verificarSubcoleccionUsers();
        await obtenerUsuarios();
      } catch (err) {
        console.error("Error en inicialización:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    inicializar();
  }, []);

  return {
    usuarios,
    loading,
    error,
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    verificarSubcoleccionUsers,
    debugRestaurantes,
    debugCrearUsuario,
    limpiarDatosOtrosRestaurantes,
  };
};
