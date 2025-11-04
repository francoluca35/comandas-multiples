"use client";
import React, { useState, useEffect } from "react";
import { useProducts } from "../../../../hooks/useProducts";
import { usePromociones } from "../../../../hooks/usePromociones";
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

  const { promociones, fetchPromociones } = usePromociones();

  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [productQuantity, setProductQuantity] = useState(1);
  const [productNota, setProductNota] = useState("");
  const [showNotaModal, setShowNotaModal] = useState(false);
  // map de cantidades por producto (mobile-first: control por tarjeta)
  const [productQuantities, setProductQuantities] = useState({});
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
    fetchPromociones();
  }, []);

  // Mostrar modal de cliente si es una mesa libre y no se han guardado los datos
  useEffect(() => {
    if (mesa && mesa.estado === "libre" && !clienteDataSaved) {
      setShowClientModal(true);
    }
  }, [mesa, clienteDataSaved]);

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
    setProductNota("");
  };

  const handleAddToOrder = () => {
    if (!selectedProduct) return;

    const newItem = {
      id: Date.now(),
      producto: selectedProduct.nombre,
      unidades: productQuantity,
      precio: selectedProduct.precio,
      total: selectedProduct.precio * productQuantity,
      notas: productNota.trim() || "",
      descripcion: selectedProduct.descripcion || selectedProduct.descripción || "",
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
    setProductNota("");
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setProductQuantity(newQuantity);
    }
  };

  // Incrementar cantidad para una tarjeta de producto (mobile behavior)
  const handleIncrease = (productId) => {
    setProductQuantities((prev) => {
      const current = prev[productId] || 1;
      return { ...prev, [productId]: current + 1 };
    });
  };

  // Agregar producto directamente desde la lista (usa productQuantities)
  const handleAddProduct = (product) => {
    const qty = productQuantities[product.id] || 1;
    const newItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      producto: product.nombre,
      unidades: qty,
      precio: typeof product.precio === 'number' ? product.precio : parseFloat(product.precio) || 0,
      total: (typeof product.precio === 'number' ? product.precio : parseFloat(product.precio) || 0) * qty,
      notas: "",
      descripcion: product.descripcion || product.descripción || "",
    };

    setOrderItems((prev) => {
      const newItems = [...prev, newItem];
      return newItems;
    });

    setOrderTotal((prev) => prev + newItem.total);

    // reset quantity for that product to 1 to avoid accidental multiple adds
    setProductQuantities((prev) => ({ ...prev, [product.id]: 1 }));
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

  const handleClientSave = async (clienteData) => {
    try {
      console.log("💾 Guardando datos del cliente:", clienteData);
      
      // Guardar datos del cliente en la mesa
      const restauranteId = getRestaurantId();
      const mesaRef = doc(db, "restaurantes", restauranteId, "tables", mesa.id);
      
      await updateDoc(mesaRef, {
        datos_cliente: clienteData,
        cliente: clienteData.nombre, // Mantener compatibilidad con campo existente
        updatedAt: new Date(),
      });
      
      // Actualizar estado local
      setClientData(clienteData);
      setClienteDataSaved(true);
      setShowClientModal(false);
      
      console.log("✅ Datos del cliente guardados exitosamente");
    } catch (error) {
      console.error("❌ Error al guardar datos del cliente:", error);
      alert("Error al guardar los datos del cliente. Intente nuevamente.");
    }
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
            descripcion: item.descripcion || "",
          })),
          total: orderTotal,
          cliente: clientData.nombre || "Sin nombre",
          datos_cliente: clientData,
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
          cliente: clientData.nombre || "Sin nombre",
          datos_cliente: clientData,
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
            descripcion: item.descripcion || "",
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
  const filteredProducts = selectedMainCategory === "promociones" 
    ? promociones.filter(p => p.activo !== false).map(p => ({
        ...p,
        nombre: p.nombre || p.name,
        precio: typeof p.precio === 'string' ? parseFloat(p.precio) || 0 : (p.precio || 0),
        mainCategoryId: "promociones",
        subCategoryId: "promociones",
      }))
    : products.filter((product) => {
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
  const filteredSubCategories = (() => {
    if (!selectedMainCategory) return [];
    
    // Para bebidas, usar las subcategorías exactas del inventario
    if (selectedMainCategory === "bebidas") {
      return [
        { id: "sin alcohol", name: "Sin Alcohol", mainCategoryId: "bebidas" },
        { id: "con alcohol", name: "Con Alcohol", mainCategoryId: "bebidas" }
      ];
    }
    
    // Para otras categorías, usar las subcategorías dinámicas
    return allSubCategories.filter((subCategory) => {
      return subCategory.mainCategoryId === selectedMainCategory;
    });
  })();

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
            {/* Categoría Promociones */}
            <button
              onClick={() => {
                setSelectedMainCategory("promociones");
                setSelectedSubCategory("");
              }}
              className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg flex-shrink-0 transition-all duration-200 font-medium shadow-md text-xs ${
                selectedMainCategory === "promociones"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/25"
                  : "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
              }`}
            >
              🎁 Promociones
            </button>
          </div>

          {/* Subcategorías */}
          {selectedMainCategory !== "promociones" && (
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
          )}
        </div>
      </div>

      {/* Layout Principal */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Panel de Detalles */}
        <div className="w-full lg:w-1/3 bg-gradient-to-br from-slate-800 to-slate-900 lg:border-r border-slate-700/50 overflow-y-auto">
    <div className="h-full flex flex-col p-2 sm:p-3">
      {selectedProduct ? (
        <>
          {/* Información del Producto */}
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-3 sm:p-4 mb-3 shadow-xl border border-slate-600/50">
            <h3 className="text-white font-bold text-base sm:text-lg mb-2">{selectedProduct.nombre}</h3>
            {/* Controles de Cantidad */}
            <div className="flex items-center justify-center space-x-2 mb-3">
              <button onClick={() => handleQuantityChange(productQuantity - 1)} disabled={productQuantity <= 1} className="w-8 h-8 bg-red-500 hover:bg-red-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <div className="bg-white text-slate-800 rounded-lg px-3 py-2 font-bold text-sm shadow-lg">{productQuantity} x</div>
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg px-3 py-2 font-bold text-sm shadow-lg">$ {selectedProduct.precio.toLocaleString()}</div>
              <button onClick={() => handleQuantityChange(productQuantity + 1)} className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            {/* Total del Item */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-2 mb-3">
              <div className="text-white text-center">
                <div className="text-xs opacity-90">Total del Item</div>
                <div className="text-lg sm:text-xl font-bold">$ {(selectedProduct.precio * productQuantity).toLocaleString()}</div>
              </div>
            </div>
            {/* Descripción */}
            {selectedProduct.descripcion && (
              <div className="mb-3 p-3 bg-slate-600/50 rounded-lg border border-slate-500/50">
                <div className="text-xs text-slate-300 mb-1 font-semibold">Descripción:</div>
                <div className="text-sm text-white">{selectedProduct.descripcion}</div>
              </div>
            )}
            {/* Botón Nota */}
            <div className="mb-3">
              <button onClick={() => setShowNotaModal(true)} className="w-full bg-slate-600 hover:bg-slate-500 text-white rounded-lg px-3 py-2 flex items-center justify-center space-x-1 transition-all duration-200 shadow-lg text-xs sm:text-sm">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Nota {productNota && productNota.trim() !== "" ? "✓" : ""}</span>
              </button>
              {productNota && productNota.trim() !== "" && (
                <div className="mt-2 text-xs text-slate-300 bg-slate-700/50 rounded p-2">
                  <div className="font-semibold mb-1">Nota actual:</div>
                  <div>{productNota}</div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
      
      {/* Botones de Acción en el Panel Izquierdo */}
      <div className="mt-auto space-y-2">
        {/* Botón Agregar al Pedido - Solo cuando hay producto seleccionado */}
        {selectedProduct && (
          <button onClick={handleAddToOrder} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl px-3 py-2 items-center justify-center space-x-2 font-bold text-sm transition-all duration-200 transform hover:scale-105 shadow-xl flex">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Agregar al Pedido</span>
          </button>
        )}
        
        {/* Botones adicionales cuando hay items en el pedido */}
        {orderItems.length > 0 && (
          <>
            {/* Botón Ver Items */}
            <button
              onClick={() => setShowOrderDetails(true)}
              className="w-full bg-gradient-to-r from-[#D98C00] to-[#D98C00] hover:from-[#C77A00] hover:to-[#C77A00] text-white rounded-xl px-3 py-2 items-center justify-center space-x-2 font-bold text-sm transition-all duration-200 transform hover:scale-105 shadow-xl flex"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Ver Items</span>
            </button>
            
            {/* Botón Enviar a Cocina */}
            <button
              onClick={handleTerminar}
              className="w-full bg-gradient-to-r from-[#00A884] to-[#00A884] hover:from-[#009673] hover:to-[#009673] text-white rounded-xl px-3 py-2 items-center justify-center space-x-2 font-bold text-sm transition-all duration-200 transform hover:scale-105 shadow-xl flex"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Enviar a Cocina</span>
            </button>
          </>
        )}
      </div>
    </div>
  </div>

  {/* Grid de Productos (mobile-first: uno por fila) */}
  <div className="flex-1 p-2 overflow-y-auto">
    {loading ? (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Cargando productos...</p>
        </div>
      </div>
    ) : filteredProducts.length > 0 ? (
      <div className="space-y-3 pb-32">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-gradient-to-br from-slate-800/60 to-slate-700/30 rounded-2xl p-3 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{product.nombre}</div>
              {product.descripcion && <div className="text-xs text-slate-400 mt-1 line-clamp-2">{product.descripcion}</div>}
              <div className="text-emerald-400 font-bold mt-3">$ {(typeof product.precio === "number" ? product.precio : parseFloat(product.precio) || 0).toLocaleString()}</div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button onClick={() => handleIncrease(product.id)} className="w-10 h-10 bg-emerald-500 rounded-full text-white flex items-center justify-center text-lg">+</button>
              <div className="text-white font-bold text-sm">{productQuantities[product.id] || 1}x</div>
              <button onClick={() => handleAddProduct(product)} className="w-28 bg-blue-600 text-white rounded-lg py-2 font-semibold">Agregar</button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-white text-base font-bold mb-1">No hay productos</h3>
          <p className="text-slate-400 text-sm">{selectedSubCategory ? "No hay productos en esta subcategoría" : "Selecciona una categoría para ver los productos disponibles"}</p>
        </div>
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

      {/* Modal de Cliente */}
      <ClienteModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSave={handleClientSave}
        mesa={mesa}
      />

      {/* Modal de Nota */}
      {showNotaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-3">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md">
            <div className="p-3 sm:p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Nota para {selectedProduct?.nombre || "producto"}
                </h2>
                <button
                  onClick={() => setShowNotaModal(false)}
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-white font-medium mb-1 sm:mb-2 text-sm">
                  Comentario para cocina (ej: sin cebolla, sin tomate, etc.)
                </label>
                <textarea
                  value={productNota}
                  onChange={(e) => setProductNota(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-700 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm resize-none"
                  placeholder="Ej: Sin cebolla, sin tomate, bien cocido..."
                />
              </div>

              <div className="flex space-x-2 sm:space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setProductNota("");
                    setShowNotaModal(false);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotaModal(false)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg text-sm"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PedidoView;
