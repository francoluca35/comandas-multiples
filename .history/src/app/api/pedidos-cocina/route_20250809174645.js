import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// GET - Obtener todos los pedidos de cocina
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restauranteId = searchParams.get("restauranteId");
    const estado = searchParams.get("estado"); // "pendiente", "en_preparacion", "listo"

    if (!restauranteId) {
      return NextResponse.json(
        { error: "restauranteId es requerido" },
        { status: 400 }
      );
    }

    let q = collection(db, `restaurantes/${restauranteId}/pedidosCocina`);
    
    if (estado) {
      q = query(q, where("estado", "==", estado));
    }
    
    q = query(q, orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(q);
    const pedidos = [];

    querySnapshot.forEach((doc) => {
      pedidos.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos de cocina:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo pedido de cocina
export async function POST(request) {
  try {
    const body = await request.json();
    const { restauranteId, mesa, productos, total, cliente, notas } = body;

    if (!restauranteId || !mesa || !productos || productos.length === 0) {
      return NextResponse.json(
        { error: "Datos incompletos para crear el pedido" },
        { status: 400 }
      );
    }

    const pedidoData = {
      mesa: mesa,
      productos: productos,
      total: total,
      cliente: cliente || "Sin nombre",
      notas: notas || "",
      estado: "pendiente", // pendiente, en_preparacion, listo
      timestamp: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, `restaurantes/${restauranteId}/pedidosCocina`),
      pedidoData
    );

    console.log("Pedido de cocina creado exitosamente:", docRef.id);

    return NextResponse.json({
      id: docRef.id,
      message: "Pedido de cocina creado exitosamente",
      ...pedidoData,
    });
  } catch (error) {
    console.error("Error al crear pedido de cocina:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar estado de un pedido de cocina
export async function PUT(request) {
  try {
    const body = await request.json();
    const { restauranteId, pedidoId, nuevoEstado } = body;

    if (!restauranteId || !pedidoId || !nuevoEstado) {
      return NextResponse.json(
        { error: "Datos incompletos para actualizar el pedido" },
        { status: 400 }
      );
    }

    const pedidoRef = doc(
      db,
      `restaurantes/${restauranteId}/pedidosCocina/${pedidoId}`
    );

    await updateDoc(pedidoRef, {
      estado: nuevoEstado,
      updatedAt: serverTimestamp(),
    });

    console.log("Estado del pedido actualizado exitosamente");

    return NextResponse.json({
      message: "Estado del pedido actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
