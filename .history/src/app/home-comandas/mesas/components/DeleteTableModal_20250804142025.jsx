import React from "react";

function DeleteTableModal({ isOpen, onClose, table, onConfirm }) {
  if (!isOpen || !table) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 border border-slate-700/50 w-96 shadow-2xl rounded-2xl bg-slate-800/90 backdrop-blur-sm">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Eliminar Mesa</h3>
            <button
              onClick={onClose}
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

          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 border border-red-500/30 mb-6">
            <svg
              className="h-8 w-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <p className="text-sm text-slate-300 mb-3">
              ¿Estás seguro de que quieres eliminar la{" "}
              <span className="font-bold text-white">Mesa {table.numero}</span>?
            </p>
            <p className="text-xs text-red-400">
              Esta acción no se puede deshacer.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-600/50 rounded-xl shadow-sm text-sm font-semibold text-slate-300 bg-slate-700/50 hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 focus:ring-offset-slate-800 transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500/50 focus:ring-offset-slate-800 transition-all duration-300"
            >
              Eliminar Mesa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteTableModal;
