"use client";
import React, { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { useIngresos } from "../hooks/useIngresos";
import { usePaymentStatus } from "../hooks/usePaymentStatus";

function QRPaymentModal({ isOpen, onClose, paymentData, orderData, onPaymentSuccess }) {
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [hasAutoProcessed, setHasAutoProcessed] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState("");
  const { crearIngreso } = useIngresos();
  
  // Usar el hook para monitorear el estado del pago automáticamente
  const externalReference = paymentData?.externalReference || null;
  const { paymentStatus, isApproved, isPending, isRejected, loading: paymentStatusLoading } = usePaymentStatus(externalReference);

  // Logging para debugging
  useEffect(() => {
    if (externalReference) {
      console.log("🔍 Monitoreando pago con externalReference:", externalReference);
    }
  }, [externalReference]);

  useEffect(() => {
    if (paymentStatus) {
      console.log("📊 Estado del pago actualizado:", {
        status: paymentStatus.status,
        amount: paymentStatus.amount,
        externalReference: paymentStatus.externalReference,
      });
    }
  }, [paymentStatus]);

  // Actualizar mensaje de estado
  useEffect(() => {
    if (isApproved) {
      setPaymentStatusMessage("✅ ¡Pago Aprobado! Procesando pedido...");
    } else if (isPending) {
      setPaymentStatusMessage("⏳ Esperando confirmación del pago...");
    } else if (isRejected) {
      setPaymentStatusMessage("❌ Pago rechazado. Por favor intenta nuevamente.");
    } else if (paymentStatusLoading) {
      setPaymentStatusMessage("🔄 Verificando estado del pago...");
    } else {
      setPaymentStatusMessage("💳 Escanea el código QR o usa el link para pagar");
    }
  }, [isApproved, isPending, isRejected, paymentStatusLoading]);

  useEffect(() => {
    if (isOpen && paymentData?.initPoint) {
      // Solo generar QR si NO es DELIVERY y NO está seleccionado "link"
      const isDelivery = orderData?.mesa === "DELIVERY";
      const isLinkOnly = orderData?.mercadopagoOption === "link";
      
      if (!isDelivery && !isLinkOnly) {
        generateQRCode();
      } else {
        // Para DELIVERY o link, solo mostrar el link (no generar QR)
        setIsLoading(false);
      }
      setPaymentConfirmed(false);
      setHasAutoProcessed(false);
    } else {
      // Mostrar error específico
      if (isOpen && !paymentData) {
        setError("No se recibieron datos de pago");
      } else if (isOpen && !paymentData?.initPoint) {
        setError("No se recibió la URL de pago de Mercado Pago");
      }
    }
  }, [isOpen, paymentData, orderData]);

  const registrarIngresoAutomatico = async () => {
    try {
      console.log("💰 Registrando ingreso automático MercadoPago");
      const fecha = new Date();
      
      // Determinar el tipo de venta basado en el tipo de pedido
      const isDelivery = orderData.mesa === "DELIVERY";
      const isTakeaway = orderData.mesa === "TAKEAWAY";
      
      const motivo = `${isDelivery ? 'Delivery' : 'Takeaway'} - Cliente: ${orderData.cliente}`;
      const tipoIngreso = isDelivery ? "Venta Delivery" : "Venta Takeaway";
      const formaIngreso = "MercadoPago";
      const opcionPago = "cuenta_restaurante";
      
      await crearIngreso(tipoIngreso, motivo, orderData.total, formaIngreso, fecha, opcionPago);
      console.log("✅ Ingreso MercadoPago registrado exitosamente");
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

      // Determinar el tipo de pedido
      const isDelivery = orderData.mesa === "DELIVERY";
      const isTakeaway = orderData.mesa === "TAKEAWAY";

      const pedidoCocina = {
        mesa: orderData.mesa, // "DELIVERY" o "TAKEAWAY"
        productos: orderData.productos,
        total: orderData.total,
        cliente: orderData.cliente,
        direccion: isDelivery ? orderData.direccion : undefined,
        whatsapp: orderData.whatsapp || "",
        metodoPago: "mercadopago",
        notas: "",
        timestamp: new Date(),
        estado: "pendiente",
        restauranteId: restauranteId,
        tipo: isDelivery ? "delivery" : "takeaway",
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
      console.log(`✅ Pedido ${isDelivery ? 'delivery' : 'takeaway'} enviado a cocina exitosamente:`, result);
    } catch (error) {
      console.error("❌ Error al enviar pedido a cocina:", error);
      throw new Error(`Error al enviar pedido a cocina: ${error.message}`);
    }
  };

  // Función para procesar el pago automáticamente cuando se aprueba
  const handleAutoProcessPayment = useCallback(async () => {
    setIsCheckingPayment(true);
    try {
      console.log("🔄 Procesando pago aprobado automáticamente...");
      setPaymentStatusMessage("🔄 Procesando pedido...");
      
      // Registrar ingreso automático
      const fecha = new Date();
      const isDelivery = orderData.mesa === "DELIVERY";
      const isTakeaway = orderData.mesa === "TAKEAWAY";
      const motivo = `${isDelivery ? 'Delivery' : 'Takeaway'} - Cliente: ${orderData.cliente}`;
      const tipoIngreso = isDelivery ? "Venta Delivery" : "Venta Takeaway";
      const formaIngreso = "MercadoPago";
      const opcionPago = "cuenta_restaurante";
      
      setPaymentStatusMessage("💰 Registrando ingreso...");
      await crearIngreso(tipoIngreso, motivo, orderData.total || orderData.monto, formaIngreso, fecha, opcionPago);
      console.log("✅ Ingreso MercadoPago registrado exitosamente");
      
      // Enviar a cocina
      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) {
        throw new Error("No se encontró el ID del restaurante");
      }

      setPaymentStatusMessage("🚀 Enviando pedido a cocina...");
      const pedidoCocina = {
        mesa: orderData.mesa,
        productos: orderData.productos,
        total: orderData.total || orderData.monto,
        cliente: orderData.cliente,
        direccion: isDelivery ? orderData.direccion : undefined,
        whatsapp: orderData.whatsapp || "",
        metodoPago: "mercadopago",
        notas: "",
        timestamp: new Date(),
        estado: "pendiente",
        restauranteId: restauranteId,
        tipo: isDelivery ? "delivery" : "takeaway",
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
      console.log(`✅ Pedido ${isDelivery ? 'delivery' : 'takeaway'} enviado a cocina exitosamente:`, result);
      
      setPaymentConfirmed(true);
      setPaymentStatusMessage("✅ ¡Pago confirmado y pedido enviado a cocina exitosamente!");
      
      // Mostrar notificación con SweetAlert si está disponible
      if (typeof window !== "undefined" && window.Swal) {
        window.Swal.fire({
          icon: "success",
          title: "¡Pago Acreditado!",
          text: "El pago ha sido confirmado y el pedido ha sido enviado a cocina automáticamente.",
          timer: 3000,
          showConfirmButton: true,
        });
      } else {
        // Fallback: alert simple
        setTimeout(() => {
          alert("✅ ¡Pago acreditado! El pedido ha sido enviado a cocina.");
        }, 500);
      }
      
      // Llamar al callback de pago exitoso
      if (onPaymentSuccess) {
        onPaymentSuccess("mercadopago");
      }
    } catch (error) {
      console.error("❌ Error procesando pago automáticamente:", error);
      setHasAutoProcessed(false); // Permitir reintentar
      setPaymentStatusMessage(`❌ Error: ${error.message}`);
      alert(`Error al procesar el pago: ${error.message}`);
    } finally {
      setIsCheckingPayment(false);
    }
  }, [orderData, crearIngreso, onPaymentSuccess]);

  // Monitorear automáticamente el estado del pago
  useEffect(() => {
    console.log("🔍 Monitoreo de pago:", {
      isApproved,
      paymentConfirmed,
      hasAutoProcessed,
      externalReference,
      paymentStatus: paymentStatus?.status,
    });

    // Si el pago está aprobado y no lo hemos procesado aún, procesarlo automáticamente
    if (isApproved && !paymentConfirmed && !hasAutoProcessed && externalReference) {
      console.log("✅ Pago aprobado automáticamente, procesando...");
      console.log("📋 Datos del pago:", paymentStatus);
      
      // Mostrar notificación visual
      setPaymentStatusMessage("✅ ¡Pago Aprobado! Enviando pedido a cocina...");
      
      setHasAutoProcessed(true);
      handleAutoProcessPayment();
    }
  }, [isApproved, paymentConfirmed, hasAutoProcessed, externalReference, handleAutoProcessPayment, paymentStatus]);

  const generateQRCode = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!paymentData?.initPoint) {
        throw new Error("No initPoint available for QR generation");
      }

      // Verificar que la URL sea válida
      try {
        new URL(paymentData.initPoint);
      } catch (urlError) {
        throw new Error("URL de pago inválida: " + paymentData.initPoint);
      }

      // Generar QR con la URL de Mercado Pago
      const qrDataURL = await QRCode.toDataURL(paymentData.initPoint, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCode(qrDataURL);
    } catch (err) {
      console.error("Error generando QR:", err);
      setError("Error al generar el código QR: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (paymentData?.initPoint) {
      navigator.clipboard.writeText(paymentData.initPoint);
      alert("Link copiado al portapapeles");
    }
  };

  const handleOpenInNewTab = () => {
    if (paymentData?.initPoint) {
      window.open(paymentData.initPoint, "_blank");
    }
  };

  const handleCheckPayment = async () => {
    setIsCheckingPayment(true);
    try {
      // Si ya está aprobado, procesar directamente
      if (isApproved) {
        await handleAutoProcessPayment();
        return;
      }

      // Si está pendiente, verificar estado
      if (isPending) {
        alert("El pago está pendiente. Por favor espera la confirmación de Mercado Pago.");
        return;
      }

      // Si está rechazado
      if (isRejected) {
        alert("El pago fue rechazado. Por favor intenta nuevamente.");
        return;
      }

      // Si no hay estado aún, intentar verificar manualmente
      if (paymentData?.externalReference) {
        // Verificar estado del pago en la API
        const response = await fetch(
          `/api/pagos/verificar-pago?external_reference=${paymentData.externalReference}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === "approved") {
            await handleAutoProcessPayment();
          } else {
            alert(`El pago está en estado: ${data.status}`);
          }
        } else {
          alert("No se pudo verificar el estado del pago. El pedido se procesará cuando Mercado Pago confirme el pago.");
        }
      } else {
        // Fallback: procesar directamente (para casos donde el pago ya se realizó)
        await registrarIngresoAutomatico();
        await enviarACocina();
        setPaymentConfirmed(true);
        
        if (onPaymentSuccess) {
          onPaymentSuccess("mercadopago");
        }
      }
    } catch (error) {
      console.error("❌ Error verificando pago:", error);
      alert("Error al verificar el pago. Inténtalo de nuevo.");
    } finally {
      setIsCheckingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            {orderData?.mesa === "DELIVERY" || orderData?.mercadopagoOption === "link" ? (
              <>
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <span className="text-gray-800 font-bold text-lg">Link de Pago Mercado Pago</span>
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6 text-blue-600"
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
                <span className="text-gray-800 font-bold text-lg">Pago con QR</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
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

        {/* Información del pedido */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Detalles del Pedido
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Mesa:</span>
              <span className="font-semibold">{orderData?.mesa || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-semibold">
                {orderData?.cliente || "Sin nombre"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold text-lg text-green-600">
                ${orderData?.monto?.toLocaleString() || "0"}
              </span>
            </div>
          </div>
        </div>

        {/* Mensaje de estado del pago */}
        {paymentStatusMessage && (
          <div className={`mb-4 p-4 rounded-lg text-center font-semibold ${
            isApproved || paymentConfirmed 
              ? "bg-green-100 text-green-800 border-2 border-green-500 animate-pulse" 
              : isPending 
                ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-500" 
                : isRejected 
                  ? "bg-red-100 text-red-800 border-2 border-red-500" 
                  : "bg-blue-100 text-blue-800 border-2 border-blue-500"
          }`}>
            <div className="flex items-center justify-center space-x-2">
              {isApproved || paymentConfirmed ? (
                <>
                  <svg className="w-6 h-6 text-green-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-lg">{paymentStatusMessage}</span>
                </>
              ) : isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                  <span>{paymentStatusMessage}</span>
                </>
              ) : isRejected ? (
                <>
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{paymentStatusMessage}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{paymentStatusMessage}</span>
                </>
              )}
            </div>
            {externalReference && (
              <p className="text-xs mt-2 opacity-75">
                Monitoreando pago: {externalReference.substring(0, 20)}...
              </p>
            )}
          </div>
        )}

        {/* QR Code o Link según el tipo de pedido */}
        <div className="text-center mb-6">
          {/* Para DELIVERY, solo mostrar el link (no QR) */}
          {orderData?.mesa === "DELIVERY" || orderData?.mercadopagoOption === "link" ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <div className="flex items-center justify-center mb-4">
                  <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Link de Pago Mercado Pago
                </h3>
                <p className="text-sm text-blue-600 mb-4">
                  Comparte este link con el cliente para que pueda pagar
                </p>
                {paymentData?.initPoint && (
                  <div className="bg-white p-3 rounded border border-blue-200 mb-4">
                    <p className="text-xs text-gray-600 break-all font-mono">
                      {paymentData.initPoint}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                  <p className="text-gray-600">Generando código QR...</p>
                </div>
              ) : error ? (
                <div className="text-red-600">
                  <p>{error}</p>
                  <button
                    onClick={generateQRCode}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Reintentar
                  </button>

                  {/* Fallback: Mostrar URL si el QR falla */}
                  {paymentData?.initPoint && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 mb-2">
                        <strong>Alternativa:</strong> Puedes usar este enlace
                        directo:
                      </p>
                      <div className="bg-white p-2 rounded border text-xs break-all">
                        {paymentData.initPoint}
                      </div>
                      <button
                        onClick={handleOpenInNewTab}
                        className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                      >
                        Abrir en Nueva Pestaña
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    <img
                      src={qrCode}
                      alt="Código QR para pago"
                      className="w-64 h-64"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Escanea este código QR con tu celular para pagar
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={handleCopyLink}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
          >
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
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span>Copiar Link</span>
          </button>

          <button
            onClick={handleOpenInNewTab}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
          >
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span>Abrir en Nueva Pestaña</span>
          </button>

          {!paymentConfirmed && (
            <button
              onClick={handleCheckPayment}
              disabled={isCheckingPayment}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Verificando Pago...</span>
                </>
              ) : (
                <>
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Confirmar Pago y Enviar a Cocina</span>
                </>
              )}
            </button>
          )}

          {paymentConfirmed && (
            <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-semibold">¡Pago Confirmado! Pedido enviado a cocina.</span>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg px-4 py-3 font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>

        {/* Instrucciones */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Instrucciones:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Abre la app de Mercado Pago en tu celular</li>
            <li>2. Escanea el código QR</li>
            <li>3. Completa el pago con dinero real</li>
            <li>4. Recibirás confirmación automática</li>
            <li>5. El ticket se imprimirá automáticamente</li>
          </ol>

          {/* Información de producción */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-green-800 text-sm">
                <p className="font-medium">✅ Entorno de Producción</p>
                <p className="text-xs mt-1">
                  Los pagos se procesarán con dinero real. Asegúrate de que los
                  datos sean correctos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRPaymentModal;
