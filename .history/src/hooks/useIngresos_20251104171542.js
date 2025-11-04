"use client";
import { useState, useEffect } from "react";
import { useAPIErrorHandler } from "./useAPIErrorHandler";

export const useIngresos = () => {
  const [ingresos, setIngresos] = useState({
    ingresos: [],
    totalIngresos: 0,
    tipos: [],
  });
  const [loading, setLoading] = useState(false);
  const { error, handleAPIError, clearError } = useAPIErrorHandler();

  // Obtener el restauranteId del localStorage
  const getRestaurantId = () => {
    const restauranteId = localStorage.getItem("restauranteId");
    if (!restauranteId) {
      throw new Error("No hay restaurante seleccionado");
    }
    return restauranteId;
  };

  // Obtener todos los ingresos
  const fetchIngresos = async () => {
    setLoading(true);
    clearError();
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch(
        `/api/ingresos?restauranteId=${restauranteId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setIngresos(data.data);
        // console.log("💰 Ingresos cargados:", data.data);
      } else {
        throw new Error(data.error || "Error al obtener los ingresos");
      }
    } catch (err) {
      handleAPIError(err, "fetchIngresos");
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo ingreso
  const crearIngreso = async (
    tipoIngreso,
    motivo,
    monto,
    formaIngreso,
    fecha,
    opcionPago
  ) => {
    setLoading(true);
    clearError();
    try {
      const restauranteId = getRestaurantId();

      // Validar que fecha sea un objeto Date válido
      const fechaValida =
        fecha instanceof Date ? fecha : new Date(fecha || Date.now());

      const response = await fetch("/api/ingresos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          tipoIngreso,
          motivo,
          monto,
          formaIngreso,
          fecha: fechaValida.toISOString(),
          opcionPago,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear el ingreso");
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Ingreso creado:", data.data);

        // Incrementar contador de ventas si es una venta de takeaway o delivery
        if (
          tipoIngreso === "Venta Takeaway" ||
          tipoIngreso === "Venta Delivery"
        ) {
          try {
            const { db } = await import("../../lib/firebase");
            const { doc, getDoc, setDoc, updateDoc, serverTimestamp } =
              await import("firebase/firestore");

            const tipoVenta =
              tipoIngreso === "Venta Takeaway" ? "takeaway" : "delivery";
            const mesActual = `${new Date().getFullYear()}-${String(
              new Date().getMonth() + 1
            ).padStart(2, "0")}`;
            const contadoresRef = doc(
              db,
              "restaurantes",
              restauranteId,
              "contadoresVentas",
              mesActual
            );
            const contadoresSnap = await getDoc(contadoresRef);

            if (contadoresSnap.exists()) {
              const data = contadoresSnap.data();
              const nuevoValor = (data[tipoVenta] || 0) + 1;
              await updateDoc(contadoresRef, {
                [tipoVenta]: nuevoValor,
                updatedAt: serverTimestamp(),
              });
            } else {
              await setDoc(contadoresRef, {
                salon: 0,
                takeaway: tipoVenta === "takeaway" ? 1 : 0,
                delivery: tipoVenta === "delivery" ? 1 : 0,
                mes: mesActual,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
            // Además actualizar contador diario
            try {
              const fecha = new Date();
              const fechaStr = `${fecha.getFullYear()}-${String(
                fecha.getMonth() + 1
              ).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
              const mesStr = mesActual;
              const dailyRef = doc(
                db,
                "restaurantes",
                restauranteId,
                "contadoresVentasDaily",
                fechaStr
              );
              const dailySnap = await getDoc(dailyRef);

              if (dailySnap.exists()) {
                const ddata = dailySnap.data();
                const nuevo = (ddata[tipoVenta] || 0) + 1;
                await updateDoc(dailyRef, {
                  [tipoVenta]: nuevo,
                  updatedAt: serverTimestamp(),
                });
              } else {
                await setDoc(dailyRef, {
                  fecha: fechaStr,
                  mes: mesStr,
                  salon: 0,
                  takeaway: tipoVenta === "takeaway" ? 1 : 0,
                  delivery: tipoVenta === "delivery" ? 1 : 0,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
              }
            } catch (dailyErr) {
              console.error(
                "Error actualizando contador diario (ingresos):",
                dailyErr
              );
            }
          } catch (err) {
            console.error("Error incrementando contador de ventas:", err);
            // No lanzar error para no interrumpir el flujo principal
          }
        }

        // Recargar los ingresos después de crear uno nuevo
        await fetchIngresos();
        return data.data;
      } else {
        throw new Error(data.error || "Error al crear el ingreso");
      }
    } catch (err) {
      handleAPIError(err, "crearIngreso");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un ingreso existente
  const actualizarIngreso = async (
    ingresoId,
    tipoIngreso,
    motivo,
    monto,
    formaIngreso,
    fecha
  ) => {
    setLoading(true);
    clearError();
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch("/api/ingresos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          ingresoId,
          tipoIngreso,
          motivo,
          monto,
          formaIngreso,
          fecha: fecha.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el ingreso");
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Ingreso actualizado:", data.data);
        // Recargar los ingresos después de actualizar
        await fetchIngresos();
        return data.data;
      } else {
        throw new Error(data.error || "Error al actualizar el ingreso");
      }
    } catch (err) {
      handleAPIError(err, "actualizarIngreso");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un ingreso
  const eliminarIngreso = async (ingresoId) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch(
        `/api/ingresos?restauranteId=${restauranteId}&ingresoId=${ingresoId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el ingreso");
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Ingreso eliminado");
        // Recargar los ingresos después de eliminar
        await fetchIngresos();
        return true;
      } else {
        throw new Error(data.error || "Error al eliminar el ingreso");
      }
    } catch (err) {
      console.error("Error deleting ingreso:", err);
      setError("Error al eliminar el ingreso");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Formatear el dinero para mostrar
  const formatDinero = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  // Obtener el total de ingresos
  const getTotalIngresos = () => {
    return ingresos.totalIngresos || 0;
  };

  // Obtener todos los ingresos
  const getIngresos = () => {
    return ingresos.ingresos || [];
  };

  // Obtener tipos únicos de ingresos para autocompletado
  const getTiposIngreso = () => {
    const tipos = ingresos.tipos || [];
    return [...new Set(tipos)];
  };

  // Cargar datos al inicializar
  useEffect(() => {
    fetchIngresos();
  }, []);

  return {
    ingresos,
    loading,
    error,
    fetchIngresos,
    crearIngreso,
    actualizarIngreso,
    eliminarIngreso,
    formatDinero,
    getTotalIngresos,
    getIngresos,
    getTiposIngreso,
  };
};
