import { NextResponse } from "next/server";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// GET - Obtener el total de inversión del inventario
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restauranteId = searchParams.get("restauranteId");

    if (!restauranteId) {
      console.log("❌ restauranteId no proporcionado");
      return NextResponse.json(
        { error: "restauranteId es requerido" },
        { status: 400 }
      );
    }

    console.log(
      "🔍 API Inversión Total - Obteniendo inversión para restaurante:",
      restauranteId
    );

    // Referencia a la colección stock
    const stockRef = collection(db, "restaurantes", restauranteId, "stock");
    console.log("📁 Referencia a stock creada:", stockRef.path);

    // Obtener todos los documentos de stock
    const stockSnapshot = await getDocs(stockRef);
    console.log("📊 Documentos encontrados:", stockSnapshot.size);

    if (stockSnapshot.empty) {
      console.log("📭 No hay productos en stock");
      return NextResponse.json({
        success: true,
        data: {
          inversionTotal: 0,
          totalProductos: 0,
          productos: [],
        },
      });
    }

    let inversionTotal = 0;
    const productos = [];

    // Procesar cada documento de stock
    stockSnapshot.forEach((doc) => {
      const productoData = doc.data();
      console.log("📦 Datos de producto:", { id: doc.id, ...productoData });

      // Calcular el costo total del producto (precio de compra * stock)
      // Validar que costo y stock existan y sean números válidos
      const costo = parseFloat(productoData.costo || productoData.precio || 0);
      const stock = parseInt(productoData.stock || productoData.cantidad || 0);

      console.log("💰 Valores calculados:", { id: doc.id, costo, stock });

      if (!isNaN(costo) && !isNaN(stock) && costo > 0 && stock > 0) {
        const costoTotal = costo * stock;
        inversionTotal += costoTotal;

        productos.push({
          id: doc.id,
          nombre:
            productoData.nombre || productoData.descripcion || "Sin nombre",
          costo: costo,
          stock: stock,
          costoTotal: costoTotal,
          categoria:
            productoData.categoria ||
            productoData.categoriaId ||
            "Sin categoría",
        });

        console.log("✅ Producto agregado:", { id: doc.id, costoTotal });
      } else {
        console.log("⚠️ Producto con datos inválidos:", {
          id: doc.id,
          costo,
          stock,
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
        productos: productos,
      },
    });
  } catch (error) {
    console.error("❌ Error obteniendo inversión total:", error);
    console.error("❌ Stack trace:", error.stack);

    // Retornar un error más específico
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener la inversión total",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
