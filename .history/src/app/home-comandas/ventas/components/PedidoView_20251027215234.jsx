"use client";
import React, { useState, useEffect } from "react";
import { useProducts } from "../../../../hooks/useProducts";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
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
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [clientData, setClientData] = useState({
    nombre: "",
    email: "",
    whatsapp: "",
  });
  const [clienteDataSaved, setClienteDataSaved] = useState(false);

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

  // Debug: Monitorear cambios en el estado del pedido
  useEffect(() => {
    console.log('🔄 Estado del pedido actualizado:');
    console.log('📋 Items:', orderItems);
    console.log('💰 Total:', orderTotal);
    console.log('📊 Cantidad de items:', orderItems.length);
  }, [orderItems, orderTotal]);

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

    console.log('🛒 Agregando item al pedido:', newItem);
    console.log('💰 Precio del item:', selectedProduct.precio);
    console.log('📦 Cantidad:', productQuantity);
    console.log('💵 Total del item:', selectedProduct.precio * productQuantity);

    setOrderItems((prev) => {
      const newItems = [...prev, newItem];
      console.log('📋 Items actualizados:', newItems);
      return newItems;
    });
    
    setOrderTotal((prev) => {
      const newTotal = prev + selectedProduct.precio * productQuantity;
      console.log('💰 Total actualizado:', newTotal);
      return newTotal;
    });
    
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
      console.log("🚀 Iniciando proceso de envío a cocina...");
      console.log("Items en el pedido:", orderItems);
      console.log("Total del pedido:", orderTotal);

      const restauranteId = getRestaurantId();
      console.log("Restaurante ID:", restauranteId);

      let docRef = null; // Declarar docRef fuera del try-catch

      // ENVIAR PEDIDO A COCINA PRIMERO
      try {
        console.log("📋 Preparando datos para cocina...");

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
          notas: "",
          timestamp: new Date(),
          estado: "pendiente",
          restauranteId: restauranteId,
        };

        console.log("📋 Datos del pedido para cocina:", pedidoCocina);

        // Crear pedido en la colección de pedidos de cocina
        const pedidoCocinaRef = collection(
          db,
          `restaurantes/${restauranteId}/pedidosCocina`
        );

        docRef = await addDoc(pedidoCocinaRef, pedidoCocina);
        console.log("✅ Pedido enviado a cocina exitosamente. Document ID:", docRef.id);

        // Mostrar notificación de éxito
        alert(`✅ Pedido enviado a cocina exitosamente!\n\nMesa: ${mesa.numero || mesa.id}\nItems: ${orderItems.length}\nTotal: $${orderTotal.toLocaleString()}\n\nID del pedido: ${docRef.id}`);

      } catch (cocinaError) {
        console.error("❌ Error al enviar pedido a cocina:", cocinaError);
        alert(`❌ Error al enviar pedido a cocina:\n${cocinaError.message}\n\nContacta al administrador.`);
        return;
      }

      // ACTUALIZAR LA MESA EN FIRESTORE
      try {
        console.log("🔄 Actualizando estado de la mesa...");
        
        const mesaRef = doc(
          db,
          `restaurantes/${restauranteId}/tables/${mesa.id}`
        );

        await updateDoc(mesaRef, {
          estado: "ocupado",
          cliente: clientData.name || "Sin nombre",
          productos: orderItems,
          total: orderTotal,
          updatedAt: new Date(),
          pedidoId: docRef?.id || "sin-id",
        });

        console.log("✅ Mesa actualizada exitosamente");

      } catch (mesaError) {
        console.error("❌ Error al actualizar la mesa:", mesaError);
        alert(`⚠️ Pedido enviado a cocina pero hubo un problema al actualizar la mesa:\n${mesaError.message}`);
      }

      // Volver a la vista de mesas
      console.log("🔄 Redirigiendo a la vista de mesas...");
      onMesaOcupada(mesa);
      onBack();

    } catch (error) {
      console.error("❌ Error general en handleTerminar:", error);
      alert(`❌ Error inesperado:\n${error.message}\n\nInténtalo de nuevo.`);
    }
  };

  const handleFinalizarPedido = async () => {
    if (orderItems.length === 0) {
      alert("Debes agregar al menos un producto al pedido");
      return;
    }

    try {
      console.log("🏁 Iniciando proceso de finalización del pedido...");
      console.log("Items en el pedido:", orderItems);
      console.log("Total del pedido:", orderTotal);

      const restauranteId = getRestaurantId();
      console.log("Restaurante ID:", restauranteId);

      let docRef = null; // Declarar docRef fuera del try-catch

      // CREAR PEDIDO FINALIZADO
      try {
        console.log("📋 Preparando datos del pedido finalizado...");

        // Preparar datos del pedido finalizado
        const pedidoFinalizado = {
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
          notas: "",
          timestamp: new Date(),
          estado: "finalizado",
          restauranteId: restauranteId,
          tipo: "venta_directa", // Indica que fue una venta directa sin pasar por cocina
        };

        console.log("📋 Datos del pedido finalizado:", pedidoFinalizado);

        // Crear pedido en la colección de pedidos finalizados
        const pedidosFinalizadosRef = collection(
          db,
          `restaurantes/${restauranteId}/pedidosFinalizados`
        );

        docRef = await addDoc(pedidosFinalizadosRef, pedidoFinalizado);
        console.log("✅ Pedido finalizado exitosamente. Document ID:", docRef.id);

        // Mostrar notificación de éxito
        alert(`✅ Pedido finalizado exitosamente!\n\nMesa: ${mesa.numero || mesa.id}\nItems: ${orderItems.length}\nTotal: $${orderTotal.toLocaleString()}\n\nID del pedido: ${docRef.id}`);

      } catch (finalizarError) {
        console.error("❌ Error al finalizar pedido:", finalizarError);
        alert(`❌ Error al finalizar pedido:\n${finalizarError.message}\n\nContacta al administrador.`);
        return;
      }

      // ACTUALIZAR LA MESA EN FIRESTORE
      try {
        console.log("🔄 Actualizando estado de la mesa...");
        
        const mesaRef = doc(
          db,
          `restaurantes/${restauranteId}/tables/${mesa.id}`
        );

        await updateDoc(mesaRef, {
          estado: "ocupado",
          cliente: clientData.name || "Sin nombre",
          productos: orderItems,
          total: orderTotal,
          updatedAt: new Date(),
          pedidoId: docRef?.id || "sin-id",
          pedidoFinalizado: true,
        });

        console.log("✅ Mesa actualizada exitosamente");

      } catch (mesaError) {
        console.error("❌ Error al actualizar la mesa:", mesaError);
        alert(`⚠️ Pedido finalizado pero hubo un problema al actualizar la mesa:\n${mesaError.message}`);
      }

      // Volver a la vista de mesas
      console.log("🔄 Redirigiendo a la vista de mesas...");
      onMesaOcupada(mesa);
      onBack();

    } catch (error) {
      console.error("❌ Error general en handleFinalizarPedido:", error);
      alert(`❌ Error inesperado:\n${error.message}\n\nInténtalo de nuevo.`);
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

    if (!selectedSubCategory) {
      return true;
    }

    return product.subCategoryId === selectedSubCategory;
  });

  // Filtrar subcategorías por categoría principal seleccionada
  const filteredSubCategories = allSubCategories.filter((subCategory) => {
    if (!selectedMainCategory) return true;
    return subCategory.mainCategoryId === selectedMainCategory;
  });

  return (
    <div className="h-screen max-h-screen min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600/50 shadow-xl">
        <div className="p-2 sm:p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button 
                onClick={onBack} 
                className="flex items-center space-x-1 sm:space-x-2 text-slate-300 hover:text-white transition-colors duration-200 group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-700 rounded-lg flex items-center justify-center group-hover:bg-slate-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="font-medium text-sm">Volver</span>
              </button>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">
                    Mesa {mesa?.numero}
                  </h1>
                  <p className="text-slate-400 text-xs">Nuevo Pedido</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xs">{orderItems.length}</span>
                </div>
                <span className="text-slate-300 text-xs font-medium hidden sm:inline">Items</span>
              </div>
              
              <button
                onClick={() => setShowClientModal(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg text-xs"
              >
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Cliente</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex-shrink-0 bg-slate-800/50 border-b border-slate-700/50">
        <div className="p-2 sm:p-3">
          {/* Categorías principales */}
          <div className="flex space-x-1 overflow-x-auto mb-2 pb-1">
            {mainCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedMainCategory(category.id)}
                className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg flex-shrink-0 transition-all duration-200 font-medium shadow-md text-xs ${
                  selectedMainCategory === category.id
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/25"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Subcategorías */}
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setSelectedSubCategory("")}
              className={`px-2 py-1 rounded-lg flex-shrink-0 transition-all duration-200 text-xs font-medium shadow-md ${
                selectedSubCategory === ""
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
              }`}
            >
              {selectedMainCategory === "comida"
                ? "🍽️ Todas"
                : selectedMainCategory === "bebidas"
                ? "🥤 Todas"
                : "🍽️ Todos"}
            </button>

            {filteredSubCategories.map((subCategory) => (
              <button
                key={`${subCategory.mainCategoryId}-${subCategory.id}`}
                onClick={() => setSelectedSubCategory(subCategory.id)}
                className={`px-2 py-1 rounded-lg flex-shrink-0 transition-all duration-200 text-xs font-medium shadow-md ${
                  selectedSubCategory === subCategory.id
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/25"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                }`}
              >
                {subCategory.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layout Principal */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Panel de Detalles */}
        <div className="w-full lg:w-1/3 bg-gradient-to-br from-slate-800 to-slate-900 lg:border-r border-slate-700/50 overflow-y-auto">
          {selectedProduct ? (
            <div className="h-full flex flex-col p-2 sm:p-3 md:p-4">
              {/* Información del Producto */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 shadow-xl border border-slate-600/50">
                <h3 className="text-white font-bold text-base sm:text-lg mb-2 sm:mb-3">
                  {selectedProduct.nombre}
                </h3>

                {/* Controles de Cantidad */}
                <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
                  <button
                    onClick={() => handleQuantityChange(productQuantity - 1)}
                    disabled={productQuantity <= 1}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500 hover:bg-red-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  
                  <div className="bg-white text-slate-800 rounded-lg px-2 py-1 sm:px-3 sm:py-2 font-bold text-sm sm:text-base shadow-lg">
                    {productQuantity} x
                  </div>
                  
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg px-2 py-1 sm:px-3 sm:py-2 font-bold text-sm sm:text-base shadow-lg">
                    $ {selectedProduct.precio.toLocaleString()}
                  </div>
                  
                  <button
                    onClick={() => handleQuantityChange(productQuantity + 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>

                {/* Total del Item */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                  <div className="text-white text-center">
                    <div className="text-xs opacity-90">Total del Item</div>
                    <div className="text-lg sm:text-xl font-bold">
                      $ {(selectedProduct.precio * productQuantity).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex space-x-2">
                  <button className="flex-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg px-2 py-1 sm:px-3 sm:py-2 flex items-center justify-center space-x-1 transition-all duration-200 shadow-lg text-xs">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Nota</span>
                  </button>
                  
                  <button className="flex-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg px-2 py-1 sm:px-3 sm:py-2 flex items-center justify-center space-x-1 transition-all duration-200 shadow-lg text-xs">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Foto</span>
                  </button>
                </div>
              </div>

                             {/* Botón Agregar al Pedido */}
               <button
                 onClick={handleAddToOrder}
                 className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-center space-x-2 font-bold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 shadow-xl"
               >
                 <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                 </svg>
                 <span>Agregar al Pedido</span>
               </button>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-2 sm:p-3">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-white text-base sm:text-lg font-bold mb-1 sm:mb-2">
                  Selecciona un Producto
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Haz clic en cualquier producto para ver sus detalles
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Grid de Productos */}
        <div className="flex-1 bg-slate-900 p-2 sm:p-3 md:p-4 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-emerald-500 mx-auto mb-3 sm:mb-4"></div>
                <p className="text-slate-400 text-sm sm:text-base">Cargando productos...</p>
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`group relative p-2 sm:p-3 rounded-xl text-left transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    selectedProduct?.id === product.id
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/25"
                      : "bg-gradient-to-br from-slate-800 to-slate-700 text-white hover:from-slate-700 hover:to-slate-600 border border-slate-600/50"
                  }`}
                >
                  {/* Código del producto */}
                  <div className={`text-xs mb-1 ${
                    selectedProduct?.id === product.id ? "text-orange-100" : "text-slate-400"
                  }`}>
                    {product.id}
                  </div>
                  
                  {/* Nombre del producto */}
                  <div className="font-bold text-xs sm:text-sm mb-1 line-clamp-2">
                    {product.nombre}
                  </div>
                  
                  {/* Precio */}
                  <div className={`text-sm sm:text-base font-bold ${
                    selectedProduct?.id === product.id ? "text-orange-100" : "text-emerald-400"
                  }`}>
                    $ {product.precio.toLocaleString()}
                  </div>
                  
                  {/* Descuento */}
                  {product.descuento > 0 && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                      -{product.descuento}%
                    </div>
                  )}
                  
                  {/* Efecto de selección */}
                  {selectedProduct?.id === product.id && (
                    <div className="absolute inset-0 border-2 border-orange-400 rounded-xl pointer-events-none"></div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-white text-base sm:text-lg font-bold mb-1 sm:mb-2">
                  No hay productos
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {selectedSubCategory
                    ? "No hay productos en esta subcategoría"
                    : "Selecciona una categoría para ver los productos disponibles"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

             {/* SECCIÓN DE PEDIDO ACTUAL - FIXED CUANDO HAY ITEMS */}
       {orderItems.length > 0 && (
         <div className="flex-shrink-0 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-600/50 shadow-xl">
           <div className="p-3 sm:p-4">
             {/* Header de la sección */}
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center space-x-2">
                 <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                   <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                   </svg>
                 </div>
                 <h3 className="text-white font-bold text-lg">Pedido Actual</h3>
                 <div className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                   {orderItems.length} items
                 </div>
               </div>
               <div className="text-right">
                 <div className="text-slate-400 text-sm">Total</div>
                 <div className="text-emerald-400 text-xl font-bold">$ {orderTotal.toLocaleString()}</div>
               </div>
             </div>

             {/* Lista de productos */}
             <div className="max-h-32 overflow-y-auto mb-3">
               <div className="space-y-2">
                 {orderItems.map((item, index) => (
                   <div
                     key={item.id}
                     className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-2 sm:p-3 border border-slate-600/50 flex items-center justify-between"
                   >
                     <div className="flex items-center space-x-2 flex-1 min-w-0">
                       <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                         <span className="text-white text-xs font-bold">{index + 1}</span>
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="text-white font-medium text-sm truncate">
                           {item.producto}
                         </div>
                         <div className="text-slate-400 text-xs">
                           {item.unidades} x ${item.precio.toLocaleString()}
                         </div>
                       </div>
                     </div>
                     <div className="flex items-center space-x-2">
                       <div className="text-right">
                         <div className="text-emerald-400 font-bold text-sm">
                           $ {item.total.toLocaleString()}
                         </div>
                       </div>
                       <button
                         onClick={() => handleRemoveFromOrder(item.id)}
                         className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200"
                       >
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                         </svg>
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

                           {/* Botón Enviar a Cocina */}
              <button
                onClick={handleTerminar}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-center space-x-2 font-bold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 shadow-xl"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Enviar a Cocina - $ {orderTotal.toLocaleString()}</span>
              </button>
           </div>
         </div>
       )}

       {/* Barra de Resumen - CON BOTÓN "ENVIAR A COCINA" - SIEMPRE VISIBLE */}
       <div className="flex-shrink-0 bg-gradient-to-r from-slate-800 to-slate-700 border-t border-slate-600/50 shadow-xl">
        <div className="p-2 sm:p-3 md:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 lg:gap-6">
              {/* Total */}
              <div className="text-center sm:text-left">
                <div className="text-slate-400 text-xs font-medium">Total del Pedido</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  $ {orderTotal ? orderTotal.toLocaleString() : '0'}
                </div>
                {/* Debug info */}
                <div className="text-xs text-red-400">Debug: {orderTotal} | Items: {orderItems ? orderItems.length : 0}</div>
              </div>
              
              {/* Contador de items */}
              <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
                <div className="text-center">
                  <div className="text-slate-400 text-xs font-medium">Items</div>
                  <div className="text-lg sm:text-xl font-bold text-white">{orderItems ? orderItems.length : 0}</div>
                </div>
                
                {/* BOTÓN "VER PEDIDO" - SOLO CUANDO HAY ITEMS */}
                {orderItems.length > 0 && (
                  <button
                    onClick={() => setShowOrderDetails(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg text-xs flex items-center space-x-1"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Ver Pedido</span>
                  </button>
                )}
              </div>
            </div>
            
                         {/* BOTONES DE ACCIÓN - SOLO CUANDO HAY ITEMS */}
             {orderItems.length > 0 ? (
               <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                 {/* BOTÓN "FINALIZAR PEDIDO" (VENTA DIRECTA) */}
                 <button
                   onClick={handleFinalizarPedido}
                   className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl font-bold text-sm transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
                 >
                   <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <span>Finalizar Pedido</span>
                 </button>
                 
                 {/* BOTÓN "ENVIAR A COCINA" */}
                 <button
                   onClick={handleTerminar}
                   className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl font-bold text-sm transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
                 >
                   <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                   </svg>
                   <span>Enviar a Cocina</span>
                 </button>

               </div>
            ) : (
              <div className="text-center sm:text-right">
                <div className="text-slate-400 text-xs font-medium">Agrega productos al pedido</div>
                <div className="text-slate-300 text-sm">Selecciona productos y presiona "Agregar al Pedido"</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL "VER PEDIDO" - CON TODOS LOS ITEMS */}
      {showOrderDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-3">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg max-h-[90vh] flex flex-col">
            {/* Header del modal */}
            <div className="p-4 sm:p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-700 to-slate-800 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Detalles del Pedido</h2>
                    <p className="text-slate-400 text-sm">Mesa {mesa?.numero || mesa?.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {orderItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-3 sm:p-4 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <div className="text-white font-bold text-sm sm:text-base truncate">
                            {item.producto}
                          </div>
                        </div>
                        <div className="text-slate-400 text-xs sm:text-sm ml-8">
                          Cantidad: {item.unidades} | Precio unitario: $ {item.precio.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-emerald-400 font-bold text-sm sm:text-base">
                            $ {item.total.toLocaleString()}
                          </div>
                          <div className="text-slate-400 text-xs">
                            {item.unidades} x ${item.precio.toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFromOrder(item.id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer del modal con resumen */}
            <div className="p-4 sm:p-6 border-t border-slate-700/50 bg-gradient-to-r from-slate-700 to-slate-800 rounded-b-xl">
              {/* Resumen del pedido */}
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-300 text-sm font-medium">Total de Items:</span>
                  <span className="text-white font-bold">{orderItems.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm font-medium">Total Final:</span>
                  <span className="text-emerald-400 text-xl sm:text-2xl font-bold">$ {orderTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowOrderDetails(false);
                    handleTerminar();
                  }}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg text-sm flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Enviar a Cocina</span>
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cliente */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-3">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md">
            <div className="p-3 sm:p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-white">Datos del Cliente</h2>
                <button
                  onClick={() => setShowClientModal(false)}
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleClientSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-white font-medium mb-1 sm:mb-2 text-sm">Nombre</label>
                <input
                  type="text"
                  value={clientData.name}
                  onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                  className="w-full bg-slate-700 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  placeholder="Nombre del cliente"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-1 sm:mb-2 text-sm">Email</label>
                <input
                  type="email"
                  value={clientData.email}
                  onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                  className="w-full bg-slate-700 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-1 sm:mb-2 text-sm">Teléfono</label>
                <input
                  type="tel"
                  value={clientData.phone}
                  onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                  className="w-full bg-slate-700 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>

              <div className="flex space-x-2 sm:space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg text-sm"
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
