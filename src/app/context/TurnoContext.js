"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const TurnoContext = createContext();

export const TurnoProvider = ({ children }) => {
  const [turnoAbierto, setTurnoAbierto] = useState(false);
  const [turnoInfo, setTurnoInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { usuario } = useAuth();
  
  // Obtener rol para verificar si es cocina (siempre tiene turno abierto)
  const getCurrentRole = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rol");
    }
    return null;
  };

  // Cargar estado del turno desde localStorage al inicializar
  useEffect(() => {
    const cargarTurno = () => {
      if (typeof window !== "undefined") {
        try {
          const rolActual = getCurrentRole();
          
          // Si el rol es cocina, siempre tiene turno abierto
          if (rolActual?.toLowerCase() === "cocina") {
            const usuarioLocal = localStorage.getItem("usuario");
            const nombreCompleto = localStorage.getItem("nombreCompleto");
            const restauranteId = localStorage.getItem("restauranteId");
            
            setTurnoInfo({
              abierto: true,
              usuario: nombreCompleto || usuarioLocal || "Cocina",
              horaApertura: new Date().toLocaleString("es-ES", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
              timestamp: Date.now(),
              restauranteId: restauranteId || null,
            });
            setTurnoAbierto(true);
            setLoading(false);
            return;
          }
          
          // Para otros roles, cargar turno normalmente
          const turnoGuardado = localStorage.getItem("turnoInfo");
          if (turnoGuardado) {
            const turnoData = JSON.parse(turnoGuardado);

            // Validar que el turno no sea muy antiguo (más de 24 horas)
            const ahora = Date.now();
            const veinticuatroHoras = 24 * 60 * 60 * 1000;

            if (
              turnoData.timestamp &&
              ahora - turnoData.timestamp > veinticuatroHoras
            ) {
              console.log("Turno muy antiguo, cerrando automáticamente");
              localStorage.removeItem("turnoInfo");
              setTurnoAbierto(false);
              setTurnoInfo(null);
            } else {
              setTurnoAbierto(turnoData.abierto);
              setTurnoInfo(turnoData);
            }
          }
        } catch (error) {
          console.error("Error al cargar turno desde localStorage:", error);
          localStorage.removeItem("turnoInfo");
        } finally {
          setLoading(false);
        }
      }
    };

    cargarTurno();
  }, []);

  const abrirTurno = () => {
    // Si es cocina, siempre tiene turno abierto, no necesita abrir turno
    const rolActual = getCurrentRole();
    if (rolActual?.toLowerCase() === "cocina") {
      return true;
    }
    
    // Obtener usuario directamente del localStorage para evitar problemas de sincronización
    const usuarioLocal = localStorage.getItem("usuario");
    const nombreCompleto = localStorage.getItem("nombreCompleto");
    const restauranteId = localStorage.getItem("restauranteId");
    
    if (!usuarioLocal) {
      console.error("No hay usuario autenticado para abrir turno");
      console.log("🔍 Debug - localStorage actual:", {
        usuario: localStorage.getItem("usuario"),
        nombreCompleto: localStorage.getItem("nombreCompleto"),
        restauranteId: localStorage.getItem("restauranteId"),
        usuarioId: localStorage.getItem("usuarioId"),
        rol: localStorage.getItem("rol")
      });
      return false;
    }

    const nuevaInfoTurno = {
      abierto: true,
      usuario: nombreCompleto || usuarioLocal,
      horaApertura: new Date().toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: Date.now(),
      restauranteId: restauranteId || null,
    };

    try {
      setTurnoAbierto(true);
      setTurnoInfo(nuevaInfoTurno);
      localStorage.setItem("turnoInfo", JSON.stringify(nuevaInfoTurno));
      console.log("Turno abierto exitosamente:", nuevaInfoTurno);
      return true;
    } catch (error) {
      console.error("Error al abrir turno:", error);
      return false;
    }
  };

  const cerrarTurno = () => {
    // Si es cocina, no puede cerrar turno (siempre está abierto)
    const rolActual = getCurrentRole();
    if (rolActual?.toLowerCase() === "cocina") {
      console.log("El rol cocina no puede cerrar turno (siempre está abierto)");
      return true; // Retornamos true porque técnicamente el turno siempre está "abierto" para cocina
    }
    
    if (!turnoInfo) {
      console.error("No hay información de turno para cerrar");
      return false;
    }

    const turnoCerrado = {
      abierto: false,
      usuario: turnoInfo.usuario,
      horaApertura: turnoInfo.horaApertura,
      horaCierre: new Date().toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: Date.now(),
      restauranteId: turnoInfo.restauranteId,
    };

    try {
      setTurnoAbierto(false);
      setTurnoInfo(turnoCerrado);
      localStorage.setItem("turnoInfo", JSON.stringify(turnoCerrado));
      console.log("Turno cerrado exitosamente:", turnoCerrado);
      return true;
    } catch (error) {
      console.error("Error al cerrar turno:", error);
      return false;
    }
  };

  const obtenerDuracionTurno = () => {
    if (!turnoInfo?.timestamp) return "0 min";

    const ahora = Date.now();
    const duracionMs = ahora - turnoInfo.timestamp;
    const duracionMin = Math.floor(duracionMs / (1000 * 60));

    if (duracionMin < 60) {
      return `${duracionMin} min`;
    } else {
      const horas = Math.floor(duracionMin / 60);
      const minutos = duracionMin % 60;
      return `${horas}h ${minutos}min`;
    }
  };

  const limpiarTurno = () => {
    try {
      localStorage.removeItem("turnoInfo");
      setTurnoAbierto(false);
      setTurnoInfo(null);
      console.log("Turno limpiado exitosamente");
      return true;
    } catch (error) {
      console.error("Error al limpiar turno:", error);
      return false;
    }
  };

  if (loading) {
    return (
      <TurnoContext.Provider
        value={{
          turnoAbierto: false,
          turnoInfo: null,
          abrirTurno: () => false,
          cerrarTurno: () => false,
          obtenerDuracionTurno: () => "0 min",
          limpiarTurno: () => false,
          loading: true,
        }}
      >
        {children}
      </TurnoContext.Provider>
    );
  }

  return (
    <TurnoContext.Provider
      value={{
        turnoAbierto,
        turnoInfo,
        abrirTurno,
        cerrarTurno,
        obtenerDuracionTurno,
        limpiarTurno,
        loading: false,
      }}
    >
      {children}
    </TurnoContext.Provider>
  );
};

export const useTurno = () => {
  const context = useContext(TurnoContext);
  if (!context) {
    throw new Error("useTurno debe ser usado dentro de TurnoProvider");
  }
  return context;
};
