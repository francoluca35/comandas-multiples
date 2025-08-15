import { NextResponse } from "next/server";
import { db } from "../../../../../lib/firebase";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// Función helper para liberar mesa
const liberarMesa = async (restauranteId, mesaId) => {
  try {
    console.log(`🔄 Liberando mesa ${mesaId} del restaurante ${restauranteId}`);
    
    // Buscar la mesa por número
    const mesaRef = doc(db, "restaurantes", restauranteId, "tables", mesaId);
    
    // Actualizar estado de la mesa
    await updateDoc(mesaRef, {
      estado: "libre",
      cliente: "",
      productos: [],
      total: 0,
      fechaActualizacion: serverTimestamp(),
    });
    
    console.log(`✅ Mesa ${mesaId} liberada exitosamente`);
    return true;
  } catch (error) {
    console.error(`❌ Error liberando mesa ${mesaId}:`, error);
    return false;
  }
};

// POST - Confirmar pago con POS externo
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      restauranteId,
      mesaId,
      monto,
      metodoPago = "tarjeta",
      externalReference,
      confirmado = true,
    } = body;

    // Validar datos requeridos
    if (!restauranteId || !mesaId || !monto) {
      return NextResponse.json(
        { error: "Faltan datos requeridos: restauranteId, mesaId, monto" },
        { status: 400 }
      );
    }

    console.log(`💳 Confirmando pago POS externo:`, {
      restauranteId,
      mesaId,
      monto,
      metodoPago,
      externalReference,
      confirmado,
    });

    if (confirmado) {
      // Registrar el pago en la colección de pagos
      const pagoData = {
        restauranteId,
        mesaId,
        monto: parseFloat(monto),
        metodoPago,
        externalReference: externalReference || `${restauranteId}_${Date.now()}`,
        estado: "approved",
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        tipo: "pos_externo",
        additional_info: {
          mesaId,
          mesa: mesaId,
        },
      };

      // Guardar en la colección de pagos
      await setDoc(
        doc(db, "pagos", pagoData.externalReference),
        pagoData
      );

      console.log(`✅ Pago registrado: ${pagoData.externalReference}`);

      // Liberar la mesa
      const mesaLiberada = await liberarMesa(restauranteId, mesaId);

      if (mesaLiberada) {
        return NextResponse.json({
          success: true,
          message: "Pago confirmado y mesa liberada exitosamente",
          pago: pagoData,
        });
      } else {
        return NextResponse.json({
          success: false,
          message: "Pago confirmado pero error al liberar mesa",
          pago: pagoData,
        }, { status: 500 });
      }
    } else {
      // Pago rechazado
      const pagoData = {
        restauranteId,
        mesaId,
        monto: parseFloat(monto),
        metodoPago,
        externalReference: externalReference || `${restauranteId}_${Date.now()}`,
        estado: "rejected",
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
        tipo: "pos_externo",
        additional_info: {
          mesaId,
          mesa: mesaId,
        },
      };

      // Guardar en la colección de pagos
      await setDoc(
        doc(db, "pagos", pagoData.externalReference),
        pagoData
      );

      console.log(`❌ Pago rechazado: ${pagoData.externalReference}`);

      return NextResponse.json({
        success: false,
        message: "Pago rechazado",
        pago: pagoData,
      });
    }
  } catch (error) {
    console.error("❌ Error confirmando pago POS externo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Obtener estado de pago
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const externalReference = searchParams.get("externalReference");

    if (!externalReference) {
      return NextResponse.json(
        { error: "externalReference es requerido" },
        { status: 400 }
      );
    }

    // Aquí podrías implementar la lógica para obtener el estado del pago
    // Por ahora retornamos un estado por defecto
    return NextResponse.json({
      success: true,
      estado: "pending",
      externalReference,
    });
  } catch (error) {
    console.error("Error obteniendo estado de pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
