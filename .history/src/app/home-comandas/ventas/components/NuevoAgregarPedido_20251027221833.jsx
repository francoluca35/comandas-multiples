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

        <div className="flex h-[calc(90vh-80px)]">
          {/* Panel de Productos */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Seleccionar Productos</h3>
            
            {/* Categorías */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {mainCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedMainCategory(category.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedMainCategory === category.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedSubCategory === subCategory.id
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {subCategory.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lista de Productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProduct?.id === product.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <h3 className="font-medium text-gray-800">{product.nombre}</h3>
                  <p className="text-sm text-gray-600">${product.precio.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Panel de Pedido */}
          <div className="w-96 bg-gray-50 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Pedido Adicional</h3>
            
            {/* Producto Seleccionado */}
            {selectedProduct && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800">{selectedProduct.nombre}</h4>
                <p className="text-sm text-blue-600">${selectedProduct.precio.toLocaleString()}</p>
                
                <div className="flex items-center mt-3">
                  <button
                    onClick={() => handleQuantityChange(productQuantity - 1)}
                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="mx-3 font-medium text-lg">{productQuantity}</span>
                  <button
                    onClick={() => handleQuantityChange(productQuantity + 1)}
                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                  >
                    +
                  </button>
                  <button
                    onClick={handleAddToOrder}
                    className="ml-3 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}

            {/* Items del Pedido */}
            <div className="space-y-2 mb-4">
              {newOrderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded border">
                  <div>
                    <span className="font-medium">{item.producto}</span>
                    <span className="text-sm text-gray-600 ml-2">x{item.unidades}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">${item.total.toLocaleString()}</span>
                    <button
                      onClick={() => handleRemoveFromOrder(item.id)}
                      className="ml-2 text-red-500 hover:text-red-700 text-lg"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Adicional:</span>
                <span className="font-bold text-lg">${newOrderTotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Total Mesa Actual:</span>
                <span>${(mesa?.total || 0).toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                <span>Total Final:</span>
                <span>${((mesa?.total || 0) + newOrderTotal).toLocaleString()}</span>
              </div>

              <button
                onClick={handleEnviarACocina}
                disabled={newOrderItems.length === 0 || isLoading}
                className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {isLoading ? "Enviando a Cocina..." : "🍳 Enviar a Cocina"}
              </button>

              {/* Mensaje de éxito */}
              {showSuccess && (
                <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <div className="font-semibold">¡Pedido enviado a cocina!</div>
                  <div className="text-sm mb-3">Los productos se han agregado a la mesa</div>
                  <button
                    onClick={handleCancelar}
                    className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
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
