import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// GET - Obtener todos los sueldos de empleados
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
      "🔍 API Sueldos - Obteniendo sueldos para restaurante:",
      restauranteId
    );

    // Obtener todos los documentos de la colección SueldoEmpleados
    const sueldosRef = collection(
      db,
      "restaurantes",
      restauranteId,
      "SueldoEmpleados"
    );
    const sueldosSnapshot = await getDocs(sueldosRef);

    const sueldos = [];
    sueldosSnapshot.forEach((doc) => {
      const data = doc.data();
      sueldos.push({
        id: doc.id,
        nombreEmpleado: data.nombreEmpleado || doc.id,
        historialPagos: data.historialPagos || {},
        ultimaActualizacion: data.ultimaActualizacion,
      });
    });

    console.log("✅ Sueldos obtenidos exitosamente:", {
      cantidadEmpleados: sueldos.length,
      totalSueldos: sueldos.reduce((sum, empleado) => {
        if (
          empleado.historialPagos &&
          typeof empleado.historialPagos === "object"
        ) {
          const empleadoTotal = Object.values(empleado.historialPagos).reduce(
            (empleadoSum, pago) => {
              return empleadoSum + (parseFloat(pago.total) || 0);
            },
            0
          );
          return sum + empleadoTotal;
        }
        return sum;
      }, 0),
    });

    return NextResponse.json({
      success: true,
      data: sueldos,
      message: "Sueldos obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo sueldos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener sueldos",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
