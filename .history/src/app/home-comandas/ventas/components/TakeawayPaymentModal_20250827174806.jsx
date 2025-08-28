"use client";
import React, { useState, useEffect } from "react";
import { usePaymentProcessor } from "@/hooks/usePaymentProcessor";
import { useTicketGenerator } from "@/hooks/useTicketGenerator";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { useIngresos } from "@/hooks/useIngresos";
import QRPaymentModal from "@/components/QRPaymentModal";
import TicketSendModal from "@/components/TicketSendModal";

function TakeawayPaymentModal({ isOpen, onClose, orderData, onPaymentComplete }) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("efectivo");
  const [showPaymentMethods, setShowPaymentMethods] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [currentExternalRef, setCurrentExternalRef] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showTicketSendModal, setShowTicketSendModal] = useState(false);

  // Hooks
  const { processPayment, isProcessing, error } = usePaymentProcessor();
  const { printTicket, isGenerating } = useTicketGenerator();
  const { paymentStatus, isApproved, isPending, isRejected } = usePaymentStatus(currentExternalRef);
  const { crearIngreso } = useIngresos();

  // Efecto para manejar el pago aprobado
  useEffect(() => {
    if (isApproved && currentExternalRef) {
      handlePaymentSuccess("mercadopago");
    }
  }, [isApproved, currentExternalRef]);

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setShowPaymentMethods(false);
  };

  const handleProcessPayment = async () => {
    if (!orderData) {
      alert("No hay datos del pedido");
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Preparar datos del pedido para el procesador de pagos
      const paymentOrderData = {
        mesa: "TAKEAWAY",
        cliente: orderData.cliente,
        monto: orderData.total,
        productos: orderData.productos,
      };

      console.log("🚀 Procesando pago takeaway:", {
        method: selectedPaymentMethod,
        orderData: paymentOrderData,
      });

      const result = await processPayment(paymentOrderData, selectedPaymentMethod);

      if (result.success) {
        if (selectedPaymentMethod === "efectivo") {
          // Para efectivo, generar ticket inmediatamente
          await handlePaymentSuccess("efectivo");
        } else if (selectedPaymentMethod === "mercadopago") {
          // Para MercadoPago, mostrar QR
          setPaymentData(result.data);
          setCurrentExternalRef(result.externalReference);
          setShowQRModal(true);
        }
      }
    } catch (error) {
      console.error("❌ Error procesando pago:", error);
      alert(`Error al procesar el pago: ${error.message}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (method) => {
    try {
      console.log("✅ Pago exitoso, registrando ingreso y generando ticket...");

      // Registrar ingreso automáticamente
      await registrarIngresoAutomatico(method, orderData.total, orderData.cliente);

      // Preparar datos para el ticket
      const ticketData = {
        mesa: "TAKEAWAY",
        cliente: orderData.cliente,
        monto: orderData.total,
        productos: orderData.productos,
        metodoPago: method,
        timestamp: new Date(),
      };

      // Generar y mostrar ticket
      await printTicket(ticketData);

      // Notificar éxito
      if (onPaymentComplete) {
        onPaymentComplete(method, orderData);
      }

      // Cerrar modal
      onClose();
    } catch (error) {
      console.error("❌ Error en proceso de pago:", error);
      alert(`Pago exitoso pero error en el proceso: ${error.message}`);
    }
  };

  const registrarIngresoAutomatico = async (metodoPago, monto, cliente) => {
    try {
      console.log("💰 Registrando ingreso automático:", {
        metodoPago,
        monto,
        cliente,
      });

      const fecha = new Date();
      const motivo = `Takeaway - Cliente: ${cliente}`;
      
      // Determinar tipo de ingreso y opción de pago según el método
      let tipoIngreso, formaIngreso, opcionPago;
      
      if (metodoPago === "efectivo") {
        tipoIngreso = "Venta Takeaway";
        formaIngreso = "Efectivo";
        opcionPago = "caja"; // Se suma a la caja registradora
      } else if (metodoPago === "mercadopago") {
        tipoIngreso = "Venta Takeaway";
        formaIngreso = "MercadoPago";
        opcionPago = "cuenta_restaurante"; // Se suma al dinero virtual
      } else {
        throw new Error(`Método de pago no reconocido: ${metodoPago}`);
      }

      // Crear el ingreso
      await crearIngreso(
        tipoIngreso,
        motivo,
        monto,
        formaIngreso,
        fecha,
        opcionPago
      );

      console.log("✅ Ingreso registrado exitosamente:", {
        tipoIngreso,
        motivo,
        monto,
        formaIngreso,
        opcionPago,
      });

    } catch (error) {
      console.error("❌ Error registrando ingreso automático:", error);
      throw new Error(`Error al registrar ingreso: ${error.message}`);
    }
  };

  const handleBackToMethods = () => {
    setShowPaymentMethods(true);
    setShowQRModal(false);
    setPaymentData(null);
    setCurrentExternalRef(null);
  };

  const handleCloseQR = () => {
    setShowQRModal(false);
    setPaymentData(null);
    setCurrentExternalRef(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Principal de Pago */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-slate-700 p-6 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-white text-2xl font-bold">Pago Takeaway</h2>
                  <p className="text-slate-300 text-sm">Selecciona el método de pago</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6">
            {/* Información del Pedido */}
            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-3">Detalles del Pedido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Cliente:</span>
                  <span className="text-white font-medium">{orderData?.cliente}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Items:</span>
                  <span className="text-white font-medium">{orderData?.productos?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Total:</span>
                  <span className="text-white font-bold text-lg">${orderData?.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Métodos de Pago */}
            {showPaymentMethods && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-lg">Selecciona el método de pago:</h3>
                
                {/* Efectivo */}
                <button
                  onClick={() => handlePaymentMethodSelect("efectivo")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Efectivo</div>
                      <div className="text-sm opacity-90">Pago en efectivo</div>
                    </div>
                  </div>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* MercadoPago */}
                <button
                  onClick={() => handlePaymentMethodSelect("mercadopago")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">MercadoPago</div>
                      <div className="text-sm opacity-90">Pago con QR</div>
                    </div>
                  </div>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Confirmación de Método */}
            {!showPaymentMethods && (
              <div className="space-y-6">
                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Método seleccionado:</h3>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedPaymentMethod === "efectivo" ? "bg-green-500" : "bg-blue-500"
                    }`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {selectedPaymentMethod === "efectivo" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                        )}
                      </svg>
                    </div>
                    <span className="text-white font-medium">
                      {selectedPaymentMethod === "efectivo" ? "Efectivo" : "MercadoPago"}
                    </span>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleBackToMethods}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
                  >
                    Cambiar Método
                  </button>
                  <button
                    onClick={handleProcessPayment}
                    disabled={isProcessingPayment || isProcessing}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    {(isProcessingPayment || isProcessing) ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <span>Procesar Pago</span>
                    )}
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de QR para MercadoPago */}
      {showQRModal && paymentData && (
        <QRPaymentModal
          isOpen={showQRModal}
          onClose={handleCloseQR}
          paymentData={paymentData}
          orderData={orderData}
        />
      )}
    </>
  );
}

export default TakeawayPaymentModal;
