"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, writeBatch } from "firebase/firestore";

// Configuraciones predefinidas de zonas
export const ZONE_CONFIGURATIONS = {
  ADENTRO_AFUERA: {
    id: "adentro_afuera",
    name: "Adentro / Afuera",
    zones: ["adentro", "afuera"],
    labels: {
      adentro: "Adentro",
      afuera: "Afuera",
    },
  },
  ADENTRO_PLANTAS: {
    id: "adentro_plantas",
    name: "Adentro Planta Baja / Adentro Planta Alta",
    zones: ["adentro_planta_baja", "adentro_planta_alta"],
    labels: {
      adentro_planta_baja: "Adentro Planta Baja",
      adentro_planta_alta: "Adentro Planta Alta",
    },
  },
  PLANTAS_AFUERA: {
    id: "plantas_afuera",
    name: "Planta Baja / Planta Alta / Afuera",
    zones: ["planta_baja", "planta_alta", "afuera"],
    labels: {
      planta_baja: "Planta Baja",
      planta_alta: "Planta Alta",
      afuera: "Afuera",
    },
  },
};

export const useRestaurantZones = () => {
  const [zonesConfig, setZonesConfig] = useState(null);
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

  // Cargar configuración de zonas
  const fetchZonesConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      const configRef = doc(db, "restaurantes", restaurantId, "configuracion", "zonas");

      const configSnap = await getDoc(configRef);

      if (configSnap.exists()) {
        const data = configSnap.data();
        setZonesConfig(data.configuracionId || "adentro_afuera");
      } else {
        // Configuración por defecto
        setZonesConfig("adentro_afuera");
      }
    } catch (err) {
      setError(`Error al cargar configuración de zonas: ${err.message}`);
      console.error("Error fetching zones config:", err);
      // Configuración por defecto en caso de error
      setZonesConfig("adentro_afuera");
    } finally {
      setLoading(false);
    }
  };

  // Migrar mesas cuando cambia la configuración de zonas
  const migrateTables = async (oldConfigId, newConfigId) => {
    try {
      const restaurantId = getRestaurantId();
      const tablesRef = collection(db, "restaurantes", restaurantId, "tables");
      const tablesSnapshot = await getDocs(tablesRef);

      if (tablesSnapshot.empty) {
        console.log("No hay mesas para migrar");
        return;
      }

      // Función para mapear zona antigua a nueva
      const mapZone = (oldZone, fromConfig, toConfig) => {
        // Si es la misma configuración, no cambiar
        if (fromConfig === toConfig) {
          return oldZone;
        }

        // De "Adentro/Afuera" a "Planta Baja/Planta Alta/Afuera"
        if (fromConfig === "adentro_afuera" && toConfig === "plantas_afuera") {
          if (oldZone === "adentro") return "planta_baja";
          if (oldZone === "afuera") return "afuera";
        }

        // De "Adentro/Afuera" a "Adentro Planta Baja/Adentro Planta Alta"
        if (fromConfig === "adentro_afuera" && toConfig === "adentro_plantas") {
          if (oldZone === "adentro") return "adentro_planta_baja";
          if (oldZone === "afuera") return "afuera"; // Mantener aunque no esté en la nueva config
        }

        // De "Planta Baja/Planta Alta/Afuera" a "Adentro/Afuera"
        if (fromConfig === "plantas_afuera" && toConfig === "adentro_afuera") {
          if (oldZone === "planta_baja") return "adentro";
          if (oldZone === "planta_alta") return "adentro";
          if (oldZone === "afuera") return "afuera";
        }

        // De "Planta Baja/Planta Alta/Afuera" a "Adentro Planta Baja/Adentro Planta Alta"
        if (fromConfig === "plantas_afuera" && toConfig === "adentro_plantas") {
          if (oldZone === "planta_baja") return "adentro_planta_baja";
          if (oldZone === "planta_alta") return "adentro_planta_alta";
          if (oldZone === "afuera") return "afuera"; // Mantener aunque no esté en la nueva config
        }

        // De "Adentro Planta Baja/Adentro Planta Alta" a "Adentro/Afuera"
        if (fromConfig === "adentro_plantas" && toConfig === "adentro_afuera") {
          if (oldZone === "adentro_planta_baja") return "adentro";
          if (oldZone === "adentro_planta_alta") return "adentro";
          if (oldZone === "afuera") return "afuera";
        }

        // De "Adentro Planta Baja/Adentro Planta Alta" a "Planta Baja/Planta Alta/Afuera"
        if (fromConfig === "adentro_plantas" && toConfig === "plantas_afuera") {
          if (oldZone === "adentro_planta_baja") return "planta_baja";
          if (oldZone === "adentro_planta_alta") return "planta_alta";
          if (oldZone === "afuera") return "afuera";
        }

        // Si no hay mapeo, mantener la zona actual
        return oldZone;
      };

      // Obtener configuración anterior
      const oldConfig = oldConfigId || "adentro_afuera";
      const newConfig = newConfigId;

      // Actualizar todas las mesas en un batch
      const batch = writeBatch(db);
      let updatesCount = 0;

      tablesSnapshot.docs.forEach((tableDoc) => {
        const tableData = tableDoc.data();
        const oldZone = tableData.lugar || "adentro";
        const newZone = mapZone(oldZone, oldConfig, newConfig);

        // Solo actualizar si cambió la zona
        if (oldZone !== newZone) {
          const tableRef = doc(db, "restaurantes", restaurantId, "tables", tableDoc.id);
          batch.update(tableRef, { lugar: newZone });
          updatesCount++;
          console.log(`Migrando mesa ${tableData.numero}: ${oldZone} -> ${newZone}`);
        }
      });

      if (updatesCount > 0) {
        await batch.commit();
        console.log(`✅ Migradas ${updatesCount} mesas a la nueva configuración`);
      } else {
        console.log("No hubo cambios en las zonas de las mesas");
      }
    } catch (err) {
      console.error("Error migrando mesas:", err);
      throw new Error(`Error al migrar mesas: ${err.message}`);
    }
  };

  // Guardar configuración de zonas y migrar mesas
  const saveZonesConfig = async (configId) => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      const configRef = doc(db, "restaurantes", restaurantId, "configuracion", "zonas");

      // Obtener configuración anterior
      const configSnap = await getDoc(configRef);
      const oldConfigId = configSnap.exists() 
        ? (configSnap.data().configuracionId || "adentro_afuera")
        : "adentro_afuera";

      const configKey = Object.keys(ZONE_CONFIGURATIONS).find(
        key => ZONE_CONFIGURATIONS[key].id === configId
      );
      const config = configKey ? ZONE_CONFIGURATIONS[configKey] : ZONE_CONFIGURATIONS.ADENTRO_AFUERA;

      // Guardar nueva configuración
      await setDoc(configRef, {
        configuracionId: configId,
        configuracion: config,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // Migrar mesas si cambió la configuración
      if (oldConfigId !== configId) {
        console.log(`🔄 Migrando mesas de ${oldConfigId} a ${configId}`);
        await migrateTables(oldConfigId, configId);
      }

      setZonesConfig(configId);
    } catch (err) {
      setError(`Error al guardar configuración de zonas: ${err.message}`);
      console.error("Error saving zones config:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener la configuración actual
  const getCurrentConfig = () => {
    if (!zonesConfig) return ZONE_CONFIGURATIONS.ADENTRO_AFUERA;
    
    const configKey = Object.keys(ZONE_CONFIGURATIONS).find(
      key => ZONE_CONFIGURATIONS[key].id === zonesConfig
    );
    
    return configKey 
      ? ZONE_CONFIGURATIONS[configKey]
      : ZONE_CONFIGURATIONS.ADENTRO_AFUERA;
  };

  // Obtener todas las configuraciones disponibles
  const getAvailableConfigurations = () => {
    return Object.values(ZONE_CONFIGURATIONS);
  };

  // Mapear zona antigua a nueva (para migración)
  const mapOldZoneToNew = (oldZone) => {
    const currentConfig = getCurrentConfig();
    
    // Si es la configuración por defecto, no hay que mapear
    if (zonesConfig === "adentro_afuera") {
      return oldZone;
    }

    // Mapeo para Adentro Planta Baja / Adentro Planta Alta
    if (zonesConfig === "adentro_plantas") {
      if (oldZone === "adentro") {
        // Por defecto, asignar a planta baja
        return "adentro_planta_baja";
      }
      if (oldZone === "afuera") {
        // Si había mesas afuera, mantenerlas (aunque no esté en la config)
        return oldZone;
      }
    }

    // Mapeo para Planta Baja / Planta Alta / Afuera
    if (zonesConfig === "plantas_afuera") {
      if (oldZone === "adentro") {
        // Por defecto, asignar a planta baja
        return "planta_baja";
      }
      // Mantener afuera como está
      if (oldZone === "afuera") {
        return "afuera";
      }
    }

    return oldZone;
  };

  useEffect(() => {
    fetchZonesConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    zonesConfig,
    loading,
    error,
    fetchZonesConfig,
    saveZonesConfig,
    getCurrentConfig,
    getAvailableConfigurations,
    mapOldZoneToNew,
  };
};

