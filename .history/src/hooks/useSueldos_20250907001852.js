import { useState, useEffect, useCallback, useMemo } from "react";

export const useSueldos = () => {
  const [sueldos, setSueldos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSueldos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) {
        console.log("❌ No hay restaurante seleccionado");
        setSueldos([]);
        return;
      }

      const response = await fetch(
        `/api/sueldos?restauranteId=${restauranteId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al obtener sueldos");
      }

      if (data.success) {
        console.log("✅ Sueldos obtenidos exitosamente:", data.data);
        setSueldos(data.data || []);
      } else {
        throw new Error(data.error || "Error al obtener sueldos");
      }
    } catch (err) {
      console.error("❌ Error obteniendo sueldos:", err);
      setError(err.message);
      setSueldos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTotalSueldos = useMemo(() => {
    try {
      if (!Array.isArray(sueldos) || sueldos.length === 0) {
        return 0;
      }

      const total = sueldos.reduce((sum, empleado) => {
        if (
          empleado.historialPagos &&
          typeof empleado.historialPagos === "object"
        ) {
          const empleadoTotal = Object.values(empleado.historialPagos).reduce(
            (empleadoSum, pago) => {
              return empleadoSum + (parseFloat(pago.total) || 0);
            },
            0
          );
          return sum + empleadoTotal;
        }
        return sum;
      }, 0);

      // console.log("💰 Total de sueldos calculado:", total);
      return total;
    } catch (error) {
      console.error("❌ Error calculando total de sueldos:", error);
      return 0;
    }
  }, [sueldos]);

  const getCantidadSueldos = useMemo(() => {
    try {
      if (!Array.isArray(sueldos) || sueldos.length === 0) {
        return 0;
      }

      const cantidad = sueldos.reduce((sum, empleado) => {
        if (
          empleado.historialPagos &&
          typeof empleado.historialPagos === "object"
        ) {
          return sum + Object.keys(empleado.historialPagos).length;
        }
        return sum;
      }, 0);

      console.log("👥 Cantidad de sueldos pagados:", cantidad);
      return cantidad;
    } catch (error) {
      console.error("❌ Error calculando cantidad de sueldos:", error);
      return 0;
    }
  }, [sueldos]);

  useEffect(() => {
    fetchSueldos();
  }, []); // Solo ejecutar una vez al montar

  return {
    sueldos,
    loading,
    error,
    fetchSueldos,
    getTotalSueldos,
    getCantidadSueldos,
  };
};
