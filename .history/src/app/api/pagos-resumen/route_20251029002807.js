import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// Función optimizada para obtener resumen de pagos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restauranteId = searchParams.get("restauranteId");

    if (!restauranteId) {
      return NextResponse.json(
        { error: "restauranteId es requerido" },
        { status: 400 }
      );
    }

    console.log("🚀 API Pagos Resumen - Cargando datos optimizados para:", restauranteId);

    // Hacer todas las consultas en paralelo con queries optimizadas
    const [
      cajaSnapshot,
      dineroSnapshot,
      ingresosSnapshot,
      egresosSnapshot,
      mesasSnapshot,
      takeawaySnapshot,
      deliverySnapshot
    ] = await Promise.all([
      // Solo obtener datos esenciales de caja
      getDocs(collection(db, "restaurantes", restauranteId, "CajaRegistradora")),
      getDocs(collection(db, "restaurantes", restauranteId, "Dinero")),
      // Solo obtener totales de ingresos (no todos los registros)
      getDocs(query(
        collection(db, "restaurantes", restauranteId, "Ingresos"),
        orderBy("fecha", "desc"),
        limit(100) // Solo últimos 100 ingresos
      )),
      // Solo obtener totales de egresos (no todos los registros)
      getDocs(query(
        collection(db, "restaurantes", restauranteId, "Egresos"),
        orderBy("fecha", "desc"),
        limit(100) // Solo últimos 100 egresos
      )),
      // Solo mesas pagadas (estado = "pagado")
      getDocs(query(
        collection(db, "restaurantes", restauranteId, "tables"),
        where("estado", "==", "pagado")
      )),
      // Solo takeaway pagado
      getDocs(query(
        collection(db, "restaurantes", restauranteId, "takeaway"),
        where("estado", "==", "pagado")
      )),
      // Solo delivery pagado
      getDocs(query(
        collection(db, "restaurantes", restauranteId, "delivery"),
        where("estado", "==", "pagado")
      ))
    ]);

    // Calcular dinero actual (efectivo) - Solo ventas - egresos (sin apertura de caja)
    let efectivoTotal = 0;
    let totalCajas = 0;
    let ultimaActualizacion = null;

    // NO sumar apertura de caja para evitar duplicación
    // Solo contar las cajas para estadísticas
    cajaSnapshot.forEach((doc) => {
      const cajaData = doc.data();
      totalCajas++;
      
      if (cajaData.ultimaActualizacion && 
          (!ultimaActualizacion || cajaData.ultimaActualizacion > ultimaActualizacion)) {
        ultimaActualizacion = cajaData.ultimaActualizacion;
      }
    });

    // Calcular dinero virtual
    let virtualTotal = 0;
    dineroSnapshot.forEach((doc) => {
      const dineroData = doc.data();
      if (dineroData.Virtual && !isNaN(parseFloat(dineroData.Virtual))) {
        virtualTotal = parseFloat(dineroData.Virtual);
      }
    });

    // Calcular totales de ingresos (excluyendo ventas de mesas para evitar duplicación)
    let totalIngresos = 0;
    let ingresosEfectivo = 0;
    let ingresosVirtual = 0;
    const ingresos = [];
    ingresosSnapshot.forEach((doc) => {
      const ingresoData = doc.data();
      if (ingresoData.monto && !isNaN(parseFloat(ingresoData.monto))) {
        const monto = parseFloat(ingresoData.monto);
        const motivo = ingresoData.motivo || "";
        
        // Excluir ingresos que son ventas de mesas (ya están contabilizadas en ventas)
        if (!motivo.includes("Cobranza mesa") && !motivo.includes("Takeaway") && !motivo.includes("Delivery")) {
          totalIngresos += monto;
          
          // Clasificar por forma de ingreso
          if (ingresoData.formaIngreso === "Efectivo" || ingresoData.opcionPago === "caja") {
            ingresosEfectivo += monto;
          } else if (ingresoData.formaIngreso === "MercadoPago" || ingresoData.opcionPago === "cuenta_restaurante") {
            ingresosVirtual += monto;
          } else {
            // Por defecto, asumir efectivo
            ingresosEfectivo += monto;
          }
        }
        
        ingresos.push({
          id: doc.id,
          monto: monto,
          motivo: ingresoData.motivo || "Sin motivo",
          fecha: ingresoData.fecha,
          esVenta: motivo.includes("Cobranza mesa") || motivo.includes("Takeaway") || motivo.includes("Delivery")
        });
      }
    });

    // Calcular totales de egresos por forma de pago
    let totalEgresos = 0;
    let egresosEfectivo = 0;
    let egresosVirtual = 0;
    const egresos = [];
    egresosSnapshot.forEach((doc) => {
      const egresoData = doc.data();
      if (egresoData.monto && !isNaN(parseFloat(egresoData.monto))) {
        const monto = parseFloat(egresoData.monto);
        totalEgresos += monto;
        
        // Separar egresos por forma de pago
        if (egresoData.formaPago === "efectivo") {
          egresosEfectivo += monto;
        } else if (egresoData.formaPago === "virtual") {
          egresosVirtual += monto;
        }
        
        egresos.push({
          id: doc.id,
          monto: monto,
          motivo: egresoData.motivo || "Sin motivo",
          fecha: egresoData.fecha,
          formaPago: egresoData.formaPago || "efectivo"
        });
      }
    });

    // Calcular ventas por método de pago
    let ventasEfectivo = 0;
    let ventasVirtual = 0;

    // Procesar mesas
    mesasSnapshot.forEach((doc) => {
      const mesaData = doc.data();
      if (mesaData.total && !isNaN(parseFloat(mesaData.total))) {
        const total = parseFloat(mesaData.total);
        if (mesaData.metodoPago === "efectivo") {
          ventasEfectivo += total;
        } else if (mesaData.metodoPago === "tarjeta" || mesaData.metodoPago === "mercadopago") {
          ventasVirtual += total;
        }
      }
    });

    // Procesar takeaway
    takeawaySnapshot.forEach((doc) => {
      const takeawayData = doc.data();
      if (takeawayData.total && !isNaN(parseFloat(takeawayData.total))) {
        const total = parseFloat(takeawayData.total);
        if (takeawayData.metodoPago === "efectivo") {
          ventasEfectivo += total;
        } else if (takeawayData.metodoPago === "tarjeta" || takeawayData.metodoPago === "mercadopago") {
          ventasVirtual += total;
        }
      }
    });

    // Procesar delivery
    deliverySnapshot.forEach((doc) => {
      const deliveryData = doc.data();
      if (deliveryData.total && !isNaN(parseFloat(deliveryData.total))) {
        const total = parseFloat(deliveryData.total);
        if (deliveryData.metodoPago === "efectivo") {
          ventasEfectivo += total;
        } else if (deliveryData.metodoPago === "tarjeta" || deliveryData.metodoPago === "mercadopago") {
          ventasVirtual += total;
        }
      }
    });

    // Si no hay ventas directas, calcular desde los ingresos que son ventas
    if (ventasEfectivo === 0 && ventasVirtual === 0) {
      console.log("📊 No hay ventas directas, calculando desde ingresos...");
      ingresosSnapshot.forEach((doc) => {
        const ingresoData = doc.data();
        if (ingresoData.monto && !isNaN(parseFloat(ingresoData.monto))) {
          const motivo = ingresoData.motivo || "";
          
          // Si el motivo indica que es una venta (mesa, takeaway, delivery)
          if (motivo.includes("Cobranza mesa") || motivo.includes("Takeaway") || motivo.includes("Delivery")) {
            const total = parseFloat(ingresoData.monto);
            
            // Clasificar por forma de ingreso
            if (ingresoData.formaIngreso === "Efectivo" || ingresoData.opcionPago === "caja") {
              ventasEfectivo += total;
            } else if (ingresoData.formaIngreso === "MercadoPago" || ingresoData.opcionPago === "cuenta_restaurante") {
              ventasVirtual += total;
            } else {
              // Por defecto, asumir efectivo
              ventasEfectivo += total;
            }
            console.log(`💰 Venta desde ingreso: ${motivo} - $${total} (${ingresoData.formaIngreso})`);
          }
        }
      });
    }

    // Calcular dinero actual real: solo ventas - egresos
    // NO sumar apertura de caja ni ingresos (para evitar duplicación)
    efectivoTotal = ventasEfectivo - egresosEfectivo;
    virtualTotal = ventasVirtual - egresosVirtual;

    const ventasTotal = ventasEfectivo + ventasVirtual;

    console.log("💰 Resumen calculado:", {
      efectivo: efectivoTotal,
      virtual: virtualTotal,
      ventasEfectivo,
      ventasVirtual,
      ingresosEfectivo,
      ingresosVirtual,
      egresosEfectivo,
      egresosVirtual,
      totalIngresos,
      totalEgresos,
      mesasCount: mesasSnapshot.size,
      takeawayCount: takeawaySnapshot.size,
      deliveryCount: deliverySnapshot.size
    });


    return NextResponse.json({
      success: true,
      data: {
        dineroActual: {
          efectivo: efectivoTotal,
          virtual: virtualTotal,
          totalCajas,
          cajas: [], // No enviar datos de cajas para optimizar
          ultimaActualizacion
        },
        ingresos: {
          ingresos: ingresos.slice(0, 10), // Solo últimos 10 para la UI
          totalIngresos,
          tipos: [] // No enviar tipos para optimizar
        },
        egresos: {
          egresos: egresos.slice(0, 10), // Solo últimos 10 para la UI
          totalEgresos,
          tipos: [] // No enviar tipos para optimizar
        },
        ventas: {
          efectivo: ventasEfectivo,
          virtual: ventasVirtual,
          total: ventasTotal
        }
      }
    });

  } catch (error) {
    console.error("❌ Error obteniendo resumen de pagos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener resumen de pagos",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
