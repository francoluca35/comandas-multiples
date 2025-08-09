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

// GET - Obtener todas las bebidas
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

    // Obtener bebidas de ambas subcategorías
    const bebidas = [];

    // Obtener bebidas sin alcohol
    const sinAlcoholRef = collection(
      db,
      "restaurantes",
      restauranteId,
      "menus",
      "bebidas",
      "subcategorias",
      "sin_alcohol",
      "items"
    );
    const sinAlcoholQuery = query(sinAlcoholRef, orderBy("nombre"));
    const sinAlcoholSnapshot = await getDocs(sinAlcoholQuery);

    sinAlcoholSnapshot.forEach((doc) => {
      bebidas.push({
        id: doc.id,
        ...doc.data(),
        subcategoria: "sin alcohol",
      });
    });

    // Obtener bebidas con alcohol
    const conAlcoholRef = collection(
      db,
      "restaurantes",
      restauranteId,
      "menus",
      "bebidas",
      "subcategorias",
      "con_alcohol",
      "items"
    );
    const conAlcoholQuery = query(conAlcoholRef, orderBy("nombre"));
    const conAlcoholSnapshot = await getDocs(conAlcoholQuery);

    conAlcoholSnapshot.forEach((doc) => {
      bebidas.push({
        id: doc.id,
        ...doc.data(),
        subcategoria: "con alcohol",
      });
    });

    return NextResponse.json(bebidas);
  } catch (error) {
    console.error("Error obteniendo bebidas:", error);
    return NextResponse.json(
      { error: "Error al obtener las bebidas" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva bebida
export async function POST(request) {
  try {
    const body = await request.json();
    const { restauranteId, nombre, subcategoria, precio, stock, imagen } = body;

    if (!restauranteId || !nombre || !subcategoria) {
      return NextResponse.json(
        { error: "restauranteId, nombre y subcategoria son requeridos" },
        { status: 400 }
      );
    }

    // Determinar la ruta correcta según la subcategoría
    const subcategoriaPath =
      subcategoria === "con alcohol" ? "con_alcohol" : "sin_alcohol";
    const bebidasRef = collection(
      db,
      "restaurantes",
      restauranteId,
      "menus",
      "bebidas",
      "subcategorias",
      subcategoriaPath,
      "items"
    );

    const nuevaBebida = {
      nombre: nombre.trim(),
      precio: parseFloat(precio) || 0,
      stock: parseInt(stock) || 0,
      imagen: imagen || "",
      habilitada: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(bebidasRef, nuevaBebida);

    return NextResponse.json({
      id: docRef.id,
      ...nuevaBebida,
    });
  } catch (error) {
    console.error("Error creando bebida:", error);
    return NextResponse.json(
      { error: "Error al crear la bebida" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar bebida
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      restauranteId,
      bebidaId,
      nombre,
      subcategoria,
      precio,
      stock,
      imagen,
      habilitada,
    } = body;

    if (!restauranteId || !bebidaId) {
      return NextResponse.json(
        { error: "restauranteId y bebidaId son requeridos" },
        { status: 400 }
      );
    }

    const bebidaRef = doc(
      db,
      "restaurantes",
      restauranteId,
      "bebidas",
      bebidaId
    );

    const updateData = {
      updatedAt: serverTimestamp(),
    };

    if (nombre !== undefined) updateData.nombre = nombre.trim();
    if (subcategoria !== undefined)
      updateData.subcategoria = subcategoria.trim();
    if (precio !== undefined) updateData.precio = parseFloat(precio) || 0;
    if (stock !== undefined) updateData.stock = parseInt(stock) || 0;
    if (imagen !== undefined) updateData.imagen = imagen;
    if (habilitada !== undefined) updateData.habilitada = habilitada;

    await updateDoc(bebidaRef, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error actualizando bebida:", error);
    return NextResponse.json(
      { error: "Error al actualizar la bebida" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar bebida
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restauranteId = searchParams.get("restauranteId");
    const bebidaId = searchParams.get("bebidaId");

    if (!restauranteId || !bebidaId) {
      return NextResponse.json(
        { error: "restauranteId y bebidaId son requeridos" },
        { status: 400 }
      );
    }

    const bebidaRef = doc(
      db,
      "restaurantes",
      restauranteId,
      "bebidas",
      bebidaId
    );

    await deleteDoc(bebidaRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando bebida:", error);
    return NextResponse.json(
      { error: "Error al eliminar la bebida" },
      { status: 500 }
    );
  }
}
