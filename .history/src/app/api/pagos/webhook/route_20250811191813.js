import { NextResponse } from "next/server";
import mercadopago from "mercadopago";
import { db } from "../../../../lib/firebase";
import { doc, updateDoc, collection, addDoc, getDoc } from "firebase/firestore";

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export async function POST(request) {
  try {
    const body = await request.json();

    // Verificar que es una notificación de Mercado Pago
    if (body.type !== "payment") {
      return NextResponse.json({ status: "ignored" });
    }

    const paymentId = body.data.id;

    // Obtener información del pago
    const payment = await mercadopago.payment.get(paymentId);
    const paymentData = payment.body;

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

    // Procesar el pago según su estado
    switch (paymentData.status) {
      case "approved":
        await handleApprovedPayment(
          paymentData,
          restaurantId,
          restaurantName,
          orderTotal
        );
        break;

      case "rejected":
        await handleRejectedPayment(paymentData, restaurantId);
        break;

      case "pending":
        await handlePendingPayment(paymentData, restaurantId);
        break;

      case "cancelled":
        await handleCancelledPayment(paymentData, restaurantId);
        break;

      default:
        console.log(`Payment status not handled: ${paymentData.status}`);
    }

    // Registrar la transacción en Firestore
    await recordPaymentTransaction(paymentData, restaurantId, restaurantName);

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
    // Calcular comisión de la plataforma (5%)
    const platformFee = orderTotal * 0.05;
    const restaurantAmount = orderTotal - platformFee;

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
      platformFee,
      restaurantAmount,
      status: "approved",
      paymentMethod: paymentData.payment_method?.type || "unknown",
      date: new Date(),
      transactionId: paymentData.transaction_id,
    };

    await addDoc(collection(db, "payments"), paymentRecord);

    console.log(
      `Payment approved for restaurant ${restaurantName}: $${restaurantAmount} (Platform fee: $${platformFee})`
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
    };

    await addDoc(collection(db, "paymentTransactions"), transaction);
  } catch (error) {
    console.error("Error recording payment transaction:", error);
  }
}
