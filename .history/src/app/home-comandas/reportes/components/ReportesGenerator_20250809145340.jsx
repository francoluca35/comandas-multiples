"use client";
import React, { useState } from "react";
import {
  DocumentChartBarIcon,
  CurrencyDollarIcon,
  CubeIcon,
  UserGroupIcon,
  TableCellsIcon,
  ShoppingCartIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon as TableIcon,
} from "@heroicons/react/24/outline";
import { useReportGenerator } from "../../../../hooks/useReportGenerator";

const reportTypes = [
  {
    id: "ventas",
    name: "Reporte de Ventas",
    description: "Detalle completo de todas las ventas realizadas",
    icon: ShoppingCartIcon,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  {
    id: "productos",
    name: "Reporte de Productos",
    description: "Inventario y rendimiento de productos",
    icon: CubeIcon,
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    id: "financiero",
    name: "Reporte Financiero",
    description: "Ingresos, egresos y balance general",
    icon: CurrencyDollarIcon,
    color: "from-yellow-500 to-orange-600",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
  },
  {
    id: "empleados",
    name: "Reporte de Empleados",
    description: "Rendimiento y pagos de empleados",
    icon: UserGroupIcon,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    id: "mesas",
    name: "Reporte de Mesas",
    description: "Ocupación y rendimiento de mesas",
    icon: TableCellsIcon,
    color: "from-indigo-500 to-blue-600",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
  },
  {
    id: "inventario",
    name: "Reporte de Inventario",
    description: "Stock actual y movimientos de inventario",
    icon: DocumentChartBarIcon,
    color: "from-red-500 to-pink-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
];

export default function ReportesGenerator() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedFormat, setSelectedFormat] = useState("excel");
  const [filters, setFilters] = useState({});

  const {
    isGenerating,
    progress,
    generateExcelReport,
    generateCSVReport,
    generatePDFReport,
  } = useReportGenerator();

  const handleReportSelect = (report) => {
    setSelectedReport(report);
    setFilters({});
  };

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const generateReport = async () => {
    if (!selectedReport) return;

    try {
      let result;

      switch (selectedFormat) {
        case "excel":
          result = await generateExcelReport(
            selectedReport.id,
            dateRange,
            filters
          );
          break;
        case "csv":
          result = await generateCSVReport(
            selectedReport.id,
            dateRange,
            filters
          );
          break;
        case "pdf":
          result = await generatePDFReport(
            selectedReport.id,
            dateRange,
            filters
          );
          break;
        default:
          result = await generateExcelReport(
            selectedReport.id,
            dateRange,
            filters
          );
      }

      if (result.success) {
        console.log("Reporte generado exitosamente:", result.fileName);
      } else {
        console.error("Error generando reporte:", result.error);
      }
    } catch (error) {
      console.error("Error generando reporte:", error);
    }
  };

  const getReportFilters = () => {
    if (!selectedReport) return null;

    const filterConfigs = {
      ventas: [
        {
          key: "tipoVenta",
          label: "Tipo de Venta",
          type: "select",
          options: ["Mesa", "Delivery", "Takeaway"],
        },
        { key: "empleado", label: "Empleado", type: "text" },
        {
          key: "metodoPago",
          label: "Método de Pago",
          type: "select",
          options: ["Efectivo", "Tarjeta", "Transferencia"],
        },
      ],
      productos: [
        {
          key: "categoria",
          label: "Categoría Principal",
          type: "select",
          options: [
            "Bebidas",
            "Platos Principales",
            "Entradas",
            "Postres",
            "Acompañamientos",
            "Salsas y Condimentos",
            "Panadería",
            "Lácteos",
            "Carnes",
            "Pescados y Mariscos",
            "Verduras",
            "Frutas",
            "Granos y Cereales",
            "Especias",
            "Otros"
          ],
        },
        { key: "stockMinimo", label: "Stock Mínimo", type: "number" },
        {
          key: "activo",
          label: "Activo",
          type: "select",
          options: ["Sí", "No"],
        },
      ],
      financiero: [
        {
          key: "tipoMovimiento",
          label: "Tipo de Movimiento",
          type: "select",
          options: ["Ingreso", "Egreso"],
        },
        { key: "categoria", label: "Categoría", type: "text" },
        { key: "empleado", label: "Empleado", type: "text" },
      ],
      empleados: [
        { key: "rol", label: "Rol", type: "text" },
        {
          key: "activo",
          label: "Activo",
          type: "select",
          options: ["Sí", "No"],
        },
        {
          key: "fechaContratacion",
          label: "Fecha de Contratación",
          type: "date",
        },
      ],
      mesas: [
        {
          key: "estado",
          label: "Estado",
          type: "select",
          options: ["Libre", "Ocupada", "Reservada"],
        },
        { key: "capacidad", label: "Capacidad", type: "number" },
      ],
      inventario: [
        { key: "categoria", label: "Categoría", type: "text" },
        { key: "proveedor", label: "Proveedor", type: "text" },
        {
          key: "stockBajo",
          label: "Stock Bajo",
          type: "select",
          options: ["Sí", "No"],
        },
      ],
    };

    return filterConfigs[selectedReport.id] || [];
  };

  return (
    <div className="space-y-8">
      {/* Selección de Tipo de Reporte */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <div
            key={report.id}
            onClick={() => handleReportSelect(report)}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedReport?.id === report.id
                ? `${report.bgColor} ${report.borderColor} border-2`
                : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50"
            }`}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 rounded-lg bg-gradient-to-r ${report.color}`}
              >
                <report.icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {report.name}
                </h3>
                <p className="text-sm text-slate-400">{report.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Configuración del Reporte */}
      {selectedReport && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <DocumentChartBarIcon className="w-6 h-6 mr-2" />
            Configurar {selectedReport.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Rango de Fechas */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rango de Fechas
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    handleDateChange("startDate", e.target.value)
                  }
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateChange("endDate", e.target.value)}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            {/* Filtros Específicos */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Filtros Adicionales
              </label>
              <div className="space-y-3">
                {getReportFilters()?.map((filter) => (
                  <div key={filter.key}>
                    <label className="block text-xs text-slate-400 mb-1">
                      {filter.label}
                    </label>
                    {filter.type === "select" ? (
                      <select
                        value={filters[filter.key] || ""}
                        onChange={(e) =>
                          handleFilterChange(filter.key, e.target.value)
                        }
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="">Todos</option>
                        {filter.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : filter.type === "number" ? (
                      <input
                        type="number"
                        value={filters[filter.key] || ""}
                        onChange={(e) =>
                          handleFilterChange(filter.key, e.target.value)
                        }
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Ingrese valor..."
                      />
                    ) : (
                      <input
                        type={filter.type}
                        value={filters[filter.key] || ""}
                        onChange={(e) =>
                          handleFilterChange(filter.key, e.target.value)
                        }
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder={`Ingrese ${filter.label.toLowerCase()}...`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selección de Formato */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Formato del Reporte
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedFormat("excel")}
                className={`p-3 rounded-lg border-2 transition-all duration-300 flex items-center justify-center space-x-2 ${
                  selectedFormat === "excel"
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                    : "bg-slate-700/50 border-slate-600/50 text-slate-400 hover:border-slate-500/50"
                }`}
              >
                <TableCellsIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Excel</span>
              </button>

              <button
                onClick={() => setSelectedFormat("csv")}
                className={`p-3 rounded-lg border-2 transition-all duration-300 flex items-center justify-center space-x-2 ${
                  selectedFormat === "csv"
                    ? "bg-green-500/20 border-green-500/50 text-green-300"
                    : "bg-slate-700/50 border-slate-600/50 text-slate-400 hover:border-slate-500/50"
                }`}
              >
                <DocumentTextIcon className="w-5 h-5" />
                <span className="text-sm font-medium">CSV</span>
              </button>

              <button
                onClick={() => setSelectedFormat("pdf")}
                className={`p-3 rounded-lg border-2 transition-all duration-300 flex items-center justify-center space-x-2 ${
                  selectedFormat === "pdf"
                    ? "bg-red-500/20 border-red-500/50 text-red-300"
                    : "bg-slate-700/50 border-slate-600/50 text-slate-400 hover:border-slate-500/50"
                }`}
              >
                <DocumentChartBarIcon className="w-5 h-5" />
                <span className="text-sm font-medium">PDF</span>
              </button>
            </div>
          </div>

          {/* Barra de Progreso */}
          {isGenerating && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
                <span>Generando reporte...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Botón de Generación */}
          <div className="flex justify-center">
            <button
              onClick={generateReport}
              disabled={
                isGenerating || !dateRange.startDate || !dateRange.endDate
              }
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 flex items-center space-x-2 ${
                isGenerating || !dateRange.startDate || !dateRange.endDate
                  ? "bg-slate-600/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 shadow-lg shadow-blue-500/25"
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>Generar Reporte {selectedFormat.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Información Adicional */}
      {!selectedReport && (
        <div className="text-center py-12">
          <CalendarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">
            Selecciona un tipo de reporte
          </h3>
          <p className="text-slate-500">
            Elige el tipo de reporte que deseas generar y configura los
            parámetros necesarios
          </p>
        </div>
      )}
    </div>
  );
}
