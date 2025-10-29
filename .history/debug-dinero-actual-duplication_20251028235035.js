// Script para debuggear la duplicación en el cálculo de dinero actual
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy, limit } = require('firebase/firestore');

// Configuración de Firebase (usar la misma que en tu app)
const firebaseConfig = {
  // Aquí deberías poner tu configuración de Firebase
  // Por ahora usaremos variables de entorno o configuración local
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugDineroActual(restauranteId) {
  console.log("🔍 Debuggeando duplicación en dinero actual para restaurante:", restauranteId);
  
  try {
    // Obtener datos de todas las colecciones
    const [cajaSnapshot, dineroSnapshot, ingresosSnapshot, egresosSnapshot, mesasSnapshot, takeawaySnapshot, deliverySnapshot] = await Promise.all([
      getDocs(collection(db, "restaurantes", restauranteId, "CajaRegistradora")),
      getDocs(collection(db, "restaurantes", restauranteId, "Dinero")),
      getDocs(query(collection(db, "restaurantes", restauranteId, "Ingresos"), orderBy("fecha", "desc"), limit(100))),
      getDocs(query(collection(db, "restaurantes", restauranteId, "Egresos"), orderBy("fecha", "desc"), limit(100))),
      getDocs(query(collection(db, "restaurantes", restauranteId, "tables"), where("estado", "==", "pagado"))),
      getDocs(query(collection(db, "restaurantes", restauranteId, "takeaway"), where("estado", "==", "pagado"))),
      getDocs(query(collection(db, "restaurantes", restauranteId, "delivery"), where("estado", "==", "pagado")))
    ]);

    console.log("\n📊 DATOS OBTENIDOS:");
    console.log("Cajas:", cajaSnapshot.size);
    console.log("Dinero:", dineroSnapshot.size);
    console.log("Ingresos:", ingresosSnapshot.size);
    console.log("Egresos:", egresosSnapshot.size);
    console.log("Mesas pagadas:", mesasSnapshot.size);
    console.log("Takeaway pagado:", takeawaySnapshot.size);
    console.log("Delivery pagado:", deliverySnapshot.size);

    // 1. Analizar apertura de caja
    let efectivoApertura = 0;
    let totalCajas = 0;
    console.log("\n💰 APERTURA DE CAJA:");
    cajaSnapshot.forEach((doc) => {
      const cajaData = doc.data();
      totalCajas++;
      console.log(`Caja ${doc.id}:`, cajaData);
      if (cajaData.Apertura && !isNaN(parseFloat(cajaData.Apertura))) {
        efectivoApertura += parseFloat(cajaData.Apertura);
        console.log(`  - Apertura: $${cajaData.Apertura}`);
      }
    });
    console.log(`Total apertura de caja: $${efectivoApertura}`);

    // 2. Analizar dinero virtual
    let virtualTotal = 0;
    console.log("\n💳 DINERO VIRTUAL:");
    dineroSnapshot.forEach((doc) => {
      const dineroData = doc.data();
      console.log(`Dinero ${doc.id}:`, dineroData);
      if (dineroData.Virtual && !isNaN(parseFloat(dineroData.Virtual))) {
        virtualTotal = parseFloat(dineroData.Virtual);
        console.log(`  - Virtual: $${dineroData.Virtual}`);
      }
    });
    console.log(`Total dinero virtual: $${virtualTotal}`);

    // 3. Analizar ingresos
    let totalIngresos = 0;
    let ingresosEfectivo = 0;
    let ingresosVirtual = 0;
    console.log("\n📈 INGRESOS:");
    ingresosSnapshot.forEach((doc) => {
      const ingresoData = doc.data();
      console.log(`Ingreso ${doc.id}:`, ingresoData);
      if (ingresoData.monto && !isNaN(parseFloat(ingresoData.monto))) {
        const monto = parseFloat(ingresoData.monto);
        totalIngresos += monto;
        
        // Clasificar por forma de ingreso
        if (ingresoData.formaIngreso === "Efectivo" || ingresoData.opcionPago === "caja") {
          ingresosEfectivo += monto;
          console.log(`  - Efectivo: $${monto} (${ingresoData.motivo || ingresoData.tipoIngreso})`);
        } else if (ingresoData.formaIngreso === "MercadoPago" || ingresoData.opcionPago === "cuenta_restaurante") {
          ingresosVirtual += monto;
          console.log(`  - Virtual: $${monto} (${ingresoData.motivo || ingresoData.tipoIngreso})`);
        } else {
          // Por defecto, asumir efectivo
          ingresosEfectivo += monto;
          console.log(`  - Efectivo (default): $${monto} (${ingresoData.motivo || ingresoData.tipoIngreso})`);
        }
      }
    });
    console.log(`Total ingresos: $${totalIngresos}`);
    console.log(`Ingresos efectivo: $${ingresosEfectivo}`);
    console.log(`Ingresos virtual: $${ingresosVirtual}`);

    // 4. Analizar egresos
    let totalEgresos = 0;
    let egresosEfectivo = 0;
    let egresosVirtual = 0;
    console.log("\n📉 EGRESOS:");
    egresosSnapshot.forEach((doc) => {
      const egresoData = doc.data();
      console.log(`Egreso ${doc.id}:`, egresoData);
      if (egresoData.monto && !isNaN(parseFloat(egresoData.monto))) {
        const monto = parseFloat(egresoData.monto);
        totalEgresos += monto;
        
        if (egresoData.formaPago === "efectivo") {
          egresosEfectivo += monto;
          console.log(`  - Efectivo: $${monto} (${egresoData.motivo})`);
        } else if (egresoData.formaPago === "virtual") {
          egresosVirtual += monto;
          console.log(`  - Virtual: $${monto} (${egresoData.motivo})`);
        } else {
          // Por defecto, asumir efectivo
          egresosEfectivo += monto;
          console.log(`  - Efectivo (default): $${monto} (${egresoData.motivo})`);
        }
      }
    });
    console.log(`Total egresos: $${totalEgresos}`);
    console.log(`Egresos efectivo: $${egresosEfectivo}`);
    console.log(`Egresos virtual: $${egresosVirtual}`);

    // 5. Analizar ventas de mesas
    let ventasEfectivo = 0;
    let ventasVirtual = 0;
    console.log("\n🪑 VENTAS DE MESAS:");
    mesasSnapshot.forEach((doc) => {
      const mesaData = doc.data();
      console.log(`Mesa ${doc.id}:`, mesaData);
      if (mesaData.total && !isNaN(parseFloat(mesaData.total))) {
        const total = parseFloat(mesaData.total);
        if (mesaData.metodoPago === "efectivo") {
          ventasEfectivo += total;
          console.log(`  - Efectivo: $${total}`);
        } else if (mesaData.metodoPago === "tarjeta" || mesaData.metodoPago === "mercadopago") {
          ventasVirtual += total;
          console.log(`  - Virtual: $${total}`);
        }
      }
    });

    // 6. Analizar ventas de takeaway
    console.log("\n🥡 VENTAS DE TAKEAWAY:");
    takeawaySnapshot.forEach((doc) => {
      const takeawayData = doc.data();
      console.log(`Takeaway ${doc.id}:`, takeawayData);
      if (takeawayData.total && !isNaN(parseFloat(takeawayData.total))) {
        const total = parseFloat(takeawayData.total);
        if (takeawayData.metodoPago === "efectivo") {
          ventasEfectivo += total;
          console.log(`  - Efectivo: $${total}`);
        } else if (takeawayData.metodoPago === "tarjeta" || takeawayData.metodoPago === "mercadopago") {
          ventasVirtual += total;
          console.log(`  - Virtual: $${total}`);
        }
      }
    });

    // 7. Analizar ventas de delivery
    console.log("\n🚚 VENTAS DE DELIVERY:");
    deliverySnapshot.forEach((doc) => {
      const deliveryData = doc.data();
      console.log(`Delivery ${doc.id}:`, deliveryData);
      if (deliveryData.total && !isNaN(parseFloat(deliveryData.total))) {
        const total = parseFloat(deliveryData.total);
        if (deliveryData.metodoPago === "efectivo") {
          ventasEfectivo += total;
          console.log(`  - Efectivo: $${total}`);
        } else if (deliveryData.metodoPago === "tarjeta" || deliveryData.metodoPago === "mercadopago") {
          ventasVirtual += total;
          console.log(`  - Virtual: $${total}`);
        }
      }
    });

    console.log(`Total ventas efectivo: $${ventasEfectivo}`);
    console.log(`Total ventas virtual: $${ventasVirtual}`);

    // 8. Cálculo actual (que podría estar duplicando)
    const efectivoActual = efectivoApertura + ventasEfectivo - egresosEfectivo;
    const virtualActual = virtualTotal + ventasVirtual - egresosVirtual;

    console.log("\n🧮 CÁLCULO ACTUAL:");
    console.log(`Efectivo actual = ${efectivoApertura} + ${ventasEfectivo} - ${egresosEfectivo} = ${efectivoActual}`);
    console.log(`Virtual actual = ${virtualTotal} + ${ventasVirtual} - ${egresosVirtual} = ${virtualActual}`);

    // 9. Verificar si hay duplicación
    console.log("\n🔍 ANÁLISIS DE DUPLICACIÓN:");
    
    // Verificar si las ventas están duplicadas con los ingresos
    const ingresosConVentas = ingresosSnapshot.docs.filter(doc => {
      const data = doc.data();
      const motivo = data.motivo || "";
      return motivo.includes("Cobranza mesa") || motivo.includes("Takeaway") || motivo.includes("Delivery");
    });

    console.log(`Ingresos que parecen ser ventas: ${ingresosConVentas.length}`);
    ingresosConVentas.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.motivo}: $${data.monto}`);
    });

    // Calcular total de ingresos que son ventas
    let ingresosVentasEfectivo = 0;
    ingresosConVentas.forEach(doc => {
      const data = doc.data();
      if (data.monto && !isNaN(parseFloat(data.monto))) {
        ingresosVentasEfectivo += parseFloat(data.monto);
      }
    });

    console.log(`Total de ingresos que son ventas: $${ingresosVentasEfectivo}`);
    console.log(`Total de ventas directas: $${ventasEfectivo}`);
    console.log(`Diferencia: $${Math.abs(ingresosVentasEfectivo - ventasEfectivo)}`);

    if (Math.abs(ingresosVentasEfectivo - ventasEfectivo) < 0.01) {
      console.log("⚠️  POSIBLE DUPLICACIÓN: Los ingresos y las ventas parecen ser los mismos datos");
    }

    // 10. Cálculo correcto (sin duplicación)
    console.log("\n✅ CÁLCULO CORRECTO (sin duplicación):");
    
    // Opción 1: Solo usar ingresos (incluye ventas registradas como ingresos)
    const efectivoCorrecto1 = efectivoApertura + ingresosEfectivo - egresosEfectivo;
    const virtualCorrecto1 = virtualTotal + ingresosVirtual - egresosVirtual;
    
    console.log(`Opción 1 (solo ingresos): Efectivo = ${efectivoCorrecto1}, Virtual = ${virtualCorrecto1}`);
    
    // Opción 2: Solo usar ventas directas (sin ingresos de ventas)
    const efectivoCorrecto2 = efectivoApertura + ventasEfectivo - egresosEfectivo;
    const virtualCorrecto2 = virtualTotal + ventasVirtual - egresosVirtual;
    
    console.log(`Opción 2 (solo ventas directas): Efectivo = ${efectivoCorrecto2}, Virtual = ${virtualCorrecto2}`);

    return {
      efectivoApertura,
      virtualTotal,
      ingresosEfectivo,
      ingresosVirtual,
      ventasEfectivo,
      ventasVirtual,
      egresosEfectivo,
      egresosVirtual,
      efectivoActual,
      virtualActual,
      efectivoCorrecto1,
      virtualCorrecto1,
      efectivoCorrecto2,
      virtualCorrecto2
    };

  } catch (error) {
    console.error("❌ Error en debug:", error);
    throw error;
  }
}

// Ejecutar el debug
if (require.main === module) {
  const restauranteId = process.argv[2];
  if (!restauranteId) {
    console.log("Uso: node debug-dinero-actual-duplication.js <restauranteId>");
    process.exit(1);
  }
  
  debugDineroActual(restauranteId)
    .then(result => {
      console.log("\n📋 RESUMEN FINAL:");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error("Error:", error);
      process.exit(1);
    });
}

module.exports = { debugDineroActual };
