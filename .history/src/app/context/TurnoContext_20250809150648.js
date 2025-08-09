"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const TurnoContext = createContext();

export const TurnoProvider = ({ children }) => {
  const [turnoAbierto, setTurnoAbierto] = useState(false);
  const [turnoInfo, setTurnoInfo] = useState(null);
  const { usuario } = useAuth();

  // Cargar estado del turno desde localStorage al inicializar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const turnoGuardado = localStorage.getItem("turnoInfo");
      if (turnoGuardado) {
        try {
          const turnoData = JSON.parse(turnoGuardado);
          setTurnoAbierto(turnoData.abierto);
          setTurnoInfo(turnoData);
        } catch (error) {
          console.error("Error al cargar turno desde localStorage:", error);
        }
      }
    }
  }, []);

  const abrirTurno = () => {
    if (!usuario) return false;

    const nuevaInfoTurno = {
      abierto: true,
      usuario: usuario.usuario || usuario.email,
      horaApertura: new Date().toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: Date.now(),
    };

    setTurnoAbierto(true);
    setTurnoInfo(nuevaInfoTurno);

    // Guardar en localStorage
    localStorage.setItem("turnoInfo", JSON.stringify(nuevaInfoTurno));

    return true;
  };

  const cerrarTurno = () => {
    const turnoCerrado = {
      abierto: false,
      usuario: turnoInfo?.usuario,
      horaApertura: turnoInfo?.horaApertura,
      horaCierre: new Date().toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: Date.now(),
    };

    setTurnoAbierto(false);
    setTurnoInfo(turnoCerrado);

    // Guardar en localStorage
    localStorage.setItem("turnoInfo", JSON.stringify(turnoCerrado));
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

  return (
    <TurnoContext.Provider
      value={{
        turnoAbierto,
        turnoInfo,
        abrirTurno,
        cerrarTurno,
        obtenerDuracionTurno,
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
