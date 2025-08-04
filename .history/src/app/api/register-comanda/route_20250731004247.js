import { NextResponse } from "next/server";
import { db } from "@/firebaseConfig"; // importa tu conexión a Firebase
import { v4 as uuidv4 } from "uuid";
import { ref, setDoc, doc } from "firebase/firestore";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const data = await req.formData();
    const nombreCompleto = data.get("nombreCompleto");
    const usuario = data.get("usuario");
    const email = data.get("email");
    const password = data.get("password");
    const rol = data.get("rol");
    const file = data.get("foto");

    // Validación
    if (!file || file.size > 1024 * 1024) {
      return NextResponse.json(
        { error: "Imagen requerida (máx. 1MB)" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir imagen a Cloudinary
    const uploadRes = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "comandas",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    const logoUrl = uploadRes.secure_url;
    const codActivacion = uuidv4().slice(0, 6); // o puedes usar uno fijo si es necesario
    const restaurante = "francomputer"; // o capturado dinámicamente

    await setDoc(doc(db, `restaurantes/${restaurante}/users`, usuario), {
      usuario,
      nombreCompleto,
      email,
      password,
      rol,
      logo: logoUrl,
      codActivacion,
      creadoEn: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ERROR:", err);
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}
