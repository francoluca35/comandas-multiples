"use client";

import { useState, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import EnhancedPaymentModal from "./EnhancedPaymentModal";

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
  const [showSelectedProducts, setShowSelectedProducts] = useState(false);
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
        (product) => product.mainCategoryId === selectedMainCategory || product.categoria === selectedMainCategory
      );
      console.log("🔍 Filtrado por categoría principal:", selectedMainCategory, "resultados:", filtered.length);
    }

    if (selectedSubCategory) {
      filtered = filtered.filter(
        (product) => product.subCategoryId === selectedSubCategory || product.subcategoria === selectedSubCategory
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

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.filter((product) => product.id !== productId)
    );
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
          <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Seleccionar Productos</h2>
                  <p className="text-slate-400 text-xs">Elige los productos para tu pedido</p>
                </div>
              </div>
              <button
                onClick={handleNextToClientData}
                disabled={selectedProducts.length === 0}
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
              >
                <span className="text-sm">Continuar</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/30 to-slate-900/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-full px-3 py-2 bg-slate-700/80 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 appearance-none cursor-pointer text-sm"
                  >
                    <option value="">Todas las categorías</option>
                    {mainCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {selectedMainCategory && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Subcategoría</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSubCategory}
                      onChange={(e) => setSelectedSubCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/80 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 appearance-none cursor-pointer text-sm"
                    >
                      <option value="">Todas las subcategorías</option>
                      {subCategories[selectedMainCategory]?.map((subCategory) => (
                        <option key={subCategory.id} value={subCategory.id}>
                          {subCategory.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grid de Productos */}
          <div className="flex-1 p-4 overflow-y-auto">
            {productsLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <p className="text-gray-400 text-sm">Cargando productos...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="text-gray-400 text-4xl mb-3">🍽️</div>
                  <p className="text-gray-400 text-sm mb-2">No hay productos disponibles</p>
                  <p className="text-gray-500 text-xs">
                    {products?.length === 0 
                      ? "No se encontraron productos en la base de datos" 
                      : "Intenta cambiar los filtros de categoría"
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="group bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-sm rounded-lg p-3 cursor-pointer hover:from-slate-600/80 hover:to-slate-700/80 transition-all duration-300 border border-slate-600/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transform hover:scale-105 hover:-translate-y-1"
                >
                  {/* Imagen del producto (placeholder) */}
                  <div className="w-full h-20 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg mb-3 flex items-center justify-center group-hover:from-blue-500/20 group-hover:to-blue-600/20 transition-all duration-300">
                    <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
                  </div>
                  
                  {/* Contenido */}
                  <div className="space-y-2">
                    <h3 className="text-white font-bold text-sm mb-1 truncate group-hover:text-blue-300 transition-colors duration-300">
                      {product.nombre}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 group-hover:text-slate-300 transition-colors duration-300">
                      {product.descripcion || "Delicioso producto disponible"}
                    </p>
                    
                    {/* Precio y descuento */}
                    <div className="flex justify-between items-center pt-1">
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-sm group-hover:text-blue-300 transition-colors duration-300">
                          ${(product.precio * (1 - product.descuento / 100)).toFixed(2)}
                        </span>
                        {product.descuento > 0 && (
                          <span className="text-slate-500 text-xs line-through">
                            ${product.precio.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {product.descuento > 0 && (
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          -{product.descuento}%
                        </div>
                      )}
                    </div>
                    
                    {/* Botón de agregar */}
                    <div className="pt-1">
                      <div className="w-full bg-gradient-to-r from-blue-600/20 to-blue-700/20 group-hover:from-blue-600/30 group-hover:to-blue-700/30 rounded-lg p-2 text-center transition-all duration-300">
                        <span className="text-blue-400 font-semibold text-xs group-hover:text-blue-300 transition-colors duration-300">
                          + Agregar
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
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 border-t border-blue-500/30 backdrop-blur-sm">
              {/* Header desplegable */}
              <div 
                className="p-3 cursor-pointer hover:bg-blue-600/10 transition-colors duration-200"
                onClick={() => setShowSelectedProducts(!showSelectedProducts)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-white font-bold text-sm">
                        {getTotalItems()} {getTotalItems() === 1 ? "producto" : "productos"}
                      </span>
                      <p className="text-blue-200 text-xs">seleccionados</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-blue-200 text-xs">Total</p>
                      <span className="text-white font-bold text-lg">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                    <div className={`transform transition-transform duration-200 ${showSelectedProducts ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista desplegable de productos */}
              {showSelectedProducts && (
                <div className="border-t border-blue-500/20 bg-slate-800/50 max-h-64 overflow-y-auto">
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="p-3 border-b border-slate-700/30 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold text-sm mb-1">{product.nombre}</h4>
                          <p className="text-slate-400 text-xs">
                            ${(product.precio * (1 - product.descuento / 100)).toFixed(2)} c/u
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {/* Controles de cantidad */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(product.id, product.cantidad - 1)}
                              className="w-6 h-6 bg-slate-600 hover:bg-slate-500 rounded-full flex items-center justify-center transition-colors duration-200"
                            >
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            
                            <span className="text-white font-bold text-sm min-w-[2rem] text-center">
                              {product.cantidad}
                            </span>
                            
                            <button
                              onClick={() => handleQuantityChange(product.id, product.cantidad + 1)}
                              className="w-6 h-6 bg-slate-600 hover:bg-slate-500 rounded-full flex items-center justify-center transition-colors duration-200"
                            >
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>

                          {/* Precio total del producto */}
                          <div className="text-right min-w-[4rem]">
                            <span className="text-white font-bold text-sm">
                              ${(product.precio * (1 - product.descuento / 100) * product.cantidad).toFixed(2)}
                            </span>
                          </div>

                          {/* Botón eliminar */}
                          <button
                            onClick={() => handleRemoveProduct(product.id)}
                            className="w-6 h-6 bg-red-600/20 hover:bg-red-600/40 rounded-full flex items-center justify-center transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
          <div className="flex-1 p-8">
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Nombre */}
                <div className="space-y-3">
                  <label className="text-lg font-bold text-slate-200 mb-3 flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span>Nombre completo</span>
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
                    className="w-full px-6 py-4 bg-slate-700/80 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-lg transition-all duration-200 hover:bg-slate-700/90"
                    placeholder="Ingresa el nombre completo"
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-3">
                  <label className="text-lg font-bold text-slate-200 mb-3 flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span>WhatsApp</span>
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
                    className="w-full px-6 py-4 bg-slate-700/80 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-lg transition-all duration-200 hover:bg-slate-700/90"
                    placeholder="5491234567890"
                />
              </div>

                {/* Dirección */}
                <div className="space-y-3 md:col-span-2">
                  <label className="text-lg font-bold text-slate-200 mb-3 flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span>Dirección de entrega</span>
                </label>
                <textarea
                  value={clientData.direccion}
                  onChange={(e) =>
                    setClientData((prev) => ({
                      ...prev,
                      direccion: e.target.value,
                    }))
                  }
                    className="w-full px-6 py-4 bg-slate-700/80 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none text-lg transition-all duration-200 hover:bg-slate-700/90"
                    placeholder="Calle, número, barrio, ciudad..."
                    rows="4"
                />
              </div>

                {/* Método de Pago */}
                <div className="space-y-3 md:col-span-2">
                  <label className="text-lg font-bold text-slate-200 mb-3 flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg">
                      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <span>Método de pago</span>
                </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { value: "efectivo", label: "Efectivo", icon: "💵", color: "green" },
                      { value: "tarjeta", label: "Tarjeta", icon: "💳", color: "blue" },
                      { value: "mercadopago", label: "Mercado Pago", icon: "📱", color: "purple" }
                    ].map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setClientData(prev => ({ ...prev, mPago: method.value }))}
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                          clientData.mPago === method.value
                            ? `border-${method.color}-500 bg-${method.color}-500/20 shadow-lg`
                            : 'border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700/80'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">{method.icon}</div>
                          <div className={`font-semibold ${
                            clientData.mPago === method.value ? 'text-white' : 'text-slate-300'
                          }`}>
                            {method.label}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paso 3: Resumen del Pedido */}
      {showOrderSection && (
        <div className="flex-1 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm flex flex-col shadow-2xl">
          {/* Header del Resumen */}
          <div className="p-8 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToClientData}
                  className="p-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-300 rounded-xl hover:scale-105"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Resumen del Pedido</h2>
                    <p className="text-slate-400 text-sm">Revisa y confirma tu pedido</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido del Resumen */}
          <div className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Información del Cliente */}
                <div className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-600/50 shadow-2xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Información del Cliente</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Nombre</p>
                        <p className="text-white font-bold text-lg">{clientData.nombre}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                </div>
                        <div>
                        <p className="text-slate-400 text-sm">WhatsApp</p>
                        <p className="text-white font-bold text-lg">{clientData.whatsapp || "No especificado"}</p>
                      </div>
                        </div>
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-purple-500/20 rounded-lg mt-1">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-400 text-sm">Dirección</p>
                        <p className="text-white font-bold text-lg">{clientData.direccion}</p>
                      </div>
                        </div>
                      </div>
                    </div>

                {/* Productos del Pedido */}
                <div className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-600/50 shadow-2xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Productos</h3>
                  </div>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                          {selectedProducts.map((product) => (
                      <div key={product.id} className="bg-slate-600/50 rounded-xl p-4 hover:bg-slate-600/70 transition-all duration-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-white font-bold text-lg mb-1">{product.nombre}</h4>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-slate-300">
                                ${(product.precio * (1 - product.descuento / 100)).toFixed(2)} c/u
                              </span>
                              <span className="text-slate-400">x{product.cantidad}</span>
                                  {product.descuento > 0 && (
                                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-semibold">
                                      -{product.descuento}%
                                    </span>
                                  )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold text-xl">
                              ${(product.precio * (1 - product.descuento / 100) * product.cantidad).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
        </div>
      </div>

              {/* Total y Botón de Pago */}
              <div className="mt-8 bg-gradient-to-r from-blue-600/20 to-blue-700/20 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
            </div>
              <div>
                      <p className="text-blue-200 text-lg">Total a pagar</p>
                      <p className="text-white font-bold text-4xl">${calculateTotal().toFixed(2)}</p>
          </div>
        </div>
                </div>
                <button
                  onClick={handleSubmitOrder}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 px-8 rounded-2xl font-bold transition-all duration-300 text-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center space-x-3"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Procesar Pedido</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago */}
      {showPaymentModal && currentOrderData && (
        <EnhancedPaymentModal
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