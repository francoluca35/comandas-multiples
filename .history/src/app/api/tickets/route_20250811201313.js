import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

export async function POST(request) {
  try {
    console.log("API de tickets: Iniciando procesamiento");
    
    const body = await request.json();
    console.log("API de tickets: Datos recibidos:", body);
    
    const { restaurantId, orderData } = body;

    if (!restaurantId) {
      console.error("API de tickets: Falta restaurantId");
      return NextResponse.json(
        { error: "Falta restaurantId" },
        { status: 400 }
      );
    }

    if (!orderData) {
      console.error("API de tickets: Falta orderData");
      return NextResponse.json(
        { error: "Falta orderData" },
        { status: 400 }
      );
    }

    console.log("API de tickets: Obteniendo datos del restaurante:", restaurantId);

    // Obtener datos del restaurante
    const restaurantRef = doc(db, "restaurantes", restaurantId);
    const restaurantDoc = await getDoc(restaurantRef);

    if (!restaurantDoc.exists()) {
      console.error("API de tickets: Restaurante no encontrado:", restaurantId);
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    const restaurantData = restaurantDoc.data();
    console.log("API de tickets: Datos del restaurante obtenidos:", restaurantData);

    // Validar que orderData tiene los campos necesarios
    if (!orderData.mesa) {
      console.error("API de tickets: Falta información de mesa en orderData");
      return NextResponse.json(
        { error: "Falta información de mesa en los datos del pedido" },
        { status: 400 }
      );
    }

    if (!orderData.productos || !Array.isArray(orderData.productos)) {
      console.error("API de tickets: Falta información de productos en orderData");
      return NextResponse.json(
        { error: "Falta información de productos en los datos del pedido" },
        { status: 400 }
      );
    }

    console.log("API de tickets: Generando contenido del ticket");

    // Generar contenido del ticket
    const ticketContent = generateTicketContent(restaurantData, orderData);

    if (!ticketContent) {
      console.error("API de tickets: No se pudo generar el contenido del ticket");
      return NextResponse.json(
        { error: "No se pudo generar el contenido del ticket" },
        { status: 500 }
      );
    }

    console.log("API de tickets: Ticket generado exitosamente");

    return NextResponse.json({
      success: true,
      ticketContent,
      restaurantData: {
        nombre: restaurantData.nombre,
        direccion: restaurantData.direccion,
        cuil: restaurantData.cuil,
        email: restaurantData.email,
        telefono: restaurantData.telefono,
      },
      orderData: {
        mesa: orderData.mesa,
        cliente: orderData.cliente,
        productos: orderData.productos,
        monto: orderData.monto,
      },
    });
  } catch (error) {
    console.error("API de tickets: Error interno:", error);
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

function generateTicketContent(restaurantData, orderData) {
  try {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Calcular ancho del ticket (58mm = ~219 píxeles a 96 DPI)
    const ticketWidth = 219;
    const margin = 10;
    const contentWidth = ticketWidth - margin * 2;

    let content = "";

    // Encabezado del restaurante
    content += `<div style="text-align: center; font-family: monospace; font-size: 12px; width: ${contentWidth}px; margin: 0 auto; color: #000000;">`;
    content += `<div style="font-weight: bold; font-size: 14px; margin-bottom: 5px; color: #000000;">${
      restaurantData.nombre || "Restaurante"
    }</div>`;

    if (restaurantData.cuil) {
      content += `<div style="font-size: 10px; margin-bottom: 3px; color: #000000;">CUIL: ${restaurantData.cuil}</div>`;
    }

    if (restaurantData.direccion) {
      content += `<div style="font-size: 10px; margin-bottom: 5px; color: #000000;">${restaurantData.direccion}</div>`;
    }

    // Línea separadora
    content += `<div style="border-top: 1px dashed #000; margin: 8px 0;"></div>`;

    // Información del ticket
    content += `<div style="text-align: center; margin-bottom: 5px;">`;
    content += `<div style="font-size: 11px; font-weight: bold; color: #000000;">TICKET DE VENTA</div>`;
    content += `<div style="font-size: 10px; color: #000000;">Mesa: ${orderData.mesa}</div>`;
    content += `<div style="font-size: 10px; color: #000000;">Fecha: ${formattedDate} ${formattedTime}</div>`;
    content += `</div>`;

    // Línea separadora
    content += `<div style="border-top: 1px dashed #000; margin: 8px 0;"></div>`;

    // Datos del cliente (solo si existe y no es "Sin nombre")
    if (
      orderData.cliente &&
      orderData.cliente !== "Sin nombre" &&
      orderData.cliente.trim() !== ""
    ) {
      content += `<div style="margin-bottom: 5px;">`;
      content += `<div style="font-size: 11px; font-weight: bold; color: #000000;">CLIENTE:</div>`;
      content += `<div style="font-size: 10px; color: #000000;">${orderData.cliente}</div>`;
      content += `</div>`;

      // Línea separadora después de los datos del cliente
      content += `<div style="border-top: 1px dashed #000; margin: 8px 0;"></div>`;
    }

    // Productos
    content += `<div style="margin-bottom: 5px;">`;
    content += `<div style="font-size: 11px; font-weight: bold; text-align: center; margin-bottom: 3px; color: #000000;">PRODUCTOS:</div>`;

    if (orderData.productos && orderData.productos.length > 0) {
      orderData.productos.forEach((item, index) => {
        content += `<div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px; color: #000000;">`;
        content += `<span style="color: #000000;">${item.producto || 'Producto sin nombre'}</span>`;
        content += `<span style="color: #000000;">x${item.unidades || 1}</span>`;
        content += `</div>`;
        content += `<div style="text-align: right; font-size: 10px; margin-bottom: 3px; color: #000000;">$${
          item.total?.toLocaleString() || "0"
        }</div>`;
      });
    }
    content += `</div>`;

    // Línea separadora
    content += `<div style="border-top: 1px dashed #000; margin: 8px 0;"></div>`;

    // Total
    content += `<div style="text-align: center; margin-bottom: 5px;">`;
    content += `<div style="font-size: 12px; font-weight: bold; color: #000000;">TOTAL: $${
      orderData.monto?.toLocaleString() || "0"
    }</div>`;
    content += `</div>`;

    // Línea separadora
    content += `<div style="border-top: 1px dashed #000; margin: 8px 0;"></div>`;

    // Información de contacto del restaurante
    content += `<div style="text-align: center; margin-bottom: 5px;">`;

    if (restaurantData.direccion) {
      content += `<div style="font-size: 9px; color: #000000; margin-bottom: 2px;">Dirección: ${restaurantData.direccion}</div>`;
    }

    if (restaurantData.email) {
      content += `<div style="font-size: 9px; color: #000000; margin-bottom: 2px;">Email: ${restaurantData.email}</div>`;
    }

    if (restaurantData.telefono) {
      content += `<div style="font-size: 9px; color: #000000; margin-bottom: 2px;">Tel: ${restaurantData.telefono}</div>`;
    }

    content += `</div>`;

    // Línea separadora
    content += `<div style="border-top: 1px dashed #000; margin: 8px 0;"></div>`;

    // Pie del ticket
    content += `<div style="text-align: center; font-size: 9px; margin-bottom: 5px;">`;
    content += `<div style="color: #000000;">¡Gracias por su compra!</div>`;
    content += `<div style="color: #000000;">Vuelva pronto</div>`;
    content += `</div>`;

    content += `</div>`;

    return content;
  } catch (error) {
    console.error("Error generando contenido del ticket:", error);
    throw new Error(`Error generando contenido del ticket: ${error.message}`);
  }
}
