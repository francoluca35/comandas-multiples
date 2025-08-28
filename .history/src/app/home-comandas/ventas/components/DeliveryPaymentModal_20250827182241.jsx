"use client";
import React, { useState } from "react";
import { usePaymentProcessor } from "../../../../hooks/usePaymentProcessor";
import { usePaymentStatus } from "../../../../hooks/usePaymentStatus";
import QRPaymentModal from "../../../../components/QRPaymentModal"; 
import TicketSendModal from "../../../../components/TicketSendModal";
import CashPaymentModal from "./CashPaymentModal";

function DeliveryPaymentModal({ isOpen, onClose, orderData, onPaymentComplete }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showTicketSendModal, setShowTicketSendModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const { processPayment, isProcessing } = usePaymentProcessor();
  const { paymentStatus, checkPaymentStatus } = usePaymentStatus();

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    
    if (method === "mercadopago") {
      // Preparar datos para MercadoPago
      const mpData = {
        amount: orderData.total,
        description: `Delivery - Cliente: ${orderData.cliente}`,
        external_reference: `delivery_${Date.now()}`,
      };
      setPaymentData(mpData);
      setShowQRModal(true);
    } else if (method === "efectivo") {
      // Procesar pago en efectivo directamente
      handlePaymentSuccess("efectivo");
    }
  };

  const handlePaymentSuccess = async (method) => {
    try {
      console.log("✅ Pago exitoso, registrando ingreso y preparando envío de ticket...");
      await registrarIngresoAutomatico(method, orderData.total, orderData.cliente);
      
      // Preparar datos del ticket
      const ticketData = {
        mesa: "DELIVERY",
        cliente: orderData.cliente,
        direccion: orderData.direccion,
        monto: orderData.total,
        productos: orderData.productos,
        metodoPago: method,
        timestamp: new Date(),
      };
      
      setShowTicketSendModal(true);
    } catch (error) {
      console.error("❌ Error en el proceso de pago:", error);
      alert(`Error al procesar el pago: ${error.message}`);
    }
  };

  const registrarIngresoAutomatico = async (metodoPago, monto, cliente) => {
    try {
      console.log("💰 Registrando ingreso automático:", { metodoPago, monto, cliente });
      const fecha = new Date();
      const motivo = `Delivery - Cliente: ${cliente}`;
      let tipoIngreso, formaIngreso, opcionPago;
      
      if (metodoPago === "efectivo") {
        tipoIngreso = "Venta Delivery";
        formaIngreso = "Efectivo";
        opcionPago = "caja";
      } else if (metodoPago === "mercadopago") {
        tipoIngreso = "Venta Delivery";
        formaIngreso = "MercadoPago";
        opcionPago = "cuenta_restaurante";
      } else {
        throw new Error(`Método de pago no reconocido: ${metodoPago}`);
      }
      
      await crearIngreso(tipoIngreso, motivo, monto, formaIngreso, fecha, opcionPago);
      console.log("✅ Ingreso registrado exitosamente:", { tipoIngreso, motivo, monto, formaIngreso, opcionPago });
    } catch (error) {
      console.error("❌ Error registrando ingreso automático:", error);
      throw new Error(`Error al registrar ingreso: ${error.message}`);
    }
  };

  const handleTicketSendComplete = (sendMethod, ticketData) => {
    console.log("✅ Ticket enviado exitosamente:", { sendMethod, ticketData });
    if (onPaymentComplete) {
      onPaymentComplete(ticketData.metodoPago, orderData);
    }
    setShowTicketSendModal(false);
    onClose();
  };

  const handleCloseTicketSendModal = () => {
    setShowTicketSendModal(false);
    if (onPaymentComplete) {
      onPaymentComplete("efectivo", orderData); // Fallback method if user closes without sending
    }
    onClose();
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setShowQRModal(false);
    setPaymentData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Pago Delivery</h2>
          <button
            onClick={handleClose}
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
              <span>Dirección de entrega:</span>
              <span className="font-medium text-right">{orderData.direccion}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Productos:</span>
              <span className="font-medium">{orderData.productos.length} items</span>
            </div>
            <div className="border-t border-slate-600 pt-2 mt-2">
              <div className="flex justify-between text-white font-bold">
                <span>Total:</span>
                <span>${orderData.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Métodos de Pago */}
        <div className="space-y-3">
          <h3 className="text-white font-bold text-lg mb-3">Seleccionar Método de Pago</h3>
          
          <button
            onClick={() => handleMethodSelect("efectivo")}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span>Efectivo</span>
          </button>

          <button
            onClick={() => handleMethodSelect("mercadopago")}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Mercado Pago</span>
          </button>
        </div>

        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-2">Procesando pago...</p>
          </div>
        )}
      </div>

      {/* Modal de QR para MercadoPago */}
      {showQRModal && paymentData && (
        <QRPaymentModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          paymentData={paymentData}
          orderData={orderData}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Modal de Envío de Ticket */}
      {showTicketSendModal && (
        <TicketSendModal
          isOpen={showTicketSendModal}
          onClose={handleCloseTicketSendModal}
          orderData={{
            mesa: "DELIVERY",
            cliente: orderData.cliente,
            direccion: orderData.direccion,
            monto: orderData.total,
            productos: orderData.productos,
            metodoPago: orderData.metodoPago,
            timestamp: new Date(),
          }}
          onSendComplete={handleTicketSendComplete}
        />
      )}
    </div>
  );
}

export default DeliveryPaymentModal;
