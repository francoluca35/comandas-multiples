import { NextResponse } from "next/server";
import mercadopago from "mercadopago";
import { db } from "../../../../lib/firebase";
import { doc, updateDoc, collection, addDoc, getDoc } from "firebase/firestore";

export async function POST(request) {
  try {
    console.log("🔔 Webhook recibido de Mercado Pago");

    const body = await request.json();
    console.log("📋 Datos del webhook:", body);

    // Verificar que es una notificación de Mercado Pago
    if (body.type !== "payment") {
      console.log("❌ Tipo de notificación ignorado:", body.type);
      return NextResponse.json({ status: "ignored" });
    }

    const paymentId = body.data.id;
    console.log("🆔 ID de pago recibido:", paymentId);

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
    console.log("🔍 Procesando pago aprobado:", {
      paymentId: paymentData.id,
      externalRef: paymentData.external_reference,
      amount: orderTotal,
      additionalInfo: paymentData.additional_info,
    });

    // En este modelo, el restaurante recibe el 100% del pago
    const restaurantAmount = orderTotal;

    // Extraer información del external_reference
    const externalRef = paymentData.external_reference;

    // Intentar liberar la mesa (pero no fallar si no se puede)
    try {
      await liberarMesa(restaurantId, externalRef);
    } catch (mesaError) {
      console.warn("⚠️ No se pudo liberar la mesa:", mesaError.message);
    }

    // Preparar datos del pedido de forma segura
    let orderData = {
      mesa: "Mesa",
      productos: [
        {
          producto: "Pedido",
          unidades: 1,
          total: orderTotal,
        },
      ],
      monto: orderTotal,
      cliente: "Cliente",
    };

    // Intentar extraer información adicional si está disponible
    if (paymentData.additional_info) {
      try {
        const additionalInfo =
          typeof paymentData.additional_info === "string"
            ? JSON.parse(paymentData.additional_info)
            : paymentData.additional_info;

        orderData = {
          mesa: additionalInfo.mesa || "Mesa",
          productos: additionalInfo.productos || orderData.productos,
          monto: orderTotal,
          cliente: additionalInfo.cliente || "Cliente",
        };
      } catch (parseError) {
        console.warn("⚠️ Error parseando additional_info:", parseError.message);
      }
    }

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
      orderData: orderData,
    };

    await addDoc(collection(db, "payments"), paymentRecord);

    console.log(
      `✅ Pago aprobado para restaurante ${restaurantName}: $${restaurantAmount} - Mesa liberada automáticamente`
    );
  } catch (error) {
    console.error("❌ Error procesando pago aprobado:", error);
    // No lanzamos el error para no afectar el webhook
  }
}

async function liberarMesa(restaurantId, externalRef, additionalInfo) {
  try {
    console.log("🔍 Intentando liberar mesa:", { restaurantId, externalRef, additionalInfo });

    // Extraer información de la mesa desde additional_info
    let mesaInfo = null;
    if (additionalInfo) {
      try {
        mesaInfo = typeof additionalInfo === "string" 
          ? JSON.parse(additionalInfo) 
          : additionalInfo;
      } catch (parseError) {
        console.warn("⚠️ Error parseando additional_info:", parseError.message);
      }
    }

    // Si tenemos información específica de la mesa, usarla
    if (mesaInfo && mesaInfo.mesaId) {
      console.log("🎯 Liberando mesa específica:", mesaInfo.mesaId);
      
      // Actualizar la mesa en Firestore
      const mesaRef = doc(db, "restaurantes", restaurantId, "tables", mesaInfo.mesaId);
      
      await updateDoc(mesaRef, {
        estado: "libre",
        cliente: "",
        productos: {},
        total: 0,
        fechaPago: new Date(),
        externalReference: externalRef,
        updatedAt: new Date(),
      });

      console.log(`✅ Mesa ${mesaInfo.mesaId} liberada exitosamente`);
    } else {
      // Buscar la mesa por número si no tenemos el ID
      if (mesaInfo && mesaInfo.mesa) {
        console.log("🔍 Buscando mesa por número:", mesaInfo.mesa);
        
        // Buscar en la colección de mesas del restaurante
        const tablesRef = collection(db, "restaurantes", restaurantId, "tables");
        const tablesSnapshot = await getDocs(tablesRef);
        
        let mesaEncontrada = null;
        tablesSnapshot.forEach((doc) => {
          const mesaData = doc.data();
          if (mesaData.numero == mesaInfo.mesa) {
            mesaEncontrada = { id: doc.id, ...mesaData };
          }
        });

        if (mesaEncontrada) {
          console.log("🎯 Mesa encontrada por número:", mesaEncontrada.id);
          
          // Actualizar la mesa encontrada
          const mesaRef = doc(db, "restaurantes", restaurantId, "tables", mesaEncontrada.id);
          
          await updateDoc(mesaRef, {
            estado: "libre",
            cliente: "",
            productos: {},
            total: 0,
            fechaPago: new Date(),
            externalReference: externalRef,
            updatedAt: new Date(),
          });

          console.log(`✅ Mesa ${mesaEncontrada.numero} (ID: ${mesaEncontrada.id}) liberada exitosamente`);
        } else {
          console.warn("⚠️ No se encontró la mesa por número:", mesaInfo.mesa);
        }
      } else {
        console.warn("⚠️ No hay información suficiente para liberar la mesa");
      }
    }

    // Crear un registro de liberación de mesa para auditoría
    const mesaLiberacionRecord = {
      restaurantId,
      externalReference: externalRef,
      mesaInfo: mesaInfo,
      estado: "pagado",
      fechaLiberacion: new Date(),
      procesado: true,
    };

    await addDoc(collection(db, "mesasLiberadas"), mesaLiberacionRecord);

    console.log(
      `✅ Registro de liberación de mesa creado para restaurante ${restaurantId} con referencia ${externalRef}`
    );
  } catch (error) {
    console.error("❌ Error en liberación de mesa:", error);
    throw error; // Re-lanzamos el error para que el manejador principal lo capture
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
