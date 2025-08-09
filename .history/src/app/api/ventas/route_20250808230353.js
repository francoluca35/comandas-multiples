import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// GET - Obtener todas las ventas
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

    console.log(
      "🔍 API Ventas - Obteniendo ventas para restaurante:",
      restauranteId
    );

    // Obtener todos los documentos de la colección Ventas
    const ventasRef = collection(db, "restaurantes", restauranteId, "Ventas");
    let ventasSnapshot;

    try {
      ventasSnapshot = await getDocs(ventasRef);
    } catch (error) {
      console.log("ℹ️ Colección Ventas no existe aún, retornando array vacío");
      return NextResponse.json({
        success: true,
        data: [],
        message: "No hay ventas registradas aún",
      });
    }

    const ventas = [];
    ventasSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.historialVentas && typeof data.historialVentas === "object") {
        ventas.push({
          id: doc.id,
          historialVentas: data.historialVentas,
          ultimaActualizacion: data.ultimaActualizacion,
        });
      }
    });

    console.log("✅ Ventas obtenidas exitosamente:", {
      cantidadVentas: ventas.length,
      totalVentas: ventas.reduce((sum, venta) => {
        if (
          venta.historialVentas &&
          typeof venta.historialVentas === "object"
        ) {
          const ventaTotal = Object.values(venta.historialVentas).reduce(
            (ventaSum, pago) => {
              return ventaSum + (parseFloat(pago.total) || 0);
            },
            0
          );
          return sum + ventaTotal;
        }
        return sum;
      }, 0),
    });

    return NextResponse.json({
      success: true,
      data: ventas,
      message: "Ventas obtenidas exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo ventas:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener ventas",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
