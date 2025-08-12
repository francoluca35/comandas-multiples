import { NextResponse } from "next/server";
import mercadopago from "mercadopago";
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
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || "TEST-123",
    });
    const tempPayment = await mercadopago.payment.get(paymentId);
    const paymentData = tempPayment.response;

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
    const finalPaymentData = payment.response;

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
    const restaurantAmount = orderTotal;

    // Extraer información del external_reference
    const externalRef = paymentData.external_reference;
    const [restId, timestamp] = externalRef.split("_");

    // Buscar y liberar la mesa
    await liberarMesa(restaurantId, externalRef);

    // Registrar el pago exitoso
    const paymentRecord = {
      restaurantId,
      restaurantName,
      paymentId: paymentData.id,
      externalReference: externalRef,
      amount: orderTotal,
      restaurantAmount,
      status: "approved",
      paymentMethod: paymentData.payment_method?.type || "unknown",
      date: new Date(),
      transactionId: paymentData.transaction_id,
      mercadopagoAccount: restaurantId,
      isIndividualAccount: true,
      // Información del pedido para generar tickets
      orderData: {
        mesa: paymentData.additional_info?.mesa || "Mesa",
        productos: paymentData.additional_info?.productos || [
          {
            producto: "Pedido",
            unidades: 1,
            total: orderTotal,
          },
        ],
        monto: orderTotal,
        cliente: paymentData.additional_info?.cliente || "Cliente",
      },
    };

    await addDoc(collection(db, "payments"), paymentRecord);

    console.log(
      `✅ Payment approved for restaurant ${restaurantName}: $${restaurantAmount} - Mesa liberada automáticamente`
    );
  } catch (error) {
    console.error("Error handling approved payment:", error);
  }
}

async function liberarMesa(restaurantId, externalRef) {
  try {
    // Buscar la mesa que tenga el external_reference correspondiente
    const tablesRef = collection(db, `restaurantes/${restaurantId}/tables`);
    
    // Actualizar todas las mesas que tengan estado "ocupada" y el external_reference correspondiente
    // Esto es una implementación simplificada - en producción deberías tener una consulta más específica
    
    // Por ahora, actualizamos la mesa más reciente que esté ocupada
    const mesaRef = doc(db, `restaurantes/${restaurantId}/tables/active`);
    
    await updateDoc(mesaRef, {
      estado: "pagado",
      externalReference: externalRef,
      paymentDate: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ Mesa liberada para restaurante ${restaurantId} con referencia ${externalRef}`);
  } catch (error) {
    console.error("Error liberando mesa:", error);
    // No lanzamos el error para no afectar el procesamiento del pago
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
