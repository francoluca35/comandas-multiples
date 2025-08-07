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
    getTablesByLocation,
    getLastTableNumberInLocation,
    calculateMissingTables,
    reorderTablesForLocation,
    createMultipleTables,
    moveMultipleTablesToLocation,
  } = useTables();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [showReorganizeModal, setShowReorganizeModal] = useState(false);
  const [reorganizeOptions, setReorganizeOptions] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [formData, setFormData] = useState({
    numero: "",
    lugar: "",
  });

  // Cargar mesas al montar el componente
  useEffect(() => {
    fetchTables();
  }, []);

  // Generar número automático cuando se abre el modal de agregar
  useEffect(() => {
    if (showAddModal) {
      setFormData({ numero: generateTableNumber(), lugar: "" });
    }
  }, [showAddModal]);

  const handleAddTable = async (e) => {
    e.preventDefault();

    if (!formData.numero.trim()) {
      alert("El número de mesa es requerido");
      return;
    }

    if (!formData.lugar) {
      alert("Debes seleccionar una ubicación");
      return;
    }

    if (isTableNumberExists(formData.numero)) {
      alert("Ya existe una mesa con ese número");
      return;
    }

    try {
      await createTable(formData);
      setShowAddModal(false);
      setFormData({ numero: "", lugar: "" });
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

    if (!formData.lugar) {
      alert("Debes seleccionar una ubicación");
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
      setFormData({ numero: "", lugar: "" });
    } catch (err) {
      console.error("Error updating table:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTable(tableToDelete.id);
      setShowDeleteModal(false);
      setTableToDelete(null);

      // Mostrar opciones de reorganización
      const remainingTables = tables.filter(
        (table) => table.id !== tableToDelete.id
      );
      const adentroTables = remainingTables.filter(
        (table) => table.lugar === "adentro"
      );
      const afueraTables = remainingTables.filter(
        (table) => table.lugar === "afuera"
      );

      setReorganizeOptions({
        deletedTable: tableToDelete,
        adentroCount: adentroTables.length,
        afueraCount: afueraTables.length,
        remainingTables: remainingTables,
      });
      setShowReorganizeModal(true);
    } catch (error) {
      console.error("Error deleting table:", error);
    }
  };

  const handleReorganizeOption = async (option) => {
    try {
      if (option === "keep-current") {
        // Mantener la numeración actual sin reordenar
        await fetchTables();
      } else if (option === "reorder-sequential") {
        // Reordenar secuencialmente
        await reorderAllTablesAfterDelete();
        await fetchTables();
      }

      setShowReorganizeModal(false);
      setReorganizeOptions(null);
    } catch (error) {
      console.error("Error reorganizing tables:", error);
    }
  };

  const openEditModal = (table) => {
    setSelectedTable(table);
    setFormData({ numero: table.numero, lugar: table.lugar || "" });
    setShowEditModal(true);
  };

  const openDeleteModal = (table) => {
    setTableToDelete(table);
    setShowDeleteModal(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="px-8 py-6">
          <MesasHeader onAddTable={() => setShowAddModal(true)} />
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-blue-500 mx-auto"></div>
                <p className="text-slate-300 mt-6 text-lg font-medium">
                  Cargando mesas...
                </p>
              </div>
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
      </div>

      {/* Modals */}
      <AddTableModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddTable}
        generateTableNumber={generateTableNumber}
        tables={tables}
        getTablesByLocation={getTablesByLocation}
        getLastTableNumberInLocation={getLastTableNumberInLocation}
        calculateMissingTables={calculateMissingTables}
        reorderTablesForLocation={reorderTablesForLocation}
        createMultipleTables={createMultipleTables}
        updateTable={updateTable}
        createTable={createTable}
        moveMultipleTablesToLocation={moveMultipleTablesToLocation}
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
        table={tableToDelete}
        onConfirm={handleDeleteConfirm}
      />

      {/* Modal de Reorganización */}
      {showReorganizeModal && reorganizeOptions && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border border-slate-700/50 w-96 shadow-2xl rounded-2xl bg-slate-800/90 backdrop-blur-sm">
            <div className="mt-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Reorganizar Mesas</h3>
                <button
                  onClick={() => {
                    setShowReorganizeModal(false);
                    setReorganizeOptions(null);
                  }}
                  className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/50"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <p className="text-slate-300 text-sm">
                  Se eliminó la mesa {reorganizeOptions.deletedTable.numero} de{" "}
                  <span className="font-semibold text-blue-400">
                    {reorganizeOptions.deletedTable.lugar === "adentro" ? "Adentro" : "Afuera"}
                  </span>
                  . ¿Cómo quieres reorganizar las mesas restantes?
                </p>

                <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-white">
                    Opciones disponibles:
                  </h4>

                  <button
                    onClick={() => handleReorganizeOption("keep-current")}
                    className="w-full text-left p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors"
                  >
                    <div className="font-semibold text-blue-400">
                      Opción 1: Mantener numeración actual
                    </div>
                    <div className="text-sm text-slate-300 mt-1">
                      Mantener las mesas con sus números actuales ({reorganizeOptions.adentroCount} adentro, {reorganizeOptions.afueraCount} afuera)
                    </div>
                  </button>

                  <button
                    onClick={() => handleReorganizeOption("reorder-sequential")}
                    className="w-full text-left p-3 bg-orange-600/20 border border-orange-500/30 rounded-lg hover:bg-orange-600/30 transition-colors"
                  >
                    <div className="font-semibold text-orange-400">
                      Opción 2: Reordenar secuencialmente
                    </div>
                    <div className="text-sm text-slate-300 mt-1">
                      Reordenar todas las mesas para que tengan números secuenciales (1, 2, 3...)
                    </div>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowReorganizeModal(false);
                    setReorganizeOptions(null);
                  }}
                  className="flex-1 px-4 py-3 border border-slate-600/50 rounded-xl shadow-sm text-sm font-semibold text-slate-300 bg-slate-700/50 hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 focus:ring-offset-slate-800 transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MesasManagement;
