import { NextResponse } from "next/server";
import mercadopago from "mercadopago";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function POST(request) {
  try {
    const body = await request.json();
    const { paymentId, restaurantId } = body;

    if (!paymentId || !restaurantId) {
      return NextResponse.json(
        { error: "Se requiere paymentId y restaurantId" },
        { status: 400 }
      );
    }

    console.log("🔍 Verificando pago:", { paymentId, restaurantId });

    // Obtener las credenciales del restaurante
    const restaurantDoc = await getDoc(doc(db, "restaurantes", restaurantId));

    if (!restaurantDoc.exists()) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    const restaurantData = restaurantDoc.data();

    if (!restaurantData?.mercadopago?.accessToken) {
      return NextResponse.json(
        { error: "Restaurante no tiene Mercado Pago configurado" },
        { status: 400 }
      );
    }

    // Configurar Mercado Pago con las credenciales del restaurante
    mercadopago.configure({
      access_token: restaurantData.mercadopago.accessToken,
    });

    // Obtener el pago de Mercado Pago
    const payment = await mercadopago.payment.get(paymentId);
    const paymentData = payment.response;

    console.log("📊 Datos del pago:", {
      id: paymentData.id,
      status: paymentData.status,
      status_detail: paymentData.status_detail,
      external_reference: paymentData.external_reference,
      transaction_amount: paymentData.transaction_amount,
      additional_info: paymentData.additional_info,
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: paymentData.id,
        status: paymentData.status,
        status_detail: paymentData.status_detail,
        external_reference: paymentData.external_reference,
        transaction_amount: paymentData.transaction_amount,
        additional_info: paymentData.additional_info,
        payment_method: paymentData.payment_method,
        date_created: paymentData.date_created,
      },
    });
  } catch (error) {
    console.error("❌ Error verificando pago:", error);
    return NextResponse.json(
      { error: "Error al verificar el pago", details: error.message },
      { status: 500 }
    );
  }
}
