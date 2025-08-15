import { db } from "../../../../lib/firebase";
import { setDoc, doc, collection, addDoc, serverTimestamp } from "firebase/firestore";
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

    // 5. Crear caja registradora inicial
    const cajaRef = collection(db, "restaurantes", restaurante, "CajaRegistradora");
    await addDoc(cajaRef, {
      Apertura: "0",
      Cierre: "",
      Extraccion: {},
      Ingresos: {},
      ultimaActualizacion: serverTimestamp(),
    });

    // 6. Crear documento de dinero virtual inicial
    const dineroRef = collection(db, "restaurantes", restaurante, "Dinero");
    await addDoc(dineroRef, {
      Virtual: "0",
      IngresosVirtual: {},
      EgresosVirtual: {},
      ultimaActualizacion: serverTimestamp(),
    });

    console.log("✅ Restaurante registrado con caja registradora y dinero virtual inicial");

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("❌ Error registrando restaurante:", err);
    return NextResponse.json(
      { error: err.message || "Error inesperado" },
      { status: 500 }
    );
  }
}
