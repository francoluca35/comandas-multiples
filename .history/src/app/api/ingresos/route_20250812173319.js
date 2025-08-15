import { NextResponse } from "next/server";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// GET - Obtener todos los ingresos y opciones de tipos
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
      "🔍 API Ingresos - Obteniendo ingresos para restaurante:",
      restauranteId
    );

    // Referencia a la colección Ingresos
    const ingresosRef = collection(
      db,
      "restaurantes",
      restauranteId,
      "Ingresos"
    );

    // Obtener todos los documentos de ingresos
    const ingresosSnapshot = await getDocs(ingresosRef);

    if (ingresosSnapshot.empty) {
      console.log("📭 No hay ingresos registrados");
      return NextResponse.json({
        success: true,
        data: {
          ingresos: [],
          totalIngresos: 0,
          tipos: [],
        },
      });
    }

    const ingresos = [];
    const tipos = [];
    let totalIngresos = 0;

    // Procesar cada documento de ingresos
    ingresosSnapshot.forEach((doc) => {
      const ingresoData = doc.data();
      console.log("📦 Datos de ingreso:", { id: doc.id, ...ingresoData });

      // Calcular total de ingresos
      if (ingresoData.monto && !isNaN(parseFloat(ingresoData.monto))) {
        const monto = parseFloat(ingresoData.monto);
        totalIngresos += monto;
      }

      // Agregar tipo a la lista
      if (ingresoData.tipoIngreso) {
        tipos.push(ingresoData.tipoIngreso);
      }

      ingresos.push({
        id: doc.id,
        tipoIngreso: ingresoData.tipoIngreso || "Sin tipo",
        motivo: ingresoData.motivo || "",
        monto: ingresoData.monto || "0",
        formaIngreso: ingresoData.formaIngreso || "",
        fecha: ingresoData.fecha || null,
        opcionPago: ingresoData.opcionPago || "",
      });
    });

    console.log("💰 Total de ingresos calculado:", totalIngresos);
    console.log("📊 Total de ingresos:", ingresos.length);

    return NextResponse.json({
      success: true,
      data: {
        ingresos: ingresos,
        totalIngresos: totalIngresos,
        tipos: tipos,
      },
    });
  } catch (error) {
    console.error("❌ Error obteniendo ingresos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener los ingresos",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo ingreso
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      restauranteId,
      tipoIngreso,
      motivo,
      monto,
      formaIngreso,
      fecha,
      opcionPago,
    } = body;

    if (
      !restauranteId ||
      !tipoIngreso ||
      !motivo ||
      !monto ||
      !formaIngreso ||
      !fecha
    ) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    console.log("🔍 API Ingresos - Creando ingreso:", {
      restauranteId,
      tipoIngreso,
      motivo,
      monto,
      formaIngreso,
      fecha,
      opcionPago,
      montoType: typeof monto,
      montoParsed: parseFloat(monto),
    });

    // Referencia a la colección Ingresos
    const ingresosRef = collection(
      db,
      "restaurantes",
      restauranteId,
      "Ingresos"
    );

    // Crear el nuevo documento de ingreso
    const nuevoIngreso = {
      tipoIngreso: tipoIngreso,
      motivo: motivo,
      monto: monto.toString(),
      formaIngreso: formaIngreso,
      fecha: new Date(fecha),
      opcionPago: opcionPago || "",
      createdAt: serverTimestamp(),
    };

    // Agregar el documento
    const docRef = await addDoc(ingresosRef, nuevoIngreso);

    console.log("✅ Ingreso creado exitosamente con ID:", docRef.id);

    // Actualizar caja registradora o dinero virtual según la opción de pago
    console.log("🔧 Decidiendo qué actualizar según opcionPago:", opcionPago);

    if (opcionPago === "caja") {
      console.log("💰 Actualizando SOLO caja registradora con monto:", monto);
      // Actualizar caja registradora
      await actualizarCajaRegistradoraIngreso(
        restauranteId,
        monto,
        motivo,
        fecha
      );
    } else if (opcionPago === "cuenta_restaurante") {
      console.log("💳 Actualizando SOLO dinero virtual con monto:", monto);
      // Actualizar dinero virtual
      await actualizarDineroVirtualIngreso(restauranteId, monto, motivo, fecha);
    } else {
      console.log("⚠️ Opción de pago no reconocida:", opcionPago);
    }

    return NextResponse.json({
      success: true,
      message: "Ingreso creado exitosamente",
      data: {
        id: docRef.id,
        ...nuevoIngreso,
      },
    });
  } catch (error) {
    console.error("❌ Error creando ingreso:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear el ingreso",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un ingreso existente
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      restauranteId,
      ingresoId,
      tipoIngreso,
      motivo,
      monto,
      formaIngreso,
      fecha,
    } = body;

    if (
      !restauranteId ||
      !ingresoId ||
      !tipoIngreso ||
      !motivo ||
      !monto ||
      !formaIngreso ||
      !fecha
    ) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    console.log("🔍 API Ingresos - Actualizando ingreso:", {
      restauranteId,
      ingresoId,
      tipoIngreso,
    });

    // Referencia al documento específico
    const ingresoRef = doc(
      db,
      "restaurantes",
      restauranteId,
      "Ingresos",
      ingresoId
    );

    const updateData = {
      tipoIngreso: tipoIngreso,
      motivo: motivo,
      monto: monto.toString(),
      formaIngreso: formaIngreso,
      fecha: new Date(fecha),
      updatedAt: serverTimestamp(),
    };

    // Actualizar el documento
    await updateDoc(ingresoRef, updateData);

    console.log("✅ Ingreso actualizado exitosamente");

    return NextResponse.json({
      success: true,
      message: "Ingreso actualizado exitosamente",
      data: updateData,
    });
  } catch (error) {
    console.error("❌ Error actualizando ingreso:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar el ingreso",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un ingreso
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restauranteId = searchParams.get("restauranteId");
    const ingresoId = searchParams.get("ingresoId");

    if (!restauranteId || !ingresoId) {
      return NextResponse.json(
        { error: "restauranteId e ingresoId son requeridos" },
        { status: 400 }
      );
    }

    console.log("🔍 API Ingresos - Eliminando ingreso:", {
      restauranteId,
      ingresoId,
    });

    // Referencia al documento específico
    const ingresoRef = doc(
      db,
      "restaurantes",
      restauranteId,
      "Ingresos",
      ingresoId
    );

    // Eliminar el documento
    await deleteDoc(ingresoRef);

    console.log("✅ Ingreso eliminado exitosamente");

    return NextResponse.json({
      success: true,
      message: "Ingreso eliminado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error eliminando ingreso:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar el ingreso",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Función auxiliar para actualizar la caja registradora (ingreso)
async function actualizarCajaRegistradoraIngreso(
  restauranteId,
  monto,
  motivo,
  fecha
) {
  try {
    console.log("💰 Actualizando caja registradora (ingreso):", {
      restauranteId,
      monto,
      motivo,
    });

    // Obtener la primera caja registradora (asumiendo que hay una)
    const cajaRef = collection(
      db,
      "restaurantes",
      restauranteId,
      "CajaRegistradora"
    );
    const cajaSnapshot = await getDocs(cajaRef);

    if (cajaSnapshot.empty) {
      console.log("⚠️ No hay cajas registradoras disponibles");
      return;
    }

    // Tomar la primera caja
    const cajaDoc = cajaSnapshot.docs[0];
    const cajaData = cajaDoc.data();

    // Calcular nuevo monto de apertura
    const aperturaActual = parseFloat(cajaData.Apertura || 0);
    const nuevoApertura = aperturaActual + parseFloat(monto);

    // Preparar datos de ingreso
    const ingresoData = {
      fecha: new Date(fecha),
      monto: monto.toString(),
      motivo: motivo,
    };

    // Actualizar el documento
    await updateDoc(cajaDoc.ref, {
      Apertura: nuevoApertura.toString(),
      Ingresos: {
        ...cajaData.Ingresos,
        [new Date().toISOString()]: ingresoData,
      },
      ultimaActualizacion: serverTimestamp(),
    });

    console.log("✅ Caja registradora actualizada exitosamente (ingreso)");
  } catch (error) {
    console.error("❌ Error actualizando caja registradora (ingreso):", error);
    throw error;
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
