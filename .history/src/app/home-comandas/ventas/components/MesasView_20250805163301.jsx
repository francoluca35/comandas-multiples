"use client";
import React, { useState, useEffect } from "react";
import { useTables } from "../../../../hooks/useTables";
import { useProducts } from "../../../../hooks/useProducts";

function MesasView({ onMesaClick }) {
  const { tables, loading, error, fetchTables } = useTables();
  const {
    mainCategories,
    subCategories,
    products,
    loading: productsLoading,
    fetchMainCategories,
    fetchSubCategories,
    fetchAllProducts,
  } = useProducts();

  const [selectedMesa, setSelectedMesa] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [currentOrderItems, setCurrentOrderItems] = useState([]);
  const [currentOrderTotal, setCurrentOrderTotal] = useState(0);

  // Cargar mesas y productos al montar el componente
  useEffect(() => {
    fetchTables();
    fetchMainCategories();
    fetchAllProducts();
  }, []);

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

  const handleMesaClick = (mesa) => {
    setSelectedMesa(mesa);
    // Limpiar pedido actual cuando se selecciona una nueva mesa
    setCurrentOrderItems([]);
    setCurrentOrderTotal(0);
    setSelectedProduct(null);
    setProductQuantity(1);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setProductQuantity(newQuantity);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setProductQuantity(1);
  };

  const handleAddToOrder = () => {
    if (!selectedProduct) return;

    const newItem = {
      id: Date.now(),
      producto: selectedProduct.nombre,
      unidades: productQuantity,
      precio: selectedProduct.precio,
      total: selectedProduct.precio * productQuantity,
    };

    setCurrentOrderItems((prev) => [...prev, newItem]);
    setCurrentOrderTotal(
      (prev) => prev + selectedProduct.precio * productQuantity
    );
    setSelectedProduct(null);
    setProductQuantity(1);
  };

  const handleRemoveFromOrder = (itemId) => {
    const itemToRemove = currentOrderItems.find((item) => item.id === itemId);
    if (itemToRemove) {
      setCurrentOrderItems((prev) => prev.filter((item) => item.id !== itemId));
      setCurrentOrderTotal((prev) => prev - itemToRemove.total);
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

  const getStatusColor = (estado) => {
    switch (estado) {
      case "libre":
        return "bg-gray-600 hover:bg-gray-500";
      case "ocupado":
        return "bg-blue-600 hover:bg-blue-500";
      default:
        return "bg-gray-600 hover:bg-gray-500";
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case "libre":
        return "Libre";
      case "ocupado":
        return "Ocupado";
      default:
        return "Desconocido";
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Cargando mesas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-white">{error}</p>
        </div>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
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
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No hay mesas disponibles
          </h3>
          <p className="text-gray-400 mb-6">
            Ve a "Gestión Mesas" para crear las primeras mesas
          </p>
          <a
            href="/home-comandas/mesas"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Crear Mesas
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 flex">
      {/* Panel principal de mesas */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map((mesa) => (
            <button
              key={mesa.id}
              onClick={() => handleMesaClick(mesa)}
              className={`${getStatusColor(
                mesa.estado
              )} text-white rounded-lg p-6 text-center transition-all duration-200 transform hover:scale-105 ${
                selectedMesa?.id === mesa.id ? "ring-4 ring-yellow-400" : ""
              }`}
            >
              <div className="text-3xl font-bold mb-2">{mesa.numero}</div>
              <div className="text-sm opacity-90">
                {getStatusText(mesa.estado)}
              </div>
              {mesa.cliente && (
                <div className="text-xs opacity-75 mt-1">
                  Cliente: {mesa.cliente}
                </div>
              )}
              {mesa.total > 0 && (
                <div className="text-xs opacity-75 mt-1">
                  Total: ${mesa.total}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Panel lateral con controles */}
      {selectedMesa && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">
              Mesa {selectedMesa.numero}
            </h3>
            <div className="text-gray-300 text-sm">
              Estado: {getStatusText(selectedMesa.estado)}
            </div>
            {selectedMesa.cliente && (
              <div className="text-gray-300 text-sm">
                Cliente: {selectedMesa.cliente}
              </div>
            )}
          </div>

          {/* Selección de productos */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h4 className="text-white font-medium mb-3">Seleccionar Producto</h4>
            
            {/* Categorías */}
            <div className="mb-3">
              <select
                value={selectedMainCategory}
                onChange={(e) => setSelectedMainCategory(e.target.value)}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:outline-none focus:border-blue-500"
              >
                {mainCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedMainCategory && subCategories[selectedMainCategory] && (
              <div className="mb-3">
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:outline-none focus:border-blue-500"
                >
                  {subCategories[selectedMainCategory].map((subCategory) => (
                    <option key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Lista de productos */}
            <div className="max-h-32 overflow-y-auto mb-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`w-full p-2 rounded-lg text-left transition-colors mb-1 ${
                    selectedProduct?.id === product.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-600 text-white hover:bg-gray-500"
                  }`}
                >
                  <div className="text-sm font-medium">{product.nombre}</div>
                  <div className="text-xs opacity-75">${product.precio}</div>
                </button>
              ))}
            </div>

            {/* Producto seleccionado y controles de cantidad */}
            {selectedProduct && (
              <div className="bg-gray-600 rounded-lg p-3">
                <div className="text-white text-sm font-medium mb-2">
                  {selectedProduct.nombre} - ${selectedProduct.precio}
                </div>
                <div className="flex items-center space-x-3 mb-3">
                  <button
                    onClick={() => handleQuantityChange(productQuantity - 1)}
                    disabled={productQuantity <= 1}
                    className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <span className="text-white font-bold text-lg min-w-[2rem] text-center">
                    {productQuantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(productQuantity + 1)}
                    className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700"
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>
                </div>
                <div className="text-white text-sm mb-2">
                  Subtotal: ${selectedProduct.precio * productQuantity}
                </div>
                <button
                  onClick={handleAddToOrder}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Agregar al Pedido
                </button>
              </div>
            )}
          </div>

          {/* Resumen del pedido actual */}
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">Pedido Actual</h4>
              <div className="text-green-400 font-bold">
                ${currentOrderTotal}
              </div>
            </div>

            {currentOrderItems.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {currentOrderItems.map((item) => (
                  <div key={item.id} className="bg-gray-600 rounded p-2">
                    <div className="text-white text-sm font-medium">
                      {item.producto}
                    </div>
                    <div className="text-gray-300 text-xs">
                      {item.unidades} x ${item.precio} = ${item.total}
                    </div>
                    <button
                      onClick={() => handleRemoveFromOrder(item.id)}
                      className="mt-1 text-red-400 hover:text-red-300 text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-sm text-center py-4">
                No hay productos en el pedido
              </div>
            )}
          </div>

          {/* Botón para ver pedidos */}
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">Items: {currentOrderItems.length}</h4>
              <button
                onClick={() => setShowOrderHistory(!showOrderHistory)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {showOrderHistory ? "Ocultar" : "Ver Pedidos"}
              </button>
            </div>

            {showOrderHistory && currentOrderItems.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {currentOrderItems.map((item) => (
                  <div key={item.id} className="bg-gray-600 rounded p-2">
                    <div className="text-white text-sm font-medium">
                      {item.producto}
                    </div>
                    <div className="text-gray-300 text-xs">
                      {item.unidades} x ${item.precio} = ${item.total}
                    </div>
                    <button
                      onClick={() => handleRemoveFromOrder(item.id)}
                      className="mt-1 text-red-400 hover:text-red-300 text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botón para abrir el pedido completo */}
          <button
            onClick={() => onMesaClick(selectedMesa)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors mt-6 font-medium"
          >
            {selectedMesa.estado === "libre" ? "Nuevo Pedido" : "Ver Pedido"}
          </button>
        </div>
      )}
    </div>
  );
}

export default MesasView;
