import { NextResponse } from "next/server";
import { db } from "../../../../../lib/firebase";
import { getDoc, doc, setDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const codActivacion = formData.get("codActivacion");
    const nombreCompleto = formData.get("nombreCompleto");
    const usuario = formData.get("usuario");
    const email = formData.get("email");
    const password = formData.get("password");
    const rol = formData.get("rol");
    const foto = formData.get("foto");

    if (!codActivacion || !usuario || !email || !password || !foto) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios." },
        { status: 400 }
      );
    }

    // Buscar el restaurante que coincide con el código
    const codDoc = await getDoc(doc(db, "codigosactivacion", codActivacion));

    if (!codDoc.exists()) {
      return NextResponse.json({ error: "Código inválido." }, { status: 404 });
    }

    const dataCod = codDoc.data();
    const nombreRestaurante = dataCod.resto;

    // Subir imagen a Cloudinary
    const buffer = Buffer.from(await foto.arrayBuffer());
    const base64String = buffer.toString("base64");

    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", `data:${foto.type};base64,${base64String}`);
    cloudinaryForm.append(
      "upload_preset",
      process.env.CLOUDINARY_UPLOAD_PRESET
    );

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: cloudinaryForm,
      }
    );

    const cloudinaryData = await cloudinaryRes.json();

    if (!cloudinaryData.secure_url) {
      return NextResponse.json(
        { error: "Error al subir imagen." },
        { status: 500 }
      );
    }

    // Guardar usuario en Firestore
    await setDoc(
      doc(db, `restaurantes/${nombreRestaurante}/users/${usuario}`),
      {
        nombreCompleto,
        usuario,
        email,
        password,
        rol,
        imagen: cloudinaryData.secure_url,
        codActivacion,
        creado: Date.now(),
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
