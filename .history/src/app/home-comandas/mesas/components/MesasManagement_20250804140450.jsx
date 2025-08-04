"use client";
import React, { useState, useEffect } from "react";
import { useTables } from "../../../../hooks/useTables";
import MesasHeader from "./MesasHeader";
import MesasGrid from "./MesasGrid";
import AddTableModal from "./AddTableModal";
import EditTableModal from "./EditTableModal";
import DeleteTableModal from "./DeleteTableModal";
import EmptyState from "./EmptyState";

function MesasManagement() {
  const {
    tables,
    loading,
    error,
    fetchTables,
    createTable,
    updateTable,
    deleteTable,
    generateTableNumber,
    isTableNumberExists,
  } = useTables();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [formData, setFormData] = useState({
    numero: "",
  });

  // Cargar mesas al montar el componente
  useEffect(() => {
    fetchTables();
  }, []);

  // Generar número automático cuando se abre el modal de agregar
  useEffect(() => {
    if (showAddModal) {
      setFormData({ numero: generateTableNumber() });
    }
  }, [showAddModal]);

  const handleAddTable = async (e) => {
    e.preventDefault();

    if (!formData.numero.trim()) {
      alert("El número de mesa es requerido");
      return;
    }

    if (isTableNumberExists(formData.numero)) {
      alert("Ya existe una mesa con ese número");
      return;
    }

    try {
      await createTable(formData);
      setShowAddModal(false);
      setFormData({ numero: "" });
    } catch (err) {
      console.error("Error creating table:", err);
    }
  };

  const handleEditTable = async (e) => {
    e.preventDefault();

    if (!formData.numero.trim()) {
      alert("El número de mesa es requerido");
      return;
    }

    // Verificar si el nuevo número ya existe (excluyendo la mesa actual)
    const otherTables = tables.filter((table) => table.id !== selectedTable.id);
    if (otherTables.some((table) => table.numero === formData.numero)) {
      alert("Ya existe una mesa con ese número");
      return;
    }

    try {
      await updateTable(selectedTable.id, formData);
      setShowEditModal(false);
      setSelectedTable(null);
      setFormData({ numero: "" });
    } catch (err) {
      console.error("Error updating table:", err);
    }
  };

  const handleDeleteTable = async () => {
    try {
      await deleteTable(selectedTable.id);
      setShowDeleteModal(false);
      setSelectedTable(null);
    } catch (err) {
      console.error("Error deleting table:", err);
    }
  };

  const openEditModal = (table) => {
    setSelectedTable(table);
    setFormData({ numero: table.numero });
    setShowEditModal(true);
  };

  const openDeleteModal = (table) => {
    setSelectedTable(table);
    setShowDeleteModal(true);
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <MesasHeader onAddTable={() => setShowAddModal(true)} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-4">Cargando mesas...</p>
          </div>
        )}

        {/* Tables Grid */}
        {!loading && tables.length > 0 && (
          <MesasGrid
            tables={tables}
            onEditTable={openEditModal}
            onDeleteTable={openDeleteModal}
          />
        )}

        {/* Empty State */}
        {!loading && tables.length === 0 && (
          <EmptyState onAddTable={() => setShowAddModal(true)} />
        )}
      </div>

      {/* Modals */}
      <AddTableModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddTable}
        generateTableNumber={generateTableNumber}
      />

      <EditTableModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        table={selectedTable}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditTable}
      />

      <DeleteTableModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        table={selectedTable}
        onConfirm={handleDeleteTable}
      />
    </div>
  );
}

export default MesasManagement;
