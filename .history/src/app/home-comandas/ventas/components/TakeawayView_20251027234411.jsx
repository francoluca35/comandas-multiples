"use client";
import React, { useState, useEffect } from "react";
import { useProducts } from "../../../../hooks/useProducts";
import TakeawayPaymentModal from "./TakeawayPaymentModal";

function TakeawayView({ onBack }) {
  const {
    products,
    mainCategories,
    subCategories,
    fetchMainCategories,
    fetchSubCategories,
    fetchAllProducts,
  } = useProducts();
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showClientData, setShowClientData] = useState(false);
  const [showOrderSection, setShowOrderSection] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [clientData, setClientData] = useState({
    nombre: "",
    whatsapp: "",
    mPago: "efectivo",
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchMainCategories();
      await fetchAllProducts();
    };
    loadInitialData();
  }, []);

  // Filtrar productos cuando cambian las categorías
  useEffect(() => {
    if (selectedMainCategory && selectedSubCategory) {
      const filtered = products.filter(
        (product) =>
          product.mainCategoryId === selectedMainCategory &&
          product.subCategoryId === selectedSubCategory
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [selectedMainCategory, selectedSubCategory, products]);

  // Cargar subcategorías cuando se selecciona una categoría principal
  useEffect(() => {
    if (selectedMainCategory) {
      fetchSubCategories(selectedMainCategory);
    }
  }, [selectedMainCategory]);

  const handleProductSelect = (product) => {
    const existingProduct = selectedProducts.find((p) => p.id === product.id);

    if (existingProduct) {
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      );
    } else {
      setSelectedProducts((prev) => [...prev, { ...product, cantidad: 1 }]);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
    } else {
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, cantidad: newQuantity } : p
        )
      );
    }
  };

  const calculateSubtotal = () => {
    return selectedProducts.reduce((total, product) => {
      const discountedPrice = product.precio * (1 - product.descuento / 100);
      return total + discountedPrice * product.cantidad;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const getTotalItems = () => {
    return selectedProducts.reduce(
      (total, product) => total + product.cantidad,
      0
    );
  };

  const handleSubmitOrder = async () => {
    if (!clientData.nombre.trim()) {
      alert("Por favor ingrese el nombre del cliente");
      return;
    }

    if (selectedProducts.length === 0) {
      alert("Por favor seleccione al menos un producto");
      return;
    }

    // Preparar datos del pedido
    const orderData = {
      cliente: clientData.nombre,
      whatsapp: clientData.whatsapp,
      total: calculateTotal(),
      productos: selectedProducts.map((item) => ({
        producto: item.nombre, // Cambiar nombre por producto para el ticket
        unidades: item.cantidad, // Cambiar cantidad por unidades para el ticket
        precio: item.precio,
        total: item.precio * item.cantidad,
        notas: "",
      })),
      metodoPago: clientData.mPago,
    };

    // Mostrar modal de pago
    setCurrentOrderData(orderData);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (paymentMethod, orderData) => {
    // Limpiar formulario después del pago exitoso
    setClientData({ nombre: "", whatsapp: "", mPago: "efectivo" });
    setSelectedProducts([]);
    setShowPaymentModal(false);
    // Volver al menú
    setShowMenu(true);
    setShowClientData(false);
    setShowOrderSection(false);
  };

  // Función para ir al siguiente paso (de menú a datos del cliente)
  const handleNextToClientData = () => {
    if (selectedProducts.length === 0) {
      alert("Por favor seleccione al menos un producto");
      return;
    }
    setShowMenu(false);
    setShowClientData(true);
  };

  // Función para ir al siguiente paso (de datos del cliente a resumen)
  const handleNextToOrderSummary = () => {
    if (!clientData.nombre.trim()) {
      alert("Por favor ingrese el nombre del cliente");
      return;
    }
    setShowClientData(false);
    setShowOrderSection(true);
  };

  // Función para volver al menú
  const handleBackToMenu = () => {
    setShowMenu(true);
    setShowClientData(false);
    setShowOrderSection(false);
  };

  // Función para volver a datos del cliente
  const handleBackToClientData = () => {
    setShowClientData(true);
    setShowOrderSection(false);
  };

  return (
    <div className="h-full bg-slate-900 flex">
      {/* Panel Izquierdo - Datos Cliente y Pedido */}
      <div className="w-1/2 bg-slate-800 flex flex-col">
        {/* Datos Cliente - Expandible */}
        <div className="border-b border-slate-700">
          <div
            className="p-4 cursor-pointer hover:bg-slate-700/50 transition-colors flex items-center justify-between"
            onClick={() => setShowClientData(!showClientData)}
          >
            <h2 className="text-xl font-bold text-white">Datos Cliente</h2>
            <svg
              className={`w-6 h-6 text-white transition-transform duration-200 ${
                showClientData ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {showClientData && (
            <div className="px-4 pb-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={clientData.nombre}
                  onChange={(e) =>
                    setClientData((prev) => ({
                      ...prev,
                      nombre: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={clientData.whatsapp}
                  onChange={(e) =>
                    setClientData((prev) => ({
                      ...prev,
                      whatsapp: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Número de WhatsApp (ej: 5491234567890)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Método de Pago
                </label>
                <select
                  value={clientData.mPago}
                  onChange={(e) =>
                    setClientData((prev) => ({
                      ...prev,
                      mPago: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="mercadopago">Mercado Pago</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Pedido Resumido - Expandible */}
        <div className="flex-1 flex flex-col relative">
          <div
            className="p-4 cursor-pointer hover:bg-slate-700/50 transition-colors flex items-center justify-between"
            onClick={() => setShowOrderSection(!showOrderSection)}
          >
            <h2 className="text-xl font-bold text-white">Pedido</h2>
            <div className="flex items-center space-x-2">
              {selectedProducts.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOrderDetails(!showOrderDetails);
                  }}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span className="text-sm">
                    {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      showOrderDetails ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )}
              <svg
                className={`w-6 h-6 text-white transition-transform duration-200 ${
                  showOrderSection ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Estado del Pedido */}
          {showOrderSection && (
            <>
              {selectedProducts.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">🛒</div>
                    <p className="text-gray-400 text-lg">
                      No hay productos seleccionados
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Selecciona productos del menú
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Sección fija en la parte inferior */}
                  <div className="absolute bottom-6 left-6 right-6 z-10">
                    {/* Resumen Rápido */}
                    <div className="bg-slate-800 rounded-lg p-4 mb-4 shadow-2xl">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-300 text-sm">
                            Total de items:
                          </p>
                          <p className="text-white font-semibold">
                            {getTotalItems()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-300 text-sm">Total:</p>
                          <p className="text-white font-bold text-xl">
                            ${calculateTotal().toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botón Procesar */}
                    <button
                      onClick={handleSubmitOrder}
                      className="w-full bg-orange-600 text-white py-4 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-lg shadow-2xl"
                    >
                      Procesar Pago
                    </button>
                  </div>

                  {/* Área de contenido principal con scroll - con padding bottom para el total fijo */}
                  <div className="flex-1 overflow-y-auto pb-40">
                    {/* Detalles del Pedido (Expandible) */}
                    {showOrderDetails && (
                      <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-4 mb-4 border border-slate-600/50 shadow-2xl shadow-black/20 z-20 relative">
                        <div className="space-y-3">
                          {selectedProducts.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between bg-slate-600/80 backdrop-blur-sm rounded-xl p-4 border border-slate-500/30 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-slate-600/90"
                            >
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium truncate text-lg">
                                  {product.nombre}
                                </h4>
                                <p className="text-gray-300 text-sm mt-1">
                                  $
                                  {(
                                    product.precio *
                                    (1 - product.descuento / 100)
                                  ).toFixed(2)}
                                  {product.descuento > 0 && (
                                    <span className="text-red-400 ml-2 font-semibold">
                                      -{product.descuento}%
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center space-x-3 ml-4">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      product.id,
                                      product.cantidad - 1
                                    )
                                  }
                                  className="w-10 h-10 bg-red-600/80 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
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
                                      d="M20 12H4"
                                    />
                                  </svg>
                                </button>
                                <span className="text-white font-bold text-lg min-w-[2.5rem] text-center bg-slate-700/50 rounded-lg py-1 px-2">
                                  {product.cantidad}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      product.id,
                                      product.cantidad + 1
                                    )
                                  }
                                  className="w-10 h-10 bg-green-600/80 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
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
                                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Panel Derecho - Menú */}
      <div className="w-1/2 bg-slate-900 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Menú</h2>

          {/* Filtros */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo
              </label>
              <select
                value={selectedMainCategory}
                onChange={(e) => {
                  setSelectedMainCategory(e.target.value);
                  setSelectedSubCategory("");
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {mainCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedMainCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SubCategoría
                </label>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las subcategorías</option>
                  {subCategories[selectedMainCategory]?.map((subCategory) => (
                    <option key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className="bg-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-700 transition-colors border border-slate-600 hover:border-slate-500"
              >
                <h3 className="text-white font-medium mb-2 truncate">
                  {product.nombre}
                </h3>
                <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                  {product.descripcion}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">
                    $
                    {(product.precio * (1 - product.descuento / 100)).toFixed(
                      2
                    )}
                  </span>
                  {product.descuento > 0 && (
                    <span className="text-red-400 text-sm font-medium">
                      -{product.descuento}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Pago */}
      {showPaymentModal && currentOrderData && (
        <TakeawayPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderData={currentOrderData}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}

export default TakeawayView;
