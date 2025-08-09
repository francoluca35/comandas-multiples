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

// GET - Obtener todos los alivios y opciones de servicios
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
      "🔍 API Alivios - Obteniendo alivios para restaurante:",
      restauranteId
    );

    // Referencia a la colección ServiciosComercio
    const serviciosRef = collection(
      db,
      "restaurantes",
      restauranteId,
      "ServiciosComercio"
    );

    // Obtener todos los documentos de servicios
    const serviciosSnapshot = await getDocs(serviciosRef);

    if (serviciosSnapshot.empty) {
      console.log("📭 No hay servicios registrados");
      return NextResponse.json({
        success: true,
        data: {
          servicios: [],
          totalAlivios: 0,
          alivios: [],
        },
      });
    }

    const servicios = [];
    const alivios = [];
    let totalAlivios = 0;

    // Procesar cada documento de servicios
    serviciosSnapshot.forEach((doc) => {
      const servicioData = doc.data();
      console.log("📦 Datos de servicio:", { id: doc.id, ...servicioData });

      // Obtener el nombre del servicio (primer campo en tipodeservicio)
      const nombreServicio =
        Object.keys(servicioData.tipodeservicio || {})[0] || "Sin nombre";

      // Calcular total de alivios para este servicio
      let totalServicio = 0;
      const pagosServicio = [];

      if (
        servicioData.tipodeservicio &&
        servicioData.tipodeservicio[nombreServicio]
      ) {
        const servicio = servicioData.tipodeservicio[nombreServicio];

        if (servicio.monto && !isNaN(parseFloat(servicio.monto))) {
          totalServicio = parseFloat(servicio.monto);
          totalAlivios += totalServicio;
        }

        pagosServicio.push({
          fechadepago: servicio.fechadepago || null,
          monto: servicio.monto || "",
          tipodepago: servicio.tipodepago || "",
          nombreServicio: nombreServicio,
        });
      }

      servicios.push({
        id: doc.id,
        nombre: nombreServicio,
        total: totalServicio,
      });

      alivios.push(...pagosServicio);
    });

    console.log("💰 Total de alivios calculado:", totalAlivios);
    console.log("📊 Total de servicios:", servicios.length);

    return NextResponse.json({
      success: true,
      data: {
        servicios: servicios,
        totalAlivios: totalAlivios,
        alivios: alivios,
      },
    });
  } catch (error) {
    console.error("❌ Error obteniendo alivios:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener los alivios",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo alivio
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      restauranteId,
      nombreServicio,
      monto,
      tipodepago,
      fecha,
      opcionPago,
    } = body;

    if (!restauranteId || !nombreServicio || !monto || !tipodepago || !fecha) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    console.log("🔍 API Alivios - Creando alivio:", {
      restauranteId,
      nombreServicio,
      monto,
      tipodepago,
      fecha,
      opcionPago,
    });

    // Referencia a la colección ServiciosComercio
    const serviciosRef = collection(
      db,
      "restaurantes",
      restauranteId,
      "ServiciosComercio"
    );

    // Crear el nuevo documento de servicio
    const nuevoServicio = {
      tipodeservicio: {
        [nombreServicio]: {
          fechadepago: new Date(fecha), // Usar la fecha personalizada
          monto: monto.toString(),
          tipodepago: tipodepago,
        },
      },
    };

    // Agregar el documento
    const docRef = await addDoc(serviciosRef, nuevoServicio);

    console.log("✅ Alivio creado exitosamente con ID:", docRef.id);

    // Actualizar caja registradora o dinero virtual según la opción de pago
    if (opcionPago === "caja") {
      // Actualizar caja registradora
      await actualizarCajaRegistradora(
        restauranteId,
        monto,
        nombreServicio,
        fecha
      );
    } else if (opcionPago === "cuenta_restaurante") {
      // Actualizar dinero virtual
      await actualizarDineroVirtual(
        restauranteId,
        monto,
        nombreServicio,
        fecha
      );
    }

    return NextResponse.json({
      success: true,
      message: "Alivio creado exitosamente",
      data: {
        id: docRef.id,
        ...nuevoServicio,
      },
    });
  } catch (error) {
    console.error("❌ Error creando alivio:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear el alivio",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un alivio existente
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      restauranteId,
      servicioId,
      nombreServicio,
      monto,
      tipodepago,
      fecha,
    } = body;

    if (
      !restauranteId ||
      !servicioId ||
      !nombreServicio ||
      !monto ||
      !tipodepago ||
      !fecha
    ) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    console.log("🔍 API Alivios - Actualizando alivio:", {
      restauranteId,
      servicioId,
      nombreServicio,
    });

    // Referencia al documento específico
    const servicioRef = doc(
      db,
      "restaurantes",
      restauranteId,
      "ServiciosComercio",
      servicioId
    );

    const updateData = {
      [`tipodeservicio.${nombreServicio}`]: {
        fechadepago: new Date(fecha), // Usar la fecha personalizada
        monto: monto.toString(),
        tipodepago: tipodepago,
      },
    };

    // Actualizar el documento
    await updateDoc(servicioRef, updateData);

    console.log("✅ Alivio actualizado exitosamente");

    return NextResponse.json({
      success: true,
      message: "Alivio actualizado exitosamente",
      data: updateData,
    });
  } catch (error) {
    console.error("❌ Error actualizando alivio:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar el alivio",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un alivio
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restauranteId = searchParams.get("restauranteId");
    const servicioId = searchParams.get("servicioId");

    if (!restauranteId || !servicioId) {
      return NextResponse.json(
        { error: "restauranteId y servicioId son requeridos" },
        { status: 400 }
      );
    }

    console.log("🔍 API Alivios - Eliminando alivio:", {
      restauranteId,
      servicioId,
    });

    // Referencia al documento específico
    const servicioRef = doc(
      db,
      "restaurantes",
      restauranteId,
      "ServiciosComercio",
      servicioId
    );

    // Eliminar el documento
    await deleteDoc(servicioRef);

    console.log("✅ Alivio eliminado exitosamente");

    return NextResponse.json({
      success: true,
      message: "Alivio eliminado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error eliminando alivio:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar el alivio",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Función auxiliar para actualizar la caja registradora
async function actualizarCajaRegistradora(restauranteId, monto, motivo, fecha) {
  try {
    console.log("💰 Actualizando caja registradora:", { restauranteId, monto, motivo });

    // Obtener la primera caja registradora (asumiendo que hay una)
    const cajaRef = collection(db, "restaurantes", restauranteId, "CajaRegistradora");
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
    const nuevoApertura = aperturaActual - parseFloat(monto);

    // Preparar datos de extracción
    const extraccionData = {
      fecha: new Date(fecha),
      monto: monto.toString(),
      motivo: motivo,
    };

    // Actualizar el documento
    await updateDoc(cajaDoc.ref, {
      Apertura: nuevoApertura.toString(),
      Extraccion: {
        ...cajaData.Extraccion,
        [new Date().toISOString()]: extraccionData,
      },
      ultimaActualizacion: serverTimestamp(),
    });

    console.log("✅ Caja registradora actualizada exitosamente");
  } catch (error) {
    console.error("❌ Error actualizando caja registradora:", error);
    throw error;
  }
}

// Función auxiliar para actualizar el dinero virtual
async function actualizarDineroVirtual(restauranteId, monto, motivo, fecha) {
  try {
    console.log("💳 Actualizando dinero virtual:", { restauranteId, monto, motivo });

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
    const nuevoVirtual = virtualActual - parseFloat(monto);

    // Preparar datos de extracción virtual
    const extraccionVirtualData = {
      fecha: new Date(fecha),
      monto: monto.toString(),
      motivo: motivo,
    };

    // Actualizar el documento
    await updateDoc(dineroDoc.ref, {
      Virtual: nuevoVirtual.toString(),
      ExtraccionVirtual: {
        ...dineroData.ExtraccionVirtual,
        [new Date().toISOString()]: extraccionVirtualData,
      },
    });

    console.log("✅ Dinero virtual actualizado exitosamente");
  } catch (error) {
    console.error("❌ Error actualizando dinero virtual:", error);
    throw error;
  }
}
