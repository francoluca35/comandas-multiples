import { NextResponse } from "next/server";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// GET - Obtener toda la materia prima
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

    const materiaPrimaRef = collection(
      db,
      "restaurantes",
      restauranteId,
      "materiaPrima"
    );
    const q = query(materiaPrimaRef, orderBy("nombre"));
    const querySnapshot = await getDocs(q);

    const materiaPrima = [];
    querySnapshot.forEach((doc) => {
      materiaPrima.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return NextResponse.json(materiaPrima);
  } catch (error) {
    console.error("Error obteniendo materia prima:", error);
    return NextResponse.json(
      { error: "Error al obtener la materia prima" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva materia prima
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      restauranteId,
      nombre,
      categoria,
      stock,
      precio,
      costo,
      imagen,
      esComida,
      esStock,
    } = body;

    if (!restauranteId || !nombre || !categoria) {
      return NextResponse.json(
        { error: "restauranteId, nombre y categoria son requeridos" },
        { status: 400 }
      );
    }

    const materiaPrimaRef = collection(
      db,
      "restaurantes",
      restauranteId,
      "materiaPrima"
    );

    const nuevaMateriaPrima = {
      nombre: nombre.trim(),
      tipo: "alimento", // Siempre será alimento
      categoria: categoria.trim(),
      stock: parseInt(stock) || 0,
      precio: parseFloat(precio) || 0,
      costo: parseFloat(costo) || 0,
      imagen: imagen || "",
      esComida: esComida || false,
      esStock: esStock || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(materiaPrimaRef, nuevaMateriaPrima);

    return NextResponse.json({
      id: docRef.id,
      ...nuevaMateriaPrima,
    });
  } catch (error) {
    console.error("Error creando materia prima:", error);
    return NextResponse.json(
      { error: "Error al crear la materia prima" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar materia prima
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      restauranteId,
      materiaPrimaId,
      nombre,
      categoria,
      stock,
      precio,
      costo,
      imagen,
      esComida,
      esStock,
    } = body;

    if (!restauranteId || !materiaPrimaId) {
      return NextResponse.json(
        { error: "restauranteId y materiaPrimaId son requeridos" },
        { status: 400 }
      );
    }

    const materiaPrimaRef = doc(
      db,
      "restaurantes",
      restauranteId,
      "materiaPrima",
      materiaPrimaId
    );
    const materiaPrimaDoc = await getDoc(materiaPrimaRef);

    if (!materiaPrimaDoc.exists()) {
      return NextResponse.json(
        { error: "Materia prima no encontrada" },
        { status: 404 }
      );
    }

    const updateData = {
      updatedAt: serverTimestamp(),
    };

    if (nombre !== undefined) updateData.nombre = nombre.trim();
    if (categoria !== undefined) updateData.categoria = categoria.trim();
    if (stock !== undefined) updateData.stock = parseInt(stock) || 0;
    if (precio !== undefined) updateData.precio = parseFloat(precio) || 0;
    if (costo !== undefined) updateData.costo = parseFloat(costo) || 0;
    if (imagen !== undefined) updateData.imagen = imagen;
    if (esComida !== undefined) updateData.esComida = esComida;
    if (esStock !== undefined) updateData.esStock = esStock;

    await updateDoc(materiaPrimaRef, updateData);

    return NextResponse.json({
      id: materiaPrimaId,
      ...updateData,
    });
  } catch (error) {
    console.error("Error actualizando materia prima:", error);
    return NextResponse.json(
      { error: "Error al actualizar la materia prima" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar materia prima
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restauranteId = searchParams.get("restauranteId");
    const materiaPrimaId = searchParams.get("materiaPrimaId");

    if (!restauranteId || !materiaPrimaId) {
      return NextResponse.json(
        { error: "restauranteId y materiaPrimaId son requeridos" },
        { status: 400 }
      );
    }

    const materiaPrimaRef = doc(
      db,
      "restaurantes",
      restauranteId,
      "materiaPrima",
      materiaPrimaId
    );
    const materiaPrimaDoc = await getDoc(materiaPrimaRef);

    if (!materiaPrimaDoc.exists()) {
      return NextResponse.json(
        { error: "Materia prima no encontrada" },
        { status: 404 }
      );
    }

    await deleteDoc(materiaPrimaRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando materia prima:", error);
    return NextResponse.json(
      { error: "Error al eliminar la materia prima" },
      { status: 500 }
    );
  }
}
