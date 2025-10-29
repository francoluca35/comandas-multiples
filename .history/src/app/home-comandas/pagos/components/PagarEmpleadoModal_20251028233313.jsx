"use client";
import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, updateDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";
import CalendarSelector from "./CalendarSelector"; 

function PagarEmpleadoModal({ isOpen, onClose, onSuccess, data, formatDinero }) {
  const [formData, setFormData] = useState({
    nombreEmpleado: "",
    diasTrabajados: 1,
    horasExtras: false,
    montoHorasExtras: "",
    precioHora: "",
    formaPago: "efectivo"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  // Calcular totales automáticamente
  const [calculos, setCalculos] = useState({
    horasNormales: 8,
    totalHorasNormales: 0,
    totalHorasExtras: 0,
    totalGeneral: 0
  });

  // Actualizar cálculos cuando cambien los valores
  useEffect(() => {
    const precioHora = parseFloat(formData.precioHora) || 0;
    const diasTrabajados = parseInt(formData.diasTrabajados) || 0;
    const montoHorasExtras = parseFloat(formData.montoHorasExtras) || 0;
    
    const horasNormales = 8;
    const totalHorasNormales = precioHora * horasNormales * diasTrabajados;
    const totalHorasExtras = formData.horasExtras ? montoHorasExtras : 0;
    const totalGeneral = totalHorasNormales + totalHorasExtras;

    setCalculos({
      horasNormales,
      totalHorasNormales,
      totalHorasExtras,
      totalGeneral
    });
  }, [formData.precioHora, formData.diasTrabajados, formData.horasExtras, formData.montoHorasExtras]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleDaysSelected = (days) => {
    setFormData(prev => ({
      ...prev,
      diasTrabajados: days
    }));
    setShowCalendar(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validaciones
      if (!formData.nombreEmpleado.trim()) {
        throw new Error("El nombre del empleado es requerido");
      }

      if (!formData.precioHora || parseFloat(formData.precioHora) <= 0) {
        throw new Error("El precio por hora debe ser mayor a 0");
      }

      if (formData.horasExtras && (!formData.montoHorasExtras || parseFloat(formData.montoHorasExtras) <= 0)) {
        throw new Error("El monto de horas extras debe ser mayor a 0");
      }

      const monto = calculos.totalGeneral;
      if (monto <= 0) {
        throw new Error("El monto total debe ser mayor a 0");
      }

      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) {
        throw new Error("No hay restaurante seleccionado");
      }

      // Verificar que hay suficiente dinero según la forma de pago
      if (formData.formaPago === "efectivo") {
        const efectivoDisponible = data?.dineroActual?.efectivo || 0;
        if (monto > efectivoDisponible) {
          throw new Error(`No hay suficiente efectivo. Disponible: ${formatDinero(efectivoDisponible)}`);
        }
      } else {
        const virtualDisponible = data?.dineroActual?.virtual || 0;
        if (monto > virtualDisponible) {
          throw new Error(`No hay suficiente dinero virtual. Disponible: ${formatDinero(virtualDisponible)}`);
        }
      }

      // Crear el egreso con información detallada
      const egresoData = {
        monto: monto.toString(),
        motivo: `Pago a empleado - ${formData.nombreEmpleado}`,
        tipo: "pago_empleado",
        formaPago: formData.formaPago,
        restauranteId,
        fecha: serverTimestamp(),
        createdAt: serverTimestamp(),
        // Información detallada del empleado
        empleado: {
          nombre: formData.nombreEmpleado,
          diasTrabajados: parseInt(formData.diasTrabajados),
          precioHora: parseFloat(formData.precioHora),
          horasNormales: calculos.horasNormales,
          totalHorasNormales: calculos.totalHorasNormales,
          horasExtras: formData.horasExtras,
          montoHorasExtras: formData.horasExtras ? parseFloat(formData.montoHorasExtras) : 0,
          totalGeneral: calculos.totalGeneral
        }
      };

      // Guardar en la colección de egresos
      await addDoc(collection(db, "restaurantes", restauranteId, "Egresos"), egresoData);

      // Actualizar según la forma de pago
      if (formData.formaPago === "efectivo") {
        // Actualizar la caja registradora para efectivo
        const cajaRef = collection(db, "restaurantes", restauranteId, "CajaRegistradora");
        const cajaSnapshot = await getDocs(cajaRef);
        
        if (!cajaSnapshot.empty) {
          const cajaDoc = cajaSnapshot.docs[0];
          const cajaData = cajaDoc.data();
          const aperturaActual = parseFloat(cajaData.Apertura || 0);
          
          await updateDoc(cajaDoc.ref, {
            Apertura: (aperturaActual - monto).toString(),
            ultimaActualizacion: serverTimestamp()
          });
        } else {
          // Crear caja si no existe
          const dineroActualEfectivo = data?.dineroActual?.efectivo || 0;
          await addDoc(cajaRef, {
            Apertura: (dineroActualEfectivo - monto).toString(),
            Cierre: "",
            Extraccion: {},
            Ingresos: {},
            ultimaActualizacion: serverTimestamp()
          });
        }
      } else {
        // Actualizar el dinero virtual
        const dineroRef = collection(db, "restaurantes", restauranteId, "Dinero");
        const dineroSnapshot = await getDocs(dineroRef);
        
        if (!dineroSnapshot.empty) {
          const dineroDoc = dineroSnapshot.docs[0];
          const dineroData = dineroDoc.data();
          const virtualActual = parseFloat(dineroData.Virtual || 0);
          
          await updateDoc(dineroDoc.ref, {
            Virtual: (virtualActual - monto).toString(),
            ultimaActualizacion: serverTimestamp()
          });
        } else {
          // Crear documento si no existe
          const dineroActualVirtual = data?.dineroActual?.virtual || 0;
          await addDoc(dineroRef, {
            Efectivo: "0",
            Virtual: (dineroActualVirtual - monto).toString(),
            ultimaActualizacion: serverTimestamp()
          });
        }
      }

      // El historial se mantiene en la colección de egresos

      console.log("✅ Pago a empleado registrado exitosamente");
      onSuccess();
      onClose();
      
      // Limpiar formulario
      setFormData({
        nombreEmpleado: "",
        diasTrabajados: 1,
        horasExtras: false,
        montoHorasExtras: "",
        precioHora: "",
        formaPago: "efectivo"
      });
    } catch (err) {
      console.error("❌ Error al registrar pago a empleado:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const efectivoDisponible = data?.dineroActual?.efectivo || 0;
  const virtualDisponible = data?.dineroActual?.virtual || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
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
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido Scrolleable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Dinero Disponible */}
          <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Efectivo Disponible:</span>
              <span className="text-green-400 font-bold">
                {formatDinero(efectivoDisponible)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Dinero Virtual:</span>
              <span className="text-blue-400 font-bold">
                {formatDinero(virtualDisponible)}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-6">
          {/* Información del Empleado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre del Empleado */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre del Empleado *
              </label>
              <input
                type="text"
                name="nombreEmpleado"
                value={formData.nombreEmpleado}
                onChange={handleInputChange}
                placeholder="Ej: Juan Pérez"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
            </div>

            {/* Días Trabajados */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Días Trabajados *
              </label>
              <button
                type="button"
                onClick={() => setShowCalendar(true)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent flex items-center justify-between"
              >
                <span>{formData.diasTrabajados} días seleccionados</span>
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Precio por Hora */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Precio por Hora *
            </label>
            <input
              type="number"
              name="precioHora"
              value={formData.precioHora}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            />
          </div>

          {/* Horas Extras */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="horasExtras"
                checked={formData.horasExtras}
                onChange={handleInputChange}
                className="w-4 h-4 text-yellow-600 bg-slate-700 border-slate-600 rounded focus:ring-yellow-500 focus:ring-2"
              />
              <label className="text-sm font-medium text-slate-300">
                ¿Trabajó horas extras?
              </label>
            </div>

            {formData.horasExtras && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Monto de Horas Extras
                </label>
                <input
                  type="number"
                  name="montoHorasExtras"
                  value={formData.montoHorasExtras}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Forma de Pago */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Forma de Pago
            </label>
            <select
              name="formaPago"
              value={formData.formaPago}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="efectivo">Efectivo</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>

          {/* Resumen de Pago */}
          <div className="bg-slate-700/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Resumen de Pago</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Días trabajados:</span>
                <span className="text-white">{formData.diasTrabajados}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Horas por día:</span>
                <span className="text-white">{calculos.horasNormales} horas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Precio por hora:</span>
                <span className="text-white">{formatDinero(parseFloat(formData.precioHora) || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Total horas normales:</span>
                <span className="text-white">{formatDinero(calculos.totalHorasNormales)}</span>
              </div>
              {formData.horasExtras && (
                <div className="flex justify-between">
                  <span className="text-slate-300">Horas extras:</span>
                  <span className="text-white">{formatDinero(calculos.totalHorasExtras)}</span>
                </div>
              )}
              <div className="border-t border-slate-600 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total a pagar:</span>
                  <span className="text-2xl font-bold text-yellow-400">{formatDinero(calculos.totalGeneral)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </form>
        </div>

        {/* Footer con Botones */}
        <div className="p-6 pt-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || calculos.totalGeneral <= 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg hover:from-yellow-700 hover:to-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Pagar {formatDinero(calculos.totalGeneral)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Selector */}
      <CalendarSelector
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        onSelectDays={handleDaysSelected}
        selectedDays={formData.diasTrabajados}
      />
    </div>
  );
}

export default PagarEmpleadoModal;