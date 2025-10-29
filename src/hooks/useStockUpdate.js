"use client";
import { useState } from "react";

export const useStockUpdate = () => {
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

  // Actualizar stock de productos vendidos
  const updateStockFromSale = async (productos) => {
    setLoading(true);
    setError(null);
    
    try {
      const restauranteId = getRestaurantId();
      
      // Procesar cada producto vendido
      for (const producto of productos) {
        // Los productos del pedido tienen estructura: { producto: nombre, unidades: cantidad }
        const nombre = producto.producto || producto.nombre;
        const cantidad = producto.unidades || producto.cantidad;
        
        console.log(`🔍 Procesando producto: "${nombre}" - Cantidad: ${cantidad}`);
        console.log('📦 Estructura del producto:', producto);
        
        // Buscar el producto en el inventario de bebidas
        const bebidasResponse = await fetch(`/api/stock?restauranteId=${restauranteId}`);
        if (bebidasResponse.ok) {
          const bebidas = await bebidasResponse.json();
          console.log(`🔍 Buscando "${nombre}" en ${bebidas.length} bebidas`);
          
          const bebidaEncontrada = bebidas.find(b => {
            const nombreInventario = b.nombre.toLowerCase().trim();
            const nombrePedido = nombre.toLowerCase().trim();
            const coincide = nombreInventario === nombrePedido || 
                           nombreInventario.includes(nombrePedido) || 
                           nombrePedido.includes(nombreInventario);
            if (coincide) {
              console.log(`✅ Encontrado: "${b.nombre}" coincide con "${nombre}"`);
            }
            return coincide;
          });
          
          if (bebidaEncontrada) {
            // Actualizar stock de bebida
            const nuevoStock = Math.max(0, (bebidaEncontrada.stock || 0) - cantidad);
            
            await fetch("/api/stock", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                restauranteId,
                productoId: bebidaEncontrada.id,
                stock: nuevoStock,
                habilitada: nuevoStock > 0,
                activo: nuevoStock > 0,
              }),
            });
            
            console.log(`✅ Stock actualizado: ${nombre} - Stock anterior: ${bebidaEncontrada.stock}, Nuevo stock: ${nuevoStock}`);
            continue;
          }
        }
        
        // Buscar el producto en materia prima
        const materiaPrimaResponse = await fetch(`/api/materia-prima?restauranteId=${restauranteId}`);
        if (materiaPrimaResponse.ok) {
          const materiaPrima = await materiaPrimaResponse.json();
          console.log(`🔍 Buscando "${nombre}" en ${materiaPrima.length} materias primas`);
          
          const materiaEncontrada = materiaPrima.find(mp => {
            const nombreInventario = mp.nombre.toLowerCase().trim();
            const nombrePedido = nombre.toLowerCase().trim();
            const coincide = nombreInventario === nombrePedido || 
                           nombreInventario.includes(nombrePedido) || 
                           nombrePedido.includes(nombreInventario);
            if (coincide) {
              console.log(`✅ Encontrado: "${mp.nombre}" coincide con "${nombre}"`);
            }
            return coincide;
          });
          
          if (materiaEncontrada) {
            // Actualizar stock de materia prima
            const nuevoStock = Math.max(0, (materiaEncontrada.stock || 0) - cantidad);
            
            await fetch("/api/materia-prima", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                restauranteId,
                materiaPrimaId: materiaEncontrada.id,
                stock: nuevoStock,
              }),
            });
            
            console.log(`✅ Stock actualizado: ${nombre} - Stock anterior: ${materiaEncontrada.stock}, Nuevo stock: ${nuevoStock}`);
            continue;
          }
        }
        
        // Si no se encontró en inventario, solo log (no es error crítico)
        console.log(`⚠️ Producto "${nombre}" no encontrado en inventario - no se actualizará stock`);
      }
      
      return { success: true };
    } catch (err) {
      console.error("Error updating stock from sale:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar stock de un producto específico
  const updateProductStock = async (productoNombre, cantidadVendida) => {
    setLoading(true);
    setError(null);
    
    try {
      const restauranteId = getRestaurantId();
      
      // Buscar en bebidas primero
      const bebidasResponse = await fetch(`/api/stock?restauranteId=${restauranteId}`);
      if (bebidasResponse.ok) {
        const bebidas = await bebidasResponse.json();
        const bebidaEncontrada = bebidas.find(b => 
          b.nombre.toLowerCase() === productoNombre.toLowerCase()
        );
        
        if (bebidaEncontrada) {
          const nuevoStock = Math.max(0, (bebidaEncontrada.stock || 0) - cantidadVendida);
          
          const response = await fetch("/api/stock", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              restauranteId,
              productoId: bebidaEncontrada.id,
              stock: nuevoStock,
              habilitada: nuevoStock > 0,
              activo: nuevoStock > 0,
            }),
          });
          
          if (response.ok) {
            console.log(`✅ Stock de bebida actualizado: ${productoNombre} - Nuevo stock: ${nuevoStock}`);
            return { success: true, tipo: 'bebida' };
          }
        }
      }
      
      // Buscar en materia prima
      const materiaPrimaResponse = await fetch(`/api/materia-prima?restauranteId=${restauranteId}`);
      if (materiaPrimaResponse.ok) {
        const materiaPrima = await materiaPrimaResponse.json();
        const materiaEncontrada = materiaPrima.find(mp => 
          mp.nombre.toLowerCase() === productoNombre.toLowerCase()
        );
        
        if (materiaEncontrada) {
          const nuevoStock = Math.max(0, (materiaEncontrada.stock || 0) - cantidadVendida);
          
          const response = await fetch("/api/materia-prima", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              restauranteId,
              materiaPrimaId: materiaEncontrada.id,
              stock: nuevoStock,
            }),
          });
          
          if (response.ok) {
            console.log(`✅ Stock de materia prima actualizado: ${productoNombre} - Nuevo stock: ${nuevoStock}`);
            return { success: true, tipo: 'materia_prima' };
          }
        }
      }
      
      // Si no se encontró
      console.log(`⚠️ Producto "${productoNombre}" no encontrado en inventario`);
      return { success: false, message: "Producto no encontrado en inventario" };
      
    } catch (err) {
      console.error("Error updating product stock:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    updateStockFromSale,
    updateProductStock,
  };
};
