import { db } from "../../../../../lib/firebase";
import { setDoc, doc, collection } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const {
      restaurante,
      email,
      password,
      codActivacion,
      cantUsuarios,
      finanzas,
    } = await req.json();

    const timestamp = new Date().toISOString();

    // 1. Guardar en codigosactivacion
    await setDoc(doc(db, "codigosactivacion", codActivacion), {
      codActivacion,
      email,
      password,
      cantUsuarios,
      finanzas,
      timestamp,
    });

    // 2. Crear documento del restaurante
    await setDoc(doc(db, "restaurantes", restaurante), {
      creadoEn: timestamp,
      nombre: restaurante,
    });

    // 3. Crear subcolección users
    await setDoc(doc(db, "restaurantes", restaurante, "users", "admin"), {
      email,
      password,
      usuario: restaurante,
      codActivacion,
    });

    // 4. Crear subcolección tables con un doc por defecto
    await setDoc(doc(db, "restaurantes", restaurante, "tables", "default"), {
      mesa: 0,
      estado: "libre",
    });

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Error inesperado" },
      { status: 500 }
    );
  }
}
