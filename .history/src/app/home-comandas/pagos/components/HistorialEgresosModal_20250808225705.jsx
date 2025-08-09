"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

function HistorialEgresosModal({ isOpen, onClose }) {
  const [historial, setHistorial] = useState({
    alivios: [],
    compras: [],
    sueldos: [],
    retiros: [],
    proveedores: [],
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
      const [aliviosRes, comprasRes, sueldosRes, retirosRes, proveedoresRes] =
        await Promise.all([
          fetch(`/api/alivios?restauranteId=${restauranteId}`),
          fetch(`/api/inversion-total?restauranteId=${restauranteId}`),
          fetch(`/api/sueldos?restauranteId=${restauranteId}`),
          fetch(`/api/retiros?restauranteId=${restauranteId}`),
          fetch(`/api/proveedores?restauranteId=${restauranteId}`),
        ]);

      const [
        aliviosData,
        comprasData,
        sueldosData,
        retirosData,
        proveedoresData,
      ] = await Promise.all([
        aliviosRes.json(),
        comprasRes.json(),
        sueldosRes.json(),
        retirosRes.json(),
        proveedoresRes.json(),
      ]);

      setHistorial({
        alivios: aliviosData.success ? aliviosData.data || [] : [],
        compras: comprasData.success ? comprasData.data || [] : [],
        sueldos: sueldosData.success ? sueldosData.data || [] : [],
        retiros: retirosData.success ? retirosData.data || [] : [],
        proveedores: proveedoresData.success ? proveedoresData.data || [] : [],
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
        const fecha = new Date(item.fecha || item.fechaPago || item.timestamp);
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

    // Alivios
    if (Array.isArray(historial.alivios)) {
      historial.alivios.forEach((alivio) => {
        if (
          alivio.historialAlivios &&
          typeof alivio.historialAlivios === "object"
        ) {
          Object.entries(alivio.historialAlivios).forEach(([fecha, data]) => {
            todosLosDatos.push({
              ...data,
              tipo: "Alivio",
              fecha: fecha,
              categoria: "Efectivo",
              descripcion: data.motivo || "Alivio",
            });
          });
        }
      });
    }

    // Compras (inversión total)
    if (Array.isArray(historial.compras)) {
      historial.compras.forEach((compra) => {
        if (
          compra.historialCompras &&
          typeof compra.historialCompras === "object"
        ) {
          Object.entries(compra.historialCompras).forEach(([fecha, data]) => {
            todosLosDatos.push({
              ...data,
              tipo: "Compra",
              fecha: fecha,
              categoria: "Efectivo",
              descripcion: data.producto || "Compra",
            });
          });
        }
      });
    }

    // Sueldos
    if (Array.isArray(historial.sueldos)) {
      historial.sueldos.forEach((empleado) => {
        if (
          empleado.historialPagos &&
          typeof empleado.historialPagos === "object"
        ) {
          Object.entries(empleado.historialPagos).forEach(([fecha, data]) => {
            todosLosDatos.push({
              ...data,
              tipo: "Sueldo",
              fecha: fecha,
              categoria: "Efectivo",
              descripcion: `Sueldo - ${empleado.nombreEmpleado || empleado.id}`,
              empleado: empleado.nombreEmpleado || empleado.id,
            });
          });
        }
      });
    }

    // Retiros
    if (Array.isArray(historial.retiros)) {
      historial.retiros.forEach((retiro) => {
        if (
          retiro.historialRetiros &&
          typeof retiro.historialRetiros === "object"
        ) {
          Object.entries(retiro.historialRetiros).forEach(([fecha, data]) => {
            todosLosDatos.push({
              ...data,
              tipo: "Retiro",
              fecha: fecha,
              categoria: "Efectivo",
              descripcion: data.motivo || "Retiro",
            });
          });
        }
      });
    }

    // Proveedores
    if (Array.isArray(historial.proveedores)) {
      historial.proveedores.forEach((proveedor) => {
        if (
          proveedor.historialPagos &&
          typeof proveedor.historialPagos === "object"
        ) {
          Object.entries(proveedor.historialPagos).forEach(([fecha, data]) => {
            todosLosDatos.push({
              ...data,
              tipo: "Proveedor",
              fecha: fecha,
              categoria: data.metodoPago === "virtual" ? "Virtual" : "Efectivo",
              descripcion: `${data.proveedor} - ${data.producto}`,
              proveedor: data.proveedor,
              producto: data.producto,
            });
          });
        }
      });
    }

    return filtrarDatos(todosLosDatos).sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );
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
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
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
            <h2 className="text-xl font-bold text-white">
              Historial de Egresos
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
              Tipo de Egreso
            </label>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
            >
              <option value="todos">Todos</option>
              <option value="Alivio">Alivios</option>
              <option value="Compra">Compras</option>
              <option value="Sueldo">Sueldos</option>
              <option value="Retiro">Retiros</option>
              <option value="Proveedor">Proveedores</option>
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
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
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
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
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
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Cargando historial...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-red-400">
                      Error: {error}
                    </td>
                  </tr>
                ) : datosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                      No hay egresos registrados
                    </td>
                  </tr>
                ) : (
                  datosFiltrados.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {formatDate(item.fecha)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.tipo === "Alivio" ? "bg-red-500/20 text-red-400" :
                          item.tipo === "Compra" ? "bg-orange-500/20 text-orange-400" :
                          item.tipo === "Sueldo" ? "bg-yellow-500/20 text-yellow-400" :
                          item.tipo === "Retiro" ? "bg-blue-500/20 text-blue-400" :
                          "bg-green-500/20 text-green-400"
                        }`}>
                          {item.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {item.descripcion || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.categoria === "Virtual" ? "bg-purple-500/20 text-purple-400" : "bg-green-500/20 text-green-400"
                        }`}>
                          {item.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300 text-right font-semibold">
                        {formatCurrency(item.total || item.importe || item.costo || 0)}
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
                <div className="text-sm text-slate-400">Total de egresos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(
                    datosFiltrados.reduce(
                      (sum, item) =>
                        sum +
                        parseFloat(
                          item.total || item.importe || item.costo || 0
                        ),
                      0
                    )
                  )}
                </div>
                <div className="text-sm text-slate-400">Total en efectivo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {formatCurrency(
                    datosFiltrados
                      .filter((item) => item.categoria === "Virtual")
                      .reduce(
                        (sum, item) =>
                          sum +
                          parseFloat(
                            item.total || item.importe || item.costo || 0
                          ),
                        0
                      )
                  )}
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

export default HistorialEgresosModal;
