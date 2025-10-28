"use client";
import React, { useState, useEffect } from "react";
import { useProducts } from "../../../../hooks/useProducts";
import { useTicketGenerator } from "../../../../hooks/useTicketGenerator";
import CobranzaModal from "./CobranzaModal";
import TicketPreview from "./TicketPreview";
import NuevoAgregarPedido from "./NuevoAgregarPedido";

function MesaOcupadaView({ mesa, onBack, onMesaCobrada, onMesaActualizada }) {
  const {
    mainCategories,
    subCategories,
    products,
    loading,
    fetchMainCategories,
    fetchSubCategories,
    fetchAllProducts,
  } = useProducts();

  const [showCobranzaModal, setShowCobranzaModal] = useState(false);
  const [estadoMesa, setEstadoMesa] = useState("ocupada"); // "ocupada", "cobrar"
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [orderItems, setOrderItems] = useState(mesa?.productos || []);
  const [orderTotal, setOrderTotal] = useState(mesa?.total || 0);

  // Hook para generar tickets
  const {
    printTicket,
    downloadTicket,
    showTicketPreview,
    hideTicketPreview,
    ticketContent,
    showPreview,
    isGenerating,
    error,
  } = useTicketGenerator();

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchMainCategories();
    fetchAllProducts();
  }, []);

  // Actualizar datos cuando cambie la mesa
  useEffect(() => {
    if (mesa) {
      setOrderItems(mesa.productos || []);
      setOrderTotal(mesa.total || 0);
    }
  }, [mesa]);

  // Datos reales del pedido existente
  const orderData = {
    mesa: mesa?.numero,
    mesaId: mesa?.id,
    cliente: mesa?.cliente || "Sin nombre",
    proforma: mesa?.numero,
    monto: mesa?.total || orderTotal,
    productos: mesa?.productos || orderItems,
    items: mesa?.productos || orderItems,
  };

  const handleEmitirFactura = async () => {
    try {
      await showTicketPreview(orderData);
    } catch (error) {
      alert("Error al emitir factura: " + error.message);
    }
  };

  const handleEmitirTicket = async () => {
    try {
      await showTicketPreview(orderData);
    } catch (error) {
      alert("Error al emitir ticket: " + error.message);
    }
  };

  const handleEmitirProforma = async () => {
    try {
      await showTicketPreview(orderData);
    } catch (error) {
      alert("Error al emitir proforma: " + error.message);
    }
  };

  const handlePrintTicket = async () => {
    try {
      await printTicket(orderData);
      setEstadoMesa("cobrar");
      hideTicketPreview();
    } catch (error) {
      alert("Error al imprimir ticket: " + error.message);
    }
  };

  const handleCobrar = () => {
    if (estadoMesa === "cobrar") {
      setShowCobranzaModal(true);
    }
  };

  const handlePaymentComplete = (paymentMethod) => {
    setShowCobranzaModal(false);

    // Si el pago fue exitoso o la mesa fue liberada, notificar al padre
    if (
      paymentMethod === "liberada" ||
      paymentMethod === "efectivo" ||
      paymentMethod === "mercadopago" ||
      paymentMethod === "tarjeta"
    ) {
      onMesaCobrada(mesa);
    }
  };

  const handleAdicionar = () => {
    setShowAddOrder(true);
  };

  const handlePedidoAgregado = (nuevosDatos) => {
    console.log("🔄 Actualizando mesa con nuevos datos:", nuevosDatos);
    
    // Actualizar el estado local con los nuevos datos
    setOrderItems(nuevosDatos.productos);
    setOrderTotal(nuevosDatos.total);
    
    // Cerrar la vista de agregar pedido
    setShowAddOrder(false);
    
    // Actualizar también los datos de la mesa para que se reflejen en orderData
    if (mesa) {
      mesa.productos = nuevosDatos.productos;
      mesa.total = nuevosDatos.total;
      mesa.estado = "en_preparacion"; // Actualizar estado a en preparación
    }
    
    console.log("✅ Mesa actualizada exitosamente");
    console.log("📊 Nuevos productos:", nuevosDatos.productos);
    console.log("💰 Nuevo total:", nuevosDatos.total);
    console.log("🟡 Estado de mesa cambiado a: en_preparacion");
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case "table":
        return (
          <svg
            className="w-6 h-6"
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

  // Vista principal de mesa ocupada
  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="text-white hover:text-gray-300">
              ← Volver
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-white font-bold text-xl">
                Mesa {mesa?.numero}
              </span>
              {getIcon("table")}
              {mesa?.estado === "servido" && (
                <div className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                  🍽️ Listo
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              {orderItems.length}
            </button>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="flex-1 p-6">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">
            Detalles del Pedido
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between text-white">
              <span>Mesa:</span>
              <span>{orderData.mesa}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Cliente:</span>
              <span>{orderData.cliente}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Total:</span>
              <span className="font-bold text-orange-400">
                ${orderData.monto.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">Items del Pedido</h2>
          <div className="space-y-2">
            {orderItems && orderItems.length > 0 ? (
              orderItems.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-medium">{item.producto}</span>
                    <span className="text-gray-400 text-sm">x{item.unidades}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-orange-400 font-bold">
                      ${item.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">
                No hay productos en este pedido
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleAdicionar}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Adicionar Pedido</span>
          </button>
     
          <button
            onClick={handleCobrar}
            className={`px-6 py-3 rounded-lg font-bold ${
              estadoMesa === "cobrar"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            Cobrar
          </button>
        </div>
      </div>

      {/* Cobranza Modal */}
      {showCobranzaModal && (
        <CobranzaModal
          isOpen={showCobranzaModal}
          orderData={orderData}
          onClose={() => setShowCobranzaModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Vista de Agregar Pedido */}
      {showAddOrder && (
        <NuevoAgregarPedido
          mesa={mesa}
          onBack={() => setShowAddOrder(false)}
          onPedidoAgregado={handlePedidoAgregado}
          onMesaActualizada={onMesaActualizada}
        />
      )}

      {/* Ticket Preview Modal */}
      {showPreview && ticketContent && (
        <TicketPreview
          ticketContent={ticketContent}
          onClose={hideTicketPreview}
          onPrint={handlePrintTicket}
        />
      )}
    </div>
  );
}

export default MesaOcupadaView;