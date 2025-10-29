"use client";
import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";
import { useTicketGenerator } from "@/hooks/useTicketGenerator";
import { usePaymentProcessor } from "@/hooks/usePaymentProcessor";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { useIngresos } from "@/hooks/useIngresos";
import { useStockUpdate } from "@/hooks/useStockUpdate";
import PaymentStatusModal from "@/components/PaymentStatusModal";
import QRPaymentModal from "@/components/QRPaymentModal";
import POSPaymentModal from "@/components/POSPaymentModal";
import TicketSendModal from "@/components/TicketSendModal";

// Función para obtener el restaurantId desde localStorage
const getRestaurantId = () => {
  if (typeof window !== "undefined") {
    const restaurantId = localStorage.getItem("restauranteId");
    if (!restaurantId) {
      throw new Error("No se encontró el ID del restaurante");
    }
    return restaurantId;
  }
  return null;
};

function CobranzaModal({ isOpen, onClose, orderData, onPaymentComplete }) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPOSModal, setShowPOSModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [currentExternalRef, setCurrentExternalRef] = useState(null);
  const [showTicketSendModal, setShowTicketSendModal] = useState(false);

  // Hook para generar tickets
  const { printTicket, isGenerating } = useTicketGenerator();

  // Hook para procesar pagos
  const { processPayment, isProcessing, error } = usePaymentProcessor();

  // Hook para monitorear estado del pago
  const { paymentStatus, isApproved, isPending, isRejected } =
    usePaymentStatus(currentExternalRef);

  // Hook para manejar ingresos
  const { crearIngreso } = useIngresos();

  // Hook para actualizar stock
  const { updateStockFromSale } = useStockUpdate();

  // Función para actualizar stock cuando se complete una venta
  const actualizarStockVenta = async () => {
    try {
      if (orderData?.productos && orderData.productos.length > 0) {
        console.log("📦 Actualizando stock por venta:", orderData.productos);
        await updateStockFromSale(orderData.productos);
        console.log("✅ Stock actualizado exitosamente");
      }
    } catch (error) {
      console.error("❌ Error actualizando stock:", error);
      // No lanzar error para no interrumpir el flujo de pago
    }
  };

  // Efecto para mostrar el modal de estado cuando el pago se aprueba
  useEffect(() => {
    if (isApproved && currentExternalRef) {
      setShowPaymentStatus(true);
      // Actualizar stock antes de notificar el pago completado
      actualizarStockVenta();
      // Notificar que el pago se completó
      if (onPaymentComplete) {
        onPaymentComplete("tarjeta");
      }
    }
  }, [isApproved, currentExternalRef, onPaymentComplete]);

  // Función para registrar ingreso automáticamente
  const registrarIngresoAutomatico = async (metodoPago, monto) => {
    try {
      const restauranteId = getRestaurantId();
      const fecha = new Date();

      // Determinar el tipo de ingreso según el método de pago
      let tipoIngreso, formaIngreso, opcionPago;

      if (metodoPago === "efectivo") {
        tipoIngreso = "Venta Mesa";
        formaIngreso = "Efectivo";
        opcionPago = "caja"; // Se suma a caja registradora
      } else if (metodoPago === "tarjeta" || metodoPago === "qr") {
        tipoIngreso = "Venta Mesa";
        formaIngreso = "MercadoPago";
        opcionPago = "cuenta_restaurante"; // Se suma a dinero virtual
      } else {
        // Método de pago no reconocido, usar valores por defecto
        tipoIngreso = "Venta Mesa";
        formaIngreso = metodoPago || "Otro";
        opcionPago = "caja";
      }

      const motivo = `Cobranza mesa ${orderData?.mesa || "N/A"} - ${
        orderData?.cliente || "Cliente"
      }`;

      console.log("💰 Registrando ingreso automático:", {
        tipoIngreso,
        motivo,
        monto,
        formaIngreso,
        opcionPago,
        metodoPago,
        restauranteId,
        fecha: fecha.toISOString(),
      });

      // Crear el ingreso automáticamente
      const resultado = await crearIngreso(
        tipoIngreso,
        motivo,
        monto,
        formaIngreso,
        fecha,
        opcionPago
      );

      console.log("✅ Ingreso registrado automáticamente:", resultado);
    } catch (error) {
      console.error("❌ Error registrando ingreso automático:", error);
      // No lanzamos el error para no interrumpir el flujo de cobranza
    }
  };

  const paymentMethods = [
    {
      id: "efectivo",
      name: "Efectivo",
      icon: "cash",
      description: "Pago en efectivo",
      color: "bg-green-600",
    },
    {
      id: "tarjeta",
      name: "Tarjeta de Crédito/Débito",
      icon: "credit",
      description: "Pago con POS externo",
      color: "bg-blue-600",
    },
    {
      id: "qr",
      name: "Pago con QR",
      icon: "qr",
      description: "Escanea QR con tu celular",
      color: "bg-purple-600",
    },
  ];

  const handleAgregarMoneda = () => {
    setShowPaymentMethods(true);
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleCobrar = async () => {
    if (!selectedPaymentMethod) return;

    console.log(`Procesando pago con: ${selectedPaymentMethod.name}`);

    try {
      // Procesar pago según el método seleccionado
      switch (selectedPaymentMethod.id) {
        case "efectivo":
          console.log("Procesando pago en efectivo...");
          // Para efectivo, procesar inmediatamente y luego mostrar modal de envío
          try {
            // Registrar ingreso automático para efectivo
            await registrarIngresoAutomatico("efectivo", orderData?.monto || 0);
            console.log("Pago en efectivo procesado");

            // Mostrar modal de envío de ticket
            setShowTicketSendModal(true);
          } catch (paymentError) {
            console.error("Error al procesar pago en efectivo:", paymentError);
            alert("Error al procesar el pago: " + paymentError.message);
          }
          break;

        case "tarjeta":
          console.log("Iniciando pago con POS externo...");
          try {
            // Mostrar modal de POS externo
            setShowPOSModal(true);
            // NO cerrar el modal de cobranza aquí, se cerrará desde el modal de POS
          } catch (paymentError) {
            console.error("Error al iniciar pago con POS:", paymentError);
            alert("Error al iniciar el pago: " + paymentError.message);
          }
          break;

        case "qr":
          try {
            // Procesar pago con Mercado Pago para obtener la URL
            const result = await processPayment(
              orderData,
              selectedPaymentMethod.id
            );

            if (result?.success && result?.data) {
              // Guardar datos del pago y mostrar modal QR
              setPaymentData(result.data);
              setShowQRModal(true);

              // Guardar external_reference para monitorear el pago
              if (result?.data?.externalReference) {
                setCurrentExternalRef(result.data.externalReference);
              }
            } else {
              alert("Error: No se pudieron obtener los datos de pago");
            }
          } catch (paymentError) {
            console.error("Error al procesar pago QR:", paymentError);
            alert("Error al procesar el pago: " + paymentError.message);
          }
          break;

        default:
          console.log("Método de pago no reconocido");
          break;
      }
    } catch (error) {
      console.error("Error al procesar pago:", error);
      alert("Error al procesar el pago: " + error.message);
    }
  };

  const handleEmitirTicket = () => {
    console.log("Descargando ticket...");
    // Aquí iría la lógica para descargar el ticket
  };

  const handleLiberarMesa = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres liberar la mesa? Esta acción eliminará todos los datos del pedido."
      )
    ) {
      return;
    }

    try {
      // Asumiendo que orderData contiene el ID de la mesa
      // Si no lo tiene, necesitaremos pasarlo desde el componente padre
      if (!orderData.mesaId) {
        console.error("No se encontró el ID de la mesa");
        alert("Error: No se pudo identificar la mesa");
        return;
      }

      // Actualizar stock antes de liberar la mesa
      await actualizarStockVenta();

      // Actualizar la mesa en Firestore para liberarla
      const mesaRef = doc(
        db,
        `restaurantes/${getRestaurantId()}/tables/${orderData.mesaId}`
      );

      await updateDoc(mesaRef, {
        estado: "pagado",
        updatedAt: new Date(),
      });

      console.log("Mesa liberada exitosamente:", orderData.mesa);
      alert("Mesa liberada exitosamente");
      onPaymentComplete("liberada");
      onClose();
    } catch (error) {
      console.error("Error al liberar mesa:", error);
      alert("Error al liberar la mesa. Inténtalo de nuevo.");
    }
  };

  const handleTicketSendComplete = async (sendMethod, ticketData) => {
    console.log("✅ Ticket enviado exitosamente:", { sendMethod, ticketData });
    
    // Actualizar stock antes de notificar el pago completado
    await actualizarStockVenta();
    
    // Notificar que el pago se completó
    if (onPaymentComplete) {
      onPaymentComplete("efectivo");
    }

    // Cerrar todos los modales
    setShowTicketSendModal(false);
    onClose();
  };

  const handleCloseTicketSendModal = async () => {
    setShowTicketSendModal(false);
    
    // Actualizar stock antes de notificar el pago completado
    await actualizarStockVenta();
    
    // Notificar que el pago se completó aunque no se envió el ticket
    if (onPaymentComplete) {
      onPaymentComplete("efectivo");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
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
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span className="text-white font-bold text-lg">Cobranza</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Payment Status Indicator */}
        {currentExternalRef && (
          <div className="mb-4 p-3 rounded-lg border">
            {isApproved ? (
              <div className="flex items-center space-x-2 text-green-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-semibold">
                  ✅ Pago Aprobado - Mesa Liberada
                </span>
              </div>
            ) : isPending ? (
              <div className="flex items-center space-x-2 text-yellow-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                <span className="font-semibold">
                  ⏳ Esperando confirmación del pago...
                </span>
              </div>
            ) : isRejected ? (
              <div className="flex items-center space-x-2 text-red-600">
                <svg
                  className="w-5 h-5"
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
                <span className="font-semibold">❌ Pago Rechazado</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="font-semibold">🔄 Monitoreando pago...</span>
              </div>
            )}
          </div>
        )}

        {/* Summary Information */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <svg
              className="w-6 h-6 text-white mx-auto mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 8h12M6 8v8M18 8v8"
              />
            </svg>
            <div className="text-white text-sm">Mesa</div>
            <div className="text-white font-bold">
              {orderData?.mesa || "N/A"}
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <svg
              className="w-6 h-6 text-white mx-auto mb-1"
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
            <div className="text-white text-sm">Cliente</div>
            <div className="text-white font-bold text-xs">
              {orderData?.cliente || "Sin nombre"}
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <svg
              className="w-6 h-6 text-white mx-auto mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <div className="text-white text-sm">Total</div>
            <div className="text-white font-bold">
              $ {orderData?.monto?.toLocaleString() || "0"}
            </div>
          </div>
        </div>

        {/* Detalles del Pedido */}
        {orderData?.productos && orderData.productos.length > 0 && (
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-white font-bold text-lg mb-3">
              Detalles del Pedido
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {orderData.productos.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex justify-between items-center text-white text-sm"
                >
                  <div className="flex-1">
                    <span className="font-medium">{item.producto}</span>
                    <span className="text-gray-300 ml-2">x{item.unidades}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">
                      ${item.total?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-600 mt-3 pt-3">
              <div className="flex justify-between items-center text-white font-bold">
                <span>Total:</span>
                <span>${orderData?.monto?.toLocaleString() || "0"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method Selection */}
        <div className="flex items-center space-x-2 mb-6">
          <button className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white hover:bg-pink-600">
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>

          <button className="bg-blue-600 text-white rounded-lg px-3 py-2">
            $ {orderData?.monto || "100"}
          </button>

          {selectedPaymentMethod ? (
            <button className="bg-purple-600 text-white rounded-lg px-3 py-2">
              {selectedPaymentMethod.name}
            </button>
          ) : (
            <button
              onClick={handleAgregarMoneda}
              className="bg-purple-600 text-white rounded-lg px-3 py-2 hover:bg-purple-700"
            >
              Agregar moneda
            </button>
          )}

          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>
        </div>

        {/* Payment Methods */}
        {showPaymentMethods && (
          <div className="mb-6">
            <div className="text-white text-sm mb-3">
              Seleccionar método de pago:
            </div>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethodSelect(method)}
                  className={`w-full rounded-lg p-4 flex items-center space-x-3 transition-all duration-200 ${
                    selectedPaymentMethod?.id === method.id
                      ? `${method.color} text-white shadow-lg transform scale-105`
                      : "bg-gray-700 text-white hover:bg-gray-600 hover:transform hover:scale-102"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      selectedPaymentMethod?.id === method.id
                        ? "bg-white bg-opacity-20"
                        : "bg-gray-600"
                    }`}
                  >
                    {method.icon === "cash" ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    ) : method.icon === "credit" ? (
                      <svg
                        className="w-5 h-5"
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
                    ) : method.icon === "qr" ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
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
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{method.name}</div>
                    <div className="text-xs opacity-75">
                      {method.description}
                    </div>
                  </div>
                  {selectedPaymentMethod?.id === method.id && (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Información adicional para tarjeta */}
            {selectedPaymentMethod?.id === "tarjeta" && (
              <div className="mt-4 p-3 bg-blue-900 bg-opacity-50 rounded-lg border border-blue-400">
                <div className="flex items-start space-x-2">
                  <svg
                    className="w-5 h-5 text-blue-300 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-blue-100 text-sm">
                    <p className="font-medium">Pago con POS externo</p>
                    <p className="text-xs opacity-75 mt-1">
                      Se abrirá un modal con instrucciones para procesar el pago
                      con el POS físico.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Información adicional para QR */}
            {selectedPaymentMethod?.id === "qr" && (
              <div className="mt-4 p-3 bg-purple-900 bg-opacity-50 rounded-lg border border-purple-400">
                <div className="flex items-start space-x-2">
                  <svg
                    className="w-5 h-5 text-purple-300 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
                    />
                  </svg>
                  <div className="text-purple-100 text-sm">
                    <p className="font-medium">Pago con código QR</p>
                    <p className="text-xs opacity-75 mt-1">
                      Se generará un código QR que podrás escanear con tu
                      celular para pagar de forma rápida y segura.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="bg-purple-600 text-white rounded-lg px-3 py-2 flex items-center justify-center space-x-2 hover:bg-purple-700">
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <span>Cuenta corriente</span>
          </button>

          <button
            onClick={handleEmitirTicket}
            className="bg-pink-500 text-white rounded-lg px-3 py-2 flex items-center justify-center space-x-2 hover:bg-pink-600"
          >
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Anular proforma</span>
          </button>

          <button className="bg-pink-500 text-white rounded-lg px-3 py-2 flex items-center justify-center space-x-2 hover:bg-pink-600">
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>Modificar mesa</span>
          </button>

          <button className="bg-gray-600 text-white rounded-lg px-3 py-2 flex items-center justify-center space-x-2 hover:bg-gray-700">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Ya Facturado</span>
          </button>

          <button className="bg-white text-gray-800 rounded-lg px-3 py-2 flex items-center justify-center space-x-2 hover:bg-gray-100 col-span-2">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Ver proforma</span>
          </button>
        </div>

        {/* Final Action Buttons */}
        <div className="flex gap-3">
          {/* Botón Liberar Mesa */}
          <button
            onClick={handleLiberarMesa}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2 flex items-center justify-center space-x-2 transition-colors"
          >
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>Liberar Mesa</span>
          </button>

          {/* Botón Cobrar */}
          <button
            onClick={handleCobrar}
            disabled={!selectedPaymentMethod || isGenerating || isProcessing}
            className={`flex-1 rounded-lg px-3 py-2 flex items-center justify-center space-x-2 ${
              selectedPaymentMethod && !isGenerating && !isProcessing
                ? "bg-cyan-500 text-white hover:bg-cyan-600"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isGenerating || isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            <span className="underline">
              {isGenerating
                ? "Imprimiendo..."
                : isProcessing
                ? "Procesando..."
                : "Cobrar"}
            </span>
          </button>
        </div>
      </div>

      {/* Modal de estado de pago */}
      <PaymentStatusModal
        isOpen={showPaymentStatus}
        onClose={() => setShowPaymentStatus(false)}
        externalReference={currentExternalRef}
        onPaymentComplete={onPaymentComplete}
      />

      {/* Modal de pago con QR */}
      <QRPaymentModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        paymentData={paymentData}
        orderData={orderData}
      />

      {/* Modal de pago con POS externo */}
      <POSPaymentModal
        isOpen={showPOSModal}
        onClose={() => setShowPOSModal(false)}
        orderData={orderData}
        onPaymentComplete={onPaymentComplete}
      />

      {/* Modal de Envío de Ticket */}
      {showTicketSendModal && (
        <TicketSendModal
          isOpen={showTicketSendModal}
          onClose={handleCloseTicketSendModal}
          orderData={orderData}
          onSendComplete={handleTicketSendComplete}
        />
      )}
    </div>
  );
}

export default CobranzaModal;
