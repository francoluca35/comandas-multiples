"use client";
import React, { useState, useEffect } from "react";

function ClienteModal({ isOpen, onClose, onSave, mesa }) {
  const [clienteData, setClienteData] = useState({
    nombre: "",
    email: "",
    whatsapp: "",
  });
  const [errors, setErrors] = useState({});

  // Cargar datos del cliente cuando se abre el modal
  useEffect(() => {
    if (isOpen && mesa) {
      console.log("🔍 Cargando datos del cliente para mesa:", mesa);
      console.log("📊 Datos de la mesa:", mesa);
      console.log("👤 Datos del cliente:", mesa.datos_cliente);
      
      // Si la mesa ya tiene datos del cliente, cargarlos
      if (mesa.datos_cliente && typeof mesa.datos_cliente === 'object') {
        console.log("✅ Cargando datos completos del cliente");
        setClienteData({
          nombre: mesa.datos_cliente.nombre || "",
          email: mesa.datos_cliente.email || "",
          whatsapp: mesa.datos_cliente.whatsapp || "",
        });
      } else {
        // Si no hay datos, usar el campo cliente como nombre
        console.log("⚠️ No hay datos del cliente, usando campo cliente");
        setClienteData({
          nombre: mesa.cliente || "",
          email: "",
          whatsapp: "",
        });
      }
    }
  }, [isOpen, mesa]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClienteData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!clienteData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }
    
    if (clienteData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteData.email)) {
      newErrors.email = "El email no tiene un formato válido";
    }
    
    if (clienteData.whatsapp && !/^\+?[\d\s-()]+$/.test(clienteData.whatsapp)) {
      newErrors.whatsapp = "El WhatsApp debe contener solo números y caracteres válidos";
    }
    
    // Al menos uno de email o whatsapp debe estar presente
    if (!clienteData.email.trim() && !clienteData.whatsapp.trim()) {
      newErrors.contacto = "Debe proporcionar al menos un email o WhatsApp";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(clienteData);
      setErrors({});
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Datos del Cliente - Mesa {mesa?.numero}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={clienteData.nombre}
              onChange={handleInputChange}
              className={`w-full text-black px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nombre ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Ingrese el nombre del cliente"
            />
            {errors.nombre && (
              <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={clienteData.email}
              onChange={handleInputChange}
              className={`w-full text-black px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="cliente@ejemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp
            </label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              value={clienteData.whatsapp}
              onChange={handleInputChange}
              className={`w-full text-black px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.whatsapp ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="+54 9 11 1234-5678"
            />
            {errors.whatsapp && (
              <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>
            )}
          </div>

          {errors.contacto && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{errors.contacto}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Guardar y Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClienteModal;