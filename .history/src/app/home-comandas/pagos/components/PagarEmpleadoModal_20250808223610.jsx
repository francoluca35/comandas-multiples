"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

function PagarEmpleadoModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    fechaPago: new Date().toISOString().split("T")[0],
    nombreEmpleado: "",
    horasTrabajadas: "",
    diasTrabajados: "",
    sueldoPorHora: "",
    presentismo: false,
  });
  const [selectedDates, setSelectedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  // Calcular subtotal y total cuando cambien los valores
  useEffect(() => {
    const horas = parseFloat(formData.horasTrabajadas) || 0;
    const dias = parseFloat(formData.diasTrabajados) || 0;
    const sueldo = parseFloat(formData.sueldoPorHora) || 0;

    const nuevoSubtotal = horas * dias * sueldo;
    setSubtotal(nuevoSubtotal);

    const nuevoTotal = formData.presentismo
      ? nuevoSubtotal * 1.2 // 20% más por presentismo
      : nuevoSubtotal;
    setTotal(nuevoTotal);
  }, [
    formData.horasTrabajadas,
    formData.diasTrabajados,
    formData.sueldoPorHora,
    formData.presentismo,
  ]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateSelection = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    setSelectedDates((prev) => {
      if (prev.includes(dateStr)) {
        const newDates = prev.filter((d) => d !== dateStr);
        setFormData((prevForm) => ({
          ...prevForm,
          diasTrabajados: newDates.length.toString(),
        }));
        return newDates;
      } else {
        const newDates = [...prev, dateStr];
        setFormData((prevForm) => ({
          ...prevForm,
          diasTrabajados: newDates.length.toString(),
        }));
        return newDates;
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar campos
      if (!formData.fechaPago) {
        throw new Error("La fecha de pago es requerida");
      }

      if (!formData.nombreEmpleado.trim()) {
        throw new Error("El nombre del empleado es requerido");
      }

      if (
        !formData.horasTrabajadas ||
        parseFloat(formData.horasTrabajadas) <= 0
      ) {
        throw new Error("Las horas trabajadas deben ser mayor a 0");
      }

      if (
        !formData.diasTrabajados ||
        parseFloat(formData.diasTrabajados) <= 0
      ) {
        throw new Error("Los días trabajados deben ser mayor a 0");
      }

      if (!formData.sueldoPorHora || parseFloat(formData.sueldoPorHora) <= 0) {
        throw new Error("El sueldo por hora debe ser mayor a 0");
      }

      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) {
        throw new Error("No hay restaurante seleccionado");
      }

      const response = await fetch("/api/pagar-empleado", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          fechaPago: formData.fechaPago,
          nombreEmpleado: formData.nombreEmpleado.trim(),
          horasTrabajadas: parseFloat(formData.horasTrabajadas),
          diasTrabajados: parseFloat(formData.diasTrabajados),
          sueldoPorHora: parseFloat(formData.sueldoPorHora),
          presentismo: formData.presentismo,
          subtotal: subtotal,
          total: total,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el pago a empleado");
      }

      if (data.success) {
        console.log("✅ Pago a empleado creado exitosamente:", data.data);
        onSuccess(data.data);
        handleClose();
      } else {
        throw new Error(data.error || "Error al crear el pago a empleado");
      }
    } catch (err) {
      console.error("❌ Error creando pago a empleado:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fechaPago: new Date().toISOString().split("T")[0],
      nombreEmpleado: "",
      horasTrabajadas: "",
      diasTrabajados: "",
      sueldoPorHora: "",
      presentismo: false,
    });
    setSelectedDates([]);
    setSubtotal(0);
    setTotal(0);
    setError(null);
    setLoading(false);
    onClose();
  };

  // Generar fechas del mes actual para el calendario
  const generateCalendarDates = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Obtener el día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
    // Ajustar para que lunes sea 0, domingo sea 6
    let firstDayWeekday = firstDayOfMonth.getDay();
    firstDayWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1; // Convertir a formato lunes=0

    const dates = [];

    // Agregar días vacíos para alinear con los encabezados
    for (let i = 0; i < firstDayWeekday; i++) {
      dates.push(null);
    }

    // Agregar todos los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      if (date <= today) {
        // Solo mostrar fechas hasta hoy
        dates.push(date);
      } else {
        dates.push(null); // Día futuro, mostrar como vacío
      }
    }

    return dates;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-6 w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl shadow-slate-900/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/25">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Pagar Empleado</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fecha de Pago */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Fecha de Pago <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={formData.fechaPago}
              onChange={(e) => handleInputChange("fechaPago", e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-200"
              required
            />
          </div>

          {/* Nombre del Empleado */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Nombre del Empleado <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.nombreEmpleado}
              onChange={(e) =>
                handleInputChange("nombreEmpleado", e.target.value)
              }
              placeholder="Nombre completo del empleado"
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-200"
              required
            />
          </div>

          {/* Horas Trabajadas por Día */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Horas Trabajadas por Día <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={formData.horasTrabajadas}
              onChange={(e) =>
                handleInputChange("horasTrabajadas", e.target.value)
              }
              placeholder="8.0"
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-200"
              required
            />
          </div>

          {/* Días Trabajados */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Días Trabajados <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.diasTrabajados}
              onChange={(e) =>
                handleInputChange("diasTrabajados", e.target.value)
              }
              placeholder="22"
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-200"
              required
            />
          </div>

          {/* Calendario de Días Trabajados */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Seleccionar Días Trabajados
            </label>
            <div className="grid grid-cols-7 gap-1 p-3 bg-slate-700/30 rounded-lg">
              {/* Días de la semana */}
              {["lun", "mar", "mié", "jue", "vie", "sáb", "dom"].map((day) => (
                <div
                  key={day}
                  className="p-2 text-xs text-slate-400 font-medium text-center"
                >
                  {day}
                </div>
              ))}

              {/* Fechas del calendario */}
              {generateCalendarDates().map((date, index) => {
                if (!date) {
                  return (
                    <div key={index} className="p-2 text-xs">
                      {/* Día vacío */}
                    </div>
                  );
                }
                
                const dateStr = date.toISOString().split("T")[0];
                const isSelected = selectedDates.includes(dateStr);
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateSelection(date)}
                    className={`p-2 text-xs rounded transition-colors ${
                      isSelected
                        ? "bg-yellow-500 text-white font-semibold"
                        : isToday
                        ? "bg-blue-500 text-white font-semibold"
                        : "bg-slate-600 text-slate-300 hover:bg-slate-500"
                    }`}
                    disabled={date > new Date()}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sueldo por Hora */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Sueldo por Hora <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.sueldoPorHora}
              onChange={(e) =>
                handleInputChange("sueldoPorHora", e.target.value)
              }
              placeholder="1000.00"
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-200"
              required
            />
          </div>

          {/* Presentismo */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="presentismo"
              checked={formData.presentismo}
              onChange={(e) =>
                handleInputChange("presentismo", e.target.checked)
              }
              className="w-4 h-4 text-yellow-500 bg-slate-700 border-slate-600 rounded focus:ring-yellow-500 focus:ring-2"
            />
            <label
              htmlFor="presentismo"
              className="text-sm font-semibold text-slate-200"
            >
              Presentismo (20% adicional)
            </label>
          </div>

          {/* Cálculos */}
          <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Subtotal:</span>
              <span className="text-white font-semibold">
                {formatCurrency(subtotal)}
              </span>
            </div>
            {formData.presentismo && (
              <div className="flex justify-between items-center">
                <span className="text-slate-300 text-sm">
                  Presentismo (20%):
                </span>
                <span className="text-yellow-400 font-semibold">
                  {formatCurrency(subtotal * 0.2)}
                </span>
              </div>
            )}
            <div className="border-t border-slate-600 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-200 font-semibold">Total:</span>
                <span className="text-yellow-400 font-bold text-lg">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Pagar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default PagarEmpleadoModal;
