import { db } from "../../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId, authenticationData } = await req.json();

    if (!userId || !authenticationData) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    const restauranteId = localStorage.getItem("restauranteId");
    if (!restauranteId) {
      return NextResponse.json(
        { error: "No se encontró información del restaurante" },
        { status: 400 }
      );
    }

    // Obtener las credenciales biométricas del usuario
    const userRef = doc(db, `restaurantes/${restauranteId}/users/${userId}`);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userData = userSnap.data();
    
    if (!userData.biometricEnabled || !userData.biometricCredentials) {
      return NextResponse.json(
        { error: "Autenticación biométrica no configurada para este usuario" },
        { status: 400 }
      );
    }

    // Verificar que la autenticación fue exitosa
    if (authenticationData.success) {
      console.log(`✅ Autenticación biométrica exitosa para usuario: ${userData.usuario}`);

      return NextResponse.json({
        success: true,
        user: {
          id: userSnap.id,
          usuario: userData.usuario,
          nombreCompleto: userData.nombreCompleto,
          rol: userData.rol,
          imagen: userData.imagen,
        },
        message: "Autenticación biométrica exitosa",
      });
    } else {
      return NextResponse.json(
        { error: "Autenticación biométrica fallida" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error en autenticación biométrica:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
