"use client";
import React, { useState, useEffect } from "react";
import { useTables } from "../../../hooks/useTables";

function MesasPage() {
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

  const getStatusColor = (estado) => {
    switch (estado) {
      case "libre":
        return "bg-green-500";
      case "ocupado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case "libre":
        return "Libre";
      case "ocupado":
        return "Ocupado";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestión de Mesas</h1>
            <p className="text-gray-400 mt-2">
              Administra las mesas del restaurante
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Agregar Mesa</span>
          </button>
        </div>

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
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map((table) => (
              <div
                key={table.id}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
              >
                {/* Table Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {table.numero}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        Mesa {table.numero}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getStatusColor(
                            table.estado
                          )}`}
                        ></div>
                        <span className="text-gray-400 text-sm">
                          {getStatusText(table.estado)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cliente:</span>
                    <span className="text-white">
                      {table.cliente || "Sin cliente"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total:</span>
                    <span className="text-white font-semibold">
                      ${table.total || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Productos:</span>
                    <span className="text-white">
                      {Object.keys(table.productos || {}).length} items
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(table)}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => openDeleteModal(table)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && tables.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay mesas creadas
            </h3>
            <p className="text-gray-400 mb-6">
              Comienza agregando tu primera mesa
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Agregar Primera Mesa
            </button>
          </div>
        )}
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Agregar Nueva Mesa
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
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

            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Número de Mesa
                </label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) =>
                    setFormData({ ...formData, numero: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="01"
                  maxLength="2"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Número automático sugerido: {generateTableNumber()}
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Crear Mesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {showEditModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Editar Mesa {selectedTable.numero}
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white"
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

            <form onSubmit={handleEditTable} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Número de Mesa
                </label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) =>
                    setFormData({ ...formData, numero: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="01"
                  maxLength="2"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                >
                  Actualizar Mesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Table Modal */}
      {showDeleteModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Eliminar Mesa</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-white"
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

            <div className="mb-6">
              <p className="text-white mb-4">
                ¿Estás seguro de que quieres eliminar la{" "}
                <span className="font-bold">Mesa {selectedTable.numero}</span>?
              </p>
              <p className="text-red-400 text-sm">
                Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteTable}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Eliminar Mesa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MesasPage;
