import { NextResponse } from "next/server";
import mercadopago from "mercadopago";

// Configurar Mercado Pago con tu Access Token
// IMPORTANTE: En producción, usa variables de entorno
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || "TEST-1234567890123456789012345678901234567890",
});

// POST - Crear preferencia de pago
export async function POST(request) {
  try {
    const body = await request.json();
    const { orderData, paymentMethod } = body;

    if (!orderData || !paymentMethod) {
      return NextResponse.json(
        { error: "Datos incompletos para procesar el pago" },
        { status: 400 }
      );
    }

    // Crear preferencia de pago en Mercado Pago
    const preference = {
      items: [
        {
          title: `Mesa ${orderData.mesa} - ${orderData.cliente || 'Cliente'}`,
          unit_price: orderData.monto,
          quantity: 1,
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/pagos/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/pagos/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/pagos/pending`,
      },
      auto_return: "approved",
      external_reference: `mesa_${orderData.mesa}_${Date.now()}`,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/pagos/webhook`,
      statement_descriptor: "RESTAURANTE",
    };

    const response = await mercadopago.preferences.create(preference);

    return NextResponse.json({
      success: true,
      preferenceId: response.body.id,
      initPoint: response.body.init_point,
      sandboxInitPoint: response.body.sandbox_init_point,
    });
  } catch (error) {
    console.error("Error al crear preferencia de pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Obtener estado de un pago
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("payment_id");

    if (!paymentId) {
      return NextResponse.json(
        { error: "ID de pago requerido" },
        { status: 400 }
      );
    }

    const payment = await mercadopago.payment.get(paymentId);

    return NextResponse.json({
      success: true,
      payment: payment.body,
    });
  } catch (error) {
    console.error("Error al obtener pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
