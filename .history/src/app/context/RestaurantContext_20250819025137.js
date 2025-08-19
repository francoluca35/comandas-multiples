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
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const cargarRestaurante = async () => {
      try {
        const nombreResto = localStorage.getItem("nombreResto");
        const codActivacion = localStorage.getItem("codActivacion");

        if (!nombreResto || !codActivacion) {
          setLoading(false);
          return;
        }

        // Generar el ID del restaurante basado en el nombre (igual que en la API)
        const restauranteId = nombreResto
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "");

        console.log("🔍 Buscando restaurante con ID generado:", restauranteId);

        // Buscar el restaurante directamente por ID
        const restauranteRef = doc(db, "restaurantes", restauranteId);
        const restauranteSnap = await getDoc(restauranteRef);

        if (restauranteSnap.exists()) {
          const data = restauranteSnap.data();

          // Verificar que el código de activación coincida
          if (data.codigoActivacion === codActivacion) {
            setRestauranteActual({
              id: restauranteId,
              ...data,
            });
            setRestauranteId(restauranteId);
            localStorage.setItem("restauranteId", restauranteId);
            console.log("✅ Restaurante cargado correctamente:", restauranteId);
          } else {
            console.warn("⚠️ Código de activación no coincide para:", restauranteId);
            // Limpiar datos inválidos
            limpiarRestaurante();
          }
        } else {
          // Si no existe con el ID generado, intentar buscar por nombre
          console.log("🔍 Restaurante no encontrado con ID generado, buscando por nombre...");
          
          try {
            const restaurantesRef = collection(db, "restaurantes");
            const restaurantesSnap = await getDocs(restaurantesRef);
            
            let restauranteEncontrado = null;
            
            restaurantesSnap.docs.forEach((doc) => {
              const data = doc.data();
              if (data.nombre && data.nombre.toLowerCase() === nombreResto.toLowerCase()) {
                if (data.codigoActivacion === codActivacion) {
                  restauranteEncontrado = {
                    id: doc.id,
                    ...data,
                  };
                }
              }
            });
            
            if (restauranteEncontrado) {
              setRestauranteActual(restauranteEncontrado);
              setRestauranteId(restauranteEncontrado.id);
              localStorage.setItem("restauranteId", restauranteEncontrado.id);
              console.log("✅ Restaurante encontrado por nombre:", restauranteEncontrado.id);
            } else {
              console.warn("⚠️ Restaurante no encontrado con nombre:", nombreResto);
              // Limpiar datos inválidos
              limpiarRestaurante();
            }
          } catch (searchError) {
            console.warn("⚠️ Error al buscar restaurante por nombre:", searchError);
            // Limpiar datos inválidos
            limpiarRestaurante();
          }
        }
      } catch (error) {
        console.warn("⚠️ Error al cargar restaurante:", error.message);
        // Limpiar datos en caso de error
        limpiarRestaurante();
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
      console.warn(`⚠️ Error al obtener ${coleccion}:`, error.message);
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
      console.warn(
        `⚠️ Error al obtener documento ${documentoId} de ${coleccion}:`,
        error.message
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
