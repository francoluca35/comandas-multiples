import { NextResponse } from "next/server";
import mercadopago from "mercadopago";
import { db } from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function POST(request) {
  try {
    console.log("API de pagos: Iniciando procesamiento");

    const body = await request.json();
    console.log("API de pagos: Datos recibidos:", body);

    const { orderData, restaurantId, restaurantName } = body;

    // Validaciones básicas
    if (!orderData || !restaurantId || !restaurantName) {
      console.error("API de pagos: Datos faltantes", {
        orderData,
        restaurantId,
        restaurantName,
      });
      return NextResponse.json(
        { error: "Datos de pedido y restaurante son requeridos" },
        { status: 400 }
      );
    }

    // Obtener las credenciales de Mercado Pago del restaurante
    const restaurantDoc = await getDoc(doc(db, "restaurantes", restaurantId));

    if (!restaurantDoc.exists()) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    // Intentar obtener la configuración desde la subcolección Mpagos/configuracion
    const mpagoConfigRef = doc(db, "restaurantes", restaurantId, "Mpagos", "configuracion");
    const mpagoConfigDoc = await getDoc(mpagoConfigRef);
    
    let mercadopagoConfig = null;
    
    // Si existe en la subcolección, usar esos datos
    if (mpagoConfigDoc.exists()) {
      mercadopagoConfig = mpagoConfigDoc.data();
      console.log("✅ Configuración encontrada en subcolección Mpagos/configuracion");
    } else {
      // Fallback: intentar obtener del documento principal del restaurante
      const restaurantData = restaurantDoc.data();
      if (restaurantData?.mercadopago) {
        mercadopagoConfig = restaurantData.mercadopago;
        console.log("✅ Configuración encontrada en documento principal");
      }
    }

    // Validar configuración de Mercado Pago
    if (!mercadopagoConfig) {
      console.error("API de pagos: No se encontró configuración de Mercado Pago");
      return NextResponse.json(
        {
          error:
            "Restaurante no tiene Mercado Pago configurado. Por favor, configura las credenciales en la sección de configuración.",
        },
        { status: 400 }
      );
    }

    if (!mercadopagoConfig.accessToken || mercadopagoConfig.accessToken.trim() === "") {
      console.error("API de pagos: Access Token vacío o no configurado");
      return NextResponse.json(
        {
          error:
            "El Access Token de Mercado Pago no está configurado o está vacío. Por favor, configura las credenciales en la sección de configuración.",
        },
        { status: 400 }
      );
    }

    // Verificar si está activo (puede estar como 'activo' o 'isActive')
    const isActive = mercadopagoConfig.isActive !== undefined 
      ? mercadopagoConfig.isActive 
      : mercadopagoConfig.activo !== undefined 
        ? mercadopagoConfig.activo 
        : true; // Si no existe, asumir activo por defecto

    if (!isActive) {
      console.error("API de pagos: Configuración de Mercado Pago inactiva");
      return NextResponse.json(
        {
          error:
            "Configuración de Mercado Pago inactiva. Por favor, verifica la configuración.",
        },
        { status: 400 }
      );
    }

    console.log("API de pagos: Configurando Mercado Pago con Access Token:", 
      mercadopagoConfig.accessToken.substring(0, 20) + "...");
    
    // Configurar Mercado Pago con las credenciales del restaurante
    try {
      mercadopago.configure({
        access_token: mercadopagoConfig.accessToken.trim(),
      });
      console.log("API de pagos: Mercado Pago configurado exitosamente");
    } catch (configError) {
      console.error("API de pagos: Error configurando Mercado Pago:", configError);
      return NextResponse.json(
        {
          error: "Error al configurar Mercado Pago. Verifica las credenciales.",
          details: configError.message,
        },
        { status: 500 }
      );
    }

    // Validar datos del pedido
    const unitPrice = orderData.unit_price || orderData.monto || 0;
    const quantity = orderData.quantity || 1;
    
    if (!unitPrice || unitPrice <= 0) {
      console.error("API de pagos: Precio inválido:", unitPrice);
      return NextResponse.json(
        {
          error: "El monto del pedido es inválido o está vacío.",
        },
        { status: 400 }
      );
    }

    console.log("API de pagos: Datos del pedido validados:", {
      unitPrice,
      quantity,
      mesa: orderData.mesa,
      cliente: orderData.cliente,
    });

    // Preparar información adicional para el webhook (máximo 600 caracteres)
    // Reducir información para cumplir el límite de 600 caracteres
    let additionalInfo = {
      r: restaurantId, // ID del restaurante (abreviado)
      n: restaurantName?.substring(0, 50) || "Restaurante", // Nombre abreviado
      t: unitPrice * quantity, // Total
      m: orderData.mesa || "DELIVERY", // Mesa
      c: orderData.cliente?.substring(0, 30) || "Cliente", // Cliente (limitado)
      // Solo IDs o nombres cortos de productos para reducir tamaño
      p: orderData.productos?.map(prod => prod.id || prod.nombre?.substring(0, 10)).slice(0, 10) || [],
    };
    
    let additionalInfoString = JSON.stringify(additionalInfo);
    
    // Si excede 600 caracteres, reducir más
    if (additionalInfoString.length > 600) {
      additionalInfo.p = []; // Eliminar productos si es necesario
      additionalInfoString = JSON.stringify(additionalInfo);
      
      if (additionalInfoString.length > 600) {
        // Último recurso: solo información esencial
        additionalInfo = {
          r: restaurantId.substring(0, 30),
          t: unitPrice * quantity,
          m: orderData.mesa || "DELIVERY",
        };
        additionalInfoString = JSON.stringify(additionalInfo);
        
        // Si aún excede, usar solo lo mínimo
        if (additionalInfoString.length > 600) {
          additionalInfo = {
            r: restaurantId.substring(0, 20),
            t: unitPrice * quantity,
          };
          additionalInfoString = JSON.stringify(additionalInfo);
        }
      }
    }
    
    console.log("API de pagos: Additional info preparado (longitud:", additionalInfoString.length, "):", additionalInfo);

    // Crear preferencia de pago con información del restaurante
    const preference = {
      items: [
        {
          title: `${restaurantName} - ${
            orderData.title || `Mesa ${orderData.mesa || "DELIVERY"}`
          }`,
          unit_price: parseFloat(unitPrice),
          quantity: parseInt(quantity),
          currency_id: "ARS",
          category_id: "restaurants",
          description: `Pedido de ${restaurantName}`,
        },
      ],
      external_reference: `${restaurantId}_${Date.now()}`,
      back_urls: {
        success: "https://comandas-multiples.vercel.app/pago-confirmado",
        failure: "https://comandas-multiples.vercel.app/pago-confirmado",
        pending: "https://comandas-multiples.vercel.app/pago-confirmado",
      },
      notification_url:
        "https://comandas-multiples.vercel.app/api/pagos/webhook",
      additional_info: additionalInfoString,
    };

    console.log("API de pagos: Creando preferencia con Mercado Pago");
    console.log("API de pagos: Configuración de Mercado Pago:", {
      accessToken: mercadopagoConfig.accessToken ? `${mercadopagoConfig.accessToken.substring(0, 20)}...` : "NO ENCONTRADO",
      activo: mercadopagoConfig.activo,
      isActive: mercadopagoConfig.isActive,
    });
    console.log("API de pagos: Datos de preferencia:", {
      items: preference.items,
      external_reference: preference.external_reference,
      restaurantId,
      restaurantName,
    });
    
    try {
      const response = await mercadopago.preferences.create(preference);
      console.log("API de pagos: Preferencia creada exitosamente:", {
        id: response.response?.id,
        init_point: response.response?.init_point ? "EXISTE" : "NO EXISTE",
      });

      return NextResponse.json({
        preferenceId: response.response.id,
        initPoint: response.response.init_point,
        sandboxInitPoint: response.response.sandbox_init_point,
        externalReference: preference.external_reference,
      });
    } catch (mpError) {
      console.error("API de pagos: Error específico de Mercado Pago:", {
        message: mpError.message,
        status: mpError.status,
        cause: mpError.cause,
        stack: mpError.stack,
      });
      throw mpError;
    }
  } catch (error) {
    console.error("API de pagos: Error creating payment preference:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    
    // Proporcionar mensajes de error más específicos
    let errorMessage = "Error al crear la preferencia de pago";
    if (error.message?.includes("access_token")) {
      errorMessage = "Error en las credenciales de Mercado Pago. Verifica el Access Token.";
    } else if (error.message?.includes("401")) {
      errorMessage = "Credenciales de Mercado Pago inválidas o expiradas.";
    } else if (error.message?.includes("400")) {
      errorMessage = "Datos de la preferencia inválidos.";
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message || "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("payment_id");
    const restaurantId = searchParams.get("restaurant_id");

    if (!paymentId || !restaurantId) {
      return NextResponse.json(
        { error: "Payment ID and Restaurant ID are required" },
        { status: 400 }
      );
    }

    // Obtener las credenciales del restaurante
    const restaurantDoc = await getDoc(doc(db, "restaurantes", restaurantId));

    if (!restaurantDoc.exists()) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    // Intentar obtener la configuración desde la subcolección Mpagos/configuracion
    const mpagoConfigRef = doc(db, "restaurantes", restaurantId, "Mpagos", "configuracion");
    const mpagoConfigDoc = await getDoc(mpagoConfigRef);
    
    let mercadopagoConfig = null;
    
    // Si existe en la subcolección, usar esos datos
    if (mpagoConfigDoc.exists()) {
      mercadopagoConfig = mpagoConfigDoc.data();
    } else {
      // Fallback: intentar obtener del documento principal del restaurante
      const restaurantData = restaurantDoc.data();
      if (restaurantData?.mercadopago) {
        mercadopagoConfig = restaurantData.mercadopago;
      }
    }

    if (!mercadopagoConfig || !mercadopagoConfig.accessToken) {
      return NextResponse.json(
        { error: "Restaurante no tiene Mercado Pago configurado" },
        { status: 400 }
      );
    }

    // Verificar si está activo (puede estar como 'activo' o 'isActive')
    const isActive = mercadopagoConfig.isActive !== undefined 
      ? mercadopagoConfig.isActive 
      : mercadopagoConfig.activo !== undefined 
        ? mercadopagoConfig.activo 
        : true; // Si no existe, asumir activo por defecto

    if (!isActive) {
      return NextResponse.json(
        { error: "Configuración de Mercado Pago inactiva" },
        { status: 400 }
      );
    }

    // Configurar Mercado Pago con las credenciales del restaurante
    mercadopago.configure({
      access_token: mercadopagoConfig.accessToken,
    });

    const payment = await mercadopago.payment.get(paymentId);

    return NextResponse.json({
      status: payment.response.status,
      status_detail: payment.response.status_detail,
      external_reference: payment.response.external_reference,
      transaction_amount: payment.response.transaction_amount,
      payment_method: payment.response.payment_method,
      date_created: payment.response.date_created,
      // Información del restaurante
      restaurant_id: payment.response.additional_info?.restaurant_id,
      restaurant_name: payment.response.additional_info?.restaurant_name,
    });
  } catch (error) {
    console.error("Error getting payment status:", error);
    return NextResponse.json(
      { error: "Error al obtener el estado del pago" },
      { status: 500 }
    );
  }
}
