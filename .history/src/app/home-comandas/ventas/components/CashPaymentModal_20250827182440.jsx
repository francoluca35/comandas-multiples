"use client";
import React, { useState } from "react";
import { useIngresos } from "../../../../hooks/useIngresos";

function CashPaymentModal({ isOpen, onClose, orderData, onPaymentComplete }) {
  const [amountReceived, setAmountReceived] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateChange = () => {
    const received = parseFloat(amountReceived) || 0;
    const total = orderData.total;
    return Math.max(0, received - total);
  };

  const handleSubmit = async () => {
    if (!amountReceived || parseFloat(amountReceived) < orderData.total) {
      alert("El monto recibido debe ser mayor o igual al total del pedido");
      return;
    }

    setIsProcessing(true);
    try {
      // Registrar ingreso automático
      await registrarIngresoAutomatico(orderData.total, orderData.cliente);
      
      // Enviar a cocina
      await enviarACocina();
      
      // Mostrar modal de ticket
      onPaymentComplete("efectivo", orderData);
    } catch (error) {
      console.error("❌ Error procesando pago en efectivo:", error);
      alert(`Error al procesar el pago: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const registrarIngresoAutomatico = async (monto, cliente) => {
    try {
      console.log("💰 Registrando ingreso automático:", { monto, cliente });
      const fecha = new Date();
      const motivo = `Delivery - Cliente: ${cliente}`;
      const tipoIngreso = "Venta Delivery";
      const formaIngreso = "Efectivo";
      const opcionPago = "caja";
      
      // Importar dinámicamente el hook
      const { useIngresos } = await import("../../../../hooks/useIngresos");
      const { crearIngreso } = useIngresos();
      
      await crearIngreso(tipoIngreso, motivo, monto, formaIngreso, fecha, opcionPago);
      console.log("✅ Ingreso registrado exitosamente");
    } catch (error) {
      console.error("❌ Error registrando ingreso automático:", error);
      throw new Error(`Error al registrar ingreso: ${error.message}`);
    }
  };

  const enviarACocina = async () => {
    try {
      console.log("🚀 Enviando pedido a cocina...");
      const restauranteId = localStorage.getItem("restauranteId");
      
      if (!restauranteId) {
        throw new Error("No se encontró el ID del restaurante");
      }

      const pedidoCocina = {
        mesa: "DELIVERY",
        productos: orderData.productos,
        total: orderData.total,
        cliente: orderData.cliente,
        direccion: orderData.direccion,
        notas: "",
        timestamp: new Date(),
        estado: "pendiente",
        restauranteId: restauranteId,
        tipo: "delivery",
        metodoPago: "efectivo",
      };

      const response = await fetch("/api/pedidos-cocina", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pedidoCocina),
      });

      if (!response.ok) {
        throw new Error("Error al enviar pedido a cocina");
      }

      const result = await response.json();
      console.log("✅ Pedido delivery enviado a cocina exitosamente:", result);
    } catch (error) {
      console.error("❌ Error al enviar pedido a cocina:", error);
      throw new Error(`Error al enviar pedido a cocina: ${error.message}`);
    }
  };

  const change = calculateChange();
  const isValid = amountReceived && parseFloat(amountReceived) >= orderData.total;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Pago en Efectivo</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Información del Pedido */}
        <div className="bg-slate-700 rounded-lg p-4 mb-6">
          <h3 className="text-white font-bold text-lg mb-3">Resumen del Pedido</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white">
              <span>Cliente:</span>
              <span className="font-medium">{orderData.cliente}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Dirección:</span>
              <span className="font-medium text-right">{orderData.direccion}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Total:</span>
              <span className="font-bold text-lg">${orderData.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Cálculo de Vuelto */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Monto Recibido
            </label>
            <input
              type="number"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ingrese el monto recibido"
              min={orderData.total}
              step="0.01"
            />
          </div>

          {amountReceived && (
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white">
                  <span>Total a pagar:</span>
                  <span>${orderData.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Monto recibido:</span>
                  <span>${parseFloat(amountReceived || 0).toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-600 pt-2">
                  <div className="flex justify-between text-white font-bold">
                    <span>Vuelto:</span>
                    <span className={change > 0 ? "text-green-400" : "text-white"}>
                      ${change.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botón de Confirmar */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Confirmar Pago y Enviar a Cocina</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CashPaymentModal;
