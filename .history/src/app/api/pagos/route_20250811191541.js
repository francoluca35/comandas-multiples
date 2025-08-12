import { NextResponse } from 'next/server';
import mercadopago from 'mercadopago';

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export async function POST(request) {
  try {
    const { orderData, restaurantId, restaurantName } = await request.json();
    
    // Crear preferencia de pago con información del restaurante
    const preference = {
      items: [
        {
          title: `${restaurantName} - ${orderData.title}`,
          unit_price: orderData.unit_price,
          quantity: orderData.quantity,
          currency_id: "ARS",
          category_id: "restaurants",
          description: `Pedido de ${restaurantName}`,
        }
      ],
      external_reference: `${restaurantId}_${Date.now()}`,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/api/pagos/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/api/pagos/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/api/pagos/pending`,
      },
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/pagos/webhook`,
      auto_return: "approved",
      // Configuración para marketplace
      marketplace: "APP_MULTI_RESTAURANT",
      marketplace_fee: 0.05, // 5% de comisión para la plataforma
      // Información del restaurante para distribución de fondos
      collector_id: process.env.MERCADOPAGO_COLLECTOR_ID, // ID del collector principal
      additional_info: {
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        order_total: orderData.unit_price * orderData.quantity
      }
    };

    const response = await mercadopago.preferences.create(preference);

    return NextResponse.json({
      preferenceId: response.body.id,
      initPoint: response.body.init_point,
      sandboxInitPoint: response.body.sandbox_init_point,
      externalReference: preference.external_reference
    });

  } catch (error) {
    console.error('Error creating payment preference:', error);
    return NextResponse.json(
      { error: 'Error al crear la preferencia de pago' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const payment = await mercadopago.payment.get(paymentId);
    
    return NextResponse.json({
      status: payment.body.status,
      status_detail: payment.body.status_detail,
      external_reference: payment.body.external_reference,
      transaction_amount: payment.body.transaction_amount,
      payment_method: payment.body.payment_method,
      date_created: payment.body.date_created,
      // Información del restaurante
      restaurant_id: payment.body.additional_info?.restaurant_id,
      restaurant_name: payment.body.additional_info?.restaurant_name
    });

  } catch (error) {
    console.error('Error getting payment status:', error);
    return NextResponse.json(
      { error: 'Error al obtener el estado del pago' },
      { status: 500 }
    );
  }
}
