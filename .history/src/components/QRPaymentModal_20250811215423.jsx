"use client";
import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

function QRPaymentModal({ isOpen, onClose, paymentData, orderData }) {
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🔍 QRPaymentModal useEffect triggered:", {
      isOpen,
      paymentData,
      paymentDataKeys: paymentData ? Object.keys(paymentData) : [],
      hasInitPoint: !!paymentData?.initPoint,
      initPointValue: paymentData?.initPoint,
    });

    if (isOpen && paymentData?.initPoint) {
      console.log(
        "✅ Generating QR code with initPoint:",
        paymentData.initPoint
      );
      generateQRCode();
    } else {
      console.log("❌ Cannot generate QR - missing data:", {
        isOpen,
        hasPaymentData: !!paymentData,
        hasInitPoint: !!paymentData?.initPoint,
        paymentDataType: typeof paymentData,
        paymentDataKeys: paymentData ? Object.keys(paymentData) : [],
      });

      // Mostrar error específico
      if (isOpen && !paymentData) {
        setError("No se recibieron datos de pago");
      } else if (isOpen && !paymentData?.initPoint) {
        setError("No se recibió la URL de pago de Mercado Pago");
      }
    }
  }, [isOpen, paymentData]);

  const generateQRCode = async () => {
    try {
      console.log("Starting QR generation with paymentData:", paymentData);
      setIsLoading(true);
      setError(null);

      if (!paymentData?.initPoint) {
        throw new Error("No initPoint available for QR generation");
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

      console.log("QR generated successfully");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
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

        {/* QR Code */}
        <div className="text-center mb-6">
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
            <li>
              2. <strong>Importante:</strong> Asegúrate de usar una cuenta
              diferente a la del restaurante
            </li>
            <li>3. Escanea el código QR</li>
            <li>4. Completa el pago</li>
            <li>5. Recibirás confirmación automática</li>
          </ol>

          {/* Advertencia sobre el error */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div className="text-yellow-800 text-sm">
                <p className="font-medium">
                  ¿Error "No podés pagarte a vos mismo"?
                </p>
                <p className="text-xs mt-1">
                  Esto ocurre cuando intentas pagar con la misma cuenta del
                  restaurante. Usa una cuenta diferente o contacta al
                  administrador.
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
