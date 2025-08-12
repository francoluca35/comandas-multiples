import { NextResponse } from "next/server";
import { MercadoPago } from "mercadopago";
import { db } from "../../../../lib/firebase";
import { doc, updateDoc, collection, addDoc, getDoc } from "firebase/firestore";

export async function POST(request) {
  try {
    const body = await request.json();

    // Verificar que es una notificación de Mercado Pago
    if (body.type !== "payment") {
      return NextResponse.json({ status: "ignored" });
    }

    const paymentId = body.data.id;

    // Obtener información del pago (usamos credenciales temporales para obtener el pago)
    // Luego obtendremos las credenciales específicas del restaurante
    const tempClient = new MercadoPago({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "TEST-123",
    });
    const tempPayment = await tempClient.payment.get({ paymentId });
    const paymentData = tempPayment;

    // Extraer información del restaurante
    const restaurantId = paymentData.additional_info?.restaurant_id;
    const restaurantName = paymentData.additional_info?.restaurant_name;
    const orderTotal = paymentData.additional_info?.order_total;

    if (!restaurantId) {
      console.error("No restaurant ID found in payment data");
      return NextResponse.json(
        { error: "Restaurant ID not found" },
        { status: 400 }
      );
    }

    // Obtener las credenciales del restaurante
    const restaurantDoc = await getDoc(doc(db, "restaurantes", restaurantId));
    const restaurantData = restaurantDoc.data();

    if (!restaurantData?.mercadopago?.accessToken) {
      console.error("Restaurant does not have Mercado Pago configured");
      return NextResponse.json(
        { error: "Restaurant not configured" },
        { status: 400 }
      );
    }

    // Configurar Mercado Pago con las credenciales del restaurante
    mercadopago.configure({
      access_token: restaurantData.mercadopago.accessToken,
    });

    // Obtener el pago con las credenciales correctas
    const payment = await mercadopago.payment.get(paymentId);
    const finalPaymentData = payment.body;

    // Procesar el pago según su estado
    switch (finalPaymentData.status) {
      case "approved":
        await handleApprovedPayment(
          finalPaymentData,
          restaurantId,
          restaurantName,
          orderTotal
        );
        break;

      case "rejected":
        await handleRejectedPayment(finalPaymentData, restaurantId);
        break;

      case "pending":
        await handlePendingPayment(finalPaymentData, restaurantId);
        break;

      case "cancelled":
        await handleCancelledPayment(finalPaymentData, restaurantId);
        break;

      default:
        console.log(`Payment status not handled: ${finalPaymentData.status}`);
    }

    // Registrar la transacción en Firestore
    await recordPaymentTransaction(
      finalPaymentData,
      restaurantId,
      restaurantName
    );

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleApprovedPayment(
  paymentData,
  restaurantId,
  restaurantName,
  orderTotal
) {
  try {
    // En este modelo, el restaurante recibe el 100% del pago
    // No hay comisión de plataforma ya que cada restaurante maneja sus propios pagos
    const restaurantAmount = orderTotal;

    // Actualizar el estado de la mesa a "pagado"
    const externalRef = paymentData.external_reference;
    const [restId, timestamp] = externalRef.split("_");

    // Buscar la mesa por external_reference
    const tablesRef = collection(db, "tables");
    // Nota: En una implementación real, necesitarías una consulta más específica
    // para encontrar la mesa correcta basada en el external_reference

    // Registrar el pago exitoso
    const paymentRecord = {
      restaurantId,
      restaurantName,
      paymentId: paymentData.id,
      externalReference: externalRef,
      amount: orderTotal,
      restaurantAmount, // 100% del pago va al restaurante
      status: "approved",
      paymentMethod: paymentData.payment_method?.type || "unknown",
      date: new Date(),
      transactionId: paymentData.transaction_id,
      // Información adicional para auditoría
      mercadopagoAccount: restaurantId,
      isIndividualAccount: true,
    };

    await addDoc(collection(db, "payments"), paymentRecord);

    console.log(
      `Payment approved for restaurant ${restaurantName}: $${restaurantAmount} (Individual account)`
    );
  } catch (error) {
    console.error("Error handling approved payment:", error);
  }
}

async function handleRejectedPayment(paymentData, restaurantId) {
  try {
    const paymentRecord = {
      restaurantId,
      paymentId: paymentData.id,
      externalReference: paymentData.external_reference,
      status: "rejected",
      reason: paymentData.status_detail,
      date: new Date(),
      isIndividualAccount: true,
    };

    await addDoc(collection(db, "payments"), paymentRecord);
    console.log(
      `Payment rejected for restaurant ${restaurantId}: ${paymentData.status_detail}`
    );
  } catch (error) {
    console.error("Error handling rejected payment:", error);
  }
}

async function handlePendingPayment(paymentData, restaurantId) {
  try {
    const paymentRecord = {
      restaurantId,
      paymentId: paymentData.id,
      externalReference: paymentData.external_reference,
      status: "pending",
      date: new Date(),
      isIndividualAccount: true,
    };

    await addDoc(collection(db, "payments"), paymentRecord);
    console.log(`Payment pending for restaurant ${restaurantId}`);
  } catch (error) {
    console.error("Error handling pending payment:", error);
  }
}

async function handleCancelledPayment(paymentData, restaurantId) {
  try {
    const paymentRecord = {
      restaurantId,
      paymentId: paymentData.id,
      externalReference: paymentData.external_reference,
      status: "cancelled",
      date: new Date(),
      isIndividualAccount: true,
    };

    await addDoc(collection(db, "payments"), paymentRecord);
    console.log(`Payment cancelled for restaurant ${restaurantId}`);
  } catch (error) {
    console.error("Error handling cancelled payment:", error);
  }
}

async function recordPaymentTransaction(
  paymentData,
  restaurantId,
  restaurantName
) {
  try {
    const transaction = {
      restaurantId,
      restaurantName,
      paymentId: paymentData.id,
      externalReference: paymentData.external_reference,
      amount: paymentData.transaction_amount,
      status: paymentData.status,
      statusDetail: paymentData.status_detail,
      paymentMethod: paymentData.payment_method?.type || "unknown",
      date: new Date(),
      processed: true,
      isIndividualAccount: true,
    };

    await addDoc(collection(db, "paymentTransactions"), transaction);
  } catch (error) {
    console.error("Error recording payment transaction:", error);
  }
}
