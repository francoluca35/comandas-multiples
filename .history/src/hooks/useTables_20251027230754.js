import { useState, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export const useTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener el restauranteId del localStorage
  const getRestaurantId = () => {
    const restauranteId = localStorage.getItem("restauranteId");
    const nombreResto = localStorage.getItem("nombreResto");

    if (!restauranteId || !nombreResto) {
      throw new Error("No hay restaurante seleccionado");
    }

    // Verificar que el restauranteId coincide con el nombre del restaurante
    const expectedRestauranteId = nombreResto
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    if (expectedRestauranteId !== restauranteId) {
      throw new Error("ID del restaurante no válido");
    }

    console.log("🏪 Usando restauranteId para mesas:", restauranteId);
    return restauranteId;
  };

  // Obtener todas las mesas
  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const restaurantId = getRestaurantId();
      console.log("🔍 Obteniendo mesas para restaurante:", restaurantId);

      const tablesRef = collection(db, "restaurantes", restaurantId, "tables");
      const q = query(tablesRef, orderBy("numero"));
      const querySnapshot = await getDocs(q);

      const tablesData = [];
      querySnapshot.forEach((doc) => {
        tablesData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log("✅ Mesas encontradas:", tablesData);
      setTables(tablesData);
    } catch (err) {
      console.error("Error fetching tables:", err);
      setError("Error al cargar las mesas");
    } finally {
      setLoading(false);
    }
  };

  // Configurar listener en tiempo real para mesas
  const setupRealtimeListener = () => {
    try {
      const restaurantId = getRestaurantId();
      console.log("🔔 Configurando listener en tiempo real para mesas:", restaurantId);

      const tablesRef = collection(db, "restaurantes", restaurantId, "tables");
      const q = query(tablesRef, orderBy("numero"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        console.log("🔄 Actualización en tiempo real de mesas detectada");
        const tablesData = [];
        querySnapshot.forEach((doc) => {
          tablesData.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        console.log("✅ Mesas actualizadas:", tablesData);
        setTables(tablesData);
      }, (error) => {
        console.error("❌ Error en listener de mesas:", error);
        setError("Error en actualización en tiempo real");
      });

      return unsubscribe;
    } catch (err) {
      console.error("Error configurando listener:", err);
      return null;
    }
  };

  // Crear nueva mesa
  const createTable = async (tableData) => {
    setLoading(true);
    setError(null);
    try {
      const restaurantId = getRestaurantId();
      const tablesRef = collection(db, "restaurantes", restaurantId, "tables");

      const newTable = {
        numero: tableData.numero,
        lugar: tableData.lugar || "adentro", // Incluir el campo lugar
        estado: "libre",
        cliente: "",
        productos: {},
        total: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(tablesRef, newTable);

      // Agregar la nueva mesa al estado local
      setTables((prev) => [...prev, { id: docRef.id, ...newTable }]);

      return docRef.id;
    } catch (err) {
      console.error("Error creating table:", err);
      setError("Error al crear la mesa");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar mesa
  const updateTable = async (tableId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const restaurantId = getRestaurantId();
      const tableRef = doc(db, "restaurantes", restaurantId, "tables", tableId);

      const updateFields = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(tableRef, updateFields);

      // Actualizar la mesa en el estado local
      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId ? { ...table, ...updateFields } : table
        )
      );
    } catch (err) {
      console.error("Error updating table:", err);
      setError("Error al actualizar la mesa");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar mesa
  const deleteTable = async (tableId) => {
    setLoading(true);
    setError(null);
    try {
      const restaurantId = getRestaurantId();
      const tableRef = doc(db, "restaurantes", restaurantId, "tables", tableId);
      await deleteDoc(tableRef);

      // Eliminar la mesa del estado local
      setTables((prev) => prev.filter((table) => table.id !== tableId));

      // No reordenar automáticamente - el usuario decidirá
      // await reorderAllTablesAfterDelete();
      // await fetchTables();
    } catch (err) {
      console.error("Error deleting table:", err);
      setError("Error al eliminar la mesa");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener una mesa específica
  const getTable = async (tableId) => {
    setLoading(true);
    setError(null);
    try {
      const restaurantId = getRestaurantId();
      const tableRef = doc(db, "restaurantes", restaurantId, "tables", tableId);
      const tableDoc = await getDoc(tableRef);

      if (tableDoc.exists()) {
        return { id: tableDoc.id, ...tableDoc.data() };
      } else {
        throw new Error("Mesa no encontrada");
      }
    } catch (err) {
      console.error("Error getting table:", err);
      setError("Error al obtener la mesa");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estado de mesa (libre/ocupado)
  const updateTableStatus = async (tableId, status, clientData = null) => {
    setLoading(true);
    setError(null);
    try {
      const restaurantId = getRestaurantId();
      const tableRef = doc(db, "restaurantes", restaurantId, "tables", tableId);

      const updateFields = {
        estado: status,
        updatedAt: serverTimestamp(),
      };

      if (clientData) {
        updateFields.cliente = clientData;
      }

      await updateDoc(tableRef, updateFields);

      // Actualizar la mesa en el estado local
      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId ? { ...table, ...updateFields } : table
        )
      );
    } catch (err) {
      console.error("Error updating table status:", err);
      setError("Error al actualizar el estado de la mesa");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Agregar productos a una mesa
  const addProductsToTable = async (tableId, products, total) => {
    setLoading(true);
    setError(null);
    try {
      const restaurantId = getRestaurantId();
      const tableRef = doc(db, "restaurantes", restaurantId, "tables", tableId);

      const updateFields = {
        productos: products,
        total: total,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(tableRef, updateFields);

      // Actualizar la mesa en el estado local
      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId ? { ...table, ...updateFields } : table
        )
      );
    } catch (err) {
      console.error("Error adding products to table:", err);
      setError("Error al agregar productos a la mesa");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Limpiar mesa (resetear a estado libre)
  const clearTable = async (tableId) => {
    setLoading(true);
    setError(null);
    try {
      const restaurantId = getRestaurantId();
      const tableRef = doc(db, "restaurantes", restaurantId, "tables", tableId);

      // Obtener la mesa actual para preservar el campo lugar
      const tableDoc = await getDoc(tableRef);
      const currentTable = tableDoc.data();

      const updateFields = {
        estado: "libre",
        cliente: "",
        productos: {},
        total: 0,
        lugar: currentTable.lugar || "adentro", // Preservar el campo lugar
        updatedAt: serverTimestamp(),
      };

      await updateDoc(tableRef, updateFields);

      // Actualizar la mesa en el estado local
      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId ? { ...table, ...updateFields } : table
        )
      );
    } catch (err) {
      console.error("Error clearing table:", err);
      setError("Error al limpiar la mesa");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Marcar mesa como pagada
  const markTableAsPaid = async (tableId) => {
    setLoading(true);
    setError(null);
    try {
      const restaurantId = getRestaurantId();
      const tableRef = doc(db, "restaurantes", restaurantId, "tables", tableId);

      const updateFields = {
        estado: "pagado",
        updatedAt: serverTimestamp(),
      };

      await updateDoc(tableRef, updateFields);

      // Actualizar la mesa en el estado local
      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId ? { ...table, ...updateFields } : table
        )
      );
    } catch (err) {
      console.error("Error marking table as paid:", err);
      setError("Error al marcar la mesa como pagada");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Marcar mesa como servida (comida lista)
  const markTableAsServed = async (tableId) => {
    setLoading(true);
    setError(null);
    try {
      const restaurantId = getRestaurantId();
      const tableRef = doc(db, "restaurantes", restaurantId, "tables", tableId);

      const updateFields = {
        estado: "servido",
        updatedAt: serverTimestamp(),
      };

      await updateDoc(tableRef, updateFields);

      // Actualizar la mesa en el estado local
      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId ? { ...table, ...updateFields } : table
        )
      );
    } catch (err) {
      console.error("Error marking table as served:", err);
      setError("Error al marcar la mesa como servida");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Generar número de mesa automático
  const generateTableNumber = () => {
    if (tables.length === 0) return "01";

    const numbers = tables.map((table) => parseInt(table.numero));
    const maxNumber = Math.max(...numbers);
    return String(maxNumber + 1).padStart(2, "0");
  };

  // Verificar si un número de mesa ya existe
  const isTableNumberExists = (numero) => {
    return tables.some((table) => table.numero === numero);
  };

  // Obtener mesas por ubicación
  const getTablesByLocation = (location) => {
    return tables.filter((table) => table.lugar === location);
  };

  // Obtener el último número de mesa en una ubicación
  const getLastTableNumberInLocation = (location) => {
    const locationTables = getTablesByLocation(location);
    if (locationTables.length === 0) return 0;

    const numbers = locationTables.map((table) => parseInt(table.numero));
    return Math.max(...numbers);
  };

  // Calcular cuántas mesas faltan para llegar a un número específico en una ubicación
  const calculateMissingTables = (targetNumber, location) => {
    const currentCount = getTablesByLocation(location).length;
    const lastNumber = getLastTableNumberInLocation(location);

    if (targetNumber <= lastNumber) {
      return 0; // Ya hay suficientes mesas
    }

    return targetNumber - lastNumber;
  };

  // Reordenar mesas de otra ubicación para hacer espacio
  const reorderTablesForLocation = async (targetNumber, targetLocation) => {
    const otherLocation = targetLocation === "adentro" ? "afuera" : "adentro";
    const otherLocationTables = getTablesByLocation(otherLocation);

    if (otherLocationTables.length === 0) return;

    // Ordenar mesas de la otra ubicación por número
    const sortedOtherTables = otherLocationTables.sort(
      (a, b) => parseInt(a.numero) - parseInt(b.numero)
    );

    // Calcular cuántas mesas necesitamos mover
    const lastNumberInTarget = getLastTableNumberInLocation(targetLocation);
    const tablesToMove = targetNumber - lastNumberInTarget;

    if (tablesToMove <= 0) return;

    // Mover las primeras mesas de la otra ubicación
    const tablesToReorder = sortedOtherTables.slice(0, tablesToMove);

    // Reordenar las mesas restantes
    const remainingTables = sortedOtherTables.slice(tablesToMove);

    // Actualizar las mesas que se mueven
    for (let i = 0; i < tablesToReorder.length; i++) {
      const table = tablesToReorder[i];
      const newNumber = String(lastNumberInTarget + i + 1).padStart(2, "0");
      await updateTable(table.id, { numero: newNumber, lugar: targetLocation });
    }

    // Reordenar las mesas restantes
    for (let i = 0; i < remainingTables.length; i++) {
      const table = remainingTables[i];
      const newNumber = String(
        lastNumberInTarget + tablesToMove + i + 1
      ).padStart(2, "0");
      await updateTable(table.id, { numero: newNumber });
    }
  };

  // Función para reordenar todas las mesas después de eliminar una
  const reorderAllTablesAfterDelete = async () => {
    // Obtener todas las mesas ordenadas por número globalmente
    const allTablesSorted = [...tables].sort(
      (a, b) => parseInt(a.numero) - parseInt(b.numero)
    );

    // Reordenar todas las mesas para que tengan números secuenciales globales
    for (let i = 0; i < allTablesSorted.length; i++) {
      const table = allTablesSorted[i];
      const newNumber = String(i + 1).padStart(2, "0");

      if (table.numero !== newNumber) {
        await updateTable(table.id, { numero: newNumber });
      }
    }
  };

  // Función para mover mesa específica a una ubicación
  const moveTableToLocation = async (targetNumber, targetLocation) => {
    const otherLocation = targetLocation === "adentro" ? "afuera" : "adentro";
    const otherLocationTables = getTablesByLocation(otherLocation);

    if (otherLocationTables.length === 0) return;

    // Ordenar mesas de la otra ubicación por número
    const sortedOtherTables = otherLocationTables.sort(
      (a, b) => parseInt(a.numero) - parseInt(b.numero)
    );

    // Encontrar la mesa que queremos mover (la primera de la otra ubicación)
    const tableToMove = sortedOtherTables[0];

    // Obtener el último número en la ubicación objetivo
    const lastNumberInTarget = getLastTableNumberInLocation(targetLocation);
    const newNumber = String(lastNumberInTarget + 1).padStart(2, "0");

    // Mover la mesa
    await updateTable(tableToMove.id, {
      numero: newNumber,
      lugar: targetLocation,
    });

    // Reordenar las mesas restantes en la ubicación original
    const remainingTables = sortedOtherTables.slice(1);
    for (let i = 0; i < remainingTables.length; i++) {
      const table = remainingTables[i];
      const newTableNumber = String(parseInt(tableToMove.numero) + i).padStart(
        2,
        "0"
      );
      await updateTable(table.id, { numero: newTableNumber });
    }
  };

  // Crear múltiples mesas en una ubicación
  const createMultipleTables = async (startNumber, endNumber, location) => {
    const tablesToCreate = [];

    for (let i = startNumber; i <= endNumber; i++) {
      const numero = String(i).padStart(2, "0");
      if (!isTableNumberExists(numero)) {
        tablesToCreate.push({
          numero,
          lugar: location,
          estado: "libre",
          cliente: "",
          productos: {},
          total: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    const restaurantId = getRestaurantId();
    const tablesRef = collection(db, "restaurantes", restaurantId, "tables");

    const createdTables = [];
    for (const tableData of tablesToCreate) {
      const docRef = await addDoc(tablesRef, tableData);
      createdTables.push({ id: docRef.id, ...tableData });
    }

    // Actualizar el estado local
    setTables((prev) => [...prev, ...createdTables]);

    return createdTables;
  };

  // Función para mover múltiples mesas de una ubicación a otra
  const moveMultipleTablesToLocation = async (
    startNumber,
    endNumber,
    fromLocation,
    toLocation
  ) => {
    // Obtener las mesas que necesitamos mover
    const tablesToMove = tables
      .filter(
        (table) =>
          table.lugar === fromLocation &&
          parseInt(table.numero) >= startNumber &&
          parseInt(table.numero) <= endNumber
      )
      .sort((a, b) => parseInt(a.numero) - parseInt(b.numero));

    // Obtener el último número en la ubicación destino
    const lastNumberInTarget = getLastTableNumberInLocation(toLocation);

    // Mover las mesas una por una
    for (let i = 0; i < tablesToMove.length; i++) {
      const table = tablesToMove[i];
      const newNumber = String(lastNumberInTarget + i + 1).padStart(2, "0");
      await updateTable(table.id, {
        numero: newNumber,
        lugar: toLocation,
      });
    }

    // Reordenar las mesas restantes en la ubicación original
    const remainingTables = tables
      .filter(
        (table) =>
          table.lugar === fromLocation && parseInt(table.numero) > endNumber
      )
      .sort((a, b) => parseInt(a.numero) - parseInt(b.numero));

    // Reordenar las mesas restantes para que empiecen después de las movidas
    for (let i = 0; i < remainingTables.length; i++) {
      const table = remainingTables[i];
      const newTableNumber = String(
        parseInt(table.numero) + tablesToMove.length
      ).padStart(2, "0");
      await updateTable(table.id, { numero: newTableNumber });
    }
  };

  // Verificar y corregir el estado de las mesas
  const verifyAndFixTableStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const restaurantId = getRestaurantId();
      console.log(
        "🔍 Verificando estado de mesas para restaurante:",
        restaurantId
      );

      const tablesRef = collection(db, "restaurantes", restaurantId, "tables");
      const q = query(tablesRef, orderBy("numero"));
      const querySnapshot = await getDocs(q);

      const updatePromises = [];

      querySnapshot.forEach((doc) => {
        const tableData = doc.data();

        // Si la mesa no tiene estado definido o tiene un estado inválido
        if (
          !tableData.estado ||
          !["libre", "ocupado", "servido", "pagado"].includes(tableData.estado)
        ) {
          console.log(
            `⚠️ Mesa ${tableData.numero} tiene estado inválido:`,
            tableData.estado
          );

          // Determinar el estado correcto basado en los datos
          let correctStatus = "libre";

          if (
            tableData.productos &&
            Object.keys(tableData.productos).length > 0
          ) {
            if (tableData.total > 0) {
              correctStatus = "ocupado";
            } else {
              correctStatus = "libre";
            }
          }

          console.log(
            `✅ Corrigiendo mesa ${tableData.numero} a estado:`,
            correctStatus
          );

          const tableRef = doc(
            db,
            "restaurantes",
            restaurantId,
            "tables",
            doc.id
          );
          updatePromises.push(
            updateDoc(tableRef, {
              estado: correctStatus,
              updatedAt: serverTimestamp(),
            })
          );
        }
      });

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        console.log(`✅ Corregidas ${updatePromises.length} mesas`);
        // Recargar las mesas después de las correcciones
        await fetchTables();
      } else {
        console.log("✅ Todas las mesas tienen estados válidos");
      }
    } catch (err) {
      console.error("Error verificando estado de mesas:", err);
      setError("Error al verificar el estado de las mesas");
    } finally {
      setLoading(false);
    }
  };

  return {
    tables,
    loading,
    error,
    fetchTables,
    createTable,
    updateTable,
    deleteTable,
    getTable,
    updateTableStatus,
    addProductsToTable,
    clearTable,
    markTableAsPaid,
    markTableAsServed,
    generateTableNumber,
    isTableNumberExists,
    getTablesByLocation,
    getLastTableNumberInLocation,
    calculateMissingTables,
    reorderTablesForLocation,
    reorderAllTablesAfterDelete,
    moveTableToLocation,
    createMultipleTables,
    moveMultipleTablesToLocation,
    verifyAndFixTableStatus,
    setupRealtimeListener,
  };
};
