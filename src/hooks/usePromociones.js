"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export const usePromociones = () => {
  const [promociones, setPromociones] = useState([]);
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

  // Crear categoría "promociones" si no existe
  const ensurePromocionesCategory = async () => {
    try {
      const restaurantId = getRestaurantId();
      const menuRef = doc(db, "restaurantes", restaurantId, "menus", "promociones");
      const menuSnap = await getDoc(menuRef);

      if (!menuSnap.exists()) {
        await setDoc(menuRef, {
          nombre: "Promociones",
          tipo: "categoria",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Error asegurando categoría promociones:", err);
    }
  };

  // Obtener todas las promociones
  const fetchPromociones = async () => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      
      // Asegurar que existe la categoría promociones
      await ensurePromocionesCategory();

      // Obtener promociones de la subcolección
      const promocionesRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        "promociones",
        "subcategorias"
      );
      const snapshot = await getDocs(promocionesRef);

      const promocionesData = [];
      
      // Para cada subcategoría, obtener sus productos
      for (const subDoc of snapshot.docs) {
        const productosRef = collection(db, promocionesRef.path, subDoc.id, "productos");
        const productosSnap = await getDocs(productosRef);
        
        productosSnap.docs.forEach(prodDoc => {
          promocionesData.push({
            id: prodDoc.id,
            subcategoriaId: subDoc.id,
            subcategoriaNombre: subDoc.data().nombre || subDoc.id,
            ...prodDoc.data(),
          });
        });
      }

      // Si no hay promociones en subcategorías, intentar obtener directamente
      if (promocionesData.length === 0) {
        // Crear subcategoría "promociones" por defecto
        const defaultSubRef = doc(db, promocionesRef.path, "promociones");
        const defaultSubSnap = await getDoc(defaultSubRef);
        
        if (!defaultSubSnap.exists()) {
          await setDoc(defaultSubRef, {
            nombre: "Promociones",
            createdAt: new Date().toISOString(),
          });
        }
      }

      setPromociones(promocionesData);
      return promocionesData;
    } catch (err) {
      setError(`Error al cargar promociones: ${err.message}`);
      console.error("Error fetching promociones:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva promoción
  const createPromocion = async (promocionData) => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      
      // Asegurar que existe la categoría promociones
      await ensurePromocionesCategory();

      // Crear o obtener subcategoría "promociones"
      const subcatRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        "promociones",
        "subcategorias",
        "promociones"
      );
      const subcatSnap = await getDoc(subcatRef);
      
      if (!subcatSnap.exists()) {
        await setDoc(subcatRef, {
          nombre: "Promociones",
          createdAt: new Date().toISOString(),
        });
      }

      // Agregar producto en la subcategoría
      const productosRef = collection(db, subcatRef.path, "productos");
      await addDoc(productosRef, {
        ...promocionData,
        categoria: "promociones",
        subcategoria: "promociones",
        esPromocion: true,
        createdAt: new Date().toISOString(),
      });

      await fetchPromociones();
    } catch (err) {
      setError(`Error al crear promoción: ${err.message}`);
      console.error("Error creating promocion:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar promoción
  const updatePromocion = async (promocionId, promocionData) => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      
      // Buscar la promoción
      const promocion = promociones.find(p => p.id === promocionId);
      if (!promocion) {
        throw new Error("Promoción no encontrada");
      }

      const productoRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        "promociones",
        "subcategorias",
        promocion.subcategoriaId,
        "productos",
        promocionId
      );

      await updateDoc(productoRef, {
        ...promocionData,
        updatedAt: new Date().toISOString(),
      });

      await fetchPromociones();
    } catch (err) {
      setError(`Error al actualizar promoción: ${err.message}`);
      console.error("Error updating promocion:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar promoción
  const deletePromocion = async (promocionId) => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      
      // Buscar la promoción
      const promocion = promociones.find(p => p.id === promocionId);
      if (!promocion) {
        throw new Error("Promoción no encontrada");
      }

      const productoRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        "promociones",
        "subcategorias",
        promocion.subcategoriaId,
        "productos",
        promocionId
      );

      await deleteDoc(productoRef);
      await fetchPromociones();
    } catch (err) {
      setError(`Error al eliminar promoción: ${err.message}`);
      console.error("Error deleting promocion:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    promociones,
    loading,
    error,
    fetchPromociones,
    createPromocion,
    updatePromocion,
    deletePromocion,
    clearError: () => setError(null),
  };
};

