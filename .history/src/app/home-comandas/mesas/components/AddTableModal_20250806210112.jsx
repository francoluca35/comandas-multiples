import React, { useState, useEffect } from "react";

function AddTableModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  generateTableNumber,
  tables,
  getTablesByLocation,
  getLastTableNumberInLocation,
  calculateMissingTables,
  reorderTablesForLocation,
  createMultipleTables,
  updateTable,
  createTable,
}) {
  const [showIntelligentModal, setShowIntelligentModal] = useState(false);
  const [intelligentOptions, setIntelligentOptions] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setShowIntelligentModal(false);
      setIntelligentOptions(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.numero.trim()) {
      alert("El número de mesa es requerido");
      return;
    }

    if (!formData.lugar) {
      alert("Debes seleccionar una ubicación");
      return;
    }

    const targetNumber = parseInt(formData.numero);
    const targetLocation = formData.lugar;

    // Verificar si el número ya existe
    const existingTable = tables.find(
      (table) => table.numero === formData.numero
    );
    if (existingTable) {
      alert("Ya existe una mesa con ese número");
      return;
    }

    // Verificar si necesitamos lógica inteligente
    const lastNumberInLocation = getLastTableNumberInLocation(targetLocation);
    const missingTables = calculateMissingTables(targetNumber, targetLocation);

    if (targetNumber > lastNumberInLocation + 1) {
      // Necesitamos lógica inteligente
      const otherLocation = targetLocation === "adentro" ? "afuera" : "adentro";
      const otherLocationTables = getTablesByLocation(otherLocation);

      setIntelligentOptions({
        targetNumber,
        targetLocation,
        lastNumberInLocation,
        missingTables,
        otherLocation,
        otherLocationTables: otherLocationTables.length,
      });
      setShowIntelligentModal(true);
      return;
    }

    // Caso normal - crear la mesa directamente
    await onSubmit(e);
  };

  const handleIntelligentOption = async (option) => {
    try {
      if (option === "create-multiple") {
        // Crear múltiples mesas hasta llegar al número objetivo
        const startNumber = intelligentOptions.lastNumberInLocation + 1;
        const endNumber = intelligentOptions.targetNumber;

        await createMultipleTables(
          startNumber,
          endNumber,
          intelligentOptions.targetLocation
        );

        // Reordenar las mesas de la otra ubicación para que tengan números secuenciales
        const otherLocation =
          intelligentOptions.targetLocation === "adentro"
            ? "afuera"
            : "adentro";
        const otherLocationTables = tables
          .filter((table) => table.lugar === otherLocation)
          .sort((a, b) => parseInt(a.numero) - parseInt(b.numero));

        // Reordenar las mesas de la otra ubicación para que empiecen después de las de la ubicación objetivo
        for (let i = 0; i < otherLocationTables.length; i++) {
          const table = otherLocationTables[i];
          const newTableNumber = String(endNumber + i + 1).padStart(2, "0");
          await updateTable(table.id, { numero: newTableNumber });
        }

        alert(
          `Se crearon ${endNumber - startNumber + 1} mesas en ${
            intelligentOptions.targetLocation === "adentro"
              ? "Adentro"
              : "Afuera"
          } y se reordenaron las mesas de ${
            otherLocation === "adentro" ? "Adentro" : "Afuera"
          }`
        );
      } else if (option === "reorder") {
        // Crear la mesa que sigue en la secuencia
        const nextTableNumber = intelligentOptions.lastNumberInLocation + 1;
        const nextTableFormatted = String(nextTableNumber).padStart(2, "0");

        // Crear la mesa que sigue en la secuencia
        await createTable({
          numero: nextTableFormatted,
          lugar: intelligentOptions.targetLocation,
        });

        // Reordenar las mesas restantes en la otra ubicación
        const otherLocation =
          intelligentOptions.targetLocation === "adentro"
            ? "afuera"
            : "adentro";
        const remainingTablesInLocation = tables
          .filter(
            (table) =>
              table.lugar === otherLocation &&
              parseInt(table.numero) >= nextTableNumber
          )
          .sort((a, b) => parseInt(a.numero) - parseInt(b.numero));

        // Reordenar las mesas que están en o después del número que acabamos de crear
        for (let i = 0; i < remainingTablesInLocation.length; i++) {
          const table = remainingTablesInLocation[i];
          const newTableNumber = String(nextTableNumber + i + 1).padStart(
            2,
            "0"
          );
          await updateTable(table.id, { numero: newTableNumber });
        }

        alert(
          `Se creó la mesa ${nextTableNumber} en ${
            intelligentOptions.targetLocation === "adentro"
              ? "Adentro"
              : "Afuera"
          } y se reordenaron las mesas restantes hasta la ${
            intelligentOptions.targetNumber
          }`
        );
      }

      setShowIntelligentModal(false);
      setIntelligentOptions(null);
      onClose();
    } catch (error) {
      console.error("Error en opción inteligente:", error);
      alert("Error al procesar la opción seleccionada");
    }
  };

  if (!isOpen) return null;

  if (showIntelligentModal && intelligentOptions) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-8 border border-slate-700/50 w-96 shadow-2xl rounded-2xl bg-slate-800/90 backdrop-blur-sm">
          <div className="mt-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                Opción Inteligente
              </h3>
              <button
                onClick={() => {
                  setShowIntelligentModal(false);
                  setIntelligentOptions(null);
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
                Quieres crear la mesa {intelligentOptions.targetNumber} en{" "}
                <span className="font-semibold text-blue-400">
                  {intelligentOptions.targetLocation === "adentro"
                    ? "Adentro"
                    : "Afuera"}
                </span>
                , pero actualmente solo hay hasta la mesa{" "}
                {intelligentOptions.lastNumberInLocation}.
              </p>

              <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-white">
                  Opciones disponibles:
                </h4>

                <button
                  onClick={() => handleIntelligentOption("create-multiple")}
                  className="w-full text-left p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors"
                >
                  <div className="font-semibold text-blue-400">
                    Opción 1: Crear mesas faltantes
                  </div>
                  <div className="text-sm text-slate-300 mt-1">
                    Crear {intelligentOptions.missingTables} mesas adicionales
                    para completar la secuencia hasta la mesa{" "}
                    {intelligentOptions.targetNumber}
                  </div>
                </button>

                <button
                  onClick={() => handleIntelligentOption("reorder")}
                  className="w-full text-left p-3 bg-orange-600/20 border border-orange-500/30 rounded-lg hover:bg-orange-600/30 transition-colors"
                >
                  <div className="font-semibold text-orange-400">
                    Opción 2: Crear mesa y reordenar
                  </div>
                  <div className="text-sm text-slate-300 mt-1">
                    Crear la mesa {intelligentOptions.lastNumberInLocation + 1}{" "}
                    en{" "}
                    {intelligentOptions.targetLocation === "adentro"
                      ? "Adentro"
                      : "Afuera"}{" "}
                    y reordenar las mesas restantes hasta la{" "}
                    {intelligentOptions.targetNumber}
                  </div>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => {
                  setShowIntelligentModal(false);
                  setIntelligentOptions(null);
                }}
                className="flex-1 px-4 py-3 border border-slate-600/50 rounded-xl shadow-sm text-sm font-semibold text-slate-300 bg-slate-700/50 hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 focus:ring-offset-slate-800 transition-all duration-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <form onSubmit={handleSubmit} className="space-y-6">
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
