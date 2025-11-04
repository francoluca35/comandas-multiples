"use client";
import React, { useState, useEffect } from "react";
import { useProducts } from "../../../../hooks/useProducts";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";
import ClienteModal from "./ClienteModal";

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

function PedidoView({ mesa, onBack, onPedidoEnviado }) {
  const {
    mainCategories,
    subCategories,
    products,
    loading,
    fetchMainCategories,
    fetchSubCategories,
    fetchAllProducts,
  } = useProducts();

  // Estados principales
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Cargar datos al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchMainCategories(), fetchAllProducts()]);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    loadData();
  }, []);

  // Cargar subcategorías cuando cambie la categoría principal
  useEffect(() => {
    if (selectedMainCategory) {
      fetchSubCategories(selectedMainCategory);
    }
  }, [selectedMainCategory]);

  // Filtrar productos según categoría seleccionada
  const filteredProducts = products.filter((product) => {
    if (selectedMainCategory === "todos") {
      return true;
    }
    if (selectedSubCategory) {
      return (
        (product.subCategoryId === selectedSubCategory ||
          product.subcategoria === selectedSubCategory) &&
        (product.mainCategoryId === selectedMainCategory ||
          product.categoria === selectedMainCategory)
      );
    }
    return (
      product.mainCategoryId === selectedMainCategory ||
      product.categoria === selectedMainCategory
    );
  });

  // Obtener subcategorías de la categoría seleccionada
  const currentSubCategories =
    selectedMainCategory && subCategories[selectedMainCategory]
      ? subCategories[selectedMainCategory]
      : [];

  // Manejar selección de producto
  const handleProductSelect = (product) => {
    if (isMobile) {
      // En mobile, expandir el producto para mostrar cantidad
      setExpandedProduct(product.id);
      setProductQuantity(1);
    } else {
      // En desktop, expandir directamente
      setExpandedProduct(product.id);
      setProductQuantity(1);
    }
  };

  // Agregar producto al pedido
  const handleAddProduct = (product) => {
    const existingProduct = selectedProducts.find((p) => p.id === product.id);

    if (existingProduct) {
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, cantidad: p.cantidad + productQuantity }
            : p
        )
      );
    } else {
      const precioFinal =
        product.precio * (1 - (product.descuento || 0) / 100);
      setSelectedProducts((prev) => [
        ...prev,
        {
          ...product,
          cantidad: productQuantity,
          precioFinal,
          total: precioFinal * productQuantity,
        },
      ]);
    }

    // Limpiar selección
    setExpandedProduct(null);
    setProductQuantity(1);
  };

  // Actualizar cantidad en el modal de items
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedProducts((prev) =>
        prev.filter((p) => p.id !== productId)
      );
    } else {
      setSelectedProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            const precioFinal = p.precio * (1 - (p.descuento || 0) / 100);
            return {
              ...p,
              cantidad: newQuantity,
              total: precioFinal * newQuantity,
            };
          }
          return p;
        })
      );
    }
  };

  // Eliminar producto del pedido
  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Calcular total
  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      return total + (product.total || 0);
    }, 0);
  };

  // Enviar pedido a cocina
  const handleEnviarACocina = async () => {
    if (selectedProducts.length === 0) {
      alert("Debes agregar al menos un producto al pedido");
      return;
    }

    try {
      const restauranteId = getRestaurantId();
      const total = calculateTotal();

      // Preparar productos para cocina
      const productosCocina = selectedProducts.map((product) => ({
        nombre: product.nombre,
        cantidad: product.cantidad,
        precio: product.precio,
        total: product.total,
        descripcion: product.descripcion || "",
      }));

      // Crear pedido para cocina
      const pedidoCocina = {
        mesa: mesa?.numero || "NUEVO",
        productos: productosCocina,
        total: total,
        cliente: mesa?.cliente || "Sin nombre",
        datos_cliente: mesa?.datos_cliente || {},
        tipo: orderType,
        notas: "",
        timestamp: new Date(),
        estado: "pendiente",
        restauranteId: restauranteId,
      };

      // Enviar a cocina
      const pedidoCocinaRef = collection(
        db,
        `restaurantes/${restauranteId}/pedidosCocina`
      );
      const docRef = await addDoc(pedidoCocinaRef, pedidoCocina);

      console.log("✅ Pedido enviado a cocina. ID:", docRef.id);

      // Si hay mesa, actualizarla
      if (mesa?.id) {
        const mesaRef = doc(db, "restaurantes", restauranteId, "tables", mesa.id);
        const productosExistentes = mesa.productos || [];
        const productosActualizados = [
          ...productosExistentes,
          ...productosCocina.map((p) => ({
            producto: p.nombre,
            unidades: p.cantidad,
            precio: p.precio,
            total: p.total,
          })),
        ];
        const totalActualizado = (mesa.total || 0) + total;

        await updateDoc(mesaRef, {
          productos: productosActualizados,
          total: totalActualizado,
          estado: "en_preparacion",
          updatedAt: new Date(),
        });
      }

      // Limpiar pedido
      setSelectedProducts([]);
      setExpandedProduct(null);
      setProductQuantity(1);

      // Notificar al componente padre
      if (onPedidoEnviado) {
        onPedidoEnviado({
          pedidoId: docRef.id,
          productos: productosCocina,
          total: total,
        });
      }

      alert("✅ Pedido enviado a cocina exitosamente");
    } catch (error) {
      console.error("❌ Error al enviar pedido:", error);
      alert(`Error al enviar el pedido: ${error.message}`);
    }
  };

  // Vista Desktop
  if (!isMobile) {
    return (
      <div className="h-full flex flex-col bg-gray-900 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-white hover:text-gray-300 flex items-center space-x-2"
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Volver</span>
              </button>
              <div className="h-6 w-6 bg-green-500 rounded"></div>
              <div>
                <div className="text-white font-bold text-xl">
                  Mesa {mesa?.numero || "NUEVA"}
                </div>
                <div className="text-gray-400 text-sm">Nuevo Pedido</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                {selectedProducts.reduce((sum, p) => sum + p.cantidad, 0)}
              </div>
              <button
                onClick={() => setShowClientModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>& Cliente</span>
              </button>
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div className="bg-gray-800 p-4 flex-shrink-0 border-b border-gray-700">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedMainCategory("todos");
                setSelectedSubCategory("");
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedMainCategory === "todos"
                  ? "bg-green-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Todos
            </button>
            {mainCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedMainCategory(category.id);
                  setSelectedSubCategory("");
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedMainCategory === category.id
                    ? "bg-orange-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {category.name || category.nombre || category.id}
              </button>
            ))}
          </div>

          {/* Subcategorías */}
          {selectedMainCategory && selectedMainCategory !== "todos" && currentSubCategories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {currentSubCategories.map((subCategory) => (
                <button
                  key={subCategory.id}
                  onClick={() => setSelectedSubCategory(subCategory.id)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    selectedSubCategory === subCategory.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {subCategory.name || subCategory.nombre || subCategory.id}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Productos */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-12">
                No hay productos disponibles
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="relative">
                  {expandedProduct === product.id ? (
                    <div className="bg-blue-600 rounded-lg p-4 border-2 border-blue-400">
                      <div className="text-white font-bold mb-2 text-sm">
                        {product.nombre}
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <button
                          onClick={() =>
                            setProductQuantity(Math.max(1, productQuantity - 1))
                          }
                          className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="text-white font-bold text-lg">
                          {productQuantity}
                        </span>
                        <button
                          onClick={() => setProductQuantity(productQuantity + 1)}
                          className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-white text-xs mb-3">
                        ${(product.precio * (1 - (product.descuento || 0) / 100)).toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleAddProduct(product)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold text-sm"
                      >
                        Añadir producto
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleProductSelect(product)}
                      className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:border-2 hover:border-blue-500 transition-all"
                    >
                      <div className="text-white text-sm font-medium truncate">
                        {product.nombre}
                      </div>
                      <div className="text-blue-400 text-xs mt-1">
                        ${(product.precio * (1 - (product.descuento || 0) / 100)).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Barra fija abajo */}
       
        <div className="h-20"></div> {/* Espaciador para la barra fija */}
      </div>
    );
  }

  // Vista Mobile/Tablet
  return (
    <div className="h-full flex flex-col bg-gray-100">
   

      {/* Header */}
      <div className="bg-blue-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="text-white hover:text-gray-200">
            volver
          </button>
          <div>
            <div className="font-bold">mesa {mesa?.numero || "03"}</div>
            <div className="text-sm text-blue-200">nuevo pedido</div>
          </div>
        </div>
        <button
          onClick={() => setShowClientModal(true)}
          className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg"
        >
          cliente
        </button>
      </div>

      {/* Categorías */}
      <div className="bg-blue-700 text-white p-4">
        <div className="text-sm font-semibold mb-2">
          productos lista de categorias
        </div>
        <div className="flex items-center space-x-2 mb-3">
          <button
            onClick={() => {
              setSelectedMainCategory("todos");
              setSelectedSubCategory("");
            }}
            className={`px-3 py-1 rounded-lg text-sm ${
              selectedMainCategory === "todos"
                ? "bg-white text-blue-700"
                : "bg-blue-600 text-white"
            }`}
          >
            Todos
          </button>
          <select
            value={selectedMainCategory}
            onChange={(e) => {
              setSelectedMainCategory(e.target.value);
              setSelectedSubCategory("");
            }}
            className="flex-1 bg-blue-600 text-white px-3 py-1 rounded-lg border border-blue-500"
          >
            <option value="todos">Todas las categorías</option>
            {mainCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name || category.nombre || category.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Productos en dos columnas */}
      <div className="flex-1 p-4 overflow-y-auto bg-blue-900">
        <div className="grid grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-2 text-center text-gray-400 py-12">
              No hay productos disponibles
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id}>
                {expandedProduct === product.id ? (
                  <div className="bg-blue-600 rounded-lg p-4 border-2 border-blue-400">
                    <div className="text-white font-bold mb-2 text-sm">
                      {product.nombre}
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() =>
                          setProductQuantity(Math.max(1, productQuantity - 1))
                        }
                        className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="text-white font-bold text-lg">
                        {productQuantity}
                      </span>
                      <button
                        onClick={() => setProductQuantity(productQuantity + 1)}
                        className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-white text-xs mb-3">
                      ${(product.precio * (1 - (product.descuento || 0) / 100)).toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleAddProduct(product)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold text-sm"
                    >
                      Añadir a pedido
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => handleProductSelect(product)}
                    className="bg-gray-600 rounded-lg p-4 cursor-pointer hover:border-2 hover:border-blue-400 transition-all min-h-[100px]"
                  >
                    <div className="text-white text-sm font-medium">
                      {product.nombre}
                    </div>
                    <div className="text-blue-300 text-xs mt-2">
                      ${(product.precio * (1 - (product.descuento || 0) / 100)).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Barra fija abajo */}
      <div className="fixed bottom-0 left-0 right-0 bg-blue-700 border-t border-blue-600 p-4 z-50">
        <div className="text-green-400 font-bold text-lg mb-3 text-center">
          Total del pedido: ${calculateTotal().toLocaleString()}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowItemsModal(true)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-semibold"
          >
            Ver pedido
          </button>
          <button
            onClick={handleEnviarACocina}
            disabled={selectedProducts.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-bold"
          >
            Enviar a cocina
          </button>
        </div>
      </div>
      <div className="h-24"></div> {/* Espaciador para la barra fija */}

      {/* Modal de Cliente */}
      {showClientModal && (
        <ClienteModal
          isOpen={showClientModal}
          onClose={() => setShowClientModal(false)}
          onSave={(data) => {
            console.log("Datos del cliente guardados:", data);
            setShowClientModal(false);
          }}
          mesa={mesa}
        />
      )}

      {/* Modal de Items */}
      {showItemsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Items del Pedido</h2>
              <button
                onClick={() => setShowItemsModal(false)}
                className="text-white hover:text-gray-200"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {selectedProducts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No hay productos en el pedido
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">
                            {product.nombre}
                          </div>
                          <div className="text-sm text-gray-600">
                            ${(product.precio * (1 - (product.descuento || 0) / 100)).toFixed(2)} c/u
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(product.id, product.cantidad - 1)
                            }
                            className="bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold text-lg min-w-[2rem] text-center">
                            {product.cantidad}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(product.id, product.cantidad + 1)
                            }
                            className="bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                        <div className="font-bold text-green-600">
                          ${product.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-gray-100 p-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-gray-700">Total:</span>
                <span className="font-bold text-xl text-green-600">
                  ${calculateTotal().toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setShowItemsModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PedidoView;

