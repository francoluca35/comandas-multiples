import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";

// POST - Crear un nuevo restaurante
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      nombre,
      email,
      telefono,
      direccion,
      codigoActivacion,
      cantidadUsuarios,
      conFinanzas,
      password,
      logo,
    } = body;

    // Validar datos requeridos
    if (
      !nombre ||
      !email ||
      !telefono ||
      !direccion ||
      !codigoActivacion ||
      !cantidadUsuarios ||
      !password
    ) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos, incluyendo la contraseña" },
        { status: 400 }
      );
    }

    // Crear el documento del restaurante
    const restauranteData = {
      nombre,
      email,
      telefono,
      direccion,
      codigoActivacion,
      cantidadUsuarios: parseInt(cantidadUsuarios),
      conFinanzas: Boolean(conFinanzas),
      estado: "activo",
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };

    // Agregar a la colección de restaurantes
    const docRef = await addDoc(
      collection(db, "restaurantes"),
      restauranteData
    );

    // Crear la estructura inicial del restaurante en Firestore
    const restauranteId = docRef.id;

    // Crear la estructura de menús
    await setDoc(doc(db, "restaurantes", restauranteId, "menus", "comida"), {
      nombre: "Comida",
      activo: true,
      fechaCreacion: new Date().toISOString(),
    });

    await setDoc(doc(db, "restaurantes", restauranteId, "menus", "bebidas"), {
      nombre: "Bebidas",
      activo: true,
      fechaCreacion: new Date().toISOString(),
    });

    // Crear subcategorías iniciales para comida
    await setDoc(
      doc(
        db,
        "restaurantes",
        restauranteId,
        "menus",
        "comida",
        "subcategorias",
        "platos_principales"
      ),
      {
        nombre: "Platos Principales",
        activo: true,
        fechaCreacion: new Date().toISOString(),
      }
    );

    await setDoc(
      doc(
        db,
        "restaurantes",
        restauranteId,
        "menus",
        "comida",
        "subcategorias",
        "entradas"
      ),
      {
        nombre: "Entradas",
        activo: true,
        fechaCreacion: new Date().toISOString(),
      }
    );

    await setDoc(
      doc(
        db,
        "restaurantes",
        restauranteId,
        "menus",
        "comida",
        "subcategorias",
        "postres"
      ),
      {
        nombre: "Postres",
        activo: true,
        fechaCreacion: new Date().toISOString(),
      }
    );

    // Crear subcategorías iniciales para bebidas
    await setDoc(
      doc(
        db,
        "restaurantes",
        restauranteId,
        "menus",
        "bebidas",
        "subcategorias",
        "con_alcohol"
      ),
      {
        nombre: "Con Alcohol",
        activo: true,
        fechaCreacion: new Date().toISOString(),
      }
    );

    await setDoc(
      doc(
        db,
        "restaurantes",
        restauranteId,
        "menus",
        "bebidas",
        "subcategorias",
        "sin_alcohol"
      ),
      {
        nombre: "Sin Alcohol",
        activo: true,
        fechaCreacion: new Date().toISOString(),
      }
    );

    // Crear colección de mesas
    await setDoc(doc(db, "restaurantes", restauranteId, "tables", "mesa1"), {
      numero: 1,
      estado: "libre",
      cliente: "",
      productos: [],
      total: 0,
      fechaCreacion: new Date().toISOString(),
    });

    await setDoc(doc(db, "restaurantes", restauranteId, "tables", "mesa2"), {
      numero: 2,
      estado: "libre",
      cliente: "",
      productos: [],
      total: 0,
      fechaCreacion: new Date().toISOString(),
    });

    // Crear documento en codigosactivacion
    await setDoc(doc(db, "codigosactivacion", codigoActivacion), {
      resto: nombre,
      email: email,
      codActivacion: codigoActivacion,
      cantUsuarios: cantidadUsuarios.toString(),
      finanzas: conFinanzas,
      password: password,
      logo: logo || "",
      timestamp: new Date().toISOString(),
    });

    // Crear colección de usuarios
    await setDoc(doc(db, "usuarios", email), {
      email,
      rol: "admin",
      restauranteId,
      activo: true,
      fechaCreacion: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Restaurante creado exitosamente",
      restaurante: {
        id: restauranteId,
        ...restauranteData,
      },
    });
  } catch (error) {
    console.error("Error al crear restaurante:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Obtener restaurantes
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    // Aquí podrías implementar la lógica para obtener restaurantes
    // Por ahora retornamos un array vacío
    return NextResponse.json({
      success: true,
      restaurantes: [],
    });
  } catch (error) {
    console.error("Error al obtener restaurantes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
