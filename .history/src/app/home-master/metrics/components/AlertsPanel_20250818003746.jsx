"use client";
import React from "react";
import {
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";

export default function AlertsPanel({ alerts }) {
  const getAlertIcon = (type) => {
    switch (type) {
      case "error":
        return <FaExclamationCircle className="text-red-400" />;
      case "warning":
        return <FaExclamationTriangle className="text-yellow-400" />;
      default:
        return <FaInfoCircle className="text-blue-400" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case "error":
        return "bg-red-900/20 border-red-500/30";
      case "warning":
        return "bg-yellow-900/20 border-yellow-500/30";
      default:
        return "bg-blue-900/20 border-blue-500/30";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "performance":
        return "text-purple-400";
      case "business":
        return "text-green-400";
      case "system":
        return "text-orange-400";
      default:
        return "text-slate-400";
    }
  };

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <FaExclamationTriangle className="mr-2 text-red-400" />
        Alertas Activas ({alerts.length})
      </h3>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="mt-1">{getAlertIcon(alert.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-semibold">
                      {alert.message}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                        alert.category
                      )} bg-slate-700`}
                    >
                      {alert.category}
                    </span>
                  </div>
                  <div className="text-sm text-slate-300">
                    Valor: {alert.value}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Severidad: {alert.severity === "high" ? "Alta" : "Media"}
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-400">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen de alertas */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-red-400 text-lg font-bold">
              {alerts.filter((a) => a.type === "error").length}
            </div>
            <div className="text-xs text-slate-400">Errores</div>
          </div>
          <div>
            <div className="text-yellow-400 text-lg font-bold">
              {alerts.filter((a) => a.type === "warning").length}
            </div>
            <div className="text-xs text-slate-400">Advertencias</div>
          </div>
          <div>
            <div className="text-blue-400 text-lg font-bold">
              {alerts.filter((a) => a.type === "info").length}
            </div>
            <div className="text-xs text-slate-400">Información</div>
          </div>
        </div>
      </div>
    </div>
  );
}
