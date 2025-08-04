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
} from "firebase/firestore";
import { db } from "../lib/firebase";

export const useTables = (restaurantId = "francomputer") => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todas las mesas
  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
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
      
      setTables(tablesData);
    } catch (err) {
      console.error("Error fetching tables:", err);
      setError("Error al cargar las mesas");
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva mesa
  const createTable = async (tableData) => {
    setLoading(true);
    setError(null);
    try {
      const tablesRef = collection(db, "restaurantes", restaurantId, "tables");
      
      const newTable = {
        numero: tableData.numero,
        estado: "libre",
        cliente: "",
        productos: {},
        total: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(tablesRef, newTable);
      
      // Agregar la nueva mesa al estado local
      setTables(prev => [...prev, { id: docRef.id, ...newTable }]);
      
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
      const tableRef = doc(db, "restaurantes", restaurantId, "tables", tableId);
      
      const updateFields = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(tableRef, updateFields);
      
      // Actualizar la mesa en el estado local
      setTables(prev => 
        prev.map(table => 
          table.id === tableId 
            ? { ...table, ...updateFields }
            : table
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
      const tableRef = doc(db, "restaurantes", restaurantId, "tables", tableId);
      await deleteDoc(tableRef);
      
      // Eliminar la mesa del estado local
      setTables(prev => prev.filter(table => table.id !== tableId));
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
      setTables(prev => 
        prev.map(table => 
          table.id === tableId 
            ? { ...table, ...updateFields }
            : table
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
      const tableRef = doc(db, "restaurantes", restaurantId, "tables", tableId);
      
      const updateFields = {
        productos: products,
        total: total,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(tableRef, updateFields);
      
      // Actualizar la mesa en el estado local
      setTables(prev => 
        prev.map(table => 
          table.id === tableId 
            ? { ...table, ...updateFields }
            : table
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
      const tableRef = doc(db, "restaurantes", restaurantId, "tables", tableId);
      
      const updateFields = {
        estado: "libre",
        cliente: "",
        productos: {},
        total: 0,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(tableRef, updateFields);
      
      // Actualizar la mesa en el estado local
      setTables(prev => 
        prev.map(table => 
          table.id === tableId 
            ? { ...table, ...updateFields }
            : table
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

  // Generar número de mesa automático
  const generateTableNumber = () => {
    if (tables.length === 0) return "01";
    
    const numbers = tables.map(table => parseInt(table.numero));
    const maxNumber = Math.max(...numbers);
    return String(maxNumber + 1).padStart(2, '0');
  };

  // Verificar si un número de mesa ya existe
  const isTableNumberExists = (numero) => {
    return tables.some(table => table.numero === numero);
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
    generateTableNumber,
    isTableNumberExists,
  };
}; 