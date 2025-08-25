import { db } from "../../../../../../lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    // El restauranteId debe venir en el request
    const restauranteId = req.headers.get("x-restaurante-id");
    
    if (!restauranteId) {
      return NextResponse.json(
        { error: "No se encontró información del restaurante" },
        { status: 400 }
      );
    }

    // Obtener el documento del usuario
    const userRef = doc(db, `restaurantes/${restauranteId}/users/${userId}`);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const credentials = userData.biometricCredentials || [];

    return NextResponse.json({
      success: true,
      credentials: credentials,
      totalCredentials: credentials.length,
    });
  } catch (error) {
    console.error("Error obteniendo credenciales biométricas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
