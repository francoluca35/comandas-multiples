import { useState, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export const useProducts = (restaurantId = "francomputer") => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todas las categorías
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const categoriesRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "menus"
      );
      const categoriesSnapshot = await getDocs(categoriesRef);

      const categoriesData = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.id,
        ...doc.data(),
      }));

      setCategories(categoriesData);
      return categoriesData;
    } catch (err) {
      setError(`Error al cargar categorías: ${err.message}`);
      console.error("Error fetching categories:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Obtener productos de una categoría específica
  const fetchProductsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      setError(null);

      const productsRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        categoryId,
        "items"
      );
      const productsSnapshot = await getDocs(productsRef);

      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        categoryId,
        ...doc.data(),
      }));

      return productsData;
    } catch (err) {
      setError(`Error al cargar productos: ${err.message}`);
      console.error("Error fetching products:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Obtener todos los productos de todas las categorías
  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const categories = await fetchCategories();
      const allProducts = [];

      for (const category of categories) {
        const categoryProducts = await fetchProductsByCategory(category.id);
        allProducts.push(...categoryProducts);
      }

      setProducts(allProducts);
      return allProducts;
    } catch (err) {
      setError(`Error al cargar todos los productos: ${err.message}`);
      console.error("Error fetching all products:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva categoría
  const createCategory = async (categoryName) => {
    try {
      setLoading(true);
      setError(null);

      // Verificar si la categoría ya existe
      const existingCategories = await fetchCategories();
      const categoryExists = existingCategories.some(
        (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
      );

      if (categoryExists) {
        throw new Error("La categoría ya existe");
      }

      // Crear la categoría como un documento con metadata
      const categoryRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        categoryName
      );
      await updateDoc(categoryRef, {
        name: categoryName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Actualizar la lista de categorías
      await fetchCategories();

      return { id: categoryName, name: categoryName };
    } catch (err) {
      setError(`Error al crear categoría: ${err.message}`);
      console.error("Error creating category:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo producto
  const createProduct = async (productData) => {
    try {
      setLoading(true);
      setError(null);

      const {
        categoryId,
        name,
        price,
        discount = 0,
        description = "",
      } = productData;

      // Validaciones
      if (!categoryId || !name || !price) {
        throw new Error("Nombre, categoría y precio son obligatorios");
      }

      if (price <= 0) {
        throw new Error("El precio debe ser mayor a 0");
      }

      if (discount < 0 || discount > 100) {
        throw new Error("El descuento debe estar entre 0 y 100");
      }

      // Crear el producto
      const productRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        categoryId,
        "items"
      );
      const newProduct = await addDoc(productRef, {
        nombre: name,
        precio: parseFloat(price),
        descuento: parseFloat(discount),
        descripcion: description,
        activo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Actualizar la lista de productos
      await fetchAllProducts();

      return {
        id: newProduct.id,
        categoryId,
        nombre: name,
        precio: parseFloat(price),
        descuento: parseFloat(discount),
        descripcion: description,
        activo: true,
      };
    } catch (err) {
      setError(`Error al crear producto: ${err.message}`);
      console.error("Error creating product:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar producto
  const updateProduct = async (productId, categoryId, productData) => {
    try {
      setLoading(true);
      setError(null);

      const {
        name,
        price,
        discount = 0,
        description = "",
        activo = true,
      } = productData;

      // Validaciones
      if (!name || !price) {
        throw new Error("Nombre y precio son obligatorios");
      }

      if (price <= 0) {
        throw new Error("El precio debe ser mayor a 0");
      }

      if (discount < 0 || discount > 100) {
        throw new Error("El descuento debe estar entre 0 y 100");
      }

      // Actualizar el producto
      const productRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        categoryId,
        "items",
        productId
      );
      await updateDoc(productRef, {
        nombre: name,
        precio: parseFloat(price),
        descuento: parseFloat(discount),
        descripcion: description,
        activo,
        updatedAt: serverTimestamp(),
      });

      // Actualizar la lista de productos
      await fetchAllProducts();

      return {
        id: productId,
        categoryId,
        nombre: name,
        precio: parseFloat(price),
        descuento: parseFloat(discount),
        descripcion: description,
        activo,
      };
    } catch (err) {
      setError(`Error al actualizar producto: ${err.message}`);
      console.error("Error updating product:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const deleteProduct = async (productId, categoryId) => {
    try {
      setLoading(true);
      setError(null);

      const productRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        categoryId,
        "items",
        productId
      );
      await deleteDoc(productRef);

      // Actualizar la lista de productos
      await fetchAllProducts();

      return true;
    } catch (err) {
      setError(`Error al eliminar producto: ${err.message}`);
      console.error("Error deleting product:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener un producto específico
  const getProduct = async (productId, categoryId) => {
    try {
      setLoading(true);
      setError(null);

      const productRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        categoryId,
        "items",
        productId
      );
      const productSnapshot = await getDoc(productRef);

      if (!productSnapshot.exists()) {
        throw new Error("Producto no encontrado");
      }

      return {
        id: productSnapshot.id,
        categoryId,
        ...productSnapshot.data(),
      };
    } catch (err) {
      setError(`Error al obtener producto: ${err.message}`);
      console.error("Error getting product:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Calcular precio con descuento
  const calculateDiscountedPrice = (price, discount) => {
    if (!discount || discount <= 0) return price;
    return price - (price * discount) / 100;
  };

  // Limpiar errores
  const clearError = () => {
    setError(null);
  };

  return {
    // Estado
    products,
    categories,
    loading,
    error,

    // Acciones
    fetchCategories,
    fetchProductsByCategory,
    fetchAllProducts,
    createCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    calculateDiscountedPrice,
    clearError,
  };
};
