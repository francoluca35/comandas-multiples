"use client";
import React, { useState } from "react";
import ClienteModal from "./ClienteModal";
import CobranzaModal from "./CobranzaModal";

function PedidoView({ mesa, onBack }) {
  const [activeCategory, setActiveCategory] = useState("adicionales");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showCobranzaModal, setShowCobranzaModal] = useState(false);
  const [clientData, setClientData] = useState(null);

  const categories = [
    { id: "adicionales", name: "0 Adicionales", count: 0 },
    { id: "bebidas", name: "1 Bebidas", count: 1 },
    { id: "brunch", name: "2 Brunch", count: 2 },
    { id: "cafeteria", name: "3 Cafeteria", count: 3 },
    { id: "empanadas", name: "4 Empanadas", count: 4 },
    { id: "heladeria", name: "5 Heladeria", count: 5 },
    { id: "pizzeria", name: "6 Pizzeria", count: 6 },
    { id: "platos", name: "7 Platos", count: 7 },
    { id: "promos", name: "8 Promos", count: 8 },
  ];

  const adicionales = [
    { id: "A1", name: "Adicional Crema", price: 100 },
    { id: "A2", name: "Adicional Dulce de Leche", price: 80 },
    { id: "A3", name: "Adicional Huevo", price: 120 },
    { id: "A4", name: "Adicional Leche Vegetal", price: 90 },
    { id: "A5", name: "Adicional Morron", price: 70 },
    { id: "A6", name: "Adicional Muzza", price: 110 },
    { id: "A7", name: "Adicional Nutella", price: 130 },
    { id: "A8", name: "Adicional Shot Cafe", price: 150 },
  ];

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleAddToOrder = () => {
    if (!selectedProduct) return;

    const newItem = {
      id: Date.now(),
      ...selectedProduct,
      quantity: 1,
      total: selectedProduct.price
    };

    setOrderItems(prev => [...prev, newItem]);
    setOrderTotal(prev => prev + selectedProduct.price);
    setSelectedProduct(null);
  };

  const handleClienteClick = () => {
    setShowClienteModal(true);
  };

  const handleClienteAccept = (data) => {
    setClientData(data);
    console.log("Datos del cliente:", data);
  };

  const handleTerminar = () => {
    setShowCobranzaModal(true);
  };

  const handlePaymentComplete = (paymentMethod) => {
    console.log(`Pago completado con: ${paymentMethod}`);
    console.log("Liberando mesa:", mesa.numero);
    // Aquí iría la lógica para liberar la mesa
    onBack();
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case "table":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8h12M6 8v8M18 8v8" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8" />
          </svg>
        );
      case "client":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case "note":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "close":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case "check":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-white hover:text-gray-300"
          >
            ← Volver a Mesas
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold">Mesa {mesa?.numero}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="bg-white text-gray-800 rounded-lg px-3 py-2 flex items-center space-x-2">
            {getIcon("table")}
            <span>1</span>
          </button>
          
          <button 
            onClick={handleClienteClick}
            className="bg-white text-gray-800 rounded-lg px-3 py-2 flex items-center space-x-2"
          >
            {getIcon("client")}
            <span>Cliente</span>
          </button>
          
          <button className="bg-white text-gray-800 rounded-lg px-3 py-2 flex items-center space-x-2">
            {getIcon("note")}
            <span>Nota</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white">
            {getIcon("close")}
          </button>
          
          <button className="bg-gray-700 text-white rounded-lg px-3 py-2">
            $ {orderTotal}
          </button>
          
          <button 
            onClick={handleTerminar}
            className="bg-cyan-500 text-white rounded-lg px-3 py-2 flex items-center space-x-2"
          >
            {getIcon("check")}
            <span>Terminar</span>
          </button>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg flex-shrink-0 transition-colors ${
                activeCategory === category.id
                  ? "bg-orange-500 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Order Details */}
        <div className="w-1/3 bg-purple-600 p-4 flex flex-col">
          {selectedProduct ? (
            <>
              <div className="bg-purple-700 rounded-lg p-4 mb-4">
                <h3 className="text-white font-bold text-lg mb-4">{selectedProduct.name}</h3>
                
                <div className="flex items-center space-x-2 mb-4">
                  <button className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white">
                    +1
                  </button>
                  <button className="bg-white text-gray-800 rounded-lg px-3 py-2">
                    1 x
                  </button>
                  <button className="bg-white text-gray-800 rounded-lg px-3 py-2">
                    $ {selectedProduct.price}
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-800">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button className="bg-white text-gray-800 rounded-lg px-3 py-2 flex items-center space-x-2">
                    {getIcon("note")}
                    <span>Nota</span>
                  </button>
                  <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-800">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              <button 
                onClick={handleAddToOrder}
                className="bg-purple-700 text-white rounded-lg px-4 py-3 flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Esperar para marchar</span>
              </button>
            </>
          ) : (
            <div className="text-white text-center">
              Selecciona un producto para ver detalles
            </div>
          )}
        </div>

        {/* Right Panel - Product Grid */}
        <div className="flex-1 bg-gray-800 p-4">
          {activeCategory === "adicionales" && (
            <div className="grid grid-cols-4 gap-4">
              {adicionales.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`p-4 rounded-lg text-left transition-colors ${
                    selectedProduct?.id === product.id
                      ? "bg-orange-500 text-white"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-1">{product.id}</div>
                  <div className="font-medium">{product.name}</div>
                </button>
              ))}
            </div>
          )}
          
          {activeCategory !== "adicionales" && (
            <div className="text-white text-center">
              Categoría {activeCategory} - Productos próximamente
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      {selectedProduct && (
        <div className="bg-purple-600 p-4">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">{selectedProduct.name}</span>
            <div className="text-white">
              x $ {selectedProduct.price} = $ {selectedProduct.price}
            </div>
            <div className="flex space-x-2">
              <button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ClienteModal
        isOpen={showClienteModal}
        onClose={() => setShowClienteModal(false)}
        onAccept={handleClienteAccept}
      />

      <CobranzaModal
        isOpen={showCobranzaModal}
        onClose={() => setShowCobranzaModal(false)}
        orderData={{
          mesa: mesa?.numero,
          proforma: "003",
          monto: orderTotal
        }}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}

export default PedidoView;
