"use client";
import React, { useState, useEffect } from "react";
import { useRestaurantZones, ZONE_CONFIGURATIONS } from "../hooks/useRestaurantZones";

function ZoneConfigModal({ isOpen, onClose, onConfigChange }) {
  const {
    zonesConfig,
    loading,
    error,
    fetchZonesConfig,
    saveZonesConfig,
    getCurrentConfig,
    getAvailableConfigurations,
  } = useRestaurantZones();

  const [selectedConfig, setSelectedConfig] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchZonesConfig();
    }
  }, [isOpen]);

  useEffect(() => {
    if (zonesConfig) {
      setSelectedConfig(zonesConfig);
    }
  }, [zonesConfig]);

  const handleSave = async () => {
    try {
      await saveZonesConfig(selectedConfig);
      if (onConfigChange) {
        onConfigChange(selectedConfig);
      }
      onClose();
    } catch (err) {
      console.error("Error saving zones config:", err);
      alert("Error al guardar la configuración. Inténtalo de nuevo.");
    }
  };

  if (!isOpen) return null;

  const currentConfig = getCurrentConfig();
  const availableConfigs = getAvailableConfigurations();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Configuración de Zonas</h2>
              <p className="text-slate-400 text-sm">
                Selecciona cómo quieres organizar las zonas de tu restaurante
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Configuraciones disponibles */}
          <div className="space-y-3">
            {availableConfigs.map((config) => (
              <div
                key={config.id}
                onClick={() => setSelectedConfig(config.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedConfig === config.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    selectedConfig === config.id
                      ? "border-blue-500 bg-blue-500"
                      : "border-slate-500"
                  }`}>
                    {selectedConfig === config.id && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">{config.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {config.zones.map((zone) => (
                        <span
                          key={zone}
                          className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium"
                        >
                          {config.labels[zone]}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedConfig === config.id && (
                    <div className="text-blue-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-blue-300 font-semibold text-sm mb-1">Migración automática:</p>
                <p className="text-blue-200 text-xs">
                  Al cambiar la configuración, las mesas se migrarán automáticamente:
                </p>
                <ul className="text-blue-200 text-xs mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Adentro</strong> → <strong>Planta Baja</strong> (si eliges Plantas/Afuera)</li>
                  <li><strong>Adentro</strong> → <strong>Adentro Planta Baja</strong> (si eliges Adentro Plantas)</li>
                  <li><strong>Planta Alta</strong> y <strong>Planta Baja</strong> → <strong>Adentro</strong> (si vuelves a Adentro/Afuera)</li>
                  <li><strong>Afuera</strong> siempre se mantiene como <strong>Afuera</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !selectedConfig}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Guardando y migrando mesas...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Guardar Configuración</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ZoneConfigModal;

