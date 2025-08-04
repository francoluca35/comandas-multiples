"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

const RestaurantContext = createContext();

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error("useRestaurant must be used within a RestaurantProvider");
  }
  return context;
};

export const RestaurantProvider = ({ children }) => {
  const [restauranteActual, setRestauranteActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restauranteId, setRestauranteId] = useState(null);

  // Cargar información del restaurante desde localStorage
  useEffect(() => {
    const cargarRestaurante = async () => {
      try {
        const nombreResto = localStorage.getItem("nombreResto");
        const codActivacion = localStorage.getItem("codActivacion");
        
        if (!nombreResto || !codActivacion) {
          setLoading(false);
          return;
        }

        // Buscar el restaurante en la colección restaurantes
        const restaurantesRef = collection(db, "restaurantes");
        const restaurantesSnapshot = await getDocs(restaurantesRef);
        let encontrado = false;

        restaurantesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.nombre === nombreResto && data.codigoActivacion === codActivacion) {
            setRestauranteActual({
              id: doc.id,
              ...data,
            });
            setRestauranteId(doc.id);
            // Guardar el ID en localStorage para uso consistente
            localStorage.setItem("restauranteId", doc.id);
            encontrado = true;
          }
        });

        if (!encontrado) {
          console.error("Restaurante no encontrado");
        }
      } catch (error) {
        console.error("Error al cargar restaurante:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarRestaurante();
  }, []);

  // Función para obtener datos específicos del restaurante
  const obtenerDatosRestaurante = async (coleccion) => {
    if (!restauranteId) return [];

    try {
      const coleccionRef = collection(
        db,
        `restaurantes/${restauranteId}/${coleccion}`
      );
      const snapshot = await getDocs(coleccionRef);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error al obtener ${coleccion}:`, error);
      return [];
    }
  };

  // Función para obtener un documento específico del restaurante
  const obtenerDocumentoRestaurante = async (coleccion, documentoId) => {
    if (!restauranteId) return null;

    try {
      const docRef = doc(
        db,
        `restaurantes/${restauranteId}/${coleccion}`,
        documentoId
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      }
      return null;
    } catch (error) {
      console.error(
        `Error al obtener documento ${documentoId} de ${coleccion}:`,
        error
      );
      return null;
    }
  };

  // Función para limpiar datos del restaurante (logout)
  const limpiarRestaurante = () => {
    setRestauranteActual(null);
    setRestauranteId(null);
    localStorage.removeItem("nombreResto");
    localStorage.removeItem("codActivacion");
    localStorage.removeItem("emailResto");
    localStorage.removeItem("cantUsuarios");
    localStorage.removeItem("finanzas");
    localStorage.removeItem("logo");
    localStorage.removeItem("restauranteId");
    localStorage.removeItem("usuario");
    localStorage.removeItem("rol");
    localStorage.removeItem("usuarioId");
  };

  const value = {
    restauranteActual,
    restauranteId,
    loading,
    obtenerDatosRestaurante,
    obtenerDocumentoRestaurante,
    limpiarRestaurante,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};
