import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// POST - Inicializar estructuras financieras manualmente
export async function POST(request) {
  try {
    const body = await request.json();
    const { restauranteId } = body;

    if (!restauranteId) {
      return NextResponse.json(
        { error: "restauranteId es requerido" },
        { status: 400 }
      );
    }

    console.log("🔧 Inicializando estructuras financieras manualmente para:", restauranteId);

    let estructurasCreadas = [];

    // Verificar si existe caja registradora
    const cajaRef = collection(db, "restaurantes", restauranteId, "CajaRegistradora");
    const cajaSnapshot = await getDocs(cajaRef);

    if (cajaSnapshot.empty) {
      console.log("📦 Creando caja registradora inicial...");
      const nuevaCaja = await addDoc(cajaRef, {
        Apertura: "0",
        Cierre: "",
        Extraccion: {},
        Ingresos: {},
        ultimaActualizacion: serverTimestamp(),
      });
      console.log("✅ Caja registradora creada con ID:", nuevaCaja.id);
      estructurasCreadas.push("Caja Registradora");
    } else {
      console.log("📦 Caja registradora ya existe");
    }

    // Verificar si existe documento de dinero virtual
    const dineroRef = collection(db, "restaurantes", restauranteId, "Dinero");
    const dineroSnapshot = await getDocs(dineroRef);

    if (dineroSnapshot.empty) {
      console.log("💳 Creando documento de dinero virtual inicial...");
      const nuevoDinero = await addDoc(dineroRef, {
        Virtual: "0",
        IngresosVirtual: {},
        EgresosVirtual: {},
        ultimaActualizacion: serverTimestamp(),
      });
      console.log("✅ Documento de dinero virtual creado con ID:", nuevoDinero.id);
      estructurasCreadas.push("Dinero Virtual");
    } else {
      console.log("💳 Documento de dinero virtual ya existe");
    }

    console.log("✅ Inicialización completada. Estructuras creadas:", estructurasCreadas);

    return NextResponse.json({
      success: true,
      message: "Estructuras financieras inicializadas correctamente",
      data: {
        estructurasCreadas,
        restauranteId,
      },
    });
  } catch (error) {
    console.error("❌ Error inicializando estructuras financieras:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al inicializar las estructuras financieras",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// GET - Verificar estado de las estructuras financieras
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

    console.log("🔍 Verificando estado de estructuras financieras para:", restauranteId);

    // Verificar caja registradora
    const cajaRef = collection(db, "restaurantes", restauranteId, "CajaRegistradora");
    const cajaSnapshot = await getDocs(cajaRef);
    const tieneCaja = !cajaSnapshot.empty;

    // Verificar dinero virtual
    const dineroRef = collection(db, "restaurantes", restauranteId, "Dinero");
    const dineroSnapshot = await getDocs(dineroRef);
    const tieneDinero = !dineroSnapshot.empty;

    const estado = {
      restauranteId,
      tieneCajaRegistradora: tieneCaja,
      tieneDineroVirtual: tieneDinero,
      estructurasCompletas: tieneCaja && tieneDinero,
    };

    if (tieneCaja) {
      const cajaData = cajaSnapshot.docs[0].data();
      estado.efectivoActual = parseFloat(cajaData.Apertura || 0);
    }

    if (tieneDinero) {
      const dineroData = dineroSnapshot.docs[0].data();
      estado.virtualActual = parseFloat(dineroData.Virtual || 0);
    }

    console.log("📊 Estado de estructuras:", estado);

    return NextResponse.json({
      success: true,
      data: estado,
    });
  } catch (error) {
    console.error("❌ Error verificando estructuras financieras:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al verificar las estructuras financieras",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
