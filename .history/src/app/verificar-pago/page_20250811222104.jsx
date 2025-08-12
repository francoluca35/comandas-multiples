"use client";
import { useState } from "react";

export default function VerificarPagoPage() {
  const [paymentId, setPaymentId] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const verificarPago = async () => {
    if (!paymentId || !restaurantId) {
      alert("Por favor, ingresa el ID del pago y el ID del restaurante");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/verificar-pago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
          restaurantId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al verificar el pago");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Verificar Estado de Pago
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Información del Pago</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID del Pago (Mercado Pago)
              </label>
              <input
                type="text"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                placeholder="Ej: 1234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID del Restaurante
              </label>
              <input
                type="text"
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                placeholder="Ej: restaurante1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={verificarPago}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-md transition-colors"
            >
              {loading ? "Verificando..." : "Verificar Pago"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-green-800 font-semibold mb-4">
              Resultado de la Verificación
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">ID del Pago:</span>
                  <p className="text-gray-800">{result.payment.id}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Estado:</span>
                  <p className={`font-semibold ${
                    result.payment.status === "approved" ? "text-green-600" :
                    result.payment.status === "pending" ? "text-yellow-600" :
                    result.payment.status === "rejected" ? "text-red-600" :
                    "text-gray-600"
                  }`}>
                    {result.payment.status === "approved" ? "✅ Aprobado" :
                     result.payment.status === "pending" ? "⏳ Pendiente" :
                     result.payment.status === "rejected" ? "❌ Rechazado" :
                     result.payment.status}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Monto:</span>
                  <p className="text-gray-800">${result.payment.transaction_amount?.toLocaleString() || "0"}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Método de Pago:</span>
                  <p className="text-gray-800">{result.payment.payment_method?.type || "N/A"}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Referencia Externa:</span>
                  <p className="text-gray-800 text-sm">{result.payment.external_reference || "N/A"}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Fecha de Creación:</span>
                  <p className="text-gray-800 text-sm">
                    {result.payment.date_created ? new Date(result.payment.date_created).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>

              {result.payment.additional_info && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Información Adicional:</h4>
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {JSON.stringify(result.payment.additional_info, null, 2)}
                  </pre>
                </div>
              )}

              {result.payment.status === "approved" && (
                <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✅ Este pago ha sido aprobado. La mesa debería haberse liberado automáticamente.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
