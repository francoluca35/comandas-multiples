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

function AgregarPedidoView({ mesa, onBack, onPedidoAgregado }) {
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

  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newOrderItems, setNewOrderItems] = useState([]);
  const [newOrderTotal, setNewOrderTotal] = useState(0);
  const [productQuantity, setProductQuantity] = useState(1);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    setNewOrderItems((prev) => [...prev, newItem]);
    setNewOrderTotal((prev) => prev + selectedProduct.precio * productQuantity);
    setSelectedProduct(null);
    setProductQuantity(1);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setProductQuantity(newQuantity);
    }
  };

  const handleRemoveFromOrder = (itemId) => {
    const itemToRemove = newOrderItems.find((item) => item.id === itemId);
    if (itemToRemove) {
      setNewOrderItems((prev) => prev.filter((item) => item.id !== itemId));
      setNewOrderTotal((prev) => prev - itemToRemove.total);
    }
  };

  const handleAgregarPedido = async () => {
    if (newOrderItems.length === 0) {
      alert("Debes agregar al menos un producto al pedido");
      return;
    }

    if (isLoading) {
      return; // Evitar múltiples clics
    }

    setIsLoading(true);

    try {
      console.log("🚀 Agregando pedido adicional a la mesa...");
      console.log("Items nuevos:", newOrderItems);
      console.log("Total nuevo:", newOrderTotal);
      console.log("Mesa actual:", mesa);

      const restauranteId = getRestaurantId();
      console.log("Restaurante ID:", restauranteId);
      
      // Combinar productos existentes con los nuevos
      const productosExistentes = mesa.productos || [];
      const productosActualizados = [...productosExistentes, ...newOrderItems];
      const totalActualizado = (mesa.total || 0) + newOrderTotal;

      // Actualizar la mesa con los nuevos productos
      const mesaRef = doc(db, "restaurantes", restauranteId, "tables", mesa.id);
      await updateDoc(mesaRef, {
        productos: productosActualizados,
        total: totalActualizado,
        updatedAt: new Date(),
      });

      // Enviar pedido adicional a cocina
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
        esAdicional: true, // Marcar como pedido adicional
        pedidoOriginal: mesa.pedidoId || null, // Referencia al pedido original
      };

      const pedidoCocinaRef = collection(
        db,
        `restaurantes/${restauranteId}/pedidosCocina`
      );

      const docRef = await addDoc(pedidoCocinaRef, pedidoCocina);
      console.log("✅ Pedido adicional enviado a cocina. ID:", docRef.id);

      // Notificar al componente padre
      onPedidoAgregado({
        productos: productosActualizados,
        total: totalActualizado,
        pedidoId: docRef.id,
      });

      alert(`✅ Pedido adicional agregado exitosamente!\n\nItems agregados: ${newOrderItems.length}\nTotal adicional: $${newOrderTotal.toLocaleString()}\nTotal mesa: $${totalActualizado.toLocaleString()}`);

    } catch (error) {
      console.error("❌ Error al agregar pedido:", error);
      console.error("❌ Detalles del error:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Error al agregar el pedido:\n\n${error.message}\n\nPor favor, intente nuevamente.`);
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Agregar Pedido - Mesa {mesa?.numero}
              </h1>
              <p className="text-gray-600">
                Cliente: {mesa?.cliente || "Sin nombre"}
              </p>
              <p className="text-sm text-gray-500">
                Total actual: ${(mesa?.total || 0).toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleCancelar}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Panel de Productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">Seleccionar Productos</h2>
              
              {/* Categorías */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {mainCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedMainCategory(category.id)}
                      className={`px-3 py-1 rounded-full text-sm ${
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
                        className={`px-3 py-1 rounded-full text-sm ${
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>

          {/* Panel de Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">Pedido Adicional</h2>
              
              {/* Producto Seleccionado */}
              {selectedProduct && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <h3 className="font-medium">{selectedProduct.nombre}</h3>
                  <p className="text-sm text-gray-600">${selectedProduct.precio.toLocaleString()}</p>
                  
                  <div className="flex items-center mt-2">
                    <button
                      onClick={() => handleQuantityChange(productQuantity - 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="mx-3 font-medium">{productQuantity}</span>
                    <button
                      onClick={() => handleQuantityChange(productQuantity + 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                    >
                      +
                    </button>
                    <button
                      onClick={handleAddToOrder}
                      className="ml-3 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )}

              {/* Items del Pedido */}
              <div className="space-y-2 mb-4">
                {newOrderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{item.producto}</span>
                      <span className="text-sm text-gray-600 ml-2">x{item.unidades}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">${item.total.toLocaleString()}</span>
                      <button
                        onClick={() => handleRemoveFromOrder(item.id)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total Adicional:</span>
                  <span className="font-bold text-lg">${newOrderTotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <span>Total Mesa Actual:</span>
                  <span>${(mesa?.total || 0).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                  <span>Total Final:</span>
                  <span>${((mesa?.total || 0) + newOrderTotal).toLocaleString()}</span>
                </div>

                <button
                  onClick={handleAgregarPedido}
                  disabled={newOrderItems.length === 0}
                  className="w-full mt-4 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Agregar Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgregarPedidoView;
