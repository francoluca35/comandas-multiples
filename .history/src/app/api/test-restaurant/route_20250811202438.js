import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("id") || "prueba";

    console.log("Verificando restaurante:", restaurantId);

    // Obtener datos del restaurante
    const restaurantDoc = await getDoc(doc(db, "restaurantes", restaurantId));

    if (!restaurantDoc.exists()) {
      return NextResponse.json({
        exists: false,
        error: "Restaurante no encontrado",
      });
    }

    const restaurantData = restaurantDoc.data();

    return NextResponse.json({
      exists: true,
      restaurant: {
        id: restaurantId,
        nombre: restaurantData.nombre,
        mercadopago: {
          hasAccessToken: !!restaurantData.mercadopago?.accessToken,
          isActive: restaurantData.mercadopago?.isActive || false,
          publicKey: restaurantData.mercadopago?.publicKey || null,
        },
      },
    });
  } catch (error) {
    console.error("Error verificando restaurante:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
