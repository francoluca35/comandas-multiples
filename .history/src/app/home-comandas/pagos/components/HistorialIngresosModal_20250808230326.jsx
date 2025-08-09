"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

function HistorialIngresosModal({ isOpen, onClose }) {
  const [historial, setHistorial] = useState({
    ingresos: [],
    ventas: [],
    otros: [],
    depositos: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchHistorial();
    }
  }, [isOpen]);

  const fetchHistorial = async () => {
    try {
      setLoading(true);
      setError(null);

      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) {
        throw new Error("No hay restaurante seleccionado");
      }

      // Obtener todos los datos del historial
      const [ingresosRes, ventasRes, otrosRes, depositosRes] =
        await Promise.all([
          fetch(`/api/ingresos?restauranteId=${restauranteId}`),
          fetch(`/api/ventas?restauranteId=${restauranteId}`),
          fetch(`/api/otros-ingresos?restauranteId=${restauranteId}`),
          fetch(`/api/depositos?restauranteId=${restauranteId}`),
        ]);

      const [ingresosData, ventasData, otrosData, depositosData] =
        await Promise.all([
          ingresosRes.json(),
          ventasRes.json(),
          otrosRes.json(),
          depositosRes.json(),
        ]);

      setHistorial({
        ingresos: ingresosData.success ? ingresosData.data?.ingresos || [] : [],
        ventas: ventasData.success ? ventasData.data || [] : [],
        otros: otrosData.success ? otrosData.data || [] : [],
        depositos: depositosData.success ? depositosData.data || [] : [],
      });
    } catch (err) {
      console.error("❌ Error obteniendo historial:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filtrarDatos = (datos) => {
    let datosFiltrados = datos;

    // Filtrar por tipo
    if (filtro !== "todos") {
      datosFiltrados = datos.filter((item) => item.tipo === filtro);
    }

    // Filtrar por fecha
    if (fechaDesde || fechaHasta) {
      datosFiltrados = datosFiltrados.filter((item) => {
        const fecha = new Date(item.fecha);
        const desde = fechaDesde ? new Date(fechaDesde) : null;
        const hasta = fechaHasta ? new Date(fechaHasta) : null;

        if (desde && fecha < desde) return false;
        if (hasta && fecha > hasta) return false;
        return true;
      });
    }

    return datosFiltrados;
  };

  const obtenerTodosLosDatos = () => {
    const todosLosDatos = [];

    // Ingresos
    if (Array.isArray(historial.ingresos)) {
      historial.ingresos.forEach(ingreso => {
        todosLosDatos.push({
          ...ingreso,
          tipo: "Ingreso",
          fecha: ingreso.fecha || ingreso.timestamp,
          categoria: ingreso.formaIngreso === "virtual" ? "Virtual" : "Efectivo",
          descripcion: ingreso.motivo || ingreso.tipoIngreso || "Ingreso",
          monto: ingreso.monto || 0
        });
      });
    }

    // Ventas
    if (Array.isArray(historial.ventas)) {
      historial.ventas.forEach(venta => {
        if (venta.historialVentas && typeof venta.historialVentas === 'object') {
          Object.entries(venta.historialVentas).forEach(([fecha, data]) => {
            todosLosDatos.push({
              ...data,
              tipo: "Venta",
              fecha: fecha,
              categoria: data.metodoPago === "virtual" ? "Virtual" : "Efectivo",
              descripcion: `Venta - ${data.productos || "Productos"}`,
              monto: data.total || 0
            });
          });
        }
      });
    }

    // Otros ingresos
    if (Array.isArray(historial.otros)) {
      historial.otros.forEach(otro => {
        if (otro.historialOtros && typeof otro.historialOtros === 'object') {
          Object.entries(otro.historialOtros).forEach(([fecha, data]) => {
            todosLosDatos.push({
              ...data,
              tipo: "Otro",
              fecha: fecha,
              categoria: data.metodoPago === "virtual" ? "Virtual" : "Efectivo",
              descripcion: data.motivo || "Otro ingreso",
              monto: data.monto || 0
            });
          });
        }
      });
    }

    // Depósitos
    if (Array.isArray(historial.depositos)) {
      historial.depositos.forEach(deposito => {
        if (deposito.historialDepositos && typeof deposito.historialDepositos === 'object') {
          Object.entries(deposito.historialDepositos).forEach(([fecha, data]) => {
            todosLosDatos.push({
              ...data,
              tipo: "Depósito",
              fecha: fecha,
              categoria: data.metodoPago === "virtual" ? "Virtual" : "Efectivo",
              descripcion: data.motivo || "Depósito",
              monto: data.monto || 0
            });
          });
        }
      });
    }

    return filtrarDatos(todosLosDatos).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  };

  const handleClose = () => {
    setFiltro("todos");
    setFechaDesde("");
    setFechaHasta("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const datosFiltrados = obtenerTodosLosDatos();

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-6 w-[1200px] max-h-[90vh] overflow-y-auto shadow-2xl shadow-slate-900/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">
              Historial de Ingresos
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Filtro por tipo */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Tipo de Ingreso
            </label>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
            >
              <option value="todos">Todos</option>
              <option value="Ingreso">Ingresos</option>
              <option value="Venta">Ventas</option>
              <option value="Otro">Otros</option>
              <option value="Depósito">Depósitos</option>
            </select>
          </div>

          {/* Fecha desde */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
            />
          </div>

          {/* Fecha hasta */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-200"
            />
          </div>

          {/* Limpiar filtros */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltro("todos");
                setFechaDesde("");
                setFechaHasta("");
              }}
              className="w-full px-3 py-2 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-all duration-200"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-slate-700/30 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600/50">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg
                          className="animate-spin h-5 w-5 text-green-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Cargando historial...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center text-red-400"
                    >
                      Error: {error}
                    </td>
                  </tr>
                ) : datosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      No hay ingresos registrados
                    </td>
                  </tr>
                ) : (
                  datosFiltrados.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {formatDate(item.fecha)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.tipo === "Ingreso"
                              ? "bg-green-500/20 text-green-400"
                              : item.tipo === "Venta"
                              ? "bg-blue-500/20 text-blue-400"
                              : item.tipo === "Otro"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-purple-500/20 text-purple-400"
                          }`}
                        >
                          {item.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {item.descripcion || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.categoria === "Virtual"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {item.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300 text-right font-semibold">
                        {formatCurrency(item.monto || 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen */}
        {!loading && !error && datosFiltrados.length > 0 && (
          <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {datosFiltrados.length}
                </div>
                <div className="text-sm text-slate-400">Total de ingresos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(datosFiltrados.filter(item => item.categoria === "Efectivo").reduce((sum, item) => sum + (parseFloat(item.monto || 0)), 0))}
                </div>
                <div className="text-sm text-slate-400">Total en efectivo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {formatCurrency(datosFiltrados.filter(item => item.categoria === "Virtual").reduce((sum, item) => sum + (parseFloat(item.monto || 0)), 0))}
                </div>
                <div className="text-sm text-slate-400">Total virtual</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default HistorialIngresosModal;
