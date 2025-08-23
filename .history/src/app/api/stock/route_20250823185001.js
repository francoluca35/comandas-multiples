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

// GET - Obtener todos los productos del stock
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

    const stockRef = collection(db, "restaurantes", restauranteId, "stock");
    const q = query(stockRef, orderBy("nombre"));
    const querySnapshot = await getDocs(q);

    const productos = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Validar y limpiar los datos antes de enviarlos
      const producto = {
        id: doc.id,
        nombre: data.nombre || "",
        tipo: data.tipo || "alimento",
        categoria: data.categoria || "",
        subcategoria: data.subcategoria || "",
        stock: Number(data.stock) || 0,
        precio: Number(data.precio) || 0,
        costo: Number(data.costo) || 0,
        imagen: data.imagen || "",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
      productos.push(producto);
    });

    console.log("📦 Stock API - Productos obtenidos:", productos.length);
    console.log("📦 Stock API - Primer producto:", productos[0]);

    return NextResponse.json(productos);
  } catch (error) {
    console.error("Error obteniendo stock:", error);
    return NextResponse.json(
      { error: "Error al obtener el stock" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo producto en stock
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      restauranteId,
      nombre,
      tipo,
      categoria,
      subcategoria,
      stock,
      precio,
      costo,
      imagen,
    } = body;

    if (!restauranteId || !nombre || !categoria) {
      return NextResponse.json(
        { error: "restauranteId, nombre y categoria son requeridos" },
        { status: 400 }
      );
    }

    const stockRef = collection(db, "restaurantes", restauranteId, "stock");

    const nuevoProducto = {
      nombre: nombre.trim(),
      tipo: tipo || "alimento",
      categoria: categoria.trim(),
      subcategoria: subcategoria || "",
      stock: parseInt(stock) || 0,
      precio: parseFloat(precio) || 0,
      costo: parseFloat(costo) || 0,
      imagen: imagen || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(stockRef, nuevoProducto);

    return NextResponse.json({
      id: docRef.id,
      ...nuevoProducto,
    });
  } catch (error) {
    console.error("Error creando producto:", error);
    return NextResponse.json(
      { error: "Error al crear el producto" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto en stock
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      restauranteId,
      productoId,
      nombre,
      tipo,
      categoria,
      subcategoria,
      stock,
      precio,
      costo,
      imagen,
    } = body;

    if (!restauranteId || !productoId) {
      return NextResponse.json(
        { error: "restauranteId y productoId son requeridos" },
        { status: 400 }
      );
    }

    const productoRef = doc(
      db,
      "restaurantes",
      restauranteId,
      "stock",
      productoId
    );

    const updateData = {
      updatedAt: serverTimestamp(),
    };

    if (nombre !== undefined) updateData.nombre = nombre.trim();
    if (tipo !== undefined) updateData.tipo = tipo.trim();
    if (categoria !== undefined) updateData.categoria = categoria.trim();
    if (subcategoria !== undefined)
      updateData.subcategoria = subcategoria.trim();
    if (stock !== undefined) updateData.stock = parseInt(stock) || 0;
    if (precio !== undefined) updateData.precio = parseFloat(precio) || 0;
    if (costo !== undefined) updateData.costo = parseFloat(costo) || 0;
    if (imagen !== undefined) updateData.imagen = imagen;

    await updateDoc(productoRef, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error actualizando producto:", error);
    return NextResponse.json(
      { error: "Error al actualizar el producto" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto del stock
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restauranteId = searchParams.get("restauranteId");
    const productoId = searchParams.get("productoId");

    if (!restauranteId || !productoId) {
      return NextResponse.json(
        { error: "restauranteId y productoId son requeridos" },
        { status: 400 }
      );
    }

    const productoRef = doc(
      db,
      "restaurantes",
      restauranteId,
      "stock",
      productoId
    );

    await deleteDoc(productoRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    return NextResponse.json(
      { error: "Error al eliminar el producto" },
      { status: 500 }
    );
  }
}
