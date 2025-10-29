// Script para debuggear el cálculo de dinero actual
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

async function debugCalculoDinero(restauranteId) {
  console.log("🔍 Debuggeando cálculo de dinero actual para restaurante:", restauranteId);
  
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
    console.log("\n💰 APERTURA DE CAJA:");
    cajaSnapshot.forEach((doc) => {
      const cajaData = doc.data();
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
      }
    });
    console.log(`Total ingresos (no ventas): $${totalIngresos}`);
    console.log(`Ingresos efectivo (no ventas): $${ingresosEfectivo}`);
    console.log(`Ingresos virtual (no ventas): $${ingresosVirtual}`);

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
        } else if (egresoData.formaPago === "virtual") {
          egresosVirtual += monto;
        } else {
          // Por defecto, asumir efectivo
          egresosEfectivo += monto;
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

    // 6. Si no hay ventas directas, calcular desde los ingresos que son ventas
    if (ventasEfectivo === 0 && ventasVirtual === 0) {
      console.log("\n📊 Calculando ventas desde ingresos...");
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

    console.log(`Total ventas efectivo: $${ventasEfectivo}`);
    console.log(`Total ventas virtual: $${ventasVirtual}`);

    // 7. Cálculo final
    const efectivoFinal = efectivoApertura + ventasEfectivo - egresosEfectivo;
    const virtualFinal = virtualTotal + ventasVirtual - egresosVirtual;

    console.log("\n🧮 CÁLCULO FINAL:");
    console.log(`Efectivo final = ${efectivoApertura} + ${ventasEfectivo} - ${egresosEfectivo} = ${efectivoFinal}`);
    console.log(`Virtual final = ${virtualTotal} + ${ventasVirtual} - ${egresosVirtual} = ${virtualFinal}`);
    console.log(`Total dinero actual = ${efectivoFinal} + ${virtualFinal} = ${efectivoFinal + virtualFinal}`);

    return {
      efectivoApertura,
      virtualTotal,
      ventasEfectivo,
      ventasVirtual,
      ingresosEfectivo,
      ingresosVirtual,
      egresosEfectivo,
      egresosVirtual,
      efectivoFinal,
      virtualFinal,
      totalDineroActual: efectivoFinal + virtualFinal
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
    console.log("Uso: node debug-calculo-dinero.js <restauranteId>");
    process.exit(1);
  }
  
  debugCalculoDinero(restauranteId)
    .then(result => {
      console.log("\n📋 RESUMEN FINAL:");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error("Error:", error);
      process.exit(1);
    });
}

module.exports = { debugCalculoDinero };
