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

    console.log("🔍 API Alivios - Obteniendo alivios para restaurante:", restauranteId);

    // Referencia a la colección ServiciosComercio
    const serviciosRef = collection(db, "restaurantes", restauranteId, "ServiciosComercio");
    
    // Obtener todos los documentos de servicios
    const serviciosSnapshot = await getDocs(serviciosRef);
    
    if (serviciosSnapshot.empty) {
      console.log("📭 No hay servicios registrados");
      return NextResponse.json({
        success: true,
        data: {
          servicios: [],
          totalAlivios: 0,
          alivios: []
        }
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
      const nombreServicio = Object.keys(servicioData.tipodeservicio || {})[0] || "Sin nombre";
      
      // Calcular total de alivios para este servicio
      let totalServicio = 0;
      const pagosServicio = [];
      
      if (servicioData.tipodeservicio && servicioData.tipodeservicio[nombreServicio]) {
        const servicio = servicioData.tipodeservicio[nombreServicio];
        
        if (servicio.monto && !isNaN(parseFloat(servicio.monto))) {
          totalServicio = parseFloat(servicio.monto);
          totalAlivios += totalServicio;
        }
        
        pagosServicio.push({
          fechadepago: servicio.fechadepago || null,
          monto: servicio.monto || "",
          tipodepago: servicio.tipodepago || "",
          nombreServicio: nombreServicio
        });
      }
      
      servicios.push({
        id: doc.id,
        nombre: nombreServicio,
        total: totalServicio
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
        alivios: alivios
      }
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
    const { restauranteId, nombreServicio, monto, tipodepago } = body;

    if (!restauranteId || !nombreServicio || !monto || !tipodepago) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    console.log("🔍 API Alivios - Creando alivio:", { restauranteId, nombreServicio, monto, tipodepago });

    // Referencia a la colección ServiciosComercio
    const serviciosRef = collection(db, "restaurantes", restauranteId, "ServiciosComercio");
    
    // Crear el nuevo documento de servicio
    const nuevoServicio = {
      tipodeservicio: {
        [nombreServicio]: {
          fechadepago: serverTimestamp(),
          monto: monto.toString(),
          tipodepago: tipodepago
        }
      }
    };

    // Agregar el documento
    const docRef = await addDoc(serviciosRef, nuevoServicio);

    console.log("✅ Alivio creado exitosamente con ID:", docRef.id);

    return NextResponse.json({
      success: true,
      message: "Alivio creado exitosamente",
      data: {
        id: docRef.id,
        ...nuevoServicio
      }
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
    const { restauranteId, servicioId, nombreServicio, monto, tipodepago } = body;

    if (!restauranteId || !servicioId || !nombreServicio || !monto || !tipodepago) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    console.log("🔍 API Alivios - Actualizando alivio:", { restauranteId, servicioId, nombreServicio });

    // Referencia al documento específico
    const servicioRef = doc(db, "restaurantes", restauranteId, "ServiciosComercio", servicioId);
    
    const updateData = {
      [`tipodeservicio.${nombreServicio}`]: {
        fechadepago: serverTimestamp(),
        monto: monto.toString(),
        tipodepago: tipodepago
      }
    };

    // Actualizar el documento
    await updateDoc(servicioRef, updateData);

    console.log("✅ Alivio actualizado exitosamente");

    return NextResponse.json({
      success: true,
      message: "Alivio actualizado exitosamente",
      data: updateData
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

    console.log("🔍 API Alivios - Eliminando alivio:", { restauranteId, servicioId });

    // Referencia al documento específico
    const servicioRef = doc(db, "restaurantes", restauranteId, "ServiciosComercio", servicioId);
    
    // Eliminar el documento
    await deleteDoc(servicioRef);

    console.log("✅ Alivio eliminado exitosamente");

    return NextResponse.json({
      success: true,
      message: "Alivio eliminado exitosamente"
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
