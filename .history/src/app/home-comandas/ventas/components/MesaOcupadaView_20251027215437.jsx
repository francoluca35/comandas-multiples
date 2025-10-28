"use client";
import React, { useState, useEffect } from "react";
import { useProducts } from "../../../../hooks/useProducts";
import { useTicketGenerator } from "../../../../hooks/useTicketGenerator";
import CobranzaModal from "./CobranzaModal";
import TicketPreview from "./TicketPreview";
import AgregarPedidoView from "./AgregarPedidoView";

function MesaOcupadaView({ mesa, onBack, onMesaCobrada }) {
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
  const [showAddOrder, setShowAddOrder] = useState(false); // Nuevo estado para mostrar vista de agregar pedido
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
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

  // Seleccionar primera categoría principal por defecto
  useEffect(() => {
    if (mainCategories.length > 0 && !selectedMainCategory) {
      setSelectedMainCategory(mainCategories[0].id);
    }
  }, [mainCategories]);

  // Cargar subcategorías cuando cambie la categoría principal
  useEffect(() => {
    if (selectedMainCategory) {
      fetchSubCategories(selectedMainCategory);
    }
  }, [selectedMainCategory]);

  // Seleccionar primera subcategoría por defecto
  useEffect(() => {
    if (
      subCategories[selectedMainCategory] &&
      subCategories[selectedMainCategory].length > 0 &&
      !selectedSubCategory
    ) {
      setSelectedSubCategory(subCategories[selectedMainCategory][0].id);
    } else {
      setSelectedSubCategory("");
    }
  }, [subCategories, selectedMainCategory]);

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
    // Actualizar el estado local con los nuevos datos
    setOrderItems(nuevosDatos.productos);
    setOrderTotal(nuevosDatos.total);
    
    // Cerrar la vista de agregar pedido
    setShowAddOrder(false);
    
    // Opcional: mostrar notificación de éxito
    console.log("✅ Pedido adicional agregado exitosamente");
    
    // Actualizar también los datos de la mesa para que se reflejen en orderData
    if (mesa) {
      mesa.productos = nuevosDatos.productos;
      mesa.total = nuevosDatos.total;
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleAddToOrder = () => {
    if (!selectedProduct) return;

    const newItem = {
      id: Date.now(),
      producto: selectedProduct.nombre,
      unidades: 1,
      precio: selectedProduct.precio,
      total: selectedProduct.precio,
    };

    setOrderItems((prev) => [...prev, newItem]);
    setOrderTotal((prev) => prev + selectedProduct.precio);
    setSelectedProduct(null);
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
      case "note":
        return (
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
        );
      default:
        return null;
    }
  };

  // Filtrar productos por categoría principal y subcategoría seleccionadas
  const filteredProducts = products.filter((product) => {
    if (
      selectedMainCategory &&
      product.mainCategoryId !== selectedMainCategory
    ) {
      return false;
    }
    if (selectedSubCategory && product.subCategoryId !== selectedSubCategory) {
      return false;
    }
    return true;
  });

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
          <div className="flex space-x-2 overflow-x-auto mb-4">
            {mainCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedMainCategory(category.id)}
                className={`px-4 py-2 rounded-lg flex-shrink-0 transition-colors ${
                  selectedMainCategory === category.id
                    ? "bg-orange-500 text-white"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {selectedMainCategory && subCategories[selectedMainCategory] && (
            <div className="flex space-x-2 overflow-x-auto">
              {subCategories[selectedMainCategory].map((subCategory) => (
                <button
                  key={subCategory.id}
                  onClick={() => setSelectedSubCategory(subCategory.id)}
                  className={`px-4 py-2 rounded-lg flex-shrink-0 transition-colors ${
                    selectedSubCategory === subCategory.id
                      ? "bg-purple-500 text-white"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  {subCategory.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Panel - Product Details */}
          <div className="w-1/3 bg-purple-600 p-4 flex flex-col">
            {selectedProduct ? (
              <>
                <div className="bg-purple-700 rounded-lg p-4 mb-4">
                  <h3 className="text-white font-bold text-lg mb-4">
                    {selectedProduct.nombre}
                  </h3>

                  <div className="flex items-center space-x-2 mb-4">
                    <button className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white">
                      +1
                    </button>
                    <button className="bg-white text-gray-800 rounded-lg px-3 py-2">
                      1 x
                    </button>
                    <button className="bg-white text-gray-800 rounded-lg px-3 py-2">
                      $ {selectedProduct.precio}
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
            {loading ? (
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="mt-4">Cargando productos...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
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
                    <div className="font-medium">{product.nombre}</div>
                    <div className="text-sm mt-1">${product.precio}</div>
                    {product.descuento > 0 && (
                      <div className="text-xs text-green-400 mt-1">
                        -{product.descuento}% descuento
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-white text-center">
                {selectedMainCategory && selectedSubCategory
                  ? "No hay productos en esta subcategoría"
                  : "Selecciona una categoría y subcategoría para ver productos"}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Bar */}
        {selectedProduct && (
          <div className="bg-purple-600 p-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">
                {selectedProduct.nombre}
              </span>
              <div className="text-white">
                x $ {selectedProduct.precio} = $ {selectedProduct.precio}
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
            <button
              onClick={handleAdicionar}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Adicionar
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
              <span>Proforma:</span>
              <span>{orderData.proforma}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Monto Total:</span>
              <span className="font-bold">
                ${orderData.monto?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-white font-bold text-lg mb-4">
            Items del Pedido
          </h3>
          <div className="space-y-2">
            {orderData.items && orderData.items.length > 0 ? (
              orderData.items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex justify-between items-center text-white p-2 bg-gray-700 rounded"
                >
                  <span>{item.producto}</span>
                  <div className="flex items-center space-x-4">
                    <span>x{item.unidades}</span>
                    <span>${item.precio?.toLocaleString()}</span>
                    <span className="font-bold">
                      ${item.total?.toLocaleString()}
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
            onClick={handleEmitirTicket}
            disabled={isGenerating}
            className={`bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2 ${
              isGenerating ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : null}
            <span>Emitir Ticket</span>
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

      {/* Ticket Preview Modal */}
      {showPreview && ticketContent && (
        <TicketPreview
          ticketContent={ticketContent}
          onClose={hideTicketPreview}
          onPrint={handlePrintTicket}
        />
      )}

      {/* Vista de Agregar Pedido */}
      {showAddOrder && (
        <AgregarPedidoView
          mesa={mesa}
          onBack={() => setShowAddOrder(false)}
          onPedidoAgregado={handlePedidoAgregado}
        />
      )}
    </div>
  );
}

export default MesaOcupadaView;
