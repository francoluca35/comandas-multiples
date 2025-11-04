"use client";

import { useState } from "react";
import TicketSendModal from "@/components/TicketSendModal";
import QRPaymentModal from "@/components/QRPaymentModal";
import { usePaymentProcessor } from "@/hooks/usePaymentProcessor";
import { useIngresos } from "@/hooks/useIngresos";

export default function EnhancedPaymentModal({
  isOpen,
  onClose,
  orderData,
  onPaymentComplete,
}) {
  const { crearIngreso } = useIngresos();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [mercadopagoOption, setMercadopagoOption] = useState("");
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { processPayment: processMercadoPagoPayment } = usePaymentProcessor();

  const total = orderData?.monto || 0;
  const change = cashAmount ? (parseFloat(cashAmount) - total).toFixed(2) : 0;

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    setCashAmount("");
    // Si es MercadoPago y es DELIVERY, auto-seleccionar "link"
    if (method === "mercadopago" && orderData?.mesa === "DELIVERY") {
      setMercadopagoOption("link");
    } else {
      setMercadopagoOption("");
    }
  };

  const handleProcessPayment = async () => {
    if (!paymentMethod) {
      alert("Por favor selecciona un método de pago");
      return;
    }

    if (paymentMethod === "efectivo" && (!cashAmount || parseFloat(cashAmount) < total)) {
      alert("El monto en efectivo debe ser mayor o igual al total");
      return;
    }

    if (paymentMethod === "mercadopago" && !mercadopagoOption) {
      alert("Por favor selecciona una opción de MercadoPago");
      return;
    }

    setIsProcessing(true);

    try {
      // Si es MercadoPago, primero generar el QR o link
      if (paymentMethod === "mercadopago") {
        try {
          console.log("💳 Procesando pago con Mercado Pago...");
          
          // Preparar datos del pedido para Mercado Pago
          const mercadoPagoOrderData = {
            mesa: orderData.mesa,
            cliente: orderData.cliente || "Cliente",
            monto: orderData.monto || total,
            productos: orderData.productos || [],
            whatsapp: orderData.whatsapp || "",
            direccion: orderData.direccion || "",
          };

          // Llamar a processPayment con método "qr" (tanto para QR como para link)
          const result = await processMercadoPagoPayment(mercadoPagoOrderData, "qr");

          if (result?.success && result?.data) {
            console.log("✅ Datos de pago recibidos:", result.data);
            console.log("✅ External Reference:", result.externalReference);
            
            // Guardar datos del pago incluyendo externalReference
            setPaymentData({
              ...result.data,
              externalReference: result.externalReference || result.data.externalReference,
            });
            
            // Mostrar modal de QR (que también puede mostrar el link)
            setShowQRModal(true);
            setIsProcessing(false);
            return;
          } else {
            throw new Error("No se pudieron obtener los datos de pago de Mercado Pago");
          }
        } catch (paymentError) {
          console.error("❌ Error procesando pago Mercado Pago:", paymentError);
          alert(`Error al procesar el pago con Mercado Pago: ${paymentError.message}`);
          setIsProcessing(false);
          return;
        }
      }

      // Para efectivo, continuar con la lógica normal
      // Obtener el restauranteId del localStorage o contexto
      let restaurantId = localStorage.getItem("restauranteId");
      
      // Si no hay restauranteId en localStorage, intentar obtenerlo del contexto o usar uno por defecto
      if (!restaurantId) {
        // Intentar obtener del contexto de la aplicación
        const appContext = localStorage.getItem("appContext");
        if (appContext) {
          try {
            const context = JSON.parse(appContext);
            restaurantId = context.restauranteId;
          } catch (e) {
            console.warn("Error parsing app context:", e);
          }
        }
        
        // Si aún no hay restauranteId, usar uno por defecto
        if (!restaurantId) {
          restaurantId = "default-restaurant";
          console.warn("⚠️ No se encontró restauranteId, usando valor por defecto:", restaurantId);
        }
      }
      
      console.log("🏪 Usando restauranteId:", restaurantId);

      // Crear datos del pedido para enviar a cocina
      const kitchenOrder = {
        restauranteId: restaurantId,
        mesa: orderData.mesa,
        productos: orderData.productos || [],
        total: orderData.monto || total,
        cliente: orderData.cliente || "Cliente",
        notas: `Método de pago: ${paymentMethod}${paymentMethod === "efectivo" ? ` | Monto recibido: $${cashAmount} | Vuelto: $${change}` : ""}`,
        metodoPago: paymentMethod,
        montoRecibido: paymentMethod === "efectivo" ? parseFloat(cashAmount) : total,
        vuelto: paymentMethod === "efectivo" ? parseFloat(change) : 0,
        whatsapp: orderData.whatsapp || "",
        direccion: orderData.direccion || "",
        timestamp: new Date(),
        estado: "pendiente"
      };

      // Validar datos requeridos
      if (!kitchenOrder.restauranteId || !kitchenOrder.mesa || !kitchenOrder.productos || kitchenOrder.productos.length === 0) {
        throw new Error("Datos incompletos para enviar a cocina");
      }

      console.log("🍳 Enviando pedido a cocina:", kitchenOrder);

      // Registrar ingreso automático para delivery / takeaway cuando el pago
      // se procesa localmente (efectivo u otros métodos que no pasan por MercadoPago).
      try {
        const isDelivery = orderData?.mesa === "DELIVERY";
        const isTakeaway = orderData?.mesa === "TAKEAWAY";

        if (isDelivery || isTakeaway) {
          const tipoIngreso = isDelivery ? "Venta Delivery" : "Venta Takeaway";
          const motivo = `${isDelivery ? 'Delivery' : 'Takeaway'} - Cliente: ${orderData?.cliente || 'Cliente'}`;
          const fecha = new Date();
          const formaIngreso = paymentMethod === "efectivo" ? "Efectivo" : paymentMethod || "efectivo";
          const opcionPago = paymentMethod === "efectivo" ? "caja" : "cuenta_restaurante";

          try {
            await crearIngreso(tipoIngreso, motivo, kitchenOrder.total, formaIngreso, fecha, opcionPago);
            console.log("✅ Ingreso registrado automáticamente para venta:", tipoIngreso);
          } catch (ingresoErr) {
            console.error("❌ Error registrando ingreso automático:", ingresoErr);
            // No interrumpir el flujo principal si falla el registro del ingreso
          }
        }
      } catch (err) {
        console.error("❌ Error preparando registro de ingreso:", err);
      }

      // Enviar a cocina
      const response = await fetch("/api/pedidos-cocina", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(kitchenOrder),
      });

      console.log("📡 Respuesta del servidor:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Pedido enviado a cocina exitosamente:", result);
        // Mostrar modal de envío de ticket
        setShowTicketModal(true);
      } else {
        const errorData = await response.json();
        console.error("❌ Error del servidor:", errorData);
        throw new Error(`Error al enviar pedido a cocina: ${errorData.error || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error procesando pago:", error);
      alert(`Error al procesar el pago: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Cerrar modal de QR primero
    setShowQRModal(false);
    setPaymentData(null);
    
    // Preparar datos del pedido para el ticket (ya está enviado a cocina desde QRPaymentModal)
    // Solo mostramos el modal de ticket para enviar por WhatsApp o mail
    const ticketOrderData = {
      ...orderData,
      metodoPago: "mercadopago",
      montoRecibido: orderData.monto || total,
      vuelto: 0,
      // Indicar que ya está enviado a cocina
      yaEnviadoACocina: true,
    };
    
    // Mostrar modal de envío de ticket después del pago exitoso
    setShowTicketModal(true);
  };

  const handleQRModalClose = () => {
    setShowQRModal(false);
    setPaymentData(null);
  };

  const handleTicketSent = () => {
    setShowTicketModal(false);
    onPaymentComplete(paymentMethod, orderData);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Procesar Pago</h2>
                  <p className="text-slate-400 text-sm">Selecciona el método de pago</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="p-6 border-b border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Resumen del Pedido</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Cliente:</span>
                <span className="text-white font-medium">{orderData?.cliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Productos:</span>
                <span className="text-white font-medium">{orderData?.productos?.length || 0} items</span>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span className="text-white">Total:</span>
                <span className="text-green-400">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Métodos de pago */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Método de Pago</h3>
            
            {/* Opciones de método de pago */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => handlePaymentMethodSelect("efectivo")}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  paymentMethod === "efectivo"
                    ? "border-green-500 bg-green-500/20 shadow-lg"
                    : "border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700/80"
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">💵</div>
                  <div className={`font-semibold ${
                    paymentMethod === "efectivo" ? "text-white" : "text-slate-300"
                  }`}>
                    Efectivo
                  </div>
                </div>
              </button>

              <button
                onClick={() => handlePaymentMethodSelect("mercadopago")}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  paymentMethod === "mercadopago"
                    ? "border-blue-500 bg-blue-500/20 shadow-lg"
                    : "border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700/80"
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">📱</div>
                  <div className={`font-semibold ${
                    paymentMethod === "mercadopago" ? "text-white" : "text-slate-300"
                  }`}>
                    MercadoPago
                  </div>
                </div>
              </button>
            </div>

            {/* Opciones específicas según el método */}
            {paymentMethod === "efectivo" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Monto recibido
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={total}
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={`Mínimo $${total.toFixed(2)}`}
                  />
                </div>
                {cashAmount && parseFloat(cashAmount) >= total && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-green-200 font-medium">Vuelto:</span>
                      <span className="text-green-400 font-bold text-xl">
                        ${change}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === "mercadopago" && (
              <div className="space-y-4">
                <h4 className="text-white font-medium">Selecciona una opción:</h4>
                <div className={`grid gap-4 ${
                  orderData?.mesa === "DELIVERY" 
                    ? "grid-cols-1" 
                    : "grid-cols-1 sm:grid-cols-2"
                }`}>
                  {/* Solo mostrar QR si NO es DELIVERY */}
                  {orderData?.mesa !== "DELIVERY" && (
                    <button
                      onClick={() => setMercadopagoOption("qr")}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        mercadopagoOption === "qr"
                          ? "border-blue-500 bg-blue-500/20 shadow-lg"
                          : "border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700/80"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">📱</div>
                        <div className={`font-semibold ${
                          mercadopagoOption === "qr" ? "text-white" : "text-slate-300"
                        }`}>
                          Código QR
                        </div>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => setMercadopagoOption("link")}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      mercadopagoOption === "link"
                        ? "border-blue-500 bg-blue-500/20 shadow-lg"
                        : "border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700/80"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🔗</div>
                      <div className={`font-semibold ${
                        mercadopagoOption === "link" ? "text-white" : "text-slate-300"
                      }`}>
                        Link de Pago
                      </div>
                    </div>
                  </button>
                </div>
                {/* Mensaje informativo para Delivery */}
                {orderData?.mesa === "DELIVERY" && (
                  <p className="text-xs text-slate-400 text-center">
                    Para pedidos de delivery solo está disponible el link de pago
                  </p>
                )}
              </div>
            )}

            {/* Botón de procesar */}
            <div className="mt-8">
              <button
                onClick={handleProcessPayment}
                disabled={isProcessing || !paymentMethod || (paymentMethod === "efectivo" && !cashAmount) || (paymentMethod === "mercadopago" && !mercadopagoOption)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold transition-all duration-300 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 flex items-center justify-center space-x-3"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Procesar Pago</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de QR/Link de pago Mercado Pago */}
      {showQRModal && paymentData && (
        <QRPaymentModal
          isOpen={showQRModal}
          onClose={handleQRModalClose}
          paymentData={paymentData}
          orderData={{
            ...orderData,
            monto: orderData.monto || total,
            total: orderData.monto || total,
            mercadopagoOption: mercadopagoOption, // Pasar la opción seleccionada (qr o link)
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Modal de envío de ticket */}
      {showTicketModal && (
        <TicketSendModal
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
          orderData={{
            ...orderData,
            metodoPago: paymentMethod || "mercadopago",
            montoRecibido: paymentMethod === "efectivo" ? parseFloat(cashAmount) : (orderData.monto || total),
            vuelto: paymentMethod === "efectivo" ? parseFloat(change) : 0,
            // Asegurar que tenga los datos correctos
            monto: orderData.monto || total,
            total: orderData.monto || total,
          }}
          onSendComplete={handleTicketSent}
        />
      )}
    </>
  );
}
