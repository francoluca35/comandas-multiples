"use client";

import { useState, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import DeliveryPaymentModal from "./DeliveryPaymentModal";

export default function DeliveryView() {
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
    direccion: "",
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
    console.log("🔍 Filtrando productos:", {
      products: products?.length || 0,
      selectedMainCategory,
      selectedSubCategory,
      loading: productsLoading
    });

    if (!products || products.length === 0) {
      console.log("❌ No hay productos disponibles");
      setFilteredProducts([]);
      return;
    }

    let filtered = products;

    if (selectedMainCategory) {
      filtered = filtered.filter(
        (product) => product.mainCategoryId === selectedMainCategory
      );
      console.log("🔍 Filtrado por categoría principal:", selectedMainCategory, "resultados:", filtered.length);
    }

    if (selectedSubCategory) {
      filtered = filtered.filter(
        (product) => product.subCategoryId === selectedSubCategory
      );
      console.log("🔍 Filtrado por subcategoría:", selectedSubCategory, "resultados:", filtered.length);
    }

    console.log("✅ Productos filtrados finales:", filtered.length);
    setFilteredProducts(filtered);
  }, [products, selectedMainCategory, selectedSubCategory, productsLoading]);

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
      mesa: "DELIVERY",
      cliente: clientData.nombre,
      direccion: clientData.direccion,
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
    setClientData({ nombre: "", direccion: "", whatsapp: "", mPago: "efectivo" });
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
    if (!clientData.direccion.trim()) {
      alert("Por favor ingrese la dirección de entrega");
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
    <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Paso 1: Menú de Productos */}
      {showMenu && (
        <div className="flex-1 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm flex flex-col shadow-2xl">
          {/* Header del Menú */}
          <div className="p-8 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Seleccionar Productos</h2>
                  <p className="text-slate-400 text-sm">Elige los productos para tu pedido</p>
                </div>
              </div>
              <button
                onClick={handleNextToClientData}
                disabled={selectedProducts.length === 0}
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
              >
                <span className="text-lg">Continuar</span>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-8 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/30 to-slate-900/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>Categoría</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedMainCategory}
                    onChange={(e) => {
                      setSelectedMainCategory(e.target.value);
                      setSelectedSubCategory("");
                    }}
                    className="w-full px-4 py-3 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="">Todas las categorías</option>
                    {mainCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {selectedMainCategory && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Subcategoría</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSubCategory}
                      onChange={(e) => setSelectedSubCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="">Todas las subcategorías</option>
                      {subCategories[selectedMainCategory]?.map((subCategory) => (
                        <option key={subCategory.id} value={subCategory.id}>
                          {subCategory.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grid de Productos */}
          <div className="flex-1 p-6 overflow-y-auto">
            {productsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-400 text-lg">Cargando productos...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                  <p className="text-gray-400 text-lg mb-2">No hay productos disponibles</p>
                  <p className="text-gray-500 text-sm">
                    {products?.length === 0 
                      ? "No se encontraron productos en la base de datos" 
                      : "Intenta cambiar los filtros de categoría"
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="group bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-6 cursor-pointer hover:from-slate-600/80 hover:to-slate-700/80 transition-all duration-300 border border-slate-600/50 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transform hover:scale-105 hover:-translate-y-1"
                >
                  {/* Imagen del producto (placeholder) */}
                  <div className="w-full h-32 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl mb-4 flex items-center justify-center group-hover:from-blue-500/20 group-hover:to-blue-600/20 transition-all duration-300">
                    <svg className="w-12 h-12 text-slate-400 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  {/* Contenido */}
                  <div className="space-y-3">
                    <h3 className="text-white font-bold text-lg mb-2 truncate group-hover:text-blue-300 transition-colors duration-300">
                      {product.nombre}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2 group-hover:text-slate-300 transition-colors duration-300">
                      {product.descripcion || "Delicioso producto disponible"}
                    </p>
                    
                    {/* Precio y descuento */}
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-xl group-hover:text-blue-300 transition-colors duration-300">
                          ${(product.precio * (1 - product.descuento / 100)).toFixed(2)}
                        </span>
                        {product.descuento > 0 && (
                          <span className="text-slate-500 text-sm line-through">
                            ${product.precio.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {product.descuento > 0 && (
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          -{product.descuento}%
                        </div>
                      )}
                    </div>
                    
                    {/* Botón de agregar */}
                    <div className="pt-2">
                      <div className="w-full bg-gradient-to-r from-blue-600/20 to-blue-700/20 group-hover:from-blue-600/30 group-hover:to-blue-700/30 rounded-xl p-3 text-center transition-all duration-300">
                        <span className="text-blue-400 font-semibold text-sm group-hover:text-blue-300 transition-colors duration-300">
                          + Agregar al pedido
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumen de productos seleccionados */}
          {selectedProducts.length > 0 && (
            <div className="p-6 bg-gradient-to-r from-blue-600/20 to-blue-700/20 border-t border-blue-500/30 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-white font-bold text-lg">
                      {getTotalItems()} {getTotalItems() === 1 ? "producto" : "productos"}
                    </span>
                    <p className="text-blue-200 text-sm">seleccionados</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-200 text-sm">Total</p>
                  <span className="text-white font-bold text-2xl">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paso 2: Datos del Cliente */}
      {showClientData && (
        <div className="flex-1 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm flex flex-col shadow-2xl">
          {/* Header de Datos del Cliente */}
          <div className="p-8 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToMenu}
                  className="p-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-300 rounded-xl hover:scale-105"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Datos del Cliente</h2>
                    <p className="text-slate-400 text-sm">Información de contacto y entrega</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleNextToOrderSummary}
                className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <span className="text-lg">Continuar</span>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  Dirección
                </label>
                <textarea
                  value={clientData.direccion}
                  onChange={(e) =>
                    setClientData((prev) => ({
                      ...prev,
                      direccion: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-lg"
                  placeholder="Dirección de entrega"
                  rows="4"
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
                  <div className="md:col-span-2">
                    <p className="text-gray-300 text-sm">Dirección:</p>
                    <p className="text-white font-semibold text-lg">{clientData.direccion}</p>
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
        <DeliveryPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderData={{
            mesa: "DELIVERY",
            cliente: currentOrderData.cliente,
            direccion: currentOrderData.direccion,
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