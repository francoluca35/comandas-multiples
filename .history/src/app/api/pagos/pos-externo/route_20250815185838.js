import { NextResponse } from "next/server";
import { db } from "../../../../../lib/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";

// Función helper para listar todas las mesas (debug)
const listarMesas = async (restauranteId) => {
  try {
    console.log(`🔍 Listando todas las mesas del restaurante ${restauranteId}`);
    const mesasRef = collection(db, "restaurantes", restauranteId, "tables");
    const mesasSnapshot = await getDocs(mesasRef);
    
    const mesas = [];
    mesasSnapshot.forEach((doc) => {
      mesas.push({
        id: doc.id,
        data: doc.data()
      });
    });
    
    console.log(`📋 Mesas encontradas:`, mesas);
    return mesas;
  } catch (error) {
    console.error(`❌ Error listando mesas:`, error);
    return [];
  }
};

// Función helper para liberar mesa
const liberarMesa = async (restauranteId, mesaId) => {
  try {
    console.log(`🔄 Liberando mesa ${mesaId} del restaurante ${restauranteId}`);

    // Normalizar el mesaId para asegurar que coincida con el formato de Firestore
    let mesaIdNormalizado = mesaId;
    
    // Si el mesaId es un número, convertirlo a string
    if (typeof mesaId === 'number') {
      mesaIdNormalizado = mesaId.toString();
    }
    
    // Si no empieza con "mesa", agregarlo
    if (!mesaIdNormalizado.startsWith('mesa')) {
      mesaIdNormalizado = `mesa${mesaIdNormalizado}`;
    }

    console.log(`🔍 MesaId normalizado: ${mesaIdNormalizado}`);

    // Buscar la mesa por número
    const mesaRef = doc(db, "restaurantes", restauranteId, "tables", mesaIdNormalizado);

    // Verificar si la mesa existe antes de actualizarla
    const mesaDoc = await getDoc(mesaRef);
    
    if (!mesaDoc.exists()) {
      console.error(`❌ La mesa ${mesaIdNormalizado} no existe en Firestore`);
      
      // Intentar con el formato original
      const mesaRefOriginal = doc(db, "restaurantes", restauranteId, "tables", mesaId);
      const mesaDocOriginal = await getDoc(mesaRefOriginal);
      
      if (!mesaDocOriginal.exists()) {
        console.error(`❌ La mesa ${mesaId} tampoco existe en formato original`);
        return false;
      }
      
      // Usar el formato original si existe
      await updateDoc(mesaRefOriginal, {
        estado: "libre",
        cliente: "",
        productos: [],
        total: 0,
        fechaActualizacion: serverTimestamp(),
      });
      
      console.log(`✅ Mesa ${mesaId} liberada exitosamente (formato original)`);
      return true;
    }

    // Actualizar estado de la mesa
    await updateDoc(mesaRef, {
      estado: "libre",
      cliente: "",
      productos: [],
      total: 0,
      fechaActualizacion: serverTimestamp(),
    });

    console.log(`✅ Mesa ${mesaIdNormalizado} liberada exitosamente`);
    return true;
  } catch (error) {
    console.error(`❌ Error liberando mesa ${mesaId}:`, error);
    console.error(`❌ Error details:`, {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return false;
  }
};

// POST - Confirmar pago con POS externo
export async function POST(request) {
  console.log("🚀 POST /api/pagos/pos-externo iniciado");

  try {
    const body = await request.json();
    console.log("📦 Request body:", body);

    const {
      restauranteId,
      mesaId,
      monto,
      metodoPago = "tarjeta",
      externalReference,
      confirmado = true,
    } = body;

    // Validar datos requeridos
    console.log("🔍 Validando datos:", { restauranteId, mesaId, monto });

    if (!restauranteId || !mesaId || !monto) {
      console.error("❌ Datos faltantes:", { restauranteId, mesaId, monto });
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
        externalReference:
          externalReference || `${restauranteId}_${Date.now()}`,
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
      await setDoc(doc(db, "pagos", pagoData.externalReference), pagoData);

      console.log(`✅ Pago registrado: ${pagoData.externalReference}`);

      // Registrar ingreso automáticamente
      const ingresoData = {
        restauranteId,
        monto: parseFloat(monto),
        formaIngreso: "Tarjeta",
        opcionPago: "cuenta_restaurante", // Se suma a dinero virtual
        descripcion: `Pago POS externo - Mesa ${mesaId}`,
        fechaCreacion: serverTimestamp(),
        tipo: "venta",
        mesaId,
        externalReference: pagoData.externalReference,
      };

      await setDoc(
        doc(
          db,
          "restaurantes",
          restauranteId,
          "Ingresos",
          pagoData.externalReference
        ),
        ingresoData
      );

      console.log(`✅ Ingreso registrado: ${pagoData.externalReference}`);

      // Actualizar dinero virtual
      await actualizarDineroVirtualIngreso(
        restauranteId,
        monto,
        `Pago POS externo - Mesa ${mesaId}`,
        new Date()
      );

      // Liberar la mesa
      const mesaLiberada = await liberarMesa(restauranteId, mesaId);

      if (mesaLiberada) {
        console.log("✅ Pago completado exitosamente");
        const response = NextResponse.json({
          success: true,
          message: "Pago confirmado y mesa liberada exitosamente",
          pago: pagoData,
        });
        console.log("📤 Enviando respuesta exitosa:", response);
        return response;
      } else {
        console.log("⚠️ Pago confirmado pero error al liberar mesa");
        const response = NextResponse.json(
          {
            success: false,
            message: "Pago confirmado pero error al liberar mesa",
            pago: pagoData,
          },
          { status: 500 }
        );
        console.log("📤 Enviando respuesta con error:", response);
        return response;
      }
    } else {
      // Pago rechazado
      const pagoData = {
        restauranteId,
        mesaId,
        monto: parseFloat(monto),
        metodoPago,
        externalReference:
          externalReference || `${restauranteId}_${Date.now()}`,
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
      await setDoc(doc(db, "pagos", pagoData.externalReference), pagoData);

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

// Función auxiliar para actualizar el dinero virtual (ingreso)
async function actualizarDineroVirtualIngreso(
  restauranteId,
  monto,
  motivo,
  fecha
) {
  try {
    console.log("💳 Actualizando dinero virtual (ingreso):", {
      restauranteId,
      monto,
      motivo,
    });

    // Obtener el documento de dinero virtual
    const dineroRef = collection(db, "restaurantes", restauranteId, "Dinero");
    const dineroSnapshot = await getDocs(dineroRef);

    if (dineroSnapshot.empty) {
      console.log("⚠️ No hay documentos de dinero virtual disponibles");
      return;
    }

    // Tomar el primer documento de dinero
    const dineroDoc = dineroSnapshot.docs[0];
    const dineroData = dineroDoc.data();

    // Calcular nuevo monto virtual
    const virtualActual = parseFloat(dineroData.Virtual || 0);
    const nuevoVirtual = virtualActual + parseFloat(monto);

    // Preparar datos de ingreso virtual
    const ingresoVirtualData = {
      fecha: new Date(fecha),
      monto: monto.toString(),
      motivo: motivo,
    };

    // Actualizar el documento
    await updateDoc(dineroDoc.ref, {
      Virtual: nuevoVirtual.toString(),
      IngresosVirtual: {
        ...dineroData.IngresosVirtual,
        [new Date().toISOString()]: ingresoVirtualData,
      },
    });

    console.log("✅ Dinero virtual actualizado exitosamente (ingreso)");
  } catch (error) {
    console.error("❌ Error actualizando dinero virtual (ingreso):", error);
    throw error;
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
