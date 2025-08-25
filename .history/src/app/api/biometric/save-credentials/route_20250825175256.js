import { db } from "../../../../../lib/firebase";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId, username, credentialData, credentialName } = await req.json();

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

    // Obtener el documento del usuario para verificar credenciales existentes
    const userRef = doc(db, `restaurantes/${restauranteId}/users/${userId}`);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const existingCredentials = userData.biometricCredentials || [];
    
    // Verificar límite de 4 huellas
    if (existingCredentials.length >= 4) {
      return NextResponse.json(
        { error: "Ya tienes el máximo de 4 huellas digitales configuradas" },
        { status: 400 }
      );
    }

    // Crear nueva credencial con nombre y timestamp
    const newCredential = {
      ...credentialData,
      name: credentialName || `Huella ${existingCredentials.length + 1}`,
      createdAt: new Date().toISOString(),
      id: `credential_${Date.now()}`,
    };

    // Agregar la nueva credencial al array existente
    const updatedCredentials = [...existingCredentials, newCredential];
    
    await updateDoc(userRef, {
      biometricCredentials: updatedCredentials,
      biometricEnabled: true,
      biometricSetupDate: new Date().toISOString(),
    });

    console.log(`✅ Credencial biométrica guardada para usuario: ${username} (Total: ${updatedCredentials.length}/4)`);

    return NextResponse.json({
      success: true,
      message: "Credencial biométrica guardada correctamente",
      totalCredentials: updatedCredentials.length,
    });
  } catch (error) {
    console.error("Error guardando credenciales biométricas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
