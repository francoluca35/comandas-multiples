import { NextResponse } from "next/server";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../../lib/firebase";

// POST - Crear una nueva extracción (retiro)
export async function POST(request) {
  try {
    const body = await request.json();
    const { restauranteId, motivo, importe } = body;

    if (!restauranteId || !motivo || !importe) {
      return NextResponse.json(
        { error: "restauranteId, motivo e importe son requeridos" },
        { status: 400 }
      );
    }

    console.log("🔍 API Retirar - Creando extracción:", {
      restauranteId,
      motivo,
      importe,
    });

    // Validar que el importe sea un número válido
    const importeNumero = parseFloat(importe);
    if (isNaN(importeNumero) || importeNumero <= 0) {
      return NextResponse.json(
        { error: "El importe debe ser un número mayor a 0" },
        { status: 400 }
      );
    }

    // Obtener la primera caja registradora
    const cajaRef = collection(
      db,
      "restaurantes",
      restauranteId,
      "CajaRegistradora"
    );
    const cajaSnapshot = await getDocs(cajaRef);

    if (cajaSnapshot.empty) {
      return NextResponse.json(
        { error: "No hay cajas registradoras disponibles" },
        { status: 404 }
      );
    }

    // Tomar la primera caja
    const cajaDoc = cajaSnapshot.docs[0];
    const cajaData = cajaDoc.data();

    // Verificar que hay suficiente efectivo
    const aperturaActual = parseFloat(cajaData.Apertura || 0);
    if (aperturaActual < importeNumero) {
      return NextResponse.json(
        { error: "No hay suficiente efectivo disponible" },
        { status: 400 }
      );
    }

    // Calcular nuevo monto de apertura
    const nuevoApertura = aperturaActual - importeNumero;

    // Crear la fecha exacta del día
    const fechaActual = new Date();
    const fechaISO = fechaActual.toISOString();

    // Preparar datos de extracción
    const extraccionData = {
      fecha: fechaActual,
      motivo: motivo.trim(),
      importe: importeNumero,
    };

    // Actualizar el documento
    await updateDoc(cajaDoc.ref, {
      Apertura: nuevoApertura.toString(),
      Extraccion: {
        ...cajaData.Extraccion,
        [fechaISO]: extraccionData,
      },
      ultimaActualizacion: serverTimestamp(),
    });

    console.log("✅ Extracción creada exitosamente:", {
      fecha: fechaISO,
      motivo,
      importe: importeNumero,
      nuevoApertura,
    });

    return NextResponse.json({
      success: true,
      data: {
        fecha: fechaISO,
        motivo,
        importe: importeNumero,
        nuevoApertura,
      },
      message: "Extracción registrada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error creando extracción:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear la extracción",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
