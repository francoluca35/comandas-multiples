import { db } from "../../../../../lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId, username, credentialData } = await req.json();

    if (!userId || !username || !credentialData) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
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

    // Guardar las credenciales biométricas en el documento del usuario
    const userRef = doc(db, `restaurantes/${restauranteId}/users/${userId}`);
    
    await updateDoc(userRef, {
      biometricCredentials: credentialData,
      biometricEnabled: true,
      biometricSetupDate: new Date().toISOString(),
    });

    console.log(`✅ Credenciales biométricas guardadas para usuario: ${username}`);

    return NextResponse.json({
      success: true,
      message: "Credenciales biométricas guardadas correctamente",
    });
  } catch (error) {
    console.error("Error guardando credenciales biométricas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
