import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restauranteId = searchParams.get("restauranteId");
    const periodo = searchParams.get("periodo"); // "dia", "semana", "mes"

    if (!restauranteId) {
      return NextResponse.json(
        { error: "restauranteId es requerido" },
        { status: 400 }
      );
    }

    // Calcular fechas según el período
    const now = new Date();
    let fechaInicio = new Date();
    
    switch (periodo) {
      case "dia":
        fechaInicio = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "semana":
        const dayOfWeek = now.getDay();
        fechaInicio = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        break;
      case "mes":
        fechaInicio = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        // Si no se especifica período, usar todos los datos
        fechaInicio = new Date(0);
        break;
    }

    console.log("📊 Ventas por período:", { 
      restauranteId, 
      periodo, 
      fechaInicio: fechaInicio.toISOString(),
      now: now.toISOString()
    });

    // Obtener todas las ventas pagadas
    const [mesasSnapshot, takeawaySnapshot, deliverySnapshot] = await Promise.all([
      getDocs(query(
        collection(db, "restaurantes", restauranteId, "tables"),
        where("estado", "==", "pagado")
      )),
      getDocs(query(
        collection(db, "restaurantes", restauranteId, "takeaway"),
        where("estado", "==", "pagado")
      )),
      getDocs(query(
        collection(db, "restaurantes", restauranteId, "delivery"),
        where("estado", "==", "pagado")
      ))
    ]);

    // Calcular ventas por tipo
    let restaurante = 0;
    let takeaway = 0;
    let delivery = 0;

    // Procesar mesas (restaurante/salón) - usar tipoVenta para clasificar
    console.log("📊 Procesando mesas:", mesasSnapshot.size);
    mesasSnapshot.forEach((doc) => {
      const mesaData = doc.data();
      if (mesaData.total && !isNaN(parseFloat(mesaData.total))) {
        const total = parseFloat(mesaData.total);
        // Usar fechaVenta si existe, sino usar updatedAt
        const fechaMesa = mesaData.fechaVenta ? mesaData.fechaVenta.toDate() : 
                         (mesaData.updatedAt ? mesaData.updatedAt.toDate() : null);
        
        console.log("🔍 Mesa:", {
          id: doc.id,
          total,
          fechaVenta: mesaData.fechaVenta,
          updatedAt: mesaData.updatedAt,
          fechaMesa: fechaMesa ? fechaMesa.toISOString() : null,
          tipoVenta: mesaData.tipoVenta
        });
        
        // Si hay período especificado, filtrar por fecha
        // Si no hay fecha, asumir que es del período actual
        const incluirEnPeriodo = !periodo || !fechaMesa || fechaMesa >= fechaInicio;
        
        if (incluirEnPeriodo) {
          // Clasificar según tipoVenta
          const tipoVenta = (mesaData.tipoVenta || "salon").toLowerCase();
          console.log("✅ Incluida en período:", { tipoVenta, total });
          if (tipoVenta === "takeaway") {
            takeaway += total;
          } else if (tipoVenta === "delivery") {
            delivery += total;
          } else {
            // Por defecto, considerar salón
            restaurante += total;
          }
        } else {
          console.log("❌ No incluida en período");
        }
      }
    });
    console.log("💰 Totales calculados:", { restaurante, takeaway, delivery });

    // Procesar takeaway de colección separada
    takeawaySnapshot.forEach((doc) => {
      const takeawayData = doc.data();
      if (takeawayData.total && !isNaN(parseFloat(takeawayData.total))) {
        const total = parseFloat(takeawayData.total);
        // Usar fechaVenta si existe, sino usar updatedAt
        const fechaTakeaway = takeawayData.fechaVenta ? takeawayData.fechaVenta.toDate() : 
                             (takeawayData.updatedAt ? takeawayData.updatedAt.toDate() : null);
        
        // Si hay período especificado, filtrar por fecha
        // Si no hay fecha, asumir que es del período actual
        const incluirEnPeriodo = !periodo || !fechaTakeaway || fechaTakeaway >= fechaInicio;
        
        if (incluirEnPeriodo) {
          takeaway += total;
        }
      }
    });

    // Procesar delivery de colección separada
    deliverySnapshot.forEach((doc) => {
      const deliveryData = doc.data();
      if (deliveryData.total && !isNaN(parseFloat(deliveryData.total))) {
        const total = parseFloat(deliveryData.total);
        // Usar fechaVenta si existe, sino usar updatedAt
        const fechaDelivery = deliveryData.fechaVenta ? deliveryData.fechaVenta.toDate() : 
                             (deliveryData.updatedAt ? deliveryData.updatedAt.toDate() : null);
        
        // Si hay período especificado, filtrar por fecha
        // Si no hay fecha, asumir que es del período actual
        const incluirEnPeriodo = !periodo || !fechaDelivery || fechaDelivery >= fechaInicio;
        
        if (incluirEnPeriodo) {
          delivery += total;
        }
      }
    });

    const total = restaurante + takeaway + delivery;

    return NextResponse.json({
      success: true,
      data: {
        restaurante,
        takeaway,
        delivery,
        total,
        periodo: periodo || "todos"
      }
    });

  } catch (error) {
    console.error("❌ Error obteniendo ventas por período:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener las ventas",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

