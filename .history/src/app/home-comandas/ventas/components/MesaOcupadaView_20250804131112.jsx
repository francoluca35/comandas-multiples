"use client";
import React, { useState } from "react";
import CobranzaModal from "./CobranzaModal";

function MesaOcupadaView({ mesa, onBack, onMesaCobrada }) {
  const [showCobranzaModal, setShowCobranzaModal] = useState(false);
  const [estadoMesa, setEstadoMesa] = useState("ocupada"); // "ocupada", "cobrar"
  const [showAddOrder, setShowAddOrder] = useState(false); // Nuevo estado para mostrar vista de agregar pedido
  const [activeCategory, setActiveCategory] = useState("adicionales");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderItems, setOrderItems] = useState([
    {
      id: 1,
      producto: "Adicional Nutella",
      unidades: 1,
      precio: 100,
      total: 100,
    },
  ]);
  const [orderTotal, setOrderTotal] = useState(100);

  // Datos simulados del pedido existente
  const orderData = {
    mesa: mesa?.numero,
    proforma: mesa?.numero,
    monto: orderTotal,
    items: orderItems,
  };

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

  const handleAdicionar = () => {
    setShowAddOrder(true);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleAddToOrder = () => {
    if (!selectedProduct) return;

    const newItem = {
      id: Date.now(),
      producto: selectedProduct.name,
      unidades: 1,
      precio: selectedProduct.price,
      total: selectedProduct.price,
    };

    setOrderItems((prev) => [...prev, newItem]);
    setOrderTotal((prev) => prev + selectedProduct.price);
    setSelectedProduct(null);
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
      case "check":
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Vista de agregar productos al pedido
  if (showAddOrder) {
    return (
      <div className="h-full flex flex-col bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-white font-bold text-xl">
                Mesa {mesa?.numero} - Agregar Productos
              </span>
              {getIcon("table")}
            </div>
            <button
              onClick={() => setShowAddOrder(false)}
              className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white"
            >
              {getIcon("close")}
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
          {/* Left Panel - Product Details */}
          <div className="w-1/3 bg-purple-600 p-4 flex flex-col">
            {selectedProduct ? (
              <>
                <div className="bg-purple-700 rounded-lg p-4 mb-4">
                  <h3 className="text-white font-bold text-lg mb-4">
                    {selectedProduct.name}
                  </h3>

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
                    <button className="bg-white text-gray-800 rounded-lg px-3 py-2 flex items-center space-x-2">
                      {getIcon("note")}
                      <span>Nota</span>
                    </button>
                    <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-800">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToOrder}
                  className="bg-purple-700 text-white rounded-lg px-4 py-3 flex items-center justify-center space-x-2"
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
                  <span>Agregar al pedido</span>
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
                    <div className="text-xs text-gray-400 mb-1">
                      {product.id}
                    </div>
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
              <span className="text-white font-medium">
                {selectedProduct.name}
              </span>
              <div className="text-white">
                x $ {selectedProduct.price} = $ {selectedProduct.price}
              </div>
              <div className="flex space-x-2">
                <button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
                <button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
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
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista normal de mesa ocupada
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
            <span>{orderItems.length}</span>
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

          <button
            onClick={handleAdicionar}
            className="bg-cyan-500 text-white rounded-lg px-3 py-2 flex items-center space-x-2 flex-shrink-0"
          >
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
              {orderItems.map((item) => (
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
              $ {orderTotal}
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
