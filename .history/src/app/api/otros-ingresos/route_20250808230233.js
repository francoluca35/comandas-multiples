import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// GET - Obtener todos los otros ingresos
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

    console.log("🔍 API Otros Ingresos - Obteniendo otros ingresos para restaurante:", restauranteId);

    // Obtener todos los documentos de la colección OtrosIngresos
    const otrosRef = collection(db, "restaurantes", restauranteId, "OtrosIngresos");
    let otrosSnapshot;
    
    try {
      otrosSnapshot = await getDocs(otrosRef);
    } catch (error) {
      console.log("ℹ️ Colección OtrosIngresos no existe aún, retornando array vacío");
      return NextResponse.json({
        success: true,
        data: [],
        message: "No hay otros ingresos registrados aún",
      });
    }

    const otros = [];
    otrosSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.historialOtros && typeof data.historialOtros === 'object') {
        otros.push({
          id: doc.id,
          historialOtros: data.historialOtros,
          ultimaActualizacion: data.ultimaActualizacion,
        });
      }
    });

    console.log("✅ Otros ingresos obtenidos exitosamente:", {
      cantidadOtros: otros.length,
      totalOtros: otros.reduce((sum, otro) => {
        if (otro.historialOtros && typeof otro.historialOtros === 'object') {
          const otroTotal = Object.values(otro.historialOtros).reduce((otroSum, pago) => {
            return otroSum + (parseFloat(pago.monto) || 0);
          }, 0);
          return sum + otroTotal;
        }
        return sum;
      }, 0),
    });

    return NextResponse.json({
      success: true,
      data: otros,
      message: "Otros ingresos obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo otros ingresos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener otros ingresos",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
