import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";

// GET - Obtener todos los retiros
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
      "🔍 API Retiros - Obteniendo retiros para restaurante:",
      restauranteId
    );

    // Obtener todos los documentos de la colección CajaRegistradora
    const cajaRef = collection(
      db,
      "restaurantes",
      restauranteId,
      "CajaRegistradora"
    );
    let cajaSnapshot;

    try {
      cajaSnapshot = await getDocs(cajaRef);
    } catch (error) {
      console.log(
        "ℹ️ Colección CajaRegistradora no existe aún, retornando array vacío"
      );
      return NextResponse.json({
        success: true,
        data: [],
        message: "No hay retiros registrados aún",
      });
    }

    const retiros = [];
    cajaSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.Extraccion && typeof data.Extraccion === "object") {
        retiros.push({
          id: doc.id,
          historialRetiros: data.Extraccion,
          ultimaActualizacion: data.ultimaActualizacion,
        });
      }
    });

    console.log("✅ Retiros obtenidos exitosamente:", {
      cantidadRetiros: retiros.length,
      totalRetiros: retiros.reduce((sum, retiro) => {
        if (
          retiro.historialRetiros &&
          typeof retiro.historialRetiros === "object"
        ) {
          const retiroTotal = Object.values(retiro.historialRetiros).reduce(
            (retiroSum, pago) => {
              return retiroSum + (parseFloat(pago.importe) || 0);
            },
            0
          );
          return sum + retiroTotal;
        }
        return sum;
      }, 0),
    });

    return NextResponse.json({
      success: true,
      data: retiros,
      message: "Retiros obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo retiros:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener retiros",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
