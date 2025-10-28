"use client";
import { useState, useEffect, useCallback } from "react";
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
      console.log(
        "🔍 Obteniendo subcategorías para:",
        mainCategoryId,
        "en restaurante:",
        restaurantId
      );

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
      console.log(
        "🔍 Obteniendo productos para:",
        subCategoryId,
        "en categoría:",
        mainCategoryId,
        "en restaurante:",
        restaurantId
      );

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
      console.log("🔍 Obteniendo todos los productos para:", restaurantId);

      if (!restaurantId) {
        console.log("❌ No hay restaurante seleccionado");
        setProducts([]);
        return [];
      }

      const allProducts = [];

      // Obtener productos del inventario (bebidas y comidas) PRIMERO
      try {
        // Obtener bebidas del inventario
        const bebidasResponse = await fetch(
          `/api/stock?restauranteId=${restaurantId}`
        );
        if (bebidasResponse.ok) {
          const bebidas = await bebidasResponse.json();
          const bebidasInventario = bebidas
            .filter((bebida) => bebida.tipo === "bebida")
            .map((bebida) => ({
              ...bebida,
              id: bebida.id,
              nombre: bebida.nombre,
              precio: bebida.precio,
              descuento: 0,
              descripcion: bebida.categoria || "Bebida del inventario",
              mainCategoryId: "bebidas",
              subCategoryId: bebida.subcategoria, // Usar el valor real de subcategoria
              categoria: "bebidas", // Para compatibilidad
              subcategoria: bebida.subcategoria, // Usar el valor real de subcategoria
              activo: bebida.stock > 0,
              habilitada: bebida.stock > 0,
              stock: bebida.stock,
              costo: bebida.costo,
              imagen: bebida.imagen,
              tipoProducto: "bebida",
              origen: "inventario",
            }));
          allProducts.push(...bebidasInventario);
          console.log(
            "✅ Bebidas del inventario agregadas:",
            bebidasInventario
          );
        }

        // Obtener materia prima del inventario (solo las que son comida)
        const materiaPrimaResponse = await fetch(
          `/api/materia-prima?restauranteId=${restaurantId}`
        );
        if (materiaPrimaResponse.ok) {
          const materiaPrima = await materiaPrimaResponse.json();
          const comidasInventario = materiaPrima
            .filter((item) => item.esComida === true)
            .map((comida) => ({
              ...comida,
              id: comida.id,
              nombre: comida.nombre,
              precio: comida.precio,
              descuento: 0,
              descripcion: comida.categoria || "Comida del inventario",
              mainCategoryId: "comidas",
              subCategoryId: comida.subcategoria || "Varios",
              categoria: "comidas", // Para compatibilidad
              subcategoria: comida.subcategoria || "Varios", // Para compatibilidad
              activo: true,
              habilitada: true,
              stock: comida.stock,
              costo: comida.costo,
              imagen: comida.imagen,
              tipoProducto: "alimento",
              origen: "inventario",
            }));
          allProducts.push(...comidasInventario);
          console.log(
            "✅ Comidas del inventario agregadas:",
            comidasInventario
          );
        }
      } catch (inventarioError) {
        console.warn(
          "Error obteniendo productos del inventario:",
          inventarioError
        );
        // No fallar si no se pueden obtener productos del inventario
      }

      // Obtener productos del menú (EXCLUYENDO bebidas para evitar duplicación)
      try {
        const mainCategories = await fetchMainCategories();
        console.log("✅ Categorías principales obtenidas:", mainCategories);

        for (const mainCategory of mainCategories) {
          const subCategories = await fetchSubCategories(mainCategory.id);

          for (const subCategory of subCategories) {
            const subCategoryProducts = await fetchProductsBySubCategory(
              mainCategory.id,
              subCategory.id
            );
            // Filtrar bebidas del menú para evitar duplicación con inventario
            const productosNoBebidas = subCategoryProducts.filter(producto => 
              !producto.nombre.toLowerCase().includes('bebida') && 
              !producto.descripcion?.toLowerCase().includes('bebida')
            );
            allProducts.push(...productosNoBebidas);
          }
        }
      } catch (menuError) {
        console.warn("Error obteniendo productos del menú:", menuError);
      }

      setProducts(allProducts);
      console.log(
        "✅ Todos los productos cargados (inventario + menú):",
        allProducts
      );
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
      console.log(
        "🔍 Creando nueva categoría principal:",
        categoryName,
        "en restaurante:",
        restaurantId
      );

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

      console.log("✅ Categoría principal creada:", {
        id: categoryName,
        name: categoryName,
      });
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
      console.log(
        "🔍 Creando nueva subcategoría:",
        subCategoryName,
        "en categoría principal:",
        mainCategoryId,
        "en restaurante:",
        restaurantId
      );

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

      console.log("✅ Subcategoría creada:", {
        id: subCategoryName,
        name: subCategoryName,
        mainCategoryId,
      });
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
      console.log(
        "🔍 Creando nuevo producto:",
        productData,
        "en restaurante:",
        restaurantId
      );

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
      console.log(
        "🔍 Actualizando producto:",
        productId,
        "en categoría:",
        mainCategoryId,
        "subcategoría:",
        subCategoryId,
        "en restaurante:",
        restaurantId
      );

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
      console.log(
        "🔍 Eliminando producto:",
        productId,
        "en categoría:",
        mainCategoryId,
        "subcategoría:",
        subCategoryId,
        "en restaurante:",
        restaurantId
      );

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
      console.log(
        "🔍 Obteniendo producto:",
        productId,
        "en categoría:",
        mainCategoryId,
        "subcategoría:",
        subCategoryId,
        "en restaurante:",
        restaurantId
      );

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

  // Actualizar categoría principal
  const updateMainCategory = async (categoryId, newName) => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      console.log(
        "🔍 Actualizando categoría principal:",
        categoryId,
        "→",
        newName,
        "en restaurante:",
        restaurantId
      );

      // Verificar si la nueva categoría ya existe
      const existingCategories = await fetchMainCategories();
      const categoryExists = existingCategories.some(
        (cat) => cat.id !== categoryId && cat.name.toLowerCase() === newName.toLowerCase()
      );

      if (categoryExists) {
        throw new Error("Ya existe una categoría con ese nombre");
      }

      // Actualizar la categoría principal
      const categoryRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        categoryId
      );
      await updateDoc(categoryRef, {
        name: newName,
        updatedAt: serverTimestamp(),
      });

      // Actualizar la lista de categorías principales
      await fetchMainCategories();

      console.log("✅ Categoría principal actualizada:", {
        id: categoryId,
        name: newName,
      });
      return { id: categoryId, name: newName };
    } catch (err) {
      setError(`Error al actualizar categoría principal: ${err.message}`);
      console.error("Error updating main category:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar categoría principal
  const deleteMainCategory = async (categoryId) => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      console.log(
        "🔍 Eliminando categoría principal:",
        categoryId,
        "en restaurante:",
        restaurantId
      );

      // Verificar si la categoría tiene subcategorías
      const subCategories = await fetchSubCategories(categoryId);
      if (subCategories.length > 0) {
        throw new Error("No se puede eliminar una categoría que tiene subcategorías. Elimina primero las subcategorías.");
      }

      // Eliminar la categoría principal
      const categoryRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        categoryId
      );
      await deleteDoc(categoryRef);

      // Actualizar la lista de categorías principales
      await fetchMainCategories();

      console.log("✅ Categoría principal eliminada:", categoryId);
      return true;
    } catch (err) {
      setError(`Error al eliminar categoría principal: ${err.message}`);
      console.error("Error deleting main category:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar subcategoría
  const updateSubCategory = async (mainCategoryId, subCategoryId, newName) => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      console.log(
        "🔍 Actualizando subcategoría:",
        subCategoryId,
        "→",
        newName,
        "en categoría:",
        mainCategoryId,
        "en restaurante:",
        restaurantId
      );

      // Verificar si la nueva subcategoría ya existe
      const existingSubCategories = await fetchSubCategories(mainCategoryId);
      const subCategoryExists = existingSubCategories.some(
        (subCat) => subCat.id !== subCategoryId && subCat.name.toLowerCase() === newName.toLowerCase()
      );

      if (subCategoryExists) {
        throw new Error("Ya existe una subcategoría con ese nombre en esta categoría");
      }

      // Actualizar la subcategoría
      const subCategoryRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        mainCategoryId,
        "subcategorias",
        subCategoryId
      );
      await updateDoc(subCategoryRef, {
        name: newName,
        updatedAt: serverTimestamp(),
      });

      // Actualizar la lista de subcategorías
      await fetchSubCategories(mainCategoryId);

      console.log("✅ Subcategoría actualizada:", {
        id: subCategoryId,
        name: newName,
        mainCategoryId,
      });
      return { id: subCategoryId, name: newName, mainCategoryId };
    } catch (err) {
      setError(`Error al actualizar subcategoría: ${err.message}`);
      console.error("Error updating subcategory:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar subcategoría
  const deleteSubCategory = async (mainCategoryId, subCategoryId) => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      console.log(
        "🔍 Eliminando subcategoría:",
        subCategoryId,
        "en categoría:",
        mainCategoryId,
        "en restaurante:",
        restaurantId
      );

      // Verificar si la subcategoría tiene productos
      const products = await fetchProductsBySubCategory(mainCategoryId, subCategoryId);
      if (products.length > 0) {
        throw new Error("No se puede eliminar una subcategoría que tiene productos. Elimina primero los productos.");
      }

      // Eliminar la subcategoría
      const subCategoryRef = doc(
        db,
        "restaurantes",
        restaurantId,
        "menus",
        mainCategoryId,
        "subcategorias",
        subCategoryId
      );
      await deleteDoc(subCategoryRef);

      // Actualizar la lista de subcategorías
      await fetchSubCategories(mainCategoryId);

      console.log("✅ Subcategoría eliminada:", subCategoryId);
      return true;
    } catch (err) {
      setError(`Error al eliminar subcategoría: ${err.message}`);
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

  // Cargar productos automáticamente al inicializar el hook
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Obtener todas las subcategorías habilitadas de todas las categorías principales
  const fetchAllSubCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      console.log(
        "🔍 Obteniendo todas las subcategorías habilitadas para restaurante:",
        restaurantId
      );

      const mainCategories = await fetchMainCategories();
      const allSubCategories = [];

      for (const mainCategory of mainCategories) {
        const subCategories = await fetchSubCategories(mainCategory.id);
        // Filtrar solo subcategorías habilitadas (si tienen la propiedad habilitada)
        const enabledSubCategories = subCategories.filter(
          (subCat) => subCat.habilitada !== false // Incluir si no tiene la propiedad o si es true
        );
        allSubCategories.push(...enabledSubCategories);
      }

      console.log("✅ Todas las subcategorías habilitadas:", allSubCategories);
      return allSubCategories;
    } catch (err) {
      setError(`Error al cargar todas las subcategorías: ${err.message}`);
      console.error("Error fetching all subcategories:", err);
      return [];
    } finally {
      setLoading(false);
    }
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
    fetchAllSubCategories,
    updateMainCategory,
    deleteMainCategory,
    updateSubCategory,
    deleteSubCategory,
  };
};
