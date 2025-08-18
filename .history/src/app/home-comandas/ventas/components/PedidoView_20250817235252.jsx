"use client";
import React, { useState, useEffect } from "react";
import { useProducts } from "../../../../hooks/useProducts";

import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";

// Función para obtener el restaurantId desde localStorage
const getRestaurantId = () => {
  if (typeof window !== "undefined") {
    const restaurantId = localStorage.getItem("restauranteId");
    if (!restaurantId) {
      throw new Error("No se encontró el ID del restaurante");
    }
    return restaurantId;
  }
  return null;
};

function PedidoView({ mesa, onBack, onMesaOcupada }) {
  const {
    mainCategories,
    subCategories,
    products,
    loading,
    fetchMainCategories,
    fetchSubCategories,
    fetchAllProducts,
    fetchAllSubCategories,
  } = useProducts();

  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [productQuantity, setProductQuantity] = useState(1);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchMainCategories();
    fetchAllProducts();
    fetchAllSubCategories().then(setAllSubCategories);
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

    setOrderItems((prev) => [...prev, newItem]);
    setOrderTotal((prev) => prev + selectedProduct.precio * productQuantity);
    setSelectedProduct(null);
    setProductQuantity(1);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setProductQuantity(newQuantity);
    }
  };

  const handleRemoveFromOrder = (itemId) => {
    const itemToRemove = orderItems.find((item) => item.id === itemId);
    if (itemToRemove) {
      setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
      setOrderTotal((prev) => prev - itemToRemove.total);
    }
  };

  const handleClientSubmit = (e) => {
    e.preventDefault();
    setShowClientModal(false);
  };

  const handleTerminar = async () => {
    if (orderItems.length === 0) {
      alert("Debes agregar al menos un producto al pedido");
      return;
    }

    try {
      // Actualizar la mesa en Firestore
      const mesaRef = doc(
        db,
        `restaurantes/${getRestaurantId()}/tables/${mesa.id}`
      );

      await updateDoc(mesaRef, {
        estado: "ocupado",
        cliente: clientData.name || "Sin nombre",
        productos: orderItems,
        total: orderTotal,
        updatedAt: new Date(),
      });

      console.log("Mesa actualizada exitosamente:");
      console.log("Productos seleccionados:", orderItems);
      console.log("Total:", orderTotal);

      // ENVIAR PEDIDO A COCINA
      try {
        const restauranteId = getRestaurantId();

        // Preparar datos del pedido para cocina
        const pedidoCocina = {
          mesa: mesa.numero || mesa.id,
          productos: orderItems.map((item) => ({
            nombre: item.producto,
            cantidad: item.unidades,
            precio: item.precio,
            total: item.total,
            notas: item.notas || "",
          })),
          total: orderTotal,
          cliente: clientData.name || "Sin nombre",
          notas: "", // Aquí podrías agregar notas especiales para cocina
          timestamp: new Date(),
          estado: "pendiente", // Estado inicial para cocina
        };

        // Crear pedido en la colección de pedidos de cocina
        const pedidoCocinaRef = collection(
          db,
          `restaurantes/${restauranteId}/pedidosCocina`
        );

        await addDoc(pedidoCocinaRef, pedidoCocina);

        console.log("✅ Pedido enviado a cocina exitosamente");

        // Mostrar notificación de éxito
        alert("Pedido enviado a cocina exitosamente");
      } catch (cocinaError) {
        console.error("Error al enviar pedido a cocina:", cocinaError);
        // No bloquear el flujo principal si falla el envío a cocina
        alert(
          "Pedido completado pero hubo un problema al enviar a cocina. Contacta al administrador."
        );
      }

      // Volver a la vista de mesas
      onMesaOcupada(mesa);
      onBack();
    } catch (error) {
      console.error("Error al actualizar la mesa:", error);
      alert("Error al actualizar la mesa. Inténtalo de nuevo.");
    }
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
    // Si hay categoría principal seleccionada, filtrar por ella
    if (
      selectedMainCategory &&
      product.mainCategoryId !== selectedMainCategory
    ) {
      return false;
    }

    // Si no hay subcategoría seleccionada, mostrar todos los productos de la categoría principal
    if (!selectedSubCategory) {
      return true;
    }

    // Filtrar por subcategoría seleccionada
    return product.subCategoryId === selectedSubCategory;
  });

  // Filtrar subcategorías por categoría principal seleccionada
  const filteredSubCategories = allSubCategories.filter((subCategory) => {
    if (!selectedMainCategory) return true;
    return subCategory.mainCategoryId === selectedMainCategory;
  });

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
                Mesa {mesa?.numero} - Nuevo Pedido
              </span>
              {getIcon("table")}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              {orderItems.length}
            </button>
            <button
              onClick={() => setShowClientModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Cliente
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        {/* Categorías principales */}
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

        {/* Todas las subcategorías habilitadas */}
        <div className="flex space-x-2 overflow-x-auto">
          {/* Botón "Todos" para mostrar todos los productos */}
          <button
            onClick={() => setSelectedSubCategory("")}
            className={`px-4 py-2 rounded-lg flex-shrink-0 transition-colors ${
              selectedSubCategory === ""
                ? "bg-green-500 text-white"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            {selectedMainCategory === "comida"
              ? "🍽️ Todas las comidas"
              : selectedMainCategory === "bebidas"
              ? "🥤 Todas las bebidas"
              : "🍽️ Todos"}
          </button>

          {filteredSubCategories.map((subCategory) => (
            <button
              key={`${subCategory.mainCategoryId}-${subCategory.id}`}
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
                  <button
                    onClick={() => handleQuantityChange(productQuantity + 1)}
                    className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
                  >
                    +1
                  </button>
                  <button className="bg-white text-gray-800 rounded-lg px-3 py-2 font-medium">
                    {productQuantity} x
                  </button>
                  <button className="bg-white text-gray-800 rounded-lg px-3 py-2">
                    $ {selectedProduct.precio}
                  </button>
                  {productQuantity > 1 && (
                    <button
                      onClick={() => handleQuantityChange(productQuantity - 1)}
                      className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    >
                      -1
                    </button>
                  )}
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
                  <div className="text-xs text-gray-400 mb-1">{product.id}</div>
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
              {selectedSubCategory
                ? "No hay productos en esta subcategoría"
                : selectedMainCategory === "comida"
                ? "Selecciona una subcategoría de comida o usa 'Todas las comidas'"
                : selectedMainCategory === "bebidas"
                ? "Selecciona una subcategoría de bebidas o usa 'Todas las bebidas'"
                : "Selecciona una subcategoría específica o usa 'Todos' para ver todos los productos"}
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

      {/* Order Summary */}
      {orderItems.length > 0 && (
        <div className="bg-gray-800 border-t border-gray-700">
          {/* Header del resumen - SIEMPRE VISIBLE */}
          <div className="p-4 sm:p-6 bg-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className="text-white">
                  <span className="text-lg sm:text-xl font-bold">
                    Total: ${orderTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm sm:text-base">
                    {orderItems.length}{" "}
                    {orderItems.length === 1 ? "item" : "items"}
                  </span>
                  <button
                    onClick={() => setShowOrderDetails(!showOrderDetails)}
                    className="text-blue-400 hover:text-blue-300 text-sm sm:text-base font-medium transition-colors duration-200 hover:underline"
                  >
                    {showOrderDetails ? "Ocultar" : "Ver Pedidos"}
                  </button>
                </div>
              </div>
              <button
                onClick={handleTerminar}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Terminar
              </button>
            </div>
          </div>

          {/* Lista de productos seleccionados - OVERLAY QUE OCUPA TODA LA PANTALLA */}
          {showOrderDetails && (
            <div className="fixed inset-0 bg-gray-800 z-40 flex flex-col">
              {/* Header fijo en la parte superior */}
              <div className="bg-gray-700 p-4 sm:p-6 border-b border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <span className="text-lg sm:text-xl font-bold">
                      Lista de Productos Seleccionados
                    </span>
                  </div>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-gray-400 hover:text-white text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Lista scrolleable que ocupa todo el espacio restante */}
              <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-gray-600">
                  {orderItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm sm:text-base font-medium truncate">
                          {item.producto}
                        </div>
                        <div className="text-gray-300 text-xs sm:text-sm mt-1">
                          {item.unidades} x ${item.precio.toLocaleString()} = $
                          {item.total.toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFromOrder(item.id)}
                        className="text-red-400 hover:text-red-300 text-xs sm:text-sm font-medium bg-red-900/20 hover:bg-red-900/30 px-3 py-2 rounded-lg transition-all duration-200 flex-shrink-0"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Datos del Cliente
              </h2>
              <button
                onClick={() => setShowClientModal(false)}
                className="text-gray-400 hover:text-white"
              >
                {getIcon("close")}
              </button>
            </div>

            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={clientData.name}
                  onChange={(e) =>
                    setClientData({ ...clientData, name: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="Nombre del cliente"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={clientData.email}
                  onChange={(e) =>
                    setClientData({ ...clientData, email: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={clientData.phone}
                  onChange={(e) =>
                    setClientData({ ...clientData, phone: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Aceptar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PedidoView;
