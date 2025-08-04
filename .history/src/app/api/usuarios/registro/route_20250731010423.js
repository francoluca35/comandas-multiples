import { NextResponse } from "next/server";
import { db } from "../../../../../lib/firebase";
import { getDoc, doc, setDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    console.log("📨 Recibiendo datos del formulario...");
    const formData = await req.formData();

    const codActivacion = formData.get("codActivacion");
    const nombreCompleto = formData.get("nombreCompleto");
    const usuario = formData.get("usuario");
    const email = formData.get("email");
    const password = formData.get("password");
    const rol = formData.get("rol");
    const foto = formData.get("foto");

    if (!codActivacion || !usuario || !email || !password || !foto) {
      console.error("❌ Faltan datos obligatorios");
      return NextResponse.json(
        { error: "Faltan datos obligatorios." },
        { status: 400 }
      );
    }

    console.log("🔍 Verificando código de activación...");
    const codDoc = await getDoc(doc(db, "codigosactivacion", codActivacion));
    if (!codDoc.exists()) {
      console.error("❌ Código inválido");
      return NextResponse.json({ error: "Código inválido." }, { status: 404 });
    }

    const dataCod = codDoc.data();
    const nombreRestaurante = dataCod.resto;
    console.log("✅ Restaurante detectado:", nombreRestaurante);

    // Convertir imagen a base64
    const buffer = Buffer.from(await foto.arrayBuffer());
    const base64String = buffer.toString("base64");

    // Subir a Cloudinary
    console.log("☁️ Subiendo imagen a Cloudinary...");
    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", `data:${foto.type};base64,${base64String}`);
    cloudinaryForm.append(
      "upload_preset",
      process.env.CLOUDINARY_UPLOAD_PRESET
    );

    const resCloudinary = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: cloudinaryForm,
      }
    );

    const cloudinaryData = await resCloudinary.json();

    if (cloudinaryData.error) {
      console.error("❌ Error al subir imagen:", cloudinaryData.error.message);
      return NextResponse.json(
        { error: "Error al subir imagen: " + cloudinaryData.error.message },
        { status: 500 }
      );
    }

    if (!cloudinaryData.secure_url) {
      console.error("❌ Cloudinary no devolvió secure_url");
      return NextResponse.json(
        { error: "No se pudo obtener la URL de la imagen." },
        { status: 500 }
      );
    }

    console.log("📝 Guardando usuario en Firestore...");
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

    console.log("✅ Registro exitoso");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error interno:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
