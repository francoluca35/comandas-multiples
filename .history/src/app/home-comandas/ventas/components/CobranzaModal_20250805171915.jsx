"use client";
import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";

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

  const paymentMethods = [
    { id: "efectivo", name: "Efectivo", icon: "cash" },
    { id: "mercadopago", name: "Mercado Pago", icon: "card" },
    { id: "tarjeta", name: "Tarjeta de Crédito", icon: "credit" },
  ];

  const handleAgregarMoneda = () => {
    setShowPaymentMethods(true);
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleCobrar = () => {
    if (!selectedPaymentMethod) return;

    console.log(`Procesando pago con: ${selectedPaymentMethod.name}`);

    // Simular procesamiento según el método de pago
    switch (selectedPaymentMethod.id) {
      case "efectivo":
        console.log("Liberando mesa inmediatamente");
        onPaymentComplete("efectivo");
        break;
      case "mercadopago":
        console.log("Analizando pago de Mercado Pago...");
        // Simular verificación
        setTimeout(() => {
          console.log("Pago confirmado, liberando mesa");
          onPaymentComplete("mercadopago");
        }, 2000);
        break;
      case "tarjeta":
        console.log("Procesando pago con tarjeta...");
        // Simular procesamiento
        setTimeout(() => {
          console.log("Pago confirmado, liberando mesa");
          onPaymentComplete("tarjeta");
        }, 2000);
        break;
    }

    onClose();
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

      // Actualizar la mesa en Firestore para liberarla
      const mesaRef = doc(
        db,
        `restaurantes/${getRestaurantId()}/tables/${orderData.mesaId}`
      );

      await updateDoc(mesaRef, {
        estado: "libre",
        cliente: "",
        productos: [],
        total: 0,
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
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethodSelect(method)}
                  className={`w-full rounded-lg px-3 py-2 flex items-center space-x-2 transition-colors ${
                    selectedPaymentMethod?.id === method.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
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
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span>{method.name}</span>
                </button>
              ))}
            </div>
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
            disabled={!selectedPaymentMethod}
            className={`flex-1 rounded-lg px-3 py-2 flex items-center justify-center space-x-2 ${
              selectedPaymentMethod
                ? "bg-cyan-500 text-white hover:bg-cyan-600"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="underline">Cobrar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CobranzaModal;
