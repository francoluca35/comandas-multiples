"use client";
import React from "react";
import {
  DocumentChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const stats = [
  {
    name: "Reportes Generados",
    value: "24",
    change: "+12%",
    changeType: "positive",
    icon: DocumentChartBarIcon,
    color: "from-blue-500 to-cyan-600",
  },
  {
    name: "Tiempo Promedio",
    value: "2.3s",
    change: "-8%",
    changeType: "positive",
    icon: ClockIcon,
    color: "from-green-500 to-emerald-600",
  },
  {
    name: "Éxito",
    value: "98.5%",
    change: "+2.1%",
    changeType: "positive",
    icon: CheckCircleIcon,
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "Errores",
    value: "1.5%",
    change: "-2.1%",
    changeType: "positive",
    icon: ExclamationTriangleIcon,
    color: "from-orange-500 to-red-600",
  },
];

export default function ReportStats() {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-8">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
        <DocumentChartBarIcon className="w-6 h-6 mr-2" />
        Estadísticas de Reportes
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="mt-4 flex items-center">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-slate-400 ml-2">
                vs mes anterior
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Último reporte generado:</span>
          <span className="text-white font-medium">Hace 2 horas</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-slate-400">Tipo:</span>
          <span className="text-white font-medium">
            Reporte de Ventas (Excel)
          </span>
        </div>
      </div>
    </div>
  );
}
