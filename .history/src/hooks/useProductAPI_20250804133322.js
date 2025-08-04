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

  // Obtener productos por categoría
  const fetchProductsByCategory = async (
    categoryId,
    restaurantId = "francomputer"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/productos?categoryId=${categoryId}&restaurantId=${restaurantId}`
      );
      const data = await handleApiError(
        response,
        "Error al obtener productos de la categoría"
      );

      return data.data || [];
    } catch (err) {
      setError(err.message);
      console.error("Error fetching products by category:", err);
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
    categoryId,
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
          categoryId,
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
    categoryId,
    restaurantId = "francomputer"
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/productos?productId=${productId}&categoryId=${categoryId}&restaurantId=${restaurantId}`,
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

  // Obtener todas las categorías
  const fetchCategories = async (restaurantId = "francomputer") => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/categorias?restaurantId=${restaurantId}`
      );
      const data = await handleApiError(
        response,
        "Error al obtener categorías"
      );

      return data.data || [];
    } catch (err) {
      setError(err.message);
      console.error("Error fetching categories:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva categoría
  const createCategory = async (name, restaurantId = "francomputer") => {
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

      const data = await handleApiError(response, "Error al crear categoría");
      return data.data;
    } catch (err) {
      setError(err.message);
      console.error("Error creating category:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar categoría
  const updateCategory = async (
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
        "Error al actualizar categoría"
      );
      return data.data;
    } catch (err) {
      setError(err.message);
      console.error("Error updating category:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar categoría
  const deleteCategory = async (name, restaurantId = "francomputer") => {
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
        "Error al eliminar categoría"
      );
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Error deleting category:", err);
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
    fetchProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct,

    // Categorías
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    // Utilidades
    clearError,
  };
};
