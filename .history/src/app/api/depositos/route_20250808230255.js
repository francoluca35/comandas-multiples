import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// GET - Obtener todos los depósitos
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

    console.log("🔍 API Depósitos - Obteniendo depósitos para restaurante:", restauranteId);

    // Obtener todos los documentos de la colección Depositos
    const depositosRef = collection(db, "restaurantes", restauranteId, "Depositos");
    let depositosSnapshot;
    
    try {
      depositosSnapshot = await getDocs(depositosRef);
    } catch (error) {
      console.log("ℹ️ Colección Depositos no existe aún, retornando array vacío");
      return NextResponse.json({
        success: true,
        data: [],
        message: "No hay depósitos registrados aún",
      });
    }

    const depositos = [];
    depositosSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.historialDepositos && typeof data.historialDepositos === 'object') {
        depositos.push({
          id: doc.id,
          historialDepositos: data.historialDepositos,
          ultimaActualizacion: data.ultimaActualizacion,
        });
      }
    });

    console.log("✅ Depósitos obtenidos exitosamente:", {
      cantidadDepositos: depositos.length,
      totalDepositos: depositos.reduce((sum, deposito) => {
        if (deposito.historialDepositos && typeof deposito.historialDepositos === 'object') {
          const depositoTotal = Object.values(deposito.historialDepositos).reduce((depositoSum, pago) => {
            return depositoSum + (parseFloat(pago.monto) || 0);
          }, 0);
          return sum + depositoTotal;
        }
        return sum;
      }, 0),
    });

    return NextResponse.json({
      success: true,
      data: depositos,
      message: "Depósitos obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo depósitos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener depósitos",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
