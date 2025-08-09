import { useState, useEffect } from "react";

export const useStock = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener el restauranteId del localStorage
  const getRestaurantId = () => {
    const restauranteId = localStorage.getItem("restauranteId");
    if (!restauranteId) {
      throw new Error("No hay restaurante seleccionado");
    }
    return restauranteId;
  };

  // Obtener todos los productos del stock
  const fetchStock = async () => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch(`/api/stock?restauranteId=${restauranteId}`);

      if (!response.ok) {
        throw new Error("Error al obtener el stock");
      }

      const data = await response.json();
      setProductos(data);
    } catch (err) {
      console.error("Error fetching stock:", err);
      setError("Error al cargar el stock");
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar con bebidas si es una bebida
  const syncWithBebidas = async (
    productoData,
    isUpdate = false,
    existingProducto = null
  ) => {
    if (productoData.tipo === "bebida") {
      try {
        const restauranteId = getRestaurantId();

        // Buscar si ya existe la bebida
        const bebidasResponse = await fetch(
          `/api/bebidas?restauranteId=${restauranteId}`
        );
        const bebidas = await bebidasResponse.json();
        const existingBebida = bebidas.find(
          (b) => b.nombre.toLowerCase() === productoData.nombre.toLowerCase()
        );

        if (existingBebida) {
          // Actualizar bebida existente
          await fetch("/api/bebidas", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              restauranteId,
              bebidaId: existingBebida.id,
              precio: productoData.precio,
              stock: productoData.stock,
              habilitada: productoData.stock > 0,
            }),
          });
          console.log(
            `✅ Bebida "${productoData.nombre}" actualizada en menú bebidas`
          );
        } else {
          // Crear nueva bebida
          const createResponse = await fetch("/api/bebidas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              restauranteId,
              nombre: productoData.nombre,
              subcategoria: productoData.subcategoria,
              precio: productoData.precio,
              stock: productoData.stock,
              imagen: productoData.imagen,
              habilitada: productoData.stock > 0, // Asegurar que se habilite si tiene stock
            }),
          });

          if (createResponse.ok) {
            console.log(
              `✅ Bebida "${productoData.nombre}" creada en menú bebidas (${productoData.subcategoria})`
            );
          } else {
            console.error(
              `❌ Error creando bebida "${productoData.nombre}" en menú bebidas`
            );
          }
        }
      } catch (error) {
        console.error("Error sincronizando con bebidas:", error);
        // No lanzar error para no interrumpir el flujo principal
      }
    }
  };

  // Crear nuevo producto
  const createProducto = async (productoData) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch("/api/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          ...productoData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el producto");
      }

      const nuevoProducto = await response.json();
      setProductos((prev) => [...prev, nuevoProducto]);

      // Sincronizar con bebidas si es necesario
      await syncWithBebidas(productoData);

      return nuevoProducto;
    } catch (err) {
      console.error("Error creating producto:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar producto
  const updateProducto = async (productoId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const existingProducto = productos.find((p) => p.id === productoId);

      const response = await fetch("/api/stock", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          productoId,
          ...updateData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el producto");
      }

      // Actualizar el estado local
      setProductos((prev) =>
        prev.map((producto) =>
          producto.id === productoId ? { ...producto, ...updateData } : producto
        )
      );

      // Sincronizar con bebidas si es necesario
      const updatedProducto = { ...existingProducto, ...updateData };
      await syncWithBebidas(updatedProducto, true, existingProducto);

      return { success: true };
    } catch (err) {
      console.error("Error updating producto:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const deleteProducto = async (productoId) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const productoToDelete = productos.find((p) => p.id === productoId);

      const response = await fetch(
        `/api/stock?restauranteId=${restauranteId}&productoId=${productoId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el producto");
      }

      // Remover del estado local
      setProductos((prev) =>
        prev.filter((producto) => producto.id !== productoId)
      );

      // Si era una bebida, también eliminarla de bebidas
      if (productoToDelete?.tipo === "bebida") {
        try {
          const bebidasResponse = await fetch(
            `/api/bebidas?restauranteId=${restauranteId}`
          );
          const bebidas = await bebidasResponse.json();
          const existingBebida = bebidas.find(
            (b) =>
              b.nombre.toLowerCase() === productoToDelete.nombre.toLowerCase()
          );

          if (existingBebida) {
            await fetch(
              `/api/bebidas?restauranteId=${restauranteId}&bebidaId=${existingBebida.id}`,
              {
                method: "DELETE",
              }
            );
          }
        } catch (error) {
          console.error("Error eliminando bebida:", error);
        }
      }

      return { success: true };
    } catch (err) {
      console.error("Error deleting producto:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener productos por categoría
  const getProductosByCategoria = (categoria) => {
    return productos.filter((producto) => producto.categoria === categoria);
  };

  // Obtener productos con stock bajo (menos de 10)
  const getProductosStockBajo = () => {
    return productos.filter((producto) => producto.stock < 10);
  };

  // Obtener productos sin stock
  const getProductosSinStock = () => {
    return productos.filter((producto) => producto.stock === 0);
  };

  // Calcular estadísticas del stock
  const getStockStats = () => {
    const totalProductos = productos.length;
    const stockBajo = getProductosStockBajo().length;
    const sinStock = getProductosSinStock().length;
    const enStock = totalProductos - sinStock;

    const valorEnStock = productos.reduce(
      (total, producto) => total + producto.stock * producto.precio,
      0
    );

    const costoStock = productos.reduce(
      (total, producto) => total + producto.stock * producto.costo,
      0
    );

    const gananciaEstimada = valorEnStock - costoStock;

    return {
      totalProductos,
      stockBajo,
      sinStock,
      enStock,
      valorEnStock,
      costoStock,
      gananciaEstimada,
    };
  };

  // Buscar productos por nombre
  const searchProductos = (searchTerm) => {
    if (!searchTerm.trim()) return productos;

    return productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Cargar productos al inicializar
  useEffect(() => {
    fetchStock();
  }, []);

  return {
    productos,
    loading,
    error,
    fetchStock,
    createProducto,
    updateProducto,
    deleteProducto,
    getProductosByCategoria,
    getProductosStockBajo,
    getProductosSinStock,
    getStockStats,
    searchProductos,
  };
};
