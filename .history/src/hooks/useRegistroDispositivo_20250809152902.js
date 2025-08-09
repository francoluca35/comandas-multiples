"use client";
import { useEffect, useCallback } from "react";
import { useDispositivos } from "./useDispositivos";
import { useAuth } from "@/app/context/AuthContext";

export const useRegistroDispositivo = () => {
  const { registrarDispositivo, desconectarDispositivo } = useDispositivos();
  const { usuario } = useAuth();

  // Obtener información del dispositivo
  const obtenerInfoDispositivo = useCallback(() => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Detectar tipo de dispositivo
    let tipoDispositivo = "desktop";
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      tipoDispositivo = "mobile";
    } else if (/iPad|Android/i.test(userAgent)) {
      tipoDispositivo = "tablet";
    }

    // Detectar navegador
    let navegador = "unknown";
    if (userAgent.includes("Chrome")) navegador = "Chrome";
    else if (userAgent.includes("Firefox")) navegador = "Firefox";
    else if (userAgent.includes("Safari")) navegador = "Safari";
    else if (userAgent.includes("Edge")) navegador = "Edge";

    return {
      userAgent,
      platform,
      language,
      timezone,
      tipoDispositivo,
      navegador,
      resolucion: `${screen.width}x${screen.height}`,
      timestamp: new Date().toISOString(),
    };
  }, []);

  // Registrar dispositivo al conectar
  const conectarDispositivo = useCallback(async () => {
    if (!usuario?.id) return;

    try {
      const dispositivoInfo = obtenerInfoDispositivo();
      await registrarDispositivo(usuario.id, {
        ...dispositivoInfo,
        nombreUsuario: usuario.nombre || usuario.usuario,
        email: usuario.email,
        rol: usuario.rol,
      });

      console.log("✅ Dispositivo conectado:", usuario.id);
    } catch (error) {
      console.error("❌ Error conectando dispositivo:", error);
    }
  }, [usuario, registrarDispositivo, obtenerInfoDispositivo]);

  // Desconectar dispositivo al salir
  const desconectarDispositivoActual = useCallback(async () => {
    if (!usuario?.id) return;

    try {
      await desconectarDispositivo(usuario.id);
      console.log("✅ Dispositivo desconectado:", usuario.id);
    } catch (error) {
      console.error("❌ Error desconectando dispositivo:", error);
    }
  }, [usuario, desconectarDispositivo]);

  // Registrar dispositivo al montar el componente
  useEffect(() => {
    if (usuario?.id) {
      conectarDispositivo();
    }
  }, [usuario?.id, conectarDispositivo]);

  // Desconectar dispositivo al desmontar o cambiar usuario
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (usuario?.id) {
        desconectarDispositivoActual();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && usuario?.id) {
        // Usuario cambió de pestaña o minimizó
        desconectarDispositivoActual();
      } else if (!document.hidden && usuario?.id) {
        // Usuario volvió a la pestaña
        conectarDispositivo();
      }
    };

    // Eventos para detectar cuando el usuario sale
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      
      // Desconectar al limpiar
      if (usuario?.id) {
        desconectarDispositivoActual();
      }
    };
  }, [usuario?.id, conectarDispositivo, desconectarDispositivoActual]);

  return {
    conectarDispositivo,
    desconectarDispositivoActual,
    obtenerInfoDispositivo,
  };
};
