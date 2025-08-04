import React from "react";

function DeleteTableModal({ isOpen, onClose, table, onConfirm }) {
  if (!isOpen || !table) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Eliminar Mesa</h2>
          <button
            onClick={onClose}
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
            <span className="font-bold">Mesa {table.numero}</span>?
          </p>
          <p className="text-red-400 text-sm">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Eliminar Mesa
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteTableModal; 