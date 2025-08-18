import { useState, useEffect } from "react";

export const useInventario = () => {
  const [bebidas, setBebidas] = useState([]);
  const [materiaPrima, setMateriaPrima] = useState([]);
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

  // Obtener todas las bebidas del stock
  const fetchBebidas = async () => {
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch(`/api/stock?restauranteId=${restauranteId}`);

      if (!response.ok) {
        throw new Error("Error al obtener las bebidas");
      }

      const data = await response.json();
      // Filtrar solo bebidas
      const bebidasData = data.filter((producto) => producto.tipo === "bebida");
      setBebidas(bebidasData);
    } catch (err) {
      console.error("Error fetching bebidas:", err);
      setError("Error al cargar las bebidas");
    }
  };

  // Obtener toda la materia prima
  const fetchMateriaPrima = async () => {
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch(
        `/api/materia-prima?restauranteId=${restauranteId}`
      );

      if (!response.ok) {
        // Si es un error 404 o similar, simplemente retornar array vacío
        if (response.status === 404) {
          console.log("No se encontró materia prima, inicializando con array vacío");
          setMateriaPrima([]);
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Verificar si la respuesta es un array
      if (Array.isArray(data)) {
        setMateriaPrima(data);
      } else {
        console.warn("Respuesta de materia prima no es un array:", data);
        setMateriaPrima([]);
      }
    } catch (err) {
      console.error("Error fetching materia prima:", err);
      // En lugar de setError, simplemente inicializar con array vacío
      setMateriaPrima([]);
      // Solo mostrar error si es un error crítico
      if (err.message.includes("restauranteId")) {
        setError("Error al cargar la materia prima: " + err.message);
      }
    }
  };

  // Cargar todos los datos
  const fetchInventario = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchBebidas(), fetchMateriaPrima()]);
    } catch (err) {
      console.error("Error fetching inventario:", err);
      setError("Error al cargar el inventario");
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar bebida con el menú de bebidas
  const syncBebidaWithMenu = async (
    bebidaData,
    isUpdate = false,
    existingBebida = null
  ) => {
    try {
      const restauranteId = getRestaurantId();

      // Buscar si ya existe la bebida en el menú
      const bebidasResponse = await fetch(
        `/api/bebidas?restauranteId=${restauranteId}`
      );
      const bebidasMenu = await bebidasResponse.json();
      const existingBebidaMenu = bebidasMenu.find(
        (b) => b.nombre.toLowerCase() === bebidaData.nombre.toLowerCase()
      );

      if (existingBebidaMenu) {
        // Actualizar bebida existente en el menú
        await fetch("/api/bebidas", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restauranteId,
            bebidaId: existingBebidaMenu.id,
            precio: bebidaData.precio,
            stock: bebidaData.stock,
            habilitada: bebidaData.stock > 0,
            activo: bebidaData.stock > 0,
          }),
        });
        console.log(`✅ Bebida "${bebidaData.nombre}" actualizada en menú`);
      } else {
        // Crear nueva bebida en el menú
        const bebidaMenuData = {
          restauranteId,
          nombre: bebidaData.nombre,
          subcategoria: bebidaData.subcategoria,
          precio: bebidaData.precio,
          stock: bebidaData.stock,
          imagen: bebidaData.imagen,
          habilitada: bebidaData.stock > 0,
          activo: bebidaData.stock > 0,
        };

        const createResponse = await fetch("/api/bebidas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bebidaMenuData),
        });

        if (createResponse.ok) {
          console.log(`✅ Bebida "${bebidaData.nombre}" creada en menú`);
        } else {
          console.error(
            `❌ Error creando bebida "${bebidaData.nombre}" en menú`
          );
        }
      }
    } catch (error) {
      console.error("Error sincronizando bebida con menú:", error);
    }
  };

  // Crear nueva bebida
  const createBebida = async (bebidaData) => {
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
          ...bebidaData,
          tipo: "bebida", // Asegurar que sea bebida
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la bebida");
      }

      // Recargar datos
      await fetchInventario();

      // Sincronizar con menú de bebidas
      await syncBebidaWithMenu(bebidaData);

      return { success: true };
    } catch (err) {
      console.error("Error creating bebida:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva materia prima
  const createMateriaPrima = async (materiaPrimaData) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const response = await fetch("/api/materia-prima", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          ...materiaPrimaData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la materia prima");
      }

      // Recargar datos
      await fetchInventario();

      return { success: true };
    } catch (err) {
      console.error("Error creating materia prima:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar bebida
  const updateBebida = async (bebidaId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const existingBebida = bebidas.find((b) => b.id === bebidaId);

      const response = await fetch("/api/stock", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          productoId: bebidaId,
          ...updateData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar la bebida");
      }

      // Recargar datos
      await fetchInventario();

      // Sincronizar con menú de bebidas
      const updatedBebida = { ...existingBebida, ...updateData };
      await syncBebidaWithMenu(updatedBebida, true, existingBebida);

      return { success: true };
    } catch (err) {
      console.error("Error updating bebida:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar materia prima
  const updateMateriaPrima = async (materiaPrimaId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();

      const response = await fetch("/api/materia-prima", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          materiaPrimaId,
          ...updateData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al actualizar la materia prima"
        );
      }

      // Recargar datos
      await fetchInventario();

      return { success: true };
    } catch (err) {
      console.error("Error updating materia prima:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar bebida
  const deleteBebida = async (bebidaId) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();
      const bebidaToDelete = bebidas.find((b) => b.id === bebidaId);

      const response = await fetch(
        `/api/stock?restauranteId=${restauranteId}&productoId=${bebidaId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar la bebida");
      }

      // Recargar datos
      await fetchInventario();

      // Si existía en el menú, también eliminarla
      if (bebidaToDelete) {
        try {
          const bebidasResponse = await fetch(
            `/api/bebidas?restauranteId=${restauranteId}`
          );
          const bebidasMenu = await bebidasResponse.json();
          const existingBebidaMenu = bebidasMenu.find(
            (b) =>
              b.nombre.toLowerCase() === bebidaToDelete.nombre.toLowerCase()
          );

          if (existingBebidaMenu) {
            await fetch(
              `/api/bebidas?restauranteId=${restauranteId}&bebidaId=${existingBebidaMenu.id}`,
              {
                method: "DELETE",
              }
            );
          }
        } catch (error) {
          console.error("Error eliminando bebida del menú:", error);
        }
      }

      return { success: true };
    } catch (err) {
      console.error("Error deleting bebida:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar materia prima
  const deleteMateriaPrima = async (materiaPrimaId) => {
    setLoading(true);
    setError(null);
    try {
      const restauranteId = getRestaurantId();

      const response = await fetch(
        `/api/materia-prima?restauranteId=${restauranteId}&materiaPrimaId=${materiaPrimaId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al eliminar la materia prima"
        );
      }

      // Recargar datos
      await fetchInventario();

      return { success: true };
    } catch (err) {
      console.error("Error deleting materia prima:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener productos con stock bajo (entre 1 y 4)
  const getProductosStockBajo = () => {
    const bebidasStockBajo = bebidas.filter(
      (bebida) => bebida.stock >= 1 && bebida.stock <= 4
    );
    const materiaPrimaStockBajo = materiaPrima.filter(
      (mp) => mp.stock >= 1 && mp.stock <= 4
    );
    return [...bebidasStockBajo, ...materiaPrimaStockBajo];
  };

  // Obtener productos sin stock
  const getProductosSinStock = () => {
    const bebidasSinStock = bebidas.filter((bebida) => bebida.stock === 0);
    const materiaPrimaSinStock = materiaPrima.filter((mp) => mp.stock === 0);
    return [...bebidasSinStock, ...materiaPrimaSinStock];
  };

  // Calcular estadísticas del inventario
  const getInventarioStats = () => {
    const totalBebidas = bebidas.length;
    const totalMateriaPrima = materiaPrima.length;
    const totalProductos = totalBebidas + totalMateriaPrima;

    const stockBajo = getProductosStockBajo().length;
    const sinStock = getProductosSinStock().length;
    const enStock = totalProductos - sinStock - stockBajo;

    // Valor en Stock = cantidad × precio de venta (para bebidas y alimentos)
    const valorEnStockBebidas = bebidas.reduce(
      (total, bebida) => total + bebida.stock * bebida.precio,
      0
    );
    const valorEnStockMateriaPrima = materiaPrima.reduce(
      (total, mp) => total + mp.stock * mp.precio,
      0
    );
    const valorEnStock = valorEnStockBebidas + valorEnStockMateriaPrima;

    // Costo de Stock = cantidad × costo
    const costoStockBebidas = bebidas.reduce(
      (total, bebida) => total + bebida.stock * bebida.costo,
      0
    );
    const costoStockMateriaPrima = materiaPrima.reduce(
      (total, mp) => total + mp.stock * mp.costo,
      0
    );
    const costoStock = costoStockBebidas + costoStockMateriaPrima;

    // Ganancia = Valor en Stock - Costo de Stock
    const ganancia = valorEnStock - costoStock;

    return {
      totalProductos,
      totalBebidas,
      totalMateriaPrima,
      stockBajo,
      sinStock,
      enStock,
      valorEnStock,
      costoStock,
      ganancia,
    };
  };

  // Buscar productos por nombre
  const searchProductos = (searchTerm) => {
    if (!searchTerm.trim()) return [...bebidas, ...materiaPrima];

    const bebidasFiltradas = bebidas.filter((bebida) =>
      bebida.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const materiaPrimaFiltrada = materiaPrima.filter((mp) =>
      mp.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...bebidasFiltradas, ...materiaPrimaFiltrada];
  };

  // Cargar datos al inicializar
  useEffect(() => {
    fetchInventario();
  }, []);

  return {
    bebidas,
    materiaPrima,
    loading,
    error,
    fetchInventario,
    createBebida,
    createMateriaPrima,
    updateBebida,
    updateMateriaPrima,
    deleteBebida,
    deleteMateriaPrima,
    getProductosStockBajo,
    getProductosSinStock,
    getInventarioStats,
    searchProductos,
  };
};
