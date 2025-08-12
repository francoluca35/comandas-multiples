"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePaymentProcessor } from "@/hooks/usePaymentProcessor";

export default function PagoExitosoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { checkPaymentStatus } = usePaymentProcessor();

  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const externalReference = searchParams.get("external_reference");

  useEffect(() => {
    if (paymentId) {
      checkPaymentStatus(paymentId)
        .then((payment) => {
          setPaymentStatus(payment);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error al verificar pago:", error);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [paymentId, checkPaymentStatus]);

  const handleVolverAVentas = () => {
    router.push("/home-comandas/ventas");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "rejected":
      case "cancelled":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Aprobado";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazado";
      case "cancelled":
        return "Cancelado";
      default:
        return "Desconocido";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return (
          <svg
            className="w-24 h-24 text-green-500"
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
        );
      case "pending":
        return (
          <svg
            className="w-24 h-24 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "rejected":
      case "cancelled":
        return (
          <svg
            className="w-24 h-24 text-red-500"
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
        );
      default:
        return (
          <svg
            className="w-24 h-24 text-gray-500"
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
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando estado del pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center">
          {/* Icono de estado */}
          {getStatusIcon(paymentStatus?.status || status)}

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-800 mt-6 mb-2">
            Pago {getStatusText(paymentStatus?.status || status)}
          </h1>

          {/* Estado */}
          <p
            className={`text-xl font-semibold ${getStatusColor(
              paymentStatus?.status || status
            )} mb-6`}
          >
            {getStatusText(paymentStatus?.status || status)}
          </p>

          {/* Detalles del pago */}
          {paymentStatus && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Detalles del Pago
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID de Pago:</span>
                  <span className="font-semibold">{paymentStatus.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span
                    className={`font-semibold ${getStatusColor(
                      paymentStatus.status
                    )}`}
                  >
                    {getStatusText(paymentStatus.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método:</span>
                  <span className="font-semibold">
                    {paymentStatus.payment_method?.type || "Tarjeta"}
                  </span>
                </div>
                {paymentStatus.transaction_amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto:</span>
                    <span className="font-semibold">
                      ${paymentStatus.transaction_amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {paymentStatus.date_created && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-semibold">
                      {new Date(paymentStatus.date_created).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mensaje según el estado */}
          {paymentStatus?.status === "approved" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">
                ¡Pago procesado exitosamente! El cliente puede retirarse.
              </p>
            </div>
          )}

          {paymentStatus?.status === "pending" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 font-medium">
                El pago está siendo procesado. Por favor, espera la
                confirmación.
              </p>
            </div>
          )}

          {paymentStatus?.status === "rejected" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium">
                El pago fue rechazado. Por favor, intenta con otro método de
                pago.
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="space-y-3">
            <button
              onClick={handleVolverAVentas}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors"
            >
              Volver a Ventas
            </button>

            {paymentStatus?.status === "approved" && (
              <button
                onClick={() => window.print()}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors"
              >
                Imprimir Comprobante
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
