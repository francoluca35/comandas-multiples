import { db } from "../../../../../lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    const { userId, credentialId } = await req.json();

    if (!userId || !credentialId) {
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
    const existingCredentials = userData.biometricCredentials || [];
    
    // Filtrar la credencial a eliminar
    const updatedCredentials = existingCredentials.filter(
      cred => cred.id !== credentialId
    );

    // Verificar si se eliminó alguna credencial
    if (updatedCredentials.length === existingCredentials.length) {
      return NextResponse.json(
        { error: "Credencial no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar el documento del usuario
    await updateDoc(userRef, {
      biometricCredentials: updatedCredentials,
      biometricEnabled: updatedCredentials.length > 0,
    });

    console.log(`✅ Credencial biométrica eliminada para usuario: ${userData.usuario} (Total: ${updatedCredentials.length}/4)`);

    return NextResponse.json({
      success: true,
      message: "Credencial biométrica eliminada correctamente",
      totalCredentials: updatedCredentials.length,
    });
  } catch (error) {
    console.error("Error eliminando credencial biométrica:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
