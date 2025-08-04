"use client";
import { useState } from "react";

export const useProductAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función helper para manejar errores de la API
  const handleApiError = (response, errorMessage) => {
    if (!response.ok) {
      const errorData = response.json
        ? response.json()
        : { error: errorMessage };
      throw new Error(errorData.error || errorMessage);
    }
    return response.json();
  };

  // Obtener todos los productos
  const fetchProducts = async (restaurantId = "francomputer") => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/productos?restaurantId=${restaurantId}`
      );
      const data = await handleApiError(response, "Error al obtener productos");

      return data.data || [];
    } catch (err) {
      setError(err.message);
      console.error("Error fetching products:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Obtener productos por subcategoría
  const fetchProductsBySubCategory = async (
    mainCategoryId,
    subCategoryId,
    restaurantId = "francomputer"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/productos?mainCategoryId=${mainCategoryId}&subCategoryId=${subCategoryId}&restaurantId=${restaurantId}`
      );
      const data = await handleApiError(
        response,
        "Error al obtener productos de la subcategoría"
      );

      return data.data || [];
    } catch (err) {
      setError(err.message);
      console.error("Error fetching products by subcategory:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo producto
  const createProduct = async (productData, restaurantId = "francomputer") => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...productData,
          restaurantId,
        }),
      });

      const data = await handleApiError(response, "Error al crear producto");
      return data.data;
    } catch (err) {
      setError(err.message);
      console.error("Error creating product:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar producto
  const updateProduct = async (
    productId,
    mainCategoryId,
    subCategoryId,
    productData,
    restaurantId = "francomputer"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/productos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          mainCategoryId,
          subCategoryId,
          ...productData,
          restaurantId,
        }),
      });

      const data = await handleApiError(
        response,
        "Error al actualizar producto"
      );
      return data.data;
    } catch (err) {
      setError(err.message);
      console.error("Error updating product:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const deleteProduct = async (
    productId,
    mainCategoryId,
    subCategoryId,
    restaurantId = "francomputer"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/productos?productId=${productId}&mainCategoryId=${mainCategoryId}&subCategoryId=${subCategoryId}&restaurantId=${restaurantId}`,
        {
          method: "DELETE",
        }
      );

      await handleApiError(response, "Error al eliminar producto");
      return true;
    } catch (err) {
      setError(err.message);
      console.error("Error deleting product:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener todas las categorías principales
  const fetchMainCategories = async (restaurantId = "francomputer") => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/categorias?restaurantId=${restaurantId}`
      );
      const data = await handleApiError(
        response,
        "Error al obtener categorías principales"
      );

      return data.data || [];
    } catch (err) {
      setError(err.message);
      console.error("Error fetching main categories:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Obtener subcategorías de una categoría principal
  const fetchSubCategories = async (
    mainCategoryId,
    restaurantId = "francomputer"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/subcategorias?mainCategoryId=${mainCategoryId}&restaurantId=${restaurantId}`
      );
      const data = await handleApiError(
        response,
        "Error al obtener subcategorías"
      );

      return data.data || [];
    } catch (err) {
      setError(err.message);
      console.error("Error fetching subcategories:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva categoría principal
  const createMainCategory = async (name, restaurantId = "francomputer") => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          restaurantId,
        }),
      });

      const data = await handleApiError(
        response,
        "Error al crear categoría principal"
      );
      return data.data;
    } catch (err) {
      setError(err.message);
      console.error("Error creating main category:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva subcategoría
  const createSubCategory = async (
    mainCategoryId,
    name,
    restaurantId = "francomputer"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/subcategorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mainCategoryId,
          name,
          restaurantId,
        }),
      });

      const data = await handleApiError(
        response,
        "Error al crear subcategoría"
      );
      return data.data;
    } catch (err) {
      setError(err.message);
      console.error("Error creating subcategory:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar categoría principal
  const updateMainCategory = async (
    oldName,
    newName,
    restaurantId = "francomputer"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/categorias", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldName,
          newName,
          restaurantId,
        }),
      });

      const data = await handleApiError(
        response,
        "Error al actualizar categoría principal"
      );
      return data.data;
    } catch (err) {
      setError(err.message);
      console.error("Error updating main category:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar subcategoría
  const updateSubCategory = async (
    mainCategoryId,
    oldName,
    newName,
    restaurantId = "francomputer"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/subcategorias", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mainCategoryId,
          oldName,
          newName,
          restaurantId,
        }),
      });

      const data = await handleApiError(
        response,
        "Error al actualizar subcategoría"
      );
      return data.data;
    } catch (err) {
      setError(err.message);
      console.error("Error updating subcategory:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar categoría principal
  const deleteMainCategory = async (name, restaurantId = "francomputer") => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/categorias?name=${encodeURIComponent(
          name
        )}&restaurantId=${restaurantId}`,
        {
          method: "DELETE",
        }
      );

      const data = await handleApiError(
        response,
        "Error al eliminar categoría principal"
      );
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Error deleting main category:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar subcategoría
  const deleteSubCategory = async (
    mainCategoryId,
    name,
    restaurantId = "francomputer"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/subcategorias?mainCategoryId=${mainCategoryId}&name=${encodeURIComponent(
          name
        )}&restaurantId=${restaurantId}`,
        {
          method: "DELETE",
        }
      );

      const data = await handleApiError(
        response,
        "Error al eliminar subcategoría"
      );
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Error deleting subcategory:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Limpiar errores
  const clearError = () => {
    setError(null);
  };

  return {
    // Estado
    loading,
    error,

    // Productos
    fetchProducts,
    fetchProductsBySubCategory,
    createProduct,
    updateProduct,
    deleteProduct,

    // Categorías principales
    fetchMainCategories,
    createMainCategory,
    updateMainCategory,
    deleteMainCategory,

    // Subcategorías
    fetchSubCategories,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,

    // Utilidades
    clearError,
  };
};
