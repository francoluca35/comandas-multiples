"use client";
import React, { useState } from "react";
import CobranzaModal from "./CobranzaModal";

function MesaOcupadaView({ mesa, onBack, onMesaCobrada }) {
  const [showCobranzaModal, setShowCobranzaModal] = useState(false);
  const [estadoMesa, setEstadoMesa] = useState("ocupada"); // "ocupada", "cobrar"

  // Datos simulados del pedido existente
  const orderData = {
    mesa: mesa?.numero,
    proforma: mesa?.numero,
    monto: 100,
    items: [
      {
        id: 1,
        producto: "Adicional Nutella",
        unidades: 1,
        precio: 100,
        total: 100,
      },
    ],
  };

  const handleEmitirFactura = () => {
    setEstadoMesa("cobrar");
  };

  const handleEmitirTicket = () => {
    setEstadoMesa("cobrar");
  };

  const handleEmitirProforma = () => {
    setEstadoMesa("cobrar");
  };

  const handleCobrar = () => {
    setShowCobranzaModal(true);
  };

  const handlePaymentComplete = (paymentMethod) => {
    console.log(`Pago completado con: ${paymentMethod}`);
    console.log("Liberando mesa:", mesa.numero);
    onMesaCobrada(mesa.numero);
    onBack();
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case "table":
        return (
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
              d="M6 8h12M6 8v8M18 8v8"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v8"
            />
          </svg>
        );
      case "move":
        return (
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
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        );
      case "client":
        return (
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      case "admin":
        return (
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      case "marchar":
        return (
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
              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
            />
          </svg>
        );
      case "transferir":
        return (
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
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        );
      case "modificar":
        return (
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        );
      case "note":
        return (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "sillas":
        return (
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      case "historial":
        return (
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "add":
        return (
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        );
      case "close":
        return (
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
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          {/* Title */}
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold text-xl">
              Mesa {mesa?.numero}
            </span>
            {getIcon("table")}
          </div>

          {/* Close Button */}
          <button
            onClick={onBack}
            className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white"
          >
            {getIcon("close")}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mt-4 overflow-x-auto">
          <button className="bg-white text-gray-800 rounded-lg px-3 py-2 flex items-center space-x-2 flex-shrink-0">
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
              />
            </svg>
            <span>1</span>
          </button>

          <button className="bg-white text-gray-800 rounded-lg px-3 py-2 flex items-center space-x-2 flex-shrink-0">
            {getIcon("move")}
            <span>Mudar</span>
          </button>

          <button className="bg-white text-gray-800 rounded-lg px-3 py-2 flex items-center space-x-2 flex-shrink-0">
            {getIcon("client")}
            <span>Cliente</span>
          </button>

          <button className="bg-white text-gray-800 rounded-lg px-3 py-2 flex items-center space-x-2 flex-shrink-0">
            {getIcon("admin")}
            <span>admin</span>
          </button>

          <button className="bg-blue-600 text-white rounded-lg px-3 py-2 flex items-center space-x-2 flex-shrink-0">
            {getIcon("marchar")}
            <span>Marchar</span>
          </button>

          <button className="bg-blue-600 text-white rounded-lg px-3 py-2 flex items-center space-x-2 flex-shrink-0">
            {getIcon("transferir")}
            <span>Transferir</span>
          </button>

          <button className="bg-blue-600 text-white rounded-lg px-3 py-2 flex items-center space-x-2 flex-shrink-0">
            {getIcon("modificar")}
            <span>Modificar</span>
          </button>

          <button className="bg-white text-gray-800 rounded-lg px-3 py-2 flex items-center space-x-2 flex-shrink-0">
            {getIcon("note")}
            <span>Nota</span>
          </button>

          <button className="bg-white text-gray-800 rounded-lg px-3 py-2 flex items-center space-x-2 flex-shrink-0">
            {getIcon("sillas")}
            <span>Sillas</span>
          </button>

          <button className="bg-white text-gray-800 rounded-lg px-3 py-2 flex items-center space-x-2 flex-shrink-0">
            {getIcon("historial")}
            <span>Historial</span>
          </button>

          <button className="bg-cyan-500 text-white rounded-lg px-3 py-2 flex items-center space-x-2 flex-shrink-0">
            {getIcon("add")}
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Order Summary */}
        <div className="flex-1 p-4">
          {/* Order Table */}
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-4 gap-4 text-white font-medium mb-2">
              <div>Producto</div>
              <div>Un</div>
              <div>Precio</div>
              <div>Total</div>
            </div>
            <div className="border-t border-gray-600 pt-2">
              {orderData.items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-4 gap-4 text-white"
                >
                  <div>{item.producto}</div>
                  <div>{item.unidades}</div>
                  <div>$ {item.precio}</div>
                  <div>$ {item.total}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="text-white text-2xl font-bold text-center">
              $ {orderData.monto}
            </div>
          </div>

          {/* Discount Button */}
          <button className="w-full bg-white text-gray-800 rounded-lg px-4 py-3 flex items-center justify-center space-x-2">
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <span>Sin Descuento</span>
          </button>
        </div>

        {/* Right Panel - Action Buttons */}
        <div className="w-1/3 p-4 space-y-4">
          <button
            onClick={handleCobrar}
            className={`w-full rounded-lg px-4 py-3 flex items-center justify-center space-x-2 ${
              estadoMesa === "cobrar"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
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
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span>Cobrar al emitir...</span>
          </button>

          <button
            onClick={handleEmitirFactura}
            className="w-full bg-pink-500 text-white rounded-lg px-4 py-3 flex items-center justify-center space-x-2 hover:bg-pink-600"
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Emitir Factura Cliente</span>
          </button>

          <button
            onClick={handleEmitirTicket}
            className="w-full bg-pink-500 text-white rounded-lg px-4 py-3 flex items-center justify-center space-x-2 hover:bg-pink-600"
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Emitir Ticket Fiscal</span>
          </button>

          <button
            onClick={handleEmitirProforma}
            className="w-full bg-pink-500 text-white rounded-lg px-4 py-3 flex items-center justify-center space-x-2 hover:bg-pink-600"
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <span>Emitir Proforma</span>
          </button>
        </div>
      </div>

      {/* Cobranza Modal */}
      <CobranzaModal
        isOpen={showCobranzaModal}
        onClose={() => setShowCobranzaModal(false)}
        orderData={orderData}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}

export default MesaOcupadaView;
