import { NextResponse } from "next/server";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// GET - Obtener todas las compras
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

    const comprasRef = collection(db, "restaurantes", restauranteId, "compras");
    const q = query(comprasRef, orderBy("fechaCompra", "desc"));
    const querySnapshot = await getDocs(q);

    const compras = [];
    querySnapshot.forEach((doc) => {
      compras.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return NextResponse.json(compras);
  } catch (error) {
    console.error("Error obteniendo compras:", error);
    return NextResponse.json(
      { error: "Error al obtener las compras" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva compra
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      restauranteId,
      nombre,
      cantidad,
      precioUnitario,
      esConsumoFinal,
      categoria,
      subcategoria,
      precioVenta,
      uso,
      tipo,
    } = body;

    if (!restauranteId || !nombre || !cantidad || !precioUnitario) {
      return NextResponse.json(
        { error: "restauranteId, nombre, cantidad y precioUnitario son requeridos" },
        { status: 400 }
      );
    }

    const comprasRef = collection(db, "restaurantes", restauranteId, "compras");

    const nuevaCompra = {
      nombre: nombre.trim(),
      cantidad: Number(cantidad),
      precioUnitario: Number(precioUnitario),
      precioTotal: Number(cantidad) * Number(precioUnitario),
      esConsumoFinal: Boolean(esConsumoFinal),
      categoria: categoria || "",
      subcategoria: subcategoria || "",
      precioVenta: esConsumoFinal ? Number(precioVenta) : 0,
      uso: uso || "",
      tipo: tipo || "materia_prima",
      fechaCompra: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(comprasRef, nuevaCompra);

    // Si es consumo final, también agregar al stock
    if (esConsumoFinal) {
      const stockRef = collection(db, "restaurantes", restauranteId, "stock");
      
      const nuevoProducto = {
        nombre: nombre.trim(),
        tipo: categoria === "bebida" ? "bebida" : "alimento",
        categoria: categoria,
        subcategoria: subcategoria,
        stock: Number(cantidad),
        precio: Number(precioVenta),
        costo: Number(precioUnitario),
        imagen: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(stockRef, nuevoProducto);
      console.log("✅ Producto agregado al stock:", nombre);
    }

    return NextResponse.json({
      id: docRef.id,
      ...nuevaCompra,
    });
  } catch (error) {
    console.error("Error creando compra:", error);
    return NextResponse.json(
      { error: "Error al crear la compra" },
      { status: 500 }
    );
  }
}
