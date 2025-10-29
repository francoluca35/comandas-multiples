"use client";
import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../../../../lib/firebase"; 

function HistorialGastosModal({ isOpen, onClose, data, formatDinero }) {
  const [egresos, setEgresos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("mes"); // mes, semana, dia
  const [fechaEspecifica, setFechaEspecifica] = useState("");

  const cargarEgresos = async () => {
    if (!isOpen) return;
    
    setLoading(true);
    setError("");

    try {
      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) {
        throw new Error("No hay restaurante seleccionado");
      }

      let fechaInicio, fechaFin;
      const ahora = new Date();

      switch (filtro) {
        case "dia":
          if (fechaEspecifica) {
            fechaInicio = new Date(fechaEspecifica);
            fechaInicio.setHours(0, 0, 0, 0);
            fechaFin = new Date(fechaEspecifica);
            fechaFin.setHours(23, 59, 59, 999);
          } else {
            fechaInicio = new Date(ahora);
            fechaInicio.setHours(0, 0, 0, 0);
            fechaFin = new Date(ahora);
            fechaFin.setHours(23, 59, 59, 999);
          }
          break;
        case "semana":
          fechaInicio = new Date(ahora);
          fechaInicio.setDate(ahora.getDate() - 7);
          fechaInicio.setHours(0, 0, 0, 0);
          fechaFin = new Date(ahora);
          fechaFin.setHours(23, 59, 59, 999);
          break;
        case "mes":
        default:
          fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
          fechaInicio.setHours(0, 0, 0, 0);
          fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
          fechaFin.setHours(23, 59, 59, 999);
          break;
      }

      const egresosRef = collection(db, "restaurantes", restauranteId, "Egresos");
      const q = query(
        egresosRef,
        where("fecha", ">=", fechaInicio),
        where("fecha", "<=", fechaFin),
        orderBy("fecha", "desc"),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const egresosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setEgresos(egresosData);
    } catch (err) {
      console.error("❌ Error al cargar egresos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      cargarEgresos();
    }
  }, [isOpen, filtro, fechaEspecifica]);

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case "retiro_efectivo":
        return (
          <div className="w-6 h-6 bg-green-500/20 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        );
      case "gasto_virtual":
        return (
          <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        );
      case "pago_empleado":
        return (
          <div className="w-6 h-6 bg-yellow-500/20 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-slate-500/20 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
        );
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case "retiro_efectivo":
        return "Retiro de Efectivo";
      case "gasto_virtual":
        return "Gasto Virtual";
      case "pago_empleado":
        return "Pago a Empleado";
      default:
        return "Egreso";
    }
  };

  const getFormaPagoColor = (formaPago) => {
    return formaPago === "efectivo" ? "text-green-400" : "text-blue-400";
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "Fecha no disponible";
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const totalEgresos = egresos.reduce((sum, egreso) => sum + parseFloat(egreso.monto || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Historial de Gastos</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <label className="text-slate-300 text-sm">Período:</label>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="mes">Este mes</option>
              <option value="semana">Última semana</option>
              <option value="dia">Día específico</option>
            </select>
          </div>

          {filtro === "dia" && (
            <div className="flex items-center space-x-2">
              <label className="text-slate-300 text-sm">Fecha:</label>
              <input
                type="date"
                value={fechaEspecifica}
                onChange={(e) => setFechaEspecifica(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          <button
            onClick={cargarEgresos}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm flex items-center space-x-2"
          >
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </button>
        </div>

        {/* Total */}
        <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-sm">Total de Gastos:</span>
            <span className="text-red-400 font-bold text-lg">
              {formatDinero(totalEgresos)}
            </span>
          </div>
        </div>

        {/* Lista de Egresos */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 text-center">
              <p className="text-red-300">{error}</p>
            </div>
          ) : egresos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No hay gastos registrados para el período seleccionado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {egresos.map((egreso) => (
                <div key={egreso.id} className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTipoIcon(egreso.tipo)}
                      <div>
                        <p className="text-white font-medium text-sm">
                          {getTipoLabel(egreso.tipo)}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {egreso.motivo}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {formatearFecha(egreso.fecha)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">
                        {formatDinero(parseFloat(egreso.monto || 0))}
                      </p>
                      <p className={`text-xs ${getFormaPagoColor(egreso.formaPago)}`}>
                        {egreso.formaPago === "efectivo" ? "Efectivo" : "Virtual"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default HistorialGastosModal;
