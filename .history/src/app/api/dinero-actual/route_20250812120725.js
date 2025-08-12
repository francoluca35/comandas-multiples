import { NextResponse } from "next/server";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../../lib/firebase";

// GET - Obtener el dinero actual (efectivo)
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

    console.log(
      "🔍 API Dinero Actual - Obteniendo efectivo y virtual para restaurante:",
      restauranteId
    );

    // Referencia a la colección CajaRegistradora
    const cajaRef = collection(
      db,
      "restaurantes",
      restauranteId,
      "CajaRegistradora"
    );

    // Referencia a la colección Dinero
    const dineroRef = collection(db, "restaurantes", restauranteId, "Dinero");

    // Obtener todos los documentos de caja
    const cajaSnapshot = await getDocs(cajaRef);

    if (cajaSnapshot.empty) {
      console.log("📭 No hay documentos en CajaRegistradora");
      return NextResponse.json({
        success: true,
        data: {
          efectivo: 0,
          virtual: 0,
          totalCajas: 0,
          ultimaActualizacion: null,
        },
      });
    }

    let efectivoTotal = 0;
    let virtualTotal = 0;
    let ultimaActualizacion = null;
    const cajas = [];

    // Procesar cada documento de caja
    cajaSnapshot.forEach((doc) => {
      const cajaData = doc.data();
      console.log("📦 Datos de caja:", { id: doc.id, ...cajaData });

      // Sumar el efectivo de apertura
      if (cajaData.Apertura && !isNaN(parseFloat(cajaData.Apertura))) {
        const apertura = parseFloat(cajaData.Apertura);
        efectivoTotal += apertura;

        cajas.push({
          id: doc.id,
          apertura: apertura,
          cierre: cajaData.Cierre || "",
          extraccion: cajaData.Extraccion || {},
          ultimaActualizacion: cajaData.ultimaActualizacion || null,
        });
      }
    });

    // Obtener el dinero virtual
    const dineroSnapshot = await getDocs(dineroRef);
    console.log("💳 Obteniendo datos de Dinero virtual...");

    if (!dineroSnapshot.empty) {
      dineroSnapshot.forEach((doc) => {
        const dineroData = doc.data();
        console.log("💳 Datos de dinero:", { id: doc.id, ...dineroData });

        // Obtener el dinero virtual
        if (dineroData.Virtual && !isNaN(parseFloat(dineroData.Virtual))) {
          virtualTotal = parseFloat(dineroData.Virtual);
          console.log("💳 Dinero virtual encontrado:", virtualTotal);
        }
      });
    } else {
      console.log("📭 No hay documentos en Dinero");
    }

    // Encontrar la última actualización
    if (cajas.length > 0) {
      ultimaActualizacion = cajas.reduce((latest, caja) => {
        if (
          caja.ultimaActualizacion &&
          (!latest || caja.ultimaActualizacion > latest)
        ) {
          return caja.ultimaActualizacion;
        }
        return latest;
      }, null);
    }

    console.log("💰 Efectivo total calculado:", efectivoTotal);
    console.log("💳 Dinero virtual total:", virtualTotal);
    console.log("📊 Total de cajas:", cajas.length);

    return NextResponse.json({
      success: true,
      data: {
        efectivo: efectivoTotal,
        virtual: virtualTotal,
        totalCajas: cajas.length,
        cajas: cajas,
        ultimaActualizacion: ultimaActualizacion,
      },
    });
  } catch (error) {
    console.error("❌ Error obteniendo dinero actual:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener el dinero actual",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Actualizar el dinero actual (efectivo)
export async function POST(request) {
  try {
    const body = await request.json();
    const { restauranteId, cajaId, apertura, cierre, extraccion } = body;

    if (!restauranteId) {
      return NextResponse.json(
        { error: "restauranteId es requerido" },
        { status: 400 }
      );
    }

    console.log("🔍 API Dinero Actual - Actualizando caja:", {
      restauranteId,
      cajaId,
      apertura,
    });

    // Referencia al documento de caja específico
    const cajaRef = doc(
      db,
      "restaurantes",
      restauranteId,
      "CajaRegistradora",
      cajaId
    );

    const updateData = {
      ultimaActualizacion: serverTimestamp(),
    };

    if (apertura !== undefined) {
      updateData.Apertura = apertura.toString();
    }

    if (cierre !== undefined) {
      updateData.Cierre = cierre.toString();
    }

    if (extraccion !== undefined) {
      updateData.Extraccion = extraccion;
    }

    // Actualizar el documento
    await updateDoc(cajaRef, updateData);

    console.log("✅ Caja actualizada exitosamente");

    return NextResponse.json({
      success: true,
      message: "Caja actualizada exitosamente",
      data: updateData,
    });
  } catch (error) {
    console.error("❌ Error actualizando caja:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar la caja",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
