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

function NuevoAgregarPedido({ mesa, onBack, onPedidoAgregado }) {
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
  const [productQuantity, setProductQuantity] = useState(1);
  const [newOrderItems, setNewOrderItems] = useState([]);
  const [newOrderTotal, setNewOrderTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      console.log("🔄 Cargando datos del componente NuevoAgregarPedido...");
      setIsInitialLoading(true);
      try {
        await Promise.all([
          fetchMainCategories(),
          fetchAllProducts()
        ]);
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Seleccionar primera categoría principal por defecto
  useEffect(() => {
    console.log("📊 Categorías principales cargadas:", mainCategories);
    if (mainCategories.length > 0 && !selectedMainCategory) {
      setSelectedMainCategory(mainCategories[0].id);
      console.log("✅ Primera categoría seleccionada:", mainCategories[0]);
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

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setProductQuantity(newQuantity);
    }
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

    setNewOrderItems((prev) => [...prev, newItem]);
    setNewOrderTotal((prev) => prev + selectedProduct.precio * productQuantity);
    setSelectedProduct(null);
    setProductQuantity(1);
  };

  const handleRemoveFromOrder = (itemId) => {
    const itemToRemove = newOrderItems.find((item) => item.id === itemId);
    if (itemToRemove) {
      setNewOrderItems((prev) => prev.filter((item) => item.id !== itemId));
      setNewOrderTotal((prev) => prev - itemToRemove.total);
    }
  };

  const handleEnviarACocina = async () => {
    if (newOrderItems.length === 0) {
      alert("Debes agregar al menos un producto al pedido");
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("🚀 Enviando pedido adicional a la mesa y cocina...");
      console.log("Items nuevos:", newOrderItems);
      console.log("Total nuevo:", newOrderTotal);
      console.log("Mesa actual:", mesa);

      const restauranteId = getRestaurantId();
      console.log("Restaurante ID:", restauranteId);

      // 1. Actualizar la mesa con los nuevos productos
      const productosExistentes = mesa.productos || [];
      const productosActualizados = [...productosExistentes, ...newOrderItems];
      const totalActualizado = (mesa.total || 0) + newOrderTotal;

      console.log("Productos existentes:", productosExistentes);
      console.log("Productos actualizados:", productosActualizados);
      console.log("Total actualizado:", totalActualizado);

      const mesaRef = doc(db, "restaurantes", restauranteId, "tables", mesa.id);
      await updateDoc(mesaRef, {
        productos: productosActualizados,
        total: totalActualizado,
        updatedAt: new Date(),
      });

      console.log("✅ Mesa actualizada exitosamente");

      // 2. Enviar pedido adicional a cocina
      const pedidoCocina = {
        mesa: mesa.numero || mesa.id,
        productos: newOrderItems.map((item) => ({
          nombre: item.producto,
          cantidad: item.unidades,
          precio: item.precio,
          total: item.total,
          notas: item.notas || "",
        })),
        total: newOrderTotal,
        cliente: mesa.cliente || "Sin nombre",
        datos_cliente: mesa.datos_cliente || {},
        notas: "Pedido adicional",
        timestamp: new Date(),
        estado: "pendiente",
        restauranteId: restauranteId,
        esAdicional: true,
        pedidoOriginal: mesa.pedidoId || null,
      };

      console.log("📋 Datos del pedido para cocina:", pedidoCocina);

      const pedidoCocinaRef = collection(
        db,
        `restaurantes/${restauranteId}/pedidosCocina`
      );

      const docRef = await addDoc(pedidoCocinaRef, pedidoCocina);
      console.log("✅ Pedido enviado a cocina. ID:", docRef.id);

      // 3. Notificar al componente padre
      onPedidoAgregado({
        productos: productosActualizados,
        total: totalActualizado,
        pedidoId: docRef.id,
      });

      // 4. Mostrar confirmación de éxito
      setShowSuccess(true);
      
      // 5. Limpiar el pedido actual después de 2 segundos
      setTimeout(() => {
        setNewOrderItems([]);
        setNewOrderTotal(0);
        setSelectedProduct(null);
        setProductQuantity(1);
        setShowSuccess(false);
      }, 2000);

    } catch (error) {
      console.error("❌ Error al enviar pedido:", error);
      console.error("❌ Detalles del error:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Error al enviar el pedido:\n\n${error.message}\n\nPor favor, intente nuevamente.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelar = () => {
    setNewOrderItems([]);
    setNewOrderTotal(0);
    setSelectedProduct(null);
    setProductQuantity(1);
    onBack();
  };

  // Filtrar productos por categoría seleccionada
  const filteredProducts = products.filter((product) => {
    if (selectedSubCategory) {
      return product.subcategoria === selectedSubCategory;
    }
    return product.categoria === selectedMainCategory;
  });

  // Debug: Mostrar información de productos
  useEffect(() => {
    console.log("🛍️ Productos cargados:", products);
    console.log("🔍 Productos filtrados:", filteredProducts);
    console.log("📂 Categoría seleccionada:", selectedMainCategory);
    console.log("📁 Subcategoría seleccionada:", selectedSubCategory);
  }, [products, filteredProducts, selectedMainCategory, selectedSubCategory]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-7xl mx-4 max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Adicionar Pedido - Mesa {mesa?.numero}</h2>
              <p className="text-blue-100">Cliente: {mesa?.cliente || "Sin nombre"}</p>
              <p className="text-sm text-blue-200">Total actual: ${(mesa?.total || 0).toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={handleCancelar}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-200 hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Panel de Productos */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Seleccionar Productos</h3>
              <p className="text-gray-600">Haz clic en cualquier producto para agregarlo al pedido</p>
            </div>
            
            {/* Categorías */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-3 mb-4">
                {mainCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedMainCategory(category.id)}
                    className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      selectedMainCategory === category.id
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-200"
                        : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {category.nombre}
                  </button>
                ))}
              </div>

              {/* Subcategorías */}
              {subCategories[selectedMainCategory] && (
                <div className="flex flex-wrap gap-2">
                  {subCategories[selectedMainCategory].map((subCategory) => (
                    <button
                      key={subCategory.id}
                      onClick={() => setSelectedSubCategory(subCategory.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedSubCategory === subCategory.id
                          ? "bg-green-500 text-white shadow-md"
                          : "bg-white text-gray-600 hover:bg-green-50 border border-gray-200 hover:border-green-300"
                      }`}
                    >
                      {subCategory.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lista de Productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isInitialLoading || loading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando productos...</p>
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-600 text-lg mb-2">No hay productos disponibles</p>
                    <p className="text-gray-500 text-sm">
                      {selectedMainCategory ? 
                        `No se encontraron productos en la categoría "${mainCategories.find(c => c.id === selectedMainCategory)?.nombre || selectedMainCategory}"` :
                        "Selecciona una categoría para ver productos"
                      }
                    </p>
                  </div>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`group p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                      selectedProduct?.id === product.id
                        ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-200"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600">{product.nombre}</h3>
                      <p className="text-lg font-bold text-green-600">${product.precio.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panel de Pedido */}
          <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Pedido Adicional</h3>
              <p className="text-gray-600 text-sm">Gestiona los productos del pedido</p>
            </div>
            
            {/* Producto Seleccionado */}
            {selectedProduct && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-blue-800 text-lg">{selectedProduct.nombre}</h4>
                    <p className="text-blue-600 font-medium">${selectedProduct.precio.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(productQuantity - 1)}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-blue-50 border border-blue-200 transition-colors"
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="font-bold text-xl text-blue-800 min-w-[2rem] text-center">{productQuantity}</span>
                    <button
                      onClick={() => handleQuantityChange(productQuantity + 1)}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-blue-50 border border-blue-200 transition-colors"
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={handleAddToOrder}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 font-medium"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}

            {/* Items del Pedido */}
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Items del Pedido</h4>
              {newOrderItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p>No hay productos en el pedido</p>
                </div>
              ) : (
                newOrderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">{item.producto}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-600">x{item.unidades}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">${item.precio.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-green-600">${item.total.toLocaleString()}</span>
                      <button
                        onClick={() => handleRemoveFromOrder(item.id)}
                        className="w-8 h-8 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totales */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Total Adicional:</span>
                <span className="font-bold text-xl text-blue-600">${newOrderTotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Total Mesa Actual:</span>
                <span>${(mesa?.total || 0).toLocaleString()}</span>
              </div>
              
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-800">Total Final:</span>
                  <span className="font-bold text-2xl text-green-600">${((mesa?.total || 0) + newOrderTotal).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleEnviarACocina}
                disabled={newOrderItems.length === 0 || isLoading}
                className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-bold text-lg shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Enviando a Cocina...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Enviar a Cocina</span>
                  </div>
                )}
              </button>

              {/* Mensaje de éxito */}
              {showSuccess && (
                <div className="mt-4 p-4 bg-green-100 border-2 border-green-300 text-green-800 rounded-xl text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <div className="font-bold text-lg mb-2">¡Pedido enviado a cocina!</div>
                  <div className="text-sm mb-4">Los productos se han agregado a la mesa</div>
                  <button
                    onClick={handleCancelar}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NuevoAgregarPedido;
