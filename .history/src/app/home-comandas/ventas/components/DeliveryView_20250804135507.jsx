"use client";
import React, { useState, useEffect } from "react";
import { useProducts } from "../../../../hooks/useProducts";

function DeliveryView() {
  const {
    mainCategories,
    subCategories,
    products,
    loading,
    fetchMainCategories,
    fetchSubCategories,
    fetchAllProducts,
  } = useProducts();

  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);

  // Cargar datos al montar el componente
  useEffect(() => {
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

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold text-xl">Delivery</span>
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div className="flex items-center space-x-2">
            <button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              {orderItems.length}
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Finalizar Pedido
            </button>
          </div>
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
          </div>
        </div>
      )}

      {/* Order Summary */}
      {orderItems.length > 0 && (
        <div className="bg-gray-800 p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <span className="font-bold">Total: ${orderTotal}</span>
              <span className="ml-4 text-gray-400">
                {orderItems.length} items
              </span>
            </div>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold">
              Finalizar Pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryView;
