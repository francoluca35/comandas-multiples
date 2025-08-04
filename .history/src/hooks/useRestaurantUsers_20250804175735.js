"use client";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
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
      if (!restauranteId) {
        throw new Error("No hay restaurante seleccionado");
      }

      const usersRef = collection(db, `restaurantes/${restauranteId}/users`);
      const snapshot = await getDocs(usersRef);
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

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
      if (!restauranteId) {
        throw new Error("No hay restaurante seleccionado");
      }

      const usersRef = collection(db, `restaurantes/${restauranteId}/users`);
      const docRef = await addDoc(usersRef, {
        ...userData,
        fechaCreacion: new Date().toISOString(),
        activo: true,
      });

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

  // Cargar usuarios al inicializar
  useEffect(() => {
    obtenerUsuarios();
  }, []);

  return {
    usuarios,
    loading,
    error,
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
  };
};
