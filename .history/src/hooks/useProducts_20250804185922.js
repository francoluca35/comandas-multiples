"use client";
import { useState, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  setDoc,
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

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener el restauranteId del localStorage
  const getRestaurantId = () => {
    const restauranteId = localStorage.getItem("restauranteId");
    const nombreResto = localStorage.getItem("nombreResto");
    
    if (!restauranteId || !nombreResto) {
      throw new Error("No hay restaurante seleccionado");
    }

    // Verificar que el restauranteId coincide con el nombre del restaurante
    const expectedRestauranteId = nombreResto
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    if (expectedRestauranteId !== restauranteId) {
      throw new Error("ID del restaurante no válido");
    }

    console.log("🏪 Usando restauranteId para productos:", restauranteId);
    return restauranteId;
  };

  // Obtener todas las categorías principales
  const fetchMainCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      console.log("🔍 Obteniendo categorías principales para:", restaurantId);

      const mainCategoriesRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "menus"
      );
      const mainCategoriesSnapshot = await getDocs(mainCategoriesRef);

      const mainCategoriesData = mainCategoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.id,
        ...doc.data(),
      }));

      console.log("✅ Categorías principales encontradas:", mainCategoriesData);
      setMainCategories(mainCategoriesData);
      return mainCategoriesData;
    } catch (err) {
      setError(`Error al cargar categorías principales: ${err.message}`);
      console.error("Error fetching main categories:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Obtener subcategorías de una categoría principal
  const fetchSubCategories = async (mainCategoryId) => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      console.log("🔍 Obteniendo subcategorías para:", mainCategoryId, "en restaurante:", restaurantId);

      const subCategoriesRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        mainCategoryId,
        "subcategorias"
      );
      const subCategoriesSnapshot = await getDocs(subCategoriesRef);

      const subCategoriesData = subCategoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        mainCategoryId,
        name: doc.id,
        ...doc.data(),
      }));

      console.log("✅ Subcategorías encontradas:", subCategoriesData);
      setSubCategories((prev) => ({
        ...prev,
        [mainCategoryId]: subCategoriesData,
      }));

      return subCategoriesData;
    } catch (err) {
      setError(`Error al cargar subcategorías: ${err.message}`);
      console.error("Error fetching subcategories:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Obtener productos de una subcategoría específica
  const fetchProductsBySubCategory = async (mainCategoryId, subCategoryId) => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      console.log("🔍 Obteniendo productos para:", subCategoryId, "en categoría:", mainCategoryId, "en restaurante:", restaurantId);

      const productsRef = collection(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        mainCategoryId,
        "subcategorias",
        subCategoryId,
        "items"
      );
      const productsSnapshot = await getDocs(productsRef);

      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        mainCategoryId,
        subCategoryId,
        ...doc.data(),
      }));

      console.log("✅ Productos encontrados:", productsData);
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

      const restaurantId = getRestaurantId();
      console.log("🔍 Obteniendo todos los productos para restaurante:", restaurantId);

      const mainCategories = await fetchMainCategories();
      const allProducts = [];

      for (const mainCategory of mainCategories) {
        const subCategories = await fetchSubCategories(mainCategory.id);

        for (const subCategory of subCategories) {
          const subCategoryProducts = await fetchProductsBySubCategory(
            mainCategory.id,
            subCategory.id
          );
          allProducts.push(...subCategoryProducts);
        }
      }

      setProducts(allProducts);
      console.log("✅ Todos los productos cargados:", allProducts);
      return allProducts;
    } catch (err) {
      setError(`Error al cargar todos los productos: ${err.message}`);
      console.error("Error fetching all products:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva categoría principal
  const createMainCategory = async (categoryName) => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      console.log("🔍 Creando nueva categoría principal:", categoryName, "en restaurante:", restaurantId);

      // Verificar si la categoría ya existe
      const existingCategories = await fetchMainCategories();
      const categoryExists = existingCategories.some(
        (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
      );

      if (categoryExists) {
        throw new Error("La categoría principal ya existe");
      }

      // Crear la categoría principal como un documento con metadata
      const categoryRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        categoryName
      );
      await setDoc(categoryRef, {
        name: categoryName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Actualizar la lista de categorías principales
      await fetchMainCategories();

      console.log("✅ Categoría principal creada:", { id: categoryName, name: categoryName });
      return { id: categoryName, name: categoryName };
    } catch (err) {
      setError(`Error al crear categoría principal: ${err.message}`);
      console.error("Error creating main category:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva subcategoría
  const createSubCategory = async (mainCategoryId, subCategoryName) => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      console.log("🔍 Creando nueva subcategoría:", subCategoryName, "en categoría principal:", mainCategoryId, "en restaurante:", restaurantId);

      // Verificar si la subcategoría ya existe
      const existingSubCategories = await fetchSubCategories(mainCategoryId);
      const subCategoryExists = existingSubCategories.some(
        (subCat) => subCat.name.toLowerCase() === subCategoryName.toLowerCase()
      );

      if (subCategoryExists) {
        throw new Error("La subcategoría ya existe");
      }

      // Crear la subcategoría como un documento con metadata
      const subCategoryRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        mainCategoryId,
        "subcategorias",
        subCategoryName
      );
      await setDoc(subCategoryRef, {
        name: subCategoryName,
        mainCategoryId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Actualizar la lista de subcategorías
      await fetchSubCategories(mainCategoryId);

      console.log("✅ Subcategoría creada:", { id: subCategoryName, name: subCategoryName, mainCategoryId });
      return { id: subCategoryName, name: subCategoryName, mainCategoryId };
    } catch (err) {
      setError(`Error al crear subcategoría: ${err.message}`);
      console.error("Error creating subcategory:", err);
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

      const restaurantId = getRestaurantId();
      console.log("🔍 Creando nuevo producto:", productData, "en restaurante:", restaurantId);

      const {
        mainCategoryId,
        subCategoryId,
        name,
        price,
        discount = 0,
        description = "",
      } = productData;

      // Validaciones
      if (!mainCategoryId || !subCategoryId || !name || !price) {
        throw new Error(
          "Categoría principal, subcategoría, nombre y precio son obligatorios"
        );
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
        mainCategoryId,
        "subcategorias",
        subCategoryId,
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

      console.log("✅ Producto creado:", {
        id: newProduct.id,
        mainCategoryId,
        subCategoryId,
        nombre: name,
        precio: parseFloat(price),
        descuento: parseFloat(discount),
        descripcion: description,
        activo: true,
      });
      return {
        id: newProduct.id,
        mainCategoryId,
        subCategoryId,
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
  const updateProduct = async (
    productId,
    mainCategoryId,
    subCategoryId,
    productData
  ) => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      console.log("🔍 Actualizando producto:", productId, "en categoría:", mainCategoryId, "subcategoría:", subCategoryId, "en restaurante:", restaurantId);

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
        mainCategoryId,
        "subcategorias",
        subCategoryId,
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

      console.log("✅ Producto actualizado:", {
        id: productId,
        mainCategoryId,
        subCategoryId,
        nombre: name,
        precio: parseFloat(price),
        descuento: parseFloat(discount),
        descripcion: description,
        activo,
      });
      return {
        id: productId,
        mainCategoryId,
        subCategoryId,
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
  const deleteProduct = async (productId, mainCategoryId, subCategoryId) => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      console.log("🔍 Eliminando producto:", productId, "en categoría:", mainCategoryId, "subcategoría:", subCategoryId, "en restaurante:", restaurantId);

      const productRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        mainCategoryId,
        "subcategorias",
        subCategoryId,
        "items",
        productId
      );
      await deleteDoc(productRef);

      // Actualizar la lista de productos
      await fetchAllProducts();

      console.log("✅ Producto eliminado:", productId);
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
  const getProduct = async (productId, mainCategoryId, subCategoryId) => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      console.log("🔍 Obteniendo producto:", productId, "en categoría:", mainCategoryId, "subcategoría:", subCategoryId, "en restaurante:", restaurantId);

      const productRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        mainCategoryId,
        "subcategorias",
        subCategoryId,
        "items",
        productId
      );
      const productSnapshot = await getDoc(productRef);

      if (!productSnapshot.exists()) {
        throw new Error("Producto no encontrado");
      }

      console.log("✅ Producto encontrado:", {
        id: productSnapshot.id,
        mainCategoryId,
        subCategoryId,
        ...productSnapshot.data(),
      });
      return {
        id: productSnapshot.id,
        mainCategoryId,
        subCategoryId,
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
    mainCategories,
    subCategories,
    loading,
    error,

    // Acciones
    fetchMainCategories,
    fetchSubCategories,
    fetchProductsBySubCategory,
    fetchAllProducts,
    createMainCategory,
    createSubCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    calculateDiscountedPrice,
    clearError,
  };
};
