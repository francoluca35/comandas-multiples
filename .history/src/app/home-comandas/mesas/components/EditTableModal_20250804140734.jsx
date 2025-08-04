import React from "react";

function EditTableModal({
  isOpen,
  onClose,
  table,
  formData,
  setFormData,
  onSubmit,
}) {
  if (!isOpen || !table) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            Editar Mesa {table.numero}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
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

        <form onSubmit={onSubmit} className="space-y-4">
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
              onClick={onClose}
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
  );
}

export default EditTableModal;
