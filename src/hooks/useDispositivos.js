"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export const useDispositivos = () => {
  const [dispositivos, setDispositivos] = useState([]);
  const [usuariosActivos, setUsuariosActivos] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener el restauranteId del localStorage
  const getRestaurantId = () => {
    const restauranteId = localStorage.getItem("restauranteId");
    if (!restauranteId) {
      throw new Error("No hay restaurante seleccionado");
    }
    return restauranteId;
  };

  // Registrar dispositivo conectado
  const registrarDispositivo = useCallback(async (usuarioId, dispositivoInfo) => {
    try {
      const restauranteId = getRestaurantId();
      const dispositivoRef = doc(
        db,
        `restaurantes/${restauranteId}/dispositivos`,
        usuarioId
      );

      await setDoc(dispositivoRef, {
        ...dispositivoInfo,
        usuarioId,
        restauranteId,
        conectado: true,
        ultimaConexion: serverTimestamp(),
        timestamp: serverTimestamp(),
      });

      console.log("✅ Dispositivo registrado:", usuarioId);
    } catch (error) {
      console.error("❌ Error registrando dispositivo:", error);
      throw error;
    }
  }, []);

  // Desconectar dispositivo
  const desconectarDispositivo = useCallback(async (usuarioId) => {
    try {
      const restauranteId = getRestaurantId();
      const dispositivoRef = doc(
        db,
        `restaurantes/${restauranteId}/dispositivos`,
        usuarioId
      );

      await updateDoc(dispositivoRef, {
        conectado: false,
        ultimaDesconexion: serverTimestamp(),
        timestamp: serverTimestamp(),
      });

      console.log("✅ Dispositivo desconectado:", usuarioId);
    } catch (error) {
      console.error("❌ Error desconectando dispositivo:", error);
      throw error;
    }
  }, []);

  // Obtener dispositivos conectados
  const obtenerDispositivos = useCallback(async () => {
    try {
      const restauranteId = getRestaurantId();
      const dispositivosRef = collection(
        db,
        `restaurantes/${restauranteId}/dispositivos`
      );
      
      const q = query(
        dispositivosRef,
        where("conectado", "==", true),
        orderBy("ultimaConexion", "desc")
      );

      const snapshot = await getDocs(q);
      const dispositivosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDispositivos(dispositivosData);
      return dispositivosData;
    } catch (error) {
      console.error("❌ Error obteniendo dispositivos:", error);
      setError(error.message);
      return [];
    }
  }, []);

  // Obtener usuarios activos
  const obtenerUsuariosActivos = useCallback(async () => {
    try {
      const restauranteId = getRestaurantId();
      const usuariosRef = collection(
        db,
        `restaurantes/${restauranteId}/users`
      );

      const snapshot = await getDocs(usuariosRef);
      const usuariosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filtrar solo usuarios activos
      const usuariosActivos = usuariosData.filter((user) => user.activo);
      setUsuariosActivos(usuariosActivos);
      return usuariosActivos;
    } catch (error) {
      console.error("❌ Error obteniendo usuarios activos:", error);
      setError(error.message);
      return [];
    }
  }, []);

  // Enviar mensaje a todos los usuarios
  const enviarMensajeATodos = useCallback(async (mensaje, adminId) => {
    try {
      const restauranteId = getRestaurantId();
      const timestamp = serverTimestamp();
      
      // Crear mensaje en la colección de mensajes
      const mensajeRef = doc(
        db,
        `restaurantes/${restauranteId}/mensajes`,
        `mensaje_${Date.now()}`
      );

      await setDoc(mensajeRef, {
        mensaje,
        adminId,
        timestamp,
        leido: false,
        tipo: "global",
        restauranteId,
      });

      // Marcar mensaje como pendiente para todos los usuarios
      const usuariosRef = collection(
        db,
        `restaurantes/${restauranteId}/users`
      );
      const snapshot = await getDocs(usuariosRef);

      const batch = [];
      snapshot.docs.forEach((userDoc) => {
        const userData = userDoc.data();
        if (userData.activo) {
          const mensajeUsuarioRef = doc(
            db,
            `restaurantes/${restauranteId}/usuarios/${userDoc.id}/mensajes`,
            `mensaje_${Date.now()}`
          );
          batch.push(
            setDoc(mensajeUsuarioRef, {
              mensaje,
              adminId,
              timestamp,
              leido: false,
              tipo: "global",
              restauranteId,
            })
          );
        }
      });

      // Ejecutar batch
      await Promise.all(batch);

      console.log("✅ Mensaje enviado a todos los usuarios");
      return true;
    } catch (error) {
      console.error("❌ Error enviando mensaje:", error);
      setError(error.message);
      throw error;
    }
  }, []);

  // Obtener mensajes del usuario
  const obtenerMensajesUsuario = useCallback(async (usuarioId) => {
    try {
      const restauranteId = getRestaurantId();
      const mensajesRef = collection(
        db,
        `restaurantes/${restauranteId}/usuarios/${usuarioId}/mensajes`
      );

      const q = query(
        mensajesRef,
        where("leido", "==", false),
        orderBy("timestamp", "desc")
      );

      const snapshot = await getDocs(q);
      const mensajesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return mensajesData;
    } catch (error) {
      console.error("❌ Error obteniendo mensajes del usuario:", error);
      return [];
    }
  }, []);

  // Marcar mensaje como leído
  const marcarMensajeLeido = useCallback(async (usuarioId, mensajeId) => {
    try {
      const restauranteId = getRestaurantId();
      const mensajeRef = doc(
        db,
        `restaurantes/${restauranteId}/usuarios/${usuarioId}/mensajes`,
        mensajeId
      );

      await updateDoc(mensajeRef, {
        leido: true,
        fechaLectura: serverTimestamp(),
      });

      console.log("✅ Mensaje marcado como leído");
    } catch (error) {
      console.error("❌ Error marcando mensaje como leído:", error);
      throw error;
    }
  }, []);

  // Obtener estadísticas de dispositivos
  const obtenerEstadisticas = useCallback(async () => {
    try {
      const restauranteId = getRestaurantId();
      const cantUsuarios = parseInt(localStorage.getItem("cantUsuarios")) || 0;
      
      const dispositivosConectados = dispositivos.filter(d => d.conectado).length;
      const usuariosDisponibles = cantUsuarios - usuariosActivos.length;

      return {
        dispositivosConectados,
        usuariosActivos: usuariosActivos.length,
        usuariosDisponibles,
        totalPermitidos: cantUsuarios,
        porcentajeUso: cantUsuarios > 0 ? Math.round((usuariosActivos.length / cantUsuarios) * 100) : 0,
      };
    } catch (error) {
      console.error("❌ Error obteniendo estadísticas:", error);
      return {
        dispositivosConectados: 0,
        usuariosActivos: 0,
        usuariosDisponibles: 0,
        totalPermitidos: 0,
        porcentajeUso: 0,
      };
    }
  }, [dispositivos, usuariosActivos]);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    const restauranteId = getRestaurantId();
    
    // Suscripción a dispositivos
    const dispositivosRef = collection(
      db,
      `restaurantes/${restauranteId}/dispositivos`
    );
    
    const unsubscribeDispositivos = onSnapshot(
      dispositivosRef,
      (snapshot) => {
        const dispositivosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDispositivos(dispositivosData);
      },
      (error) => {
        console.error("❌ Error en suscripción a dispositivos:", error);
        setError(error.message);
      }
    );

    // Suscripción a usuarios
    const usuariosRef = collection(
      db,
      `restaurantes/${restauranteId}/users`
    );
    
    const unsubscribeUsuarios = onSnapshot(
      usuariosRef,
      (snapshot) => {
        const usuariosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const usuariosActivos = usuariosData.filter((user) => user.activo);
        setUsuariosActivos(usuariosActivos);
      },
      (error) => {
        console.error("❌ Error en suscripción a usuarios:", error);
        setError(error.message);
      }
    );

    setLoading(false);

    return () => {
      unsubscribeDispositivos();
      unsubscribeUsuarios();
    };
  }, []);

  return {
    dispositivos,
    usuariosActivos,
    mensajes,
    loading,
    error,
    registrarDispositivo,
    desconectarDispositivo,
    obtenerDispositivos,
    obtenerUsuariosActivos,
    enviarMensajeATodos,
    obtenerMensajesUsuario,
    marcarMensajeLeido,
    obtenerEstadisticas,
  };
};
