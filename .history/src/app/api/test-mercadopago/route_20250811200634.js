import { NextResponse } from "next/server";
import mercadopago from "mercadopago";

export async function GET() {
  try {
    console.log("🔍 Explorando estructura de Mercado Pago...");

    // Verificar que mercadopago está disponible
    if (!mercadopago) {
      throw new Error("Mercado Pago SDK no está disponible");
    }

    // Explorar la estructura
    const structure = {
      mercadopago: typeof mercadopago,
      keys: Object.keys(mercadopago),
      configure: typeof mercadopago.configure,
      hasUsers: !!mercadopago.users,
      hasPreferences: !!mercadopago.preferences,
      hasPayment: !!mercadopago.payment,
    };

    // Si tiene users, explorar su estructura
    if (mercadopago.users) {
      structure.usersKeys = Object.keys(mercadopago.users);
      structure.usersGet = typeof mercadopago.users.get;
    }

    // Si tiene preferences, explorar su estructura
    if (mercadopago.preferences) {
      structure.preferencesKeys = Object.keys(mercadopago.preferences);
      structure.preferencesCreate = typeof mercadopago.preferences.create;
    }

    // Si tiene payment, explorar su estructura
    if (mercadopago.payment) {
      structure.paymentKeys = Object.keys(mercadopago.payment);
      structure.paymentGet = typeof mercadopago.payment.get;
    }

    console.log("✅ Estructura explorada:", structure);

    return NextResponse.json({
      success: true,
      message: "Estructura de Mercado Pago explorada",
      sdkVersion: "1.5.8",
      status: "explored",
      structure: structure,
    });
  } catch (error) {
    console.error("❌ Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error explorando Mercado Pago",
        error: error.message,
        sdkVersion: "1.5.8",
      },
      { status: 500 }
    );
  }
}
