import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔍 Probando conexión con Mercado Pago...");

    // Por ahora, vamos a simular una respuesta exitosa
    // para verificar que la API funciona
    return NextResponse.json({
      success: true,
      message: "API funcionando correctamente",
      sdkVersion: "2.8.0",
      status: "ready_for_testing",
      note: "Mercado Pago SDK needs to be configured properly",
    });
  } catch (error) {
    console.error("❌ Error general:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error.message,
        sdkVersion: "2.8.0",
      },
      { status: 500 }
    );
  }
}
