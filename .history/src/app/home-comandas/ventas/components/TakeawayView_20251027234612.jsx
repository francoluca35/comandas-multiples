"use client";

import { useState, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import TakeawayPaymentModal from "./TakeawayPaymentModal";

export default function TakeawayView() {
  const { products, loading: productsLoading } = useProducts();
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

  // Categorías principales
  const mainCategories = [
    { id: "comidas", name: "Comidas" },
    { id: "bebidas", name: "Bebidas" },
    { id: "postres", name: "Postres" },
  ];

  // Subcategorías por categoría principal
  const subCategories = {
    comidas: [
      { id: "hamburguesas", name: "Hamburguesas" },
      { id: "pizzas", name: "Pizzas" },
      { id: "pastas", name: "Pastas" },
    ],
    bebidas: [
      { id: "gaseosas", name: "Gaseosas" },
      { id: "jugos", name: "Jugos" },
      { id: "alcoholicas", name: "Alcohólicas" },
    ],
    postres: [
      { id: "helados", name: "Helados" },
      { id: "tortas", name: "Tortas" },
      { id: "flan", name: "Flan" },
    ],
  };

  // Filtrar productos
  useEffect(() => {
    if (!products) return;

    let filtered = products;

    if (selectedMainCategory) {
      filtered = filtered.filter(
        (product) => product.categoria === selectedMainCategory
      );
    }

    if (selectedSubCategory) {
      filtered = filtered.filter(
        (product) => product.subcategoria === selectedSubCategory
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedMainCategory, selectedSubCategory]);

  const handleProductSelect = (product) => {
    const existingProduct = selectedProducts.find((p) => p.id === product.id);

    if (existingProduct) {
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      );
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        { ...product, cantidad: 1 },
      ]);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedProducts((prev) =>
        prev.filter((product) => product.id !== productId)
      );
    } else {
      setSelectedProducts((prev) =>
        prev.map((product) =>
          product.id === productId ? { ...product, cantidad: newQuantity } : product
        )
      );
    }
  };

  const getTotalItems = () => {
    return selectedProducts.reduce((total, product) => total + product.cantidad, 0);
  };

  const calculateTotal = () => {
    return selectedProducts.reduce(
      (total, product) =>
        total +
        product.precio * (1 - product.descuento / 100) * product.cantidad,
      0
    );
  };

  const handleSubmitOrder = () => {
    if (selectedProducts.length === 0) {
      alert("Por favor seleccione al menos un producto");
      return;
    }

    const orderData = {
      mesa: "TAKEAWAY",
      cliente: clientData.nombre,
      whatsapp: clientData.whatsapp,
      total: calculateTotal(),
      productos: selectedProducts,
      metodoPago: clientData.mPago,
      timestamp: new Date(),
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
    <div className="h-full bg-slate-900 flex flex-col">
      {/* Paso 1: Menú de Productos */}
      {showMenu && (
        <div className="flex-1 bg-slate-800 flex flex-col">
          {/* Header del Menú */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Seleccionar Productos</h2>
              <button
                onClick={handleNextToClientData}
                disabled={selectedProducts.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <span>Continuar</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-6 border-b border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="bg-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-600 transition-colors border border-slate-600 hover:border-slate-500"
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
                      {(product.precio * (1 - product.descuento / 100)).toFixed(2)}
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

          {/* Resumen de productos seleccionados */}
          {selectedProducts.length > 0 && (
            <div className="p-4 bg-slate-700 border-t border-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">
                  {getTotalItems()} {getTotalItems() === 1 ? "producto seleccionado" : "productos seleccionados"}
                </span>
                <span className="text-white font-bold text-lg">
                  Total: ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paso 2: Datos del Cliente */}
      {showClientData && (
        <div className="flex-1 bg-slate-800 flex flex-col">
          {/* Header de Datos del Cliente */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToMenu}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-white">Datos del Cliente</h2>
              </div>
              <button
                onClick={handleNextToOrderSummary}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <span>Continuar</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Formulario de Datos del Cliente */}
          <div className="flex-1 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-200 mb-3">
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-200 mb-3">
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  placeholder="Número de WhatsApp (ej: 5491234567890)"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-200 mb-3">
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="mercadopago">Mercado Pago</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paso 3: Resumen del Pedido */}
      {showOrderSection && (
        <div className="flex-1 bg-slate-800 flex flex-col">
          {/* Header del Resumen */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToClientData}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-white">Resumen del Pedido</h2>
              </div>
            </div>
          </div>

          {/* Contenido del Resumen */}
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              {/* Información del Cliente */}
              <div className="bg-slate-700 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Información del Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-300 text-sm">Nombre:</p>
                    <p className="text-white font-semibold text-lg">{clientData.nombre}</p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">WhatsApp:</p>
                    <p className="text-white font-semibold text-lg">{clientData.whatsapp || "No especificado"}</p>
                  </div>
                </div>
              </div>

              {/* Productos del Pedido */}
              <div className="bg-slate-700 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Productos Seleccionados</h3>
                <div className="space-y-3">
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex justify-between items-center bg-slate-600 rounded-lg p-4">
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-lg">{product.nombre}</h4>
                        <p className="text-gray-300 text-sm">
                          ${(product.precio * (1 - product.descuento / 100)).toFixed(2)} x {product.cantidad}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">
                          ${(product.precio * (1 - product.descuento / 100) * product.cantidad).toFixed(2)}
                        </p>
                        {product.descuento > 0 && (
                          <p className="text-red-400 text-sm">-{product.descuento}% descuento</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total y Botón de Pago */}
              <div className="bg-slate-700 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-white font-bold text-2xl">Total:</span>
                  <span className="text-white font-bold text-3xl">${calculateTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={handleSubmitOrder}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all duration-200 text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105"
                >
                  Procesar Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago */}
      {showPaymentModal && currentOrderData && (
        <TakeawayPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderData={{
            mesa: "TAKEAWAY",
            cliente: currentOrderData.cliente,
            whatsapp: currentOrderData.whatsapp,
            monto: currentOrderData.total,
            productos: currentOrderData.productos,
            metodoPago: currentOrderData.metodoPago,
            timestamp: new Date(),
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}