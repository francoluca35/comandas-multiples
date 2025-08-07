"use client";
import React, { useState, useEffect } from "react";
import { useProducts } from "../../../../hooks/useProducts";

function DeliveryView({ onBack }) {
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
  const [clientData, setClientData] = useState({
    nombre: "",
    direccion: "",
    mPago: "efectivo",
  });

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

  const handleSubmitOrder = () => {
    if (!clientData.nombre.trim()) {
      alert("Por favor ingrese el nombre del cliente");
      return;
    }

    if (!clientData.direccion.trim()) {
      alert("Por favor ingrese la dirección de entrega");
      return;
    }

    if (selectedProducts.length === 0) {
      alert("Por favor seleccione al menos un producto");
      return;
    }

    // Aquí iría la lógica para procesar el pedido
    console.log("Pedido Delivery:", {
      cliente: clientData,
      productos: selectedProducts,
      total: calculateTotal(),
      tipo: "delivery",
    });

    // Limpiar formulario
    setClientData({ nombre: "", direccion: "", mPago: "efectivo" });
    setSelectedProducts([]);
    alert("Pedido procesado exitosamente");
  };

  return (
    <div className="h-full bg-slate-900 flex">
      {/* Panel Izquierdo - Datos Cliente y Pedido */}
      <div className="w-1/2 bg-slate-800 flex flex-col">
        {/* Datos Cliente */}
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Datos Cliente</h2>
          <div className="space-y-4">
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
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Dirección de entrega"
                rows="3"
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
        </div>

        {/* Pedido Resumido */}
        <div className="flex-1 p-6 flex flex-col relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Pedido</h2>
            {selectedProducts.length > 0 && (
              <button
                onClick={() => setShowOrderDetails(!showOrderDetails)}
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
          </div>

          {/* Estado del Pedido */}
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
              {/* Área de contenido principal con scroll - con padding bottom para el total fijo */}
              <div className="flex-1 overflow-y-auto pb-32">
                {/* Detalles del Pedido (Expandible) */}
                {showOrderDetails && (
                  <div className="bg-slate-700 rounded-lg p-4 mb-4">
                    <div className="space-y-3">
                      {selectedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between bg-slate-600 rounded-lg p-3"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate">
                              {product.nombre}
                            </h4>
                            <p className="text-gray-300 text-sm">
                              $
                              {(
                                product.precio *
                                (1 - product.descuento / 100)
                              ).toFixed(2)}
                              {product.descuento > 0 && (
                                <span className="text-red-400 ml-2">
                                  -{product.descuento}%
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  product.id,
                                  product.cantidad - 1
                                )
                              }
                              className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                            >
                              -
                            </button>
                            <span className="text-white font-medium min-w-[2rem] text-center">
                              {product.cantidad}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  product.id,
                                  product.cantidad + 1
                                )
                              }
                              className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sección fija en la parte inferior - usando position absolute */}
              <div className="absolute bottom-6 left-6 right-6 bg-slate-800 rounded-lg p-4">
                {/* Resumen Rápido */}
                <div className="bg-slate-700 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-300 text-sm">Total de items:</p>
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
                  className="w-full bg-blue-600 text-white py-4 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
                >
                  Procesar Pedido
                </button>
              </div>
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
    </div>
  );
}

export default DeliveryView;
