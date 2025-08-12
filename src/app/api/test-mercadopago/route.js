import { NextResponse } from "next/server";
import mercadopago from "mercadopago";

export async function GET() {
  try {
    console.log("🔍 Probando configuración de Mercado Pago...");

    // Verificar que mercadopago está disponible
    if (!mercadopago) {
      throw new Error("Mercado Pago SDK no está disponible");
    }

    // Verificar que configure está disponible
    if (typeof mercadopago.configure !== "function") {
      throw new Error("mercadopago.configure no es una función");
    }

    // Configurar con un token de prueba
    const testToken = "TEST-123456789012345678901234567890";
    mercadopago.configure({
      access_token: testToken,
    });

    console.log("✅ Configuración exitosa");

    return NextResponse.json({
      success: true,
      message: "Configuración de Mercado Pago exitosa",
      sdkVersion: "1.5.8",
      status: "configured",
      availableMethods: {
        configure: "function",
        preferences: "available",
        payment: "available",
        get: "available",
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error en la configuración de Mercado Pago",
        error: error.message,
        sdkVersion: "1.5.8",
      },
      { status: 500 }
    );
  }
}
