import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// GET - Obtener el total de inversión del inventario
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restauranteId = searchParams.get("restauranteId");

    if (!restauranteId) {
      return NextResponse.json(
        { error: "restauranteId es requerido" },
        { status: 400 }
      );
    }

    console.log("🔍 API Inversión Total - Obteniendo inversión para restaurante:", restauranteId);

    // Referencia a la colección stock
    const stockRef = collection(db, "restaurantes", restauranteId, "stock");
    
    // Obtener todos los documentos de stock
    const stockSnapshot = await getDocs(stockRef);
    
    if (stockSnapshot.empty) {
      console.log("📭 No hay productos en stock");
      return NextResponse.json({
        success: true,
        data: {
          inversionTotal: 0,
          totalProductos: 0,
          productos: []
        }
      });
    }

    let inversionTotal = 0;
    const productos = [];

    // Procesar cada documento de stock
    stockSnapshot.forEach((doc) => {
      const productoData = doc.data();
      console.log("📦 Datos de producto:", { id: doc.id, ...productoData });
      
      // Calcular el costo total del producto (precio de compra * stock)
      if (productoData.costo && !isNaN(parseFloat(productoData.costo)) && 
          productoData.stock && !isNaN(parseInt(productoData.stock))) {
        const costo = parseFloat(productoData.costo);
        const stock = parseInt(productoData.stock);
        const costoTotal = costo * stock;
        
        inversionTotal += costoTotal;
        
        productos.push({
          id: doc.id,
          nombre: productoData.nombre || "Sin nombre",
          costo: costo,
          stock: stock,
          costoTotal: costoTotal,
          categoria: productoData.categoria || "Sin categoría"
        });
      }
    });

    console.log("💰 Inversión total calculada:", inversionTotal);
    console.log("📊 Total de productos:", productos.length);

    return NextResponse.json({
      success: true,
      data: {
        inversionTotal: inversionTotal,
        totalProductos: productos.length,
        productos: productos
      }
    });

  } catch (error) {
    console.error("❌ Error obteniendo inversión total:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener la inversión total",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
