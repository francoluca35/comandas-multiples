import React from "react";

function AddTableModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  generateTableNumber,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 border border-slate-700/50 w-96 shadow-2xl rounded-2xl bg-slate-800/90 backdrop-blur-sm">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Agregar Nueva Mesa</h3>
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

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Número de Mesa
              </label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) =>
                  setFormData({ ...formData, numero: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-slate-400 backdrop-blur-sm"
                placeholder="01"
                maxLength="2"
              />
              <p className="text-sm text-slate-400 mt-2">
                Número automático sugerido: {generateTableNumber()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Ubicación
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, lugar: "adentro" })}
                  className={`px-4 py-3 rounded-xl border transition-all duration-200 ${
                    formData.lugar === "adentro"
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg"
                      : "bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span className="font-medium">Adentro</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, lugar: "afuera" })}
                  className={`px-4 py-3 rounded-xl border transition-all duration-200 ${
                    formData.lugar === "afuera"
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg"
                      : "bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
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
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">Afuera</span>
                  </div>
                </button>
              </div>
              {!formData.lugar && (
                <p className="text-sm text-red-400 mt-2">
                  Selecciona una ubicación
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-600/50 rounded-xl shadow-sm text-sm font-semibold text-slate-300 bg-slate-700/50 hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 focus:ring-offset-slate-800 transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!formData.lugar}
                className="flex-1 px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 focus:ring-offset-slate-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Mesa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddTableModal;
