"use client";
import React, { useEffect, useState } from "react";
import { useVentasContadores } from "../../../../hooks/useVentasContadores";
import { useRole } from "../../../context/RoleContext";

function VentasCard() {
  const { contadores, cargarContadores, resetearContadores, obtenerContadoresMes } = useVentasContadores();
  const { isAdmin } = useRole();
  const [ultimoMesRevisado, setUltimoMesRevisado] = useState(null);
  const [mostrarAlertMes, setMostrarAlertMes] = useState(false);

  // Cargar contadores al montar
  useEffect(() => {
    cargarContadores();
  }, []);

  // Verificar si cambió el mes
  useEffect(() => {
    const verificarCambioMes = async () => {
      const ahora = new Date();
      const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
      
      // Verificar si es el primer día del mes y es admin
      if (ahora.getDate() === 1 && isAdmin && ultimoMesRevisado !== mesActual) {
        // Verificar si hay ventas del mes anterior
        const mesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
        const mesAnteriorStr = `${mesAnterior.getFullYear()}-${String(mesAnterior.getMonth() + 1).padStart(2, '0')}`;
        
        // Verificar si hay contadores del mes anterior
        try {
          const contadoresAnterior = await obtenerContadoresMes(mesAnteriorStr);
          
          // Solo mostrar alert si hay contadores del mes anterior
          if (contadoresAnterior.salon > 0 || contadoresAnterior.takeaway > 0 || contadoresAnterior.delivery > 0) {
            setMostrarAlertMes(true);
            setUltimoMesRevisado(mesActual);
          }
        } catch (error) {
          console.error("Error verificando contadores del mes anterior:", error);
        }
      }
    };

    verificarCambioMes();
    
    // Verificar cada hora si cambió el mes
    const interval = setInterval(verificarCambioMes, 60 * 60 * 1000); // Cada hora
    
    return () => clearInterval(interval);
  }, [isAdmin, ultimoMesRevisado, obtenerContadoresMes]);

  const handleNavigation = (mode) => {
    // Navigate to ventas page with the specific mode as a query parameter
    window.location.href = `/home-comandas/ventas?mode=${mode}`;
  };

  const handleDescargarRegistroVentas = async () => {
    try {
      // Obtener mes anterior
      const ahora = new Date();
      const mesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
      const mesAnteriorStr = `${mesAnterior.getFullYear()}-${String(mesAnterior.getMonth() + 1).padStart(2, '0')}`;
      
      // Obtener contadores del mes anterior
      const contadoresAnterior = await obtenerContadoresMes(mesAnteriorStr);
      
      // Si no hay contadores del mes anterior, usar los actuales
      const contadoresParaExcel = contadoresAnterior.salon > 0 || contadoresAnterior.takeaway > 0 || contadoresAnterior.delivery > 0
        ? contadoresAnterior
        : contadores;
      
      // Crear Excel usando import dinámico
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();
      
      const datosExcel = [
        { 'Tipo de Venta': 'Salón', 'Cantidad': contadoresParaExcel.salon },
        { 'Tipo de Venta': 'Takeaway', 'Cantidad': contadoresParaExcel.takeaway },
        { 'Tipo de Venta': 'Delivery', 'Cantidad': contadoresParaExcel.delivery },
      ];

      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      worksheet['!cols'] = [
        { wch: 20 }, // Tipo de Venta
        { wch: 15 }, // Cantidad
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registro Ventas');
      
      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Registro_Ventas_${mesAnteriorStr}.xlsx`;
      
      XLSX.writeFile(workbook, nombreArchivo);
      
      // Resetear contadores después de descargar
      await resetearContadores();
      
      // Recargar contadores para actualizar la vista
      await cargarContadores();
      
      setMostrarAlertMes(false);
      alert('Registro de ventas descargado exitosamente. Los contadores han sido reseteados.');
    } catch (error) {
      console.error('Error descargando registro de ventas:', error);
      alert('Error al descargar el registro: ' + error.message);
    }
  };

  return (
    <div className="bg-[#2a2a2a] rounded-lg p-3 sm:p-4 md:p-6 text-white h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
            />
          </svg>
        </div>
        <span className="font-semibold text-sm sm:text-base">Ventas</span>
      </div>

      {/* Stats Grid - 2x2 layout */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4 flex-1">
        {/* Delivery - Top Left */}
        <div className="bg-[#3a3a3a] rounded-lg p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                />
              </svg>
              <span className="text-xs sm:text-sm">Delivery</span>
            </div>
            <span className="text-xs sm:text-sm font-semibold">{contadores.delivery}</span>
          </div>
        </div>
        
        {/* Takeaway - Top Right */}
        <div className="bg-[#3a3a3a] rounded-lg p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="text-xs sm:text-sm">Takeaway</span>
            </div>
            <span className="text-xs sm:text-sm font-semibold">{contadores.takeaway}</span>
          </div>
        </div>
        
        {/* Salón - Bottom Left, spanning 2 columns */}
        <div className="bg-[#3a3a3a] rounded-lg p-2 sm:p-3 col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <span className="text-xs sm:text-sm">Salón</span>
            </div>
            <span className="text-xs sm:text-sm font-semibold">{contadores.salon}</span>
          </div>
        </div>
      </div>

      {/* Botón único */}
      <div className="flex justify-center mt-auto">
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors duration-200"
          onClick={() => handleNavigation("salon")}
        >
          Ir a ventas
        </button>
      </div>

      {/* Modal de Alert Mensual */}
      {mostrarAlertMes && isAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Nuevo Mes</h3>
                  <p className="text-slate-400 text-sm">¿Quieres descargar el registro de ventas del mes anterior?</p>
                </div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <div className="text-sm text-slate-300 space-y-2">
                  <div className="flex justify-between">
                    <span>Salón:</span>
                    <span className="font-semibold">{contadores.salon}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Takeaway:</span>
                    <span className="font-semibold">{contadores.takeaway}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span className="font-semibold">{contadores.delivery}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setMostrarAlertMes(false);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
                >
                  No
                </button>
                <button
                  onClick={handleDescargarRegistroVentas}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Sí, descargar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VentasCard;
