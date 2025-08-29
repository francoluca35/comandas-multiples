"use client";
import React, { useEffect, useState } from "react";
import { FaBell, FaTimes, FaVolumeUp, FaVolumeMute, FaCog } from "react-icons/fa";

const KitchenNotification = ({ 
  notification, 
  onClose, 
  isEnabled, 
  onToggleEnabled, 
  volume, 
  onVolumeChange,
  soundType,
  onSoundTypeChange,
  onTestSound,
  onTestSpecificSound
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      setIsExpanded(true);
      
      // Auto-ocultar después de 5 segundos
      const timer = setTimeout(() => {
        setIsExpanded(false);
        setTimeout(() => setIsVisible(false), 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!notification || !isVisible) return null;

  const getNotificationStyles = () => {
    switch (notification.type) {
      case "new-order":
        return {
          bg: "bg-gradient-to-r from-green-500 to-emerald-600",
          border: "border-green-400",
          icon: "🔔",
          text: "text-white"
        };
      case "test":
        return {
          bg: "bg-gradient-to-r from-blue-500 to-indigo-600",
          border: "border-blue-400",
          icon: "🔊",
          text: "text-white"
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-600 to-gray-700",
          border: "border-gray-400",
          icon: "ℹ️",
          text: "text-white"
        };
    }
  };

  const styles = getNotificationStyles();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full">
      {/* Notificación principal */}
      <div 
        className={`${styles.bg} ${styles.border} border-2 rounded-xl shadow-2xl transform transition-all duration-300 ${
          isExpanded ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl animate-pulse">
                {styles.icon}
              </div>
              <div className="flex-1">
                <p className={`${styles.text} font-semibold text-sm leading-tight`}>
                  {notification.message}
                </p>
                <p className="text-white/70 text-xs mt-1">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors ml-2"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Panel de configuración */}
      <div className="mt-3 bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-sm font-medium">Configuración de Notificaciones</h3>
          <FaCog className="w-4 h-4 text-slate-400" />
        </div>
        
        <div className="space-y-3">
          {/* Toggle de notificaciones */}
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-sm">Notificaciones</span>
            <button
              onClick={onToggleEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isEnabled ? 'bg-green-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Tipo de sonido */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Tipo de Sonido</span>
              <button
                onClick={onTestSound}
                className="text-blue-400 hover:text-blue-300 transition-colors"
                title="Probar sonido"
              >
                <FaVolumeUp className="w-4 h-4" />
              </button>
            </div>
            <select
              value={soundType}
              onChange={(e) => onSoundTypeChange(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="powerful">🔊 Potente (Alarma de Cocina)</option>
              <option value="simple">🔔 Simple</option>
              <option value="alarm">🚨 Alarma Industrial</option>
            </select>
          </div>

          {/* Control de volumen */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Volumen</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaVolumeMute className="w-3 h-3 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <FaVolumeUp className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-xs">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default KitchenNotification;
