"use client";
import React, { useState, useEffect } from "react";
import { useProducts } from "../../../../hooks/useProducts";

function TakeawayView({ onBack }) {
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
  const [clientData, setClientData] = useState({
    nombre: "",
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

  const handleSubmitOrder = () => {
    if (!clientData.nombre.trim()) {
      alert("Por favor ingrese el nombre del cliente");
      return;
    }

    if (selectedProducts.length === 0) {
      alert("Por favor seleccione al menos un producto");
      return;
    }

    // Aquí iría la lógica para procesar el pedido
    console.log("Pedido Takeaway:", {
      cliente: clientData,
      productos: selectedProducts,
      total: calculateTotal(),
      tipo: "takeaway",
    });

    // Limpiar formulario
    setClientData({ nombre: "", mPago: "efectivo" });
    setSelectedProducts([]);
    alert("Pedido procesado exitosamente");
  };

  return (
    <div className="h-full flex bg-slate-900">
      {/* Panel Izquierdo - Datos Cliente y Pedido */}
      <div className="w-1/2 bg-slate-800 p-6 flex flex-col">
        {/* Datos Cliente */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Datos Cliente</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={clientData.nombre}
                onChange={(e) =>
                  setClientData((prev) => ({ ...prev, nombre: e.target.value }))
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del cliente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Método de Pago
              </label>
              <select
                value={clientData.mPago}
                onChange={(e) =>
                  setClientData((prev) => ({ ...prev, mPago: e.target.value }))
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

        {/* Pedido */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-4">Pedido</h2>
          <div className="bg-slate-700 rounded-lg p-4 flex-1 min-h-0">
            {selectedProducts.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                No hay productos seleccionados
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between bg-slate-600 rounded-lg p-3"
                  >
                    <div className="flex-1">
                      <h4 className="text-white font-medium">
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(product.id, product.cantidad - 1)
                        }
                        className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                      >
                        -
                      </button>
                      <span className="text-white font-medium min-w-[2rem] text-center">
                        {product.cantidad}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(product.id, product.cantidad + 1)
                        }
                        className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Totales */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-gray-300">
            <span>Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-white font-bold text-lg">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Botón Procesar */}
        <button
          onClick={handleSubmitOrder}
          className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Procesar Pedido
        </button>
      </div>

      {/* Panel Derecho - Menú */}
      <div className="w-1/2 bg-slate-900 p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Menú</h2>

        {/* Filtros */}
        <div className="mb-6 space-y-4">
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

        {/* Grid de Productos */}
        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className="bg-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-700 transition-colors border border-slate-600"
            >
              <h3 className="text-white font-medium mb-2">{product.nombre}</h3>
              <p className="text-gray-400 text-sm mb-2">
                {product.descripcion}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-white font-bold">
                  ${(product.precio * (1 - product.descuento / 100)).toFixed(2)}
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
  );
}

export default TakeawayView;
