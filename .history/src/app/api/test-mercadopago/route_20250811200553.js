import { NextResponse } from "next/server";
import mercadopago from "mercadopago";

export async function GET() {
  try {
    console.log("🔍 Probando estructura de Mercado Pago...");

    // Verificar que mercadopago está disponible
    if (!mercadopago) {
      throw new Error("Mercado Pago SDK no está disponible");
    }

    // Verificar que configure está disponible
    if (typeof mercadopago.configure !== "function") {
      throw new Error("mercadopago.configure no es una función");
    }

    // Verificar que users está disponible
    if (!mercadopago.users) {
      throw new Error("mercadopago.users no está disponible");
    }

    // Verificar que get está disponible
    if (typeof mercadopago.users.get !== "function") {
      throw new Error("mercadopago.users.get no es una función");
    }

    console.log("✅ Estructura de Mercado Pago correcta");

    return NextResponse.json({
      success: true,
      message: "Estructura de Mercado Pago correcta",
      sdkVersion: "1.5.8",
      status: "structure_ok",
      availableMethods: {
        configure: typeof mercadopago.configure,
        users: !!mercadopago.users,
        usersGet: typeof mercadopago.users.get,
        preferences: !!mercadopago.preferences,
        payment: !!mercadopago.payment,
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error en la estructura de Mercado Pago",
        error: error.message,
        sdkVersion: "1.5.8",
      },
      { status: 500 }
    );
  }
}
