"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from "firebase/firestore";

export const useRestaurantMonitoring = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [monitoringData, setMonitoringData] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    restaurantsWithIssues: 0,
    criticalIssues: 0,
    warnings: 0,
    lastScan: null,
    scanDuration: 0,
  });
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Detectar problemas comunes
  const detectIssues = useCallback(async (restaurantId, restaurantData) => {
    const restaurantIssues = [];
    const startTime = Date.now();

    try {
      // 1. Verificar estructura básica
      if (!restaurantData.nombre || !restaurantData.estado) {
        restaurantIssues.push({
          type: "critical",
          category: "structure",
          message: "Estructura de datos incompleta",
          details: "Faltan campos obligatorios (nombre, estado)",
        });
      }

      // 2. Verificar usuarios
      const usuariosRef = collection(db, "restaurantes", restaurantId, "usuarios");
      const usuariosSnap = await getDocs(usuariosRef);
      
      if (usuariosSnap.empty) {
        restaurantIssues.push({
          type: "warning",
          category: "users",
          message: "Sin usuarios registrados",
          details: "El restaurante no tiene usuarios activos",
        });
      } else {
        // Verificar usuarios sin actividad reciente
        const usuarios = usuariosSnap.docs.map(doc => doc.data());
        const inactiveUsers = usuarios.filter(user => {
          const lastActivity = user.ultimaActividad?.toDate?.() || new Date(0);
          const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceActivity > 30;
        });

        if (inactiveUsers.length > 0) {
          restaurantIssues.push({
            type: "warning",
            category: "users",
            message: `${inactiveUsers.length} usuarios inactivos`,
            details: "Usuarios sin actividad en más de 30 días",
          });
        }
      }

      // 3. Verificar mesas
      const mesasRef = collection(db, "restaurantes", restaurantId, "mesas");
      const mesasSnap = await getDocs(mesasRef);
      
      if (mesasSnap.empty) {
        restaurantIssues.push({
          type: "warning",
          category: "tables",
          message: "Sin mesas configuradas",
          details: "El restaurante no tiene mesas definidas",
        });
      } else {
        // Verificar mesas con estado inconsistente
        const mesas = mesasSnap.docs.map(doc => doc.data());
        const inconsistentTables = mesas.filter(mesa => {
          return mesa.estado === "desconocido" || 
                 (mesa.estado === "ocupado" && (!mesa.productos || mesa.productos.length === 0)) ||
                 (mesa.estado === "libre" && mesa.productos && mesa.productos.length > 0);
        });

        if (inconsistentTables.length > 0) {
          restaurantIssues.push({
            type: "critical",
            category: "tables",
            message: `${inconsistentTables.length} mesas con estado inconsistente`,
            details: "Mesas con estado 'desconocido' o inconsistente",
          });
        }
      }

      // 4. Verificar productos
      const menuRef = collection(db, "restaurantes", restaurantId, "menus");
      const menuSnap = await getDocs(menuRef);
      
      if (menuSnap.empty) {
        restaurantIssues.push({
          type: "warning",
          category: "products",
          message: "Sin productos en menú",
          details: "El restaurante no tiene productos configurados",
        });
      }

      // 5. Verificar pedidos recientes (últimas 24h)
      const pedidosRef = collection(db, "restaurantes", restaurantId, "pedidos");
      const pedidosQuery = query(
        pedidosRef,
        where("fecha", ">=", new Date(Date.now() - 24 * 60 * 60 * 1000)),
        orderBy("fecha", "desc"),
        limit(10)
      );
      
      try {
        const pedidosSnap = await getDocs(pedidosQuery);
        const pedidos = pedidosSnap.docs.map(doc => doc.data());
        
        // Verificar pedidos sin completar
        const incompleteOrders = pedidos.filter(pedido => 
          pedido.estado === "pendiente" || pedido.estado === "en_proceso"
        );

        if (incompleteOrders.length > 5) {
          restaurantIssues.push({
            type: "warning",
            category: "orders",
            message: `${incompleteOrders.length} pedidos sin completar`,
            details: "Muchos pedidos pendientes en las últimas 24h",
          });
        }
      } catch (error) {
        // Si hay error al consultar pedidos, puede ser un problema de permisos o estructura
        restaurantIssues.push({
          type: "critical",
          category: "orders",
          message: "Error al consultar pedidos",
          details: "Problema de permisos o estructura de datos",
        });
      }

      // 6. Verificar configuración de pagos
      const pagosRef = doc(db, "restaurantes", restaurantId, "configuracion", "pagos");
      try {
        const pagosSnap = await getDoc(pagosRef);
        if (!pagosSnap.exists()) {
          restaurantIssues.push({
            type: "warning",
            category: "payments",
            message: "Sin configuración de pagos",
            details: "No hay configuración de métodos de pago",
          });
        }
      } catch (error) {
        restaurantIssues.push({
          type: "warning",
          category: "payments",
          message: "Error en configuración de pagos",
          details: "Problema al acceder a configuración de pagos",
        });
      }

      // 7. Verificar rendimiento (tiempo de respuesta)
      const scanTime = Date.now() - startTime;
      if (scanTime > 5000) {
        restaurantIssues.push({
          type: "critical",
          category: "performance",
          message: "Rendimiento lento",
          details: `Tiempo de escaneo: ${scanTime}ms (más de 5 segundos)`,
        });
      }

    } catch (error) {
      restaurantIssues.push({
        type: "critical",
        category: "system",
        message: "Error de sistema",
        details: `Error al escanear restaurante: ${error.message}`,
      });
    }

    return restaurantIssues;
  }, []);

  // Escanear todos los restaurantes
  const scanAllRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      console.log("🔍 Iniciando escaneo de restaurantes...");
      
      const restaurantsRef = collection(db, "restaurantes");
      const restaurantsSnap = await getDocs(restaurantsRef);
      
      const restaurantsData = [];
      const allIssues = [];
      let activeCount = 0;
      let issuesCount = 0;
      let criticalCount = 0;
      let warningsCount = 0;

      for (const doc of restaurantsSnap.docs) {
        const restaurantData = doc.data();
        const restaurantId = doc.id;
        
        // Verificar si el restaurante está activo
        const isActive = restaurantData.estado === "activo" || restaurantData.estado === "habilitado";
        if (isActive) activeCount++;

        // Detectar problemas
        const restaurantIssues = await detectIssues(restaurantId, restaurantData);
        
        if (restaurantIssues.length > 0) {
          issuesCount++;
          restaurantIssues.forEach(issue => {
            if (issue.type === "critical") criticalCount++;
            if (issue.type === "warning") warningsCount++;
          });
        }

        // Agregar datos del restaurante (sin información sensible)
        restaurantsData.push({
          id: restaurantId,
          nombre: restaurantData.nombre || "Sin nombre",
          estado: restaurantData.estado || "desconocido",
          fechaCreacion: restaurantData.fechaCreacion?.toDate?.() || new Date(),
          ultimaActividad: restaurantData.ultimaActividad?.toDate?.() || new Date(),
          issues: restaurantIssues,
          hasIssues: restaurantIssues.length > 0,
          criticalIssues: restaurantIssues.filter(i => i.type === "critical").length,
          warnings: restaurantIssues.filter(i => i.type === "warning").length,
        });

        allIssues.push(...restaurantIssues.map(issue => ({
          ...issue,
          restaurantId,
          restaurantName: restaurantData.nombre || "Sin nombre",
        })));
      }

      const scanDuration = Date.now() - startTime;

      setRestaurants(restaurantsData);
      setIssues(allIssues);
      setMonitoringData({
        totalRestaurants: restaurantsSnap.size,
        activeRestaurants: activeCount,
        restaurantsWithIssues: issuesCount,
        criticalIssues: criticalCount,
        warnings: warningsCount,
        lastScan: new Date(),
        scanDuration,
      });

      console.log("✅ Escaneo completado:", {
        total: restaurantsSnap.size,
        active: activeCount,
        withIssues: issuesCount,
        critical: criticalCount,
        warnings: warningsCount,
        duration: scanDuration,
      });

    } catch (error) {
      console.error("❌ Error en escaneo:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [detectIssues]);

  // Escanear restaurante específico
  const scanRestaurant = useCallback(async (restaurantId) => {
    try {
      const restaurantRef = doc(db, "restaurantes", restaurantId);
      const restaurantSnap = await getDoc(restaurantRef);
      
      if (!restaurantSnap.exists()) {
        throw new Error("Restaurante no encontrado");
      }

      const restaurantData = restaurantSnap.data();
      const issues = await detectIssues(restaurantId, restaurantData);

      return {
        id: restaurantId,
        nombre: restaurantData.nombre || "Sin nombre",
        estado: restaurantData.estado || "desconocido",
        issues,
        hasIssues: issues.length > 0,
        criticalIssues: issues.filter(i => i.type === "critical").length,
        warnings: issues.filter(i => i.type === "warning").length,
      };
    } catch (error) {
      console.error("Error escaneando restaurante:", error);
      throw error;
    }
  }, [detectIssues]);

  // Obtener estadísticas por categoría
  const getIssuesByCategory = useCallback(() => {
    const categories = {};
    issues.forEach(issue => {
      if (!categories[issue.category]) {
        categories[issue.category] = { critical: 0, warning: 0 };
      }
      categories[issue.category][issue.type]++;
    });
    return categories;
  }, [issues]);

  // Obtener restaurantes con problemas críticos
  const getCriticalRestaurants = useCallback(() => {
    return restaurants.filter(restaurant => restaurant.criticalIssues > 0);
  }, [restaurants]);

  // Obtener restaurantes sin problemas
  const getHealthyRestaurants = useCallback(() => {
    return restaurants.filter(restaurant => restaurant.issues.length === 0);
  }, [restaurants]);

  useEffect(() => {
    // Escanear automáticamente al montar el componente
    scanAllRestaurants();
  }, [scanAllRestaurants]);

  return {
    restaurants,
    monitoringData,
    issues,
    loading,
    error,
    scanAllRestaurants,
    scanRestaurant,
    getIssuesByCategory,
    getCriticalRestaurants,
    getHealthyRestaurants,
  };
};
