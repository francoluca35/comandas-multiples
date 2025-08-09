"use client";
import React from "react";
import ReportesGenerator from "./components/ReportesGenerator";
import ReportStats from "./components/ReportStats";

export default function ReportesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Reportes
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Genera reportes detallados de tu restaurante en formato Excel para
              análisis y control
            </p>
          </div>

          {/* Estadísticas de Reportes */}
          <ReportStats />

          {/* Reportes Generator Component */}
          <ReportesGenerator />
        </div>
      </div>
    </div>
  );
}
