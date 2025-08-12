"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { useTicketGenerator } from "@/hooks/useTicketGenerator";

function PagoConfirmadoContent() {
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState(null);
  const [externalRef, setExternalRef] = useState(null);

  // Obtener parámetros de la URL
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const externalReference = searchParams.get("external_reference");

  // Hooks
  const { paymentStatus, isApproved, isPending, isRejected, loading } =
    usePaymentStatus(externalReference);
  const { printTicket } = useTicketGenerator();

  useEffect(() => {
    // Extraer información del external_reference
    if (externalReference) {
      setExternalRef(externalReference);

      // Si el pago fue aprobado, imprimir ticket automáticamente
      if (status === "approved" && paymentStatus?.orderData) {
        printTicket(paymentStatus.orderData);
      }
    }
  }, [externalReference, status, paymentStatus, printTicket]);

  const getStatusMessage = () => {
    if (loading) return "Verificando estado del pago...";
    if (isApproved) return "✅ Pago Aprobado - Mesa Liberada";
    if (isPending) return "⏳ Pago Pendiente";
    if (isRejected) return "❌ Pago Rechazado";
    return "Estado desconocido";
  };

  const getStatusColor = () => {
    if (isApproved) return "text-green-600";
    if (isPending) return "text-yellow-600";
    if (isRejected) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          {/* Icono de estado */}
          <div className="mb-6">
            {isApproved ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
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
              </div>
            ) : isPending ? (
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              </div>
            ) : isRejected ? (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-red-600"
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
              </div>
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-gray-600"
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
              </div>
            )}
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Confirmación de Pago
          </h1>

          {/* Estado del pago */}
          <div className={`text-lg font-semibold mb-6 ${getStatusColor()}`}>
            {getStatusMessage()}
          </div>

          {/* Información del pago */}
          {paymentStatus && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-semibold">
                    ${paymentStatus.amount?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método:</span>
                  <span className="font-semibold">
                    {paymentStatus.paymentMethod || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Referencia:</span>
                  <span className="font-semibold text-xs">
                    {paymentStatus.externalReference || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Información de la mesa */}
          {paymentStatus?.orderData && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">
                Información del Pedido
              </h3>
              <div className="space-y-1 text-sm text-blue-700">
                <div>Mesa: {paymentStatus.orderData.mesa}</div>
                <div>Cliente: {paymentStatus.orderData.cliente}</div>
                {isApproved && (
                  <div className="font-semibold text-green-600">
                    ✅ Mesa liberada automáticamente
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="space-y-3">
            {isApproved && (
              <button
                onClick={() =>
                  paymentStatus?.orderData &&
                  printTicket(paymentStatus.orderData)
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
              >
                Imprimir Ticket
              </button>
            )}

            <button
              onClick={() => (window.location.href = "/home-comandas/ventas")}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
            >
              Volver a Ventas
            </button>
          </div>

          {/* Mensaje adicional */}
          {isApproved && (
            <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                El pago ha sido procesado exitosamente y la mesa ha sido
                liberada automáticamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Cargando...
          </h1>
          <p className="text-gray-600">Verificando información del pago</p>
        </div>
      </div>
    </div>
  );
}

export default function PagoConfirmadoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PagoConfirmadoContent />
    </Suspense>
  );
}
