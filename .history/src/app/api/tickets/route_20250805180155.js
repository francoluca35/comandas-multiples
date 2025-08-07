import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

export async function POST(request) {
  try {
    const { restaurantId, orderData } = await request.json();

    // Debug: Log de los datos recibidos
    console.log("=== DEBUG: API recibió datos ===");
    console.log("restaurantId:", restaurantId);
    console.log("orderData:", orderData);
    console.log("orderData.cliente:", orderData?.cliente);
    console.log("orderData.productos:", orderData?.productos);
    console.log("orderData.monto:", orderData?.monto);
    console.log("================================");

    if (!restaurantId || !orderData) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Obtener datos del restaurante
    const restaurantRef = doc(db, "restaurantes", restaurantId);
    const restaurantDoc = await getDoc(restaurantRef);

    if (!restaurantDoc.exists()) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    const restaurantData = restaurantDoc.data();

    // Debug: Log de los datos del restaurante
    console.log("=== DEBUG: Datos del restaurante ===");
    console.log("restaurantData:", restaurantData);
    console.log("================================");

    // Generar contenido del ticket
    const ticketContent = generateTicketContent(restaurantData, orderData);

    // Debug: Log del contenido generado
    console.log("=== DEBUG: Contenido del ticket generado ===");
    console.log("ticketContent length:", ticketContent?.length);
    console.log("ticketContent preview:", ticketContent?.substring(0, 200) + "...");
    console.log("================================");

    return NextResponse.json({
      success: true,
      ticketContent,
      restaurantData,
      orderData,
    });
  } catch (error) {
    console.error("Error generando ticket:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

function generateTicketContent(restaurantData, orderData) {
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
      content += `<span style="color: #000000;">${item.producto}</span>`;
      content += `<span style="color: #000000;">x${item.unidades}</span>`;
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

  // Pie del ticket
  content += `<div style="text-align: center; font-size: 9px; margin-bottom: 5px;">`;
  content += `<div style="color: #000000;">¡Gracias por su compra!</div>`;
  content += `<div style="color: #000000;">Vuelva pronto</div>`;
  content += `</div>`;

  content += `</div>`;

  return content;
}
