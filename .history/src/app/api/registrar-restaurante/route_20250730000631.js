import { db } from "../../../../lib/firebase";
import { doc, collection, setDoc, serverTimestamp } from "firebase/firestore";

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

    // 1. Guardar en la colección "codigosactivacion"
    const codigosRef = doc(collection(db, "codigosactivacion"));
    await setDoc(codigosRef, {
      codActivacion,
      email,
      password,
      cantUsuarios,
      finanzas,
      timestamp: serverTimestamp(),
    });

    // 2. Crear documento en "restaurantes" con nombre como ID
    const restauranteRef = doc(db, "restaurantes", restaurante);
    await setDoc(restauranteRef, {
      creadoEn: serverTimestamp(),
    });

    // 3. Subcolección "users"
    const userDoc = doc(collection(restauranteRef, "users"));
    await setDoc(userDoc, {
      email,
      password,
      usuario: restaurante,
      codActivacion,
    });

    // 4. Crear subcolección vacía "tables"
    const tablesRef = doc(collection(restauranteRef, "tables", "init"));
    await setDoc(tablesRef, { creado: serverTimestamp() });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("Error al registrar restaurante:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
