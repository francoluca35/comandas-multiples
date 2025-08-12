import { NextResponse } from "next/server";
import mercadopago from "mercadopago";

export async function GET() {
  try {
    // Usar un token de prueba para verificar que la conexión funciona
    const testToken =
      process.env.MERCADOPAGO_ACCESS_TOKEN ||
      "TEST-123456789012345678901234567890";

    console.log("🔍 Probando conexión con Mercado Pago...");
    console.log("🔍 Token:", testToken.substring(0, 10) + "...");

    mercadopago.configure({
      access_token: testToken,
    });

    // Intentar obtener información básica
    try {
      const accountInfo = await mercadopago.users.get();
      console.log("✅ Conexión exitosa con Mercado Pago");

      return NextResponse.json({
        success: true,
        message: "Conexión con Mercado Pago exitosa",
        accountInfo: {
          id: accountInfo.body.id,
          nickname: accountInfo.body.nickname,
          email: accountInfo.body.email,
        },
        sdkVersion: "2.8.0",
        status: "working",
      });
    } catch (mpError) {
      console.error("❌ Error con Mercado Pago:", mpError);

      return NextResponse.json(
        {
          success: false,
          message: "Error al conectar con Mercado Pago",
          error: mpError.message,
          status: mpError.status || "unknown",
          sdkVersion: "2.8.0",
        },
        { status: 400 }
      );
    }
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
