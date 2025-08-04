"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
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
      console.log("🔍 Obteniendo usuarios para restauranteId:", restauranteId);

      if (!restauranteId || restauranteId === "") {
        console.error("❌ RestauranteId no válido:", restauranteId);
        throw new Error("No hay restaurante seleccionado o el ID es inválido");
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
      }));

      console.log("Usuarios encontrados:", usersData);
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
        console.error("❌ RestauranteId no válido para crear usuario:", restauranteId);
        throw new Error("No hay restaurante seleccionado o el ID es inválido");
      }

      console.log("Creando usuario en:", `restaurantes/${restauranteId}/users`);
      console.log("Datos del usuario:", userData);

      const usersRef = collection(db, `restaurantes/${restauranteId}/users`);
      const docRef = await addDoc(usersRef, {
        ...userData,
        fechaCreacion: new Date().toISOString(),
        activo: true,
      });

      console.log("Usuario creado con ID:", docRef.id);

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

      if (!restauranteId) {
        throw new Error("No hay restaurante seleccionado");
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

  // Cargar usuarios al inicializar
  useEffect(() => {
    const inicializar = async () => {
      await debugRestaurantes(); // Debug: listar restaurantes
      await verificarSubcoleccionUsers();
      await obtenerUsuarios();
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
  };
};
