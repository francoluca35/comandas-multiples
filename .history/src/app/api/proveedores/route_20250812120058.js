import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";

// GET - Obtener todos los pagos a proveedores
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
      "🔍 API Proveedores - Obteniendo pagos a proveedores para restaurante:",
      restauranteId
    );

    const proveedores = [];

    // Obtener pagos en efectivo de CajaRegistradora
    try {
      const cajaRef = collection(
        db,
        "restaurantes",
        restauranteId,
        "CajaRegistradora"
      );
      const cajaSnapshot = await getDocs(cajaRef);

      cajaSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.proveedores && typeof data.proveedores === "object") {
          proveedores.push({
            id: doc.id,
            historialPagos: data.proveedores,
            ultimaActualizacion: data.ultimaActualizacion,
            tipo: "efectivo",
          });
        }
      });
    } catch (error) {
      console.log(
        "ℹ️ Colección CajaRegistradora no existe aún para proveedores"
      );
    }

    // Obtener pagos virtuales de Dinero
    try {
      const dineroRef = collection(db, "restaurantes", restauranteId, "Dinero");
      const dineroSnapshot = await getDocs(dineroRef);

      dineroSnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.ProveedorVirtual &&
          typeof data.ProveedorVirtual === "object"
        ) {
          proveedores.push({
            id: doc.id,
            historialPagos: data.ProveedorVirtual,
            ultimaActualizacion: data.ultimaActualizacion,
            tipo: "virtual",
          });
        }
      });
    } catch (error) {
      console.log(
        "ℹ️ Colección Dinero no existe aún para proveedores virtuales"
      );
    }

    console.log("✅ Pagos a proveedores obtenidos exitosamente:", {
      cantidadProveedores: proveedores.length,
      totalProveedores: proveedores.reduce((sum, proveedor) => {
        if (
          proveedor.historialPagos &&
          typeof proveedor.historialPagos === "object"
        ) {
          const proveedorTotal = Object.values(proveedor.historialPagos).reduce(
            (proveedorSum, pago) => {
              return proveedorSum + (parseFloat(pago.costo) || 0);
            },
            0
          );
          return sum + proveedorTotal;
        }
        return sum;
      }, 0),
    });

    return NextResponse.json({
      success: true,
      data: proveedores,
      message: "Pagos a proveedores obtenidos exitosamente",
    });
  } catch (error) {
    console.error("❌ Error obteniendo pagos a proveedores:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener pagos a proveedores",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
