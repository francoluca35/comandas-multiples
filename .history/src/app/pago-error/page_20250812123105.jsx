"use client";
import { useRouter, useSearchParams, Suspense } from "next/navigation";

function PagoErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const externalReference = searchParams.get("external_reference");

  const handleVolverAVentas = () => {
    router.push("/home-comandas/ventas");
  };

  const handleReintentar = () => {
    // Volver a la página de ventas para reintentar el pago
    router.push("/home-comandas/ventas");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center">
          {/* Icono de error */}
          <svg
            className="w-24 h-24 text-red-500 mx-auto mb-6"
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

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Error en el Pago
          </h1>

          {/* Estado */}
          <p className="text-xl font-semibold text-red-500 mb-6">
            El pago no pudo ser procesado
          </p>

          {/* Detalles del error */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4">
              Información del Error
            </h3>
            <div className="space-y-3 text-sm">
              {paymentId && (
                <div className="flex justify-between">
                  <span className="text-red-600">ID de Pago:</span>
                  <span className="font-semibold">{paymentId}</span>
                </div>
              )}
              {status && (
                <div className="flex justify-between">
                  <span className="text-red-600">Estado:</span>
                  <span className="font-semibold text-red-500">{status}</span>
                </div>
              )}
              {externalReference && (
                <div className="flex justify-between">
                  <span className="text-red-600">Referencia:</span>
                  <span className="font-semibold text-xs">
                    {externalReference}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mensaje de ayuda */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-medium">
              Posibles causas del error:
            </p>
            <ul className="text-yellow-700 text-sm mt-2 space-y-1">
              <li>• Tarjeta sin fondos suficientes</li>
              <li>• Datos de tarjeta incorrectos</li>
              <li>• Tarjeta bloqueada o vencida</li>
              <li>• Problemas de conexión</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <button
              onClick={handleReintentar}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors"
            >
              Reintentar Pago
            </button>

            <button
              onClick={handleVolverAVentas}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors"
            >
              Volver a Ventas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Cargando...</h1>
          <p className="text-gray-600">Verificando información del error</p>
        </div>
      </div>
    </div>
  );
}

export default function PagoErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PagoErrorContent />
    </Suspense>
  );
}
