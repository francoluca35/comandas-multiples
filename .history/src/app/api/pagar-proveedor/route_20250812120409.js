import { NextResponse } from "next/server";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// POST - Crear un nuevo pago a proveedor
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      restauranteId,
      fecha,
      proveedor,
      producto,
      costo,
      metodoPago,
      tipoPago,
    } = body;

    if (
      !restauranteId ||
      !fecha ||
      !proveedor ||
      !producto ||
      !costo ||
      !metodoPago ||
      !tipoPago
    ) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    console.log("🔍 API Pagar Proveedor - Creando pago:", {
      restauranteId,
      fecha,
      proveedor,
      producto,
      costo,
      metodoPago,
      tipoPago,
    });

    // Validar que el costo sea un número válido
    const costoNumero = parseFloat(costo);
    if (isNaN(costoNumero) || costoNumero <= 0) {
      return NextResponse.json(
        { error: "El costo debe ser un número mayor a 0" },
        { status: 400 }
      );
    }

    // Validar método de pago
    if (!["efectivo", "virtual"].includes(metodoPago)) {
      return NextResponse.json(
        { error: "Método de pago debe ser 'efectivo' o 'virtual'" },
        { status: 400 }
      );
    }

    // Validar tipo de pago
    if (!["contado", "credito"].includes(tipoPago)) {
      return NextResponse.json(
        { error: "Tipo de pago debe ser 'contado' o 'credito'" },
        { status: 400 }
      );
    }

    // Crear la fecha
    const fechaPago = new Date(fecha);
    const fechaISO = fechaPago.toISOString();

    // Preparar datos del pago
    const pagoData = {
      fecha: fechaPago,
      proveedor: proveedor.trim(),
      producto: producto.trim(),
      costo: costoNumero,
      metodoPago,
      tipoPago,
      timestamp: serverTimestamp(),
    };

    if (metodoPago === "efectivo") {
      // Pago en efectivo - actualizar CajaRegistradora
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
      if (aperturaActual < costoNumero) {
        return NextResponse.json(
          { error: "No hay suficiente efectivo disponible" },
          { status: 400 }
        );
      }

      // Calcular nuevo monto de apertura
      const nuevoApertura = aperturaActual - costoNumero;

      // Actualizar el documento de caja registradora
      await updateDoc(cajaDoc.ref, {
        Apertura: nuevoApertura.toString(),
        proveedores: {
          ...cajaData.proveedores,
          [fechaISO]: pagoData,
        },
        ultimaActualizacion: serverTimestamp(),
      });

      console.log("✅ Pago a proveedor en efectivo creado exitosamente:", {
        fecha: fechaISO,
        proveedor,
        producto,
        costo: costoNumero,
        nuevoApertura,
      });
    } else {
      // Pago virtual - actualizar Dinero
      const dineroRef = collection(db, "restaurantes", restauranteId, "Dinero");
      const dineroSnapshot = await getDocs(dineroRef);

      if (dineroSnapshot.empty) {
        return NextResponse.json(
          { error: "No hay documentos de dinero virtual disponibles" },
          { status: 404 }
        );
      }

      // Tomar el primer documento de dinero
      const dineroDoc = dineroSnapshot.docs[0];
      const dineroData = dineroDoc.data();

      // Verificar que hay suficiente dinero virtual
      const virtualActual = parseFloat(dineroData.Virtual || 0);
      if (virtualActual < costoNumero) {
        return NextResponse.json(
          { error: "No hay suficiente dinero virtual disponible" },
          { status: 400 }
        );
      }

      // Calcular nuevo monto virtual
      const nuevoVirtual = virtualActual - costoNumero;

      // Actualizar el documento de dinero
      await updateDoc(dineroDoc.ref, {
        Virtual: nuevoVirtual.toString(),
        ProveedorVirtual: {
          ...dineroData.ProveedorVirtual,
          [fechaISO]: pagoData,
        },
        ultimaActualizacion: serverTimestamp(),
      });

      console.log("✅ Pago a proveedor virtual creado exitosamente:", {
        fecha: fechaISO,
        proveedor,
        producto,
        costo: costoNumero,
        nuevoVirtual,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        fecha: fechaISO,
        proveedor,
        producto,
        costo: costoNumero,
        metodoPago,
        tipoPago,
      },
      message: "Pago a proveedor registrado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error creando pago a proveedor:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear el pago a proveedor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
