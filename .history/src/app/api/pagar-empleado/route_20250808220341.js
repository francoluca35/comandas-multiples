import { NextResponse } from "next/server";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// POST - Crear un nuevo pago a empleado
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      restauranteId,
      fechaPago,
      nombreEmpleado,
      horasTrabajadas,
      diasTrabajados,
      sueldoPorHora,
      presentismo,
      subtotal,
      total,
    } = body;

    if (
      !restauranteId ||
      !fechaPago ||
      !nombreEmpleado ||
      !horasTrabajadas ||
      !diasTrabajados ||
      !sueldoPorHora ||
      subtotal === undefined ||
      total === undefined
    ) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    console.log("🔍 API Pagar Empleado - Creando pago:", {
      restauranteId,
      fechaPago,
      nombreEmpleado,
      horasTrabajadas,
      diasTrabajados,
      sueldoPorHora,
      presentismo,
      subtotal,
      total,
    });

    // Validar que los valores numéricos sean válidos
    const horasTrabajadasNum = parseFloat(horasTrabajadas);
    const diasTrabajadosNum = parseFloat(diasTrabajados);
    const sueldoPorHoraNum = parseFloat(sueldoPorHora);
    const subtotalNum = parseFloat(subtotal);
    const totalNum = parseFloat(total);

    if (
      isNaN(horasTrabajadasNum) ||
      isNaN(diasTrabajadosNum) ||
      isNaN(sueldoPorHoraNum) ||
      isNaN(subtotalNum) ||
      isNaN(totalNum) ||
      horasTrabajadasNum <= 0 ||
      diasTrabajadosNum <= 0 ||
      sueldoPorHoraNum <= 0 ||
      subtotalNum <= 0 ||
      totalNum <= 0
    ) {
      return NextResponse.json(
        { error: "Los valores numéricos deben ser mayores a 0" },
        { status: 400 }
      );
    }

    // Crear la fecha de pago
    const fechaPagoDate = new Date(fechaPago);
    const fechaISO = fechaPagoDate.toISOString();

    // Preparar datos del pago
    const pagoData = {
      fechaPago: fechaPagoDate,
      nombreEmpleado: nombreEmpleado.trim(),
      horasTrabajadas: horasTrabajadasNum,
      diasTrabajados: diasTrabajadosNum,
      sueldoPorHora: sueldoPorHoraNum,
      presentismo: Boolean(presentismo),
      subtotal: subtotalNum,
      total: totalNum,
      timestamp: serverTimestamp(),
    };

    // Crear o actualizar el documento del empleado
    const empleadoRef = doc(
      db,
      "restaurantes",
      restauranteId,
      "SueldoEmpleados",
      nombreEmpleado.trim()
    );

    // Obtener el documento actual del empleado si existe
    const empleadoDoc = await getDocs(
      collection(db, "restaurantes", restauranteId, "SueldoEmpleados")
    );

    let empleadoData = {};
    let empleadoExiste = false;

    empleadoDoc.forEach((doc) => {
      if (doc.id === nombreEmpleado.trim()) {
        empleadoData = doc.data();
        empleadoExiste = true;
      }
    });

    // Agregar el nuevo pago al historial del empleado
    const historialPagos = empleadoExiste ? empleadoData.historialPagos || {} : {};
    historialPagos[fechaISO] = pagoData;

    // Actualizar o crear el documento del empleado
    await setDoc(empleadoRef, {
      nombreEmpleado: nombreEmpleado.trim(),
      historialPagos,
      ultimaActualizacion: serverTimestamp(),
    });

    console.log("✅ Pago a empleado creado exitosamente:", {
      fecha: fechaISO,
      nombreEmpleado,
      horasTrabajadas: horasTrabajadasNum,
      diasTrabajados: diasTrabajadosNum,
      sueldoPorHora: sueldoPorHoraNum,
      presentismo: Boolean(presentismo),
      subtotal: subtotalNum,
      total: totalNum,
    });

    return NextResponse.json({
      success: true,
      data: {
        fecha: fechaISO,
        nombreEmpleado,
        horasTrabajadas: horasTrabajadasNum,
        diasTrabajados: diasTrabajadosNum,
        sueldoPorHora: sueldoPorHoraNum,
        presentismo: Boolean(presentismo),
        subtotal: subtotalNum,
        total: totalNum,
      },
      message: "Pago a empleado registrado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error creando pago a empleado:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear el pago a empleado",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
