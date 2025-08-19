import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "diwlchtx1",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

export async function POST(req) {
  try {
    const data = await req.formData();
    const nombreCompleto = data.get("nombreCompleto");
    const usuario = data.get("usuario");
    const email = data.get("email");
    const password = data.get("password");
    const rol = data.get("rol");
    const codActivacion = data.get("codActivacion");
    const file = data.get("foto");

    if (!codActivacion) {
      return NextResponse.json(
        { error: "Código de activación faltante" },
        { status: 400 }
      );
    }

    if (!file || file.size > 1024 * 1024) {
      return NextResponse.json(
        { error: "Imagen requerida (máx. 1MB)" },
        { status: 400 }
      );
    }

    // Buscar nombre del restaurante según codActivacion
    const restaurantesSnap = await getDocs(collection(db, "restaurantes"));
    let restaurante = null;

    restaurantesSnap.forEach((docSnap) => {
      if (docSnap.data().codActivacion === codActivacion) {
        restaurante = docSnap.id;
      }
    });

    if (!restaurante) {
      return NextResponse.json(
        { error: "Código de activación inválido" },
        { status: 404 }
      );
    }

    // Verificar si ya existe usuario o email repetido
    const usersSnap = await getDocs(
      collection(db, `restaurantes/${restaurante}/users`)
    );
    let usuarioExistente = false;

    usersSnap.forEach((doc) => {
      const d = doc.data();
      if (d.usuario === usuario || d.email === email) {
        usuarioExistente = true;
      }
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { error: "Ya existe un usuario o email igual en este restaurante" },
        { status: 409 }
      );
    }

    // Subir imagen a Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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

    // Usar el nombre de usuario como ID del documento, igual que en la otra API
    await setDoc(doc(db, `restaurantes/${restaurante}/users/${usuario}`), {
      usuario,
      nombreCompleto,
      email,
      password,
      rol,
      imagen: logoUrl, // Cambiar 'logo' por 'imagen' para consistencia
      codActivacion,
      creado: Date.now(), // Usar 'creado' en lugar de 'creadoEn' para consistencia
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
