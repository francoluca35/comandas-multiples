"use client";
import React, { useState, useEffect } from "react";
import { RestaurantGuard } from "../../../components/RestaurantGuard";
import RoleGuard from "../../../components/RoleGuard";
import { useProducts } from "../../../hooks/useProducts";
import CustomAlert from "../../../components/CustomAlert";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";

function ProductosContent() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const {
    products,
    mainCategories,
    subCategories,
    loading,
    error,
    fetchMainCategories,
    fetchSubCategories,
    fetchAllProducts,
    createMainCategory,
    createSubCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    calculateDiscountedPrice,
    clearError,
  } = useProducts();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showMainCategoryForm, setShowMainCategoryForm] = useState(false);
  const [showSubCategoryForm, setShowSubCategoryForm] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [currentView, setCurrentView] = useState("menu"); // "menu" o "inventario"
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: null,
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    showCancel: true
  });
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discount: "0",
    description: "",
    mainCategoryId: "",
    subCategoryId: "",
  });
  const [mainCategoryFormData, setMainCategoryFormData] = useState({
    name: "",
  });
  const [subCategoryFormData, setSubCategoryFormData] = useState({
    name: "",
    mainCategoryId: "",
  });

  useEffect(() => {
    fetchMainCategories();
    fetchAllProducts();
  }, []);

  useEffect(() => {
    // No auto-select main category - show all categories by default
  }, [mainCategories]);

  useEffect(() => {
    if (selectedMainCategory) {
      fetchSubCategories(selectedMainCategory);
    } else {
      // Clear subcategory selection when no main category is selected
      setSelectedSubCategory("");
    }
  }, [selectedMainCategory]);

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

  // Función para mostrar alert personalizado
  const showAlert = (title, message, type = "warning", onConfirm = null, confirmText = "Confirmar", cancelText = "Cancelar", showCancel = true) => {
    setAlertConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText,
      showCancel
    });
  };

  // Función para cerrar alert
  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Filtrar productos según la vista actual
  const getFilteredProducts = () => {
    if (currentView === "menu") {
      // Solo productos del menú (platos, bebidas, postres) - NO materia prima
      return products.filter(product => 
        product.origen !== "inventario" || 
        (product.origen === "inventario" && product.tipo === "bebida")
      );
    } else {
      // Solo inventario (materia prima y bebidas con stock)
      return products.filter(product => 
        product.origen === "inventario"
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMainCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setMainCategoryFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setSubCategoryFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        tipo: currentView === "menu" ? "producto" : "inventario",
        esComida: currentView === "inventario" ? true : undefined
      };

      if (editingProduct) {
        await updateProduct(
          editingProduct.id,
          formData.mainCategoryId,
          formData.subCategoryId,
          productData
        );
        showAlert(
          "✅ Producto Actualizado",
          `El ${currentView === "menu" ? "producto del menú" : "item del inventario"} "${formData.name}" ha sido actualizado correctamente.`,
          "success"
        );
        resetForm();
        setShowForm(false);
      } else {
        await createProduct(productData);
        showAlert(
          "✅ Producto Creado",
          `El ${currentView === "menu" ? "producto del menú" : "item del inventario"} "${formData.name}" ha sido creado correctamente.`,
          "success"
        );
        resetForm();
        setShowForm(false);
        setShowContinueModal(true);
      }
    } catch (err) {
      console.error("Error saving product:", err);
      showAlert(
        "❌ Error al Guardar",
        `Hubo un error al ${editingProduct ? "actualizar" : "crear"} el ${currentView === "menu" ? "producto" : "item del inventario"}. Por favor, inténtalo de nuevo.`,
        "error"
      );
    }
  };

  const handleMainCategorySubmit = async (e) => {
    e.preventDefault();

    try {
      await createMainCategory(mainCategoryFormData.name);
      setMainCategoryFormData({ name: "" });
      setShowMainCategoryForm(false);
    } catch (err) {
      console.error("Error creating main category:", err);
    }
  };

  const handleSubCategorySubmit = async (e) => {
    e.preventDefault();

    try {
      await createSubCategory(
        subCategoryFormData.mainCategoryId,
        subCategoryFormData.name
      );
      setSubCategoryFormData({ name: "", mainCategoryId: "" });
      setShowSubCategoryForm(false);
    } catch (err) {
      console.error("Error creating subcategory:", err);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.nombre,
      price: product.precio.toString(),
      discount: product.descuento?.toString() || "0",
      description: product.descripcion || "",
      mainCategoryId: product.mainCategoryId,
      subCategoryId: product.subCategoryId,
    });
    setShowForm(true);
  };

  const handleDelete = async (product) => {
    const productType = product.origen === "inventario" ? "item del inventario" : "producto del menú";
    const productCategory = product.tipo === "bebida" ? "bebida" : 
                           product.esComida ? "materia prima" : "producto";
    
    showAlert(
      "⚠️ Confirmar Eliminación",
      `¿Estás seguro de que quieres eliminar este ${productType}?\n\n"${product.nombre}"\n\nEsta acción no se puede deshacer.`,
      "warning",
      async () => {
        try {
          await deleteProduct(
            product.id,
            product.mainCategoryId,
            product.subCategoryId
          );
          showAlert(
            "✅ Eliminado Correctamente",
            `El ${productType} "${product.nombre}" ha sido eliminado correctamente.`,
            "success"
          );
        } catch (err) {
          console.error("Error deleting product:", err);
          showAlert(
            "❌ Error al Eliminar",
            `Hubo un error al eliminar el ${productType}. Por favor, inténtalo de nuevo.`,
            "error"
          );
        }
      },
      "Sí, Eliminar",
      "Cancelar"
    );
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      discount: "0",
      description: "",
      mainCategoryId: "",
      subCategoryId: "",
    });
    setEditingProduct(null);
  };

  const handleContinueAdding = () => {
    setShowContinueModal(false);
    setShowForm(true);
  };

  const handleStopAdding = () => {
    setShowContinueModal(false);
  };

  const filteredProducts = products.filter((product) => {
    // Primero filtrar por tipo de vista (menú vs inventario)
    let passesViewFilter = false;
    if (currentView === "menu") {
      // Solo productos del menú (platos, bebidas, postres) - NO materia prima
      passesViewFilter = product.origen !== "inventario" || 
                        (product.origen === "inventario" && product.tipo === "bebida");
    } else {
      // Solo inventario (materia prima y bebidas con stock)
      passesViewFilter = product.origen === "inventario";
    }

    if (!passesViewFilter) return false;

    // Luego filtrar por categoría si está seleccionada
    if (
      selectedMainCategory &&
      product.mainCategoryId !== selectedMainCategory
    ) {
      return false;
    }
    // Si subcategoría está seleccionada, filtrar por ella (solo si la categoría principal también está seleccionada)
    if (
      selectedSubCategory &&
      selectedMainCategory &&
      product.subCategoryId !== selectedSubCategory
    ) {
      return false;
    }
    return true;
  });

  const getIcon = (iconName) => {
    switch (iconName) {
      case "add":
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        );
      case "edit":
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        );
      case "delete":
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />

      <div
        className={`flex-1 flex flex-col bg-slate-800 transition-all duration-300 ${
          isExpanded
            ? "ml-56 sm:ml-64 md:ml-72 lg:ml-80 xl:ml-96 2xl:ml-[420px]"
            : "ml-16 sm:ml-20"
        }`}
      >
        {/* Overlay para cerrar sidebar */}
        {isExpanded && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
            onClick={toggleSidebar}
          />
        )}

        {/* Header */}
        <div className="bg-slate-800 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col space-y-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Gestión de Productos
              </h1>
              
              {/* Botones de cambio de vista */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentView("menu")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentView === "menu"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  🍽️ Menú (Platos, Bebidas, Postres)
                </button>
                <button
                  onClick={() => setCurrentView("inventario")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentView === "inventario"
                      ? "bg-orange-600 text-white shadow-lg"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  📦 Inventario (Materia Prima, Bebidas Stock)
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowMainCategoryForm(true)}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start space-x-2 hover:bg-blue-700 text-sm sm:text-base"
              >
                {getIcon("add")}
                <span className="hidden sm:inline">Nueva Categoría Principal</span>
                <span className="sm:hidden">Nueva Categoría</span>
              </button>
              <button
                onClick={() => setShowSubCategoryForm(true)}
                className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start space-x-2 hover:bg-purple-700 text-sm sm:text-base"
              >
                {getIcon("add")}
                <span className="hidden sm:inline">Nueva Subcategoría</span>
                <span className="sm:hidden">Nueva Subcat.</span>
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start space-x-2 hover:bg-green-700 text-sm sm:text-base"
              >
                {getIcon("add")}
                <span className="hidden sm:inline">
                  {currentView === "menu" ? "Nuevo Producto del Menú" : "Nuevo Item del Inventario"}
                </span>
                <span className="sm:hidden">
                  {currentView === "menu" ? "Nuevo Producto" : "Nuevo Item"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="mb-4">
            <p className="text-slate-400 text-sm">
              {currentView === "menu" 
                ? "Productos que aparecen en el menú del restaurante (platos, bebidas, postres)" 
                : "Items del inventario para control de stock (materia prima, bebidas con stock)"
              }
            </p>
          </div>
          {/* Error Display */}
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6 flex items-center justify-between">
              <span className="text-sm sm:text-base">{error}</span>
              <button
                onClick={clearError}
                className="text-white hover:text-gray-200 ml-2"
              >
                {getIcon("close")}
              </button>
            </div>
          )}

          {/* Category Filters */}
          <div className="bg-slate-800 p-4 rounded-lg mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <label className="text-white font-medium text-sm sm:text-base">
                  Categoría Principal:
                </label>
                <select
                  value={selectedMainCategory}
                  onChange={(e) => setSelectedMainCategory(e.target.value)}
                  className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                >
                  <option value="">Todas las categorías principales</option>
                  {mainCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMainCategory && (
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <label className="text-white font-medium text-sm sm:text-base">
                    Subcategoría:
                  </label>
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
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
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-sm sm:text-base">Cargando productos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-white font-semibold text-base sm:text-lg pr-2">
                      {product.nombre}
                    </h3>
                    <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                      {/* Mostrar botones de edición/eliminación según la vista actual */}
                      {(currentView === "menu" && product.origen !== "inventario") || 
                       (currentView === "inventario" && product.origen === "inventario") ? (
                        <>
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title={`Editar ${currentView === "menu" ? "producto del menú" : "item del inventario"}`}
                          >
                            {getIcon("edit")}
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title={`Eliminar ${currentView === "menu" ? "producto del menú" : "item del inventario"}`}
                          >
                            {getIcon("delete")}
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 px-2 py-1 bg-slate-700 rounded">
                          {currentView === "menu" ? "Gestionar desde Inventario" : "Gestionar desde Menú"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2 text-slate-300 text-sm sm:text-base">
                    <p className="break-words">
                      <span className="font-medium">Categoría:</span>{" "}
                      {product.mainCategoryId} → {product.subCategoryId}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {product.origen && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            product.origen === "inventario"
                              ? "bg-orange-600 text-white"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {product.origen === "inventario"
                            ? "📦 Inventario"
                            : "🍽️ Menú"}
                        </span>
                      )}
                      {product.tipo && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            product.tipo === "bebida"
                              ? "bg-green-600 text-white"
                              : product.esComida
                              ? "bg-purple-600 text-white"
                              : "bg-gray-600 text-white"
                          }`}
                        >
                          {product.tipo === "bebida" 
                            ? "🥤 Bebida" 
                            : product.esComida 
                            ? "🥘 Materia Prima" 
                            : "🍽️ Producto"}
                        </span>
                      )}
                    </div>
                    <p>
                      <span className="font-medium">Precio:</span> $
                      {product.precio}
                    </p>
                    {product.descuento > 0 && (
                      <p>
                        <span className="font-medium">Descuento:</span>{" "}
                        {product.descuento}%
                      </p>
                    )}
                    {product.descuento > 0 && (
                      <p className="text-green-400 font-medium">
                        Precio final: $
                        {calculateDiscountedPrice(
                          product.precio,
                          product.descuento
                        ).toFixed(2)}
                      </p>
                    )}
                    {product.descripcion && (
                      <p className="break-words">
                        <span className="font-medium">Descripción:</span>{" "}
                        {product.descripcion}
                      </p>
                    )}
                    {product.stock !== undefined && (
                      <p>
                        <span className="font-medium">Stock:</span>{" "}
                        <span
                          className={`font-medium ${
                            product.stock > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Estado:</span>
                      <span
                        className={`ml-2 ${
                          product.activo ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {product.activo ? "Activo" : "Inactivo"}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center text-slate-400 py-8 sm:py-12">
              <p className="text-lg sm:text-xl">
                {selectedMainCategory
                  ? "No hay productos en esta categoría"
                  : "No hay productos disponibles"}
              </p>
              <p className="mt-2 text-sm sm:text-base">Crea un nuevo producto para comenzar</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {editingProduct 
                  ? `Editar ${currentView === "menu" ? "Producto del Menú" : "Item del Inventario"}` 
                  : `Nuevo ${currentView === "menu" ? "Producto del Menú" : "Item del Inventario"}`
                }
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                {getIcon("close")}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-white font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                  Categoría Principal *
                </label>
                <select
                  name="mainCategoryId"
                  value={formData.mainCategoryId}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                >
                  <option value="">Seleccionar categoría principal</option>
                  {mainCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.mainCategoryId && (
                <div>
                  <label className="block text-white font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                    Subcategoría *
                  </label>
                  <select
                    name="subCategoryId"
                    value={formData.subCategoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  >
                    <option value="">Seleccionar subcategoría</option>
                    {subCategories[formData.mainCategoryId]?.map(
                      (subCategory) => (
                        <option key={subCategory.id} value={subCategory.id}>
                          {subCategory.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-white font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                  Precio *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                  Descuento (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Descripción del producto (opcional)"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-slate-700 text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading
                    ? "Guardando..."
                    : editingProduct
                    ? "Actualizar"
                    : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Category Form Modal */}
      {showMainCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Nueva Categoría Principal
              </h2>
              <button
                onClick={() => setShowMainCategoryForm(false)}
                className="text-slate-400 hover:text-white"
              >
                {getIcon("close")}
              </button>
            </div>

            <form onSubmit={handleMainCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Nombre de la categoría principal *
                </label>
                <input
                  type="text"
                  name="name"
                  value={mainCategoryFormData.name}
                  onChange={handleMainCategoryInputChange}
                  required
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
                  placeholder="Ej: Comida, Bebidas"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMainCategoryForm(false)}
                  className="flex-1 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Creando..." : "Crear Categoría Principal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub Category Form Modal */}
      {showSubCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Nueva Subcategoría
              </h2>
              <button
                onClick={() => setShowSubCategoryForm(false)}
                className="text-slate-400 hover:text-white"
              >
                {getIcon("close")}
              </button>
            </div>

            <form onSubmit={handleSubCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Categoría Principal *
                </label>
                <select
                  name="mainCategoryId"
                  value={subCategoryFormData.mainCategoryId}
                  onChange={handleSubCategoryInputChange}
                  required
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Seleccionar categoría principal</option>
                  {mainCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Nombre de la subcategoría *
                </label>
                <input
                  type="text"
                  name="name"
                  value={subCategoryFormData.name}
                  onChange={handleSubCategoryInputChange}
                  required
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
                  placeholder="Ej: Pizzas, Hamburguesas, Cafés"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSubCategoryForm(false)}
                  className="flex-1 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? "Creando..." : "Crear Subcategoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Continue Adding Modal */}
      {showContinueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="text-green-400 text-6xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-white mb-4">
                ¡Producto creado exitosamente!
              </h2>
              <p className="text-slate-300 mb-6">
                ¿Quieres seguir agregando más productos?
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={handleStopAdding}
                  className="flex-1 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  No, cerrar
                </button>
                <button
                  onClick={handleContinueAdding}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Sí, continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
      />

    </div>
  );
}

const ProductosPage = () => {
  return (
    <RestaurantGuard>
      <RoleGuard
        requiredPermission="canAccessProductos"
        fallback={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-red-400 mb-2">
                Acceso Denegado
              </h1>
              <p className="text-slate-400 mb-4">
                No tienes permisos para acceder a la gestión de productos.
              </p>
              <p className="text-slate-500 text-sm">
                Solo los administradores pueden gestionar productos del
                restaurante.
              </p>
            </div>
          </div>
        }
      >
        <div className="min-h-screen bg-slate-900 text-white">
          <SidebarProvider>
            <ProductosContent />
          </SidebarProvider>
        </div>
      </RoleGuard>
    </RestaurantGuard>
  );
};

export default ProductosPage;
