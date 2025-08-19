import { db } from "../../../../../lib/firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

// Función helper para generar ID del restaurante
const generarRestauranteId = (nombre) => {
  return nombre
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
};

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
    const restauranteId =
      dataCod.restauranteId || generarRestauranteId(nombreRestaurante);

    console.log("✅ Restaurante detectado:", nombreRestaurante);
    console.log("🆔 ID del restaurante:", restauranteId);

    // Convertir imagen a base64
    const buffer = Buffer.from(await foto.arrayBuffer());
    const base64String = buffer.toString("base64");

    // Subir a Cloudinary
    console.log("☁️ Subiendo imagen a Cloudinary...");

    // Usar el cloud_name hardcodeado como fallback si no hay variable de entorno
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "diwlchtx1";
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default";

    console.log("🔧 Cloudinary config:", { cloudName, uploadPreset });

    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", `data:${foto.type};base64,${base64String}`);
    cloudinaryForm.append("upload_preset", uploadPreset);

    const resCloudinary = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryForm,
      }
    );

    const cloudinaryData = await resCloudinary.json();

    if (cloudinaryData.error) {
      console.error("❌ Error al subir imagen:", cloudinaryData.error);

      // Manejar errores específicos de Cloudinary
      let errorMessage = "Error al subir imagen";

      if (cloudinaryData.error.message === "cloud_name is disabled") {
        errorMessage =
          "Error de configuración de Cloudinary. Contacta al administrador.";
      } else if (cloudinaryData.error.message.includes("upload_preset")) {
        errorMessage = "Error en la configuración de subida de imágenes.";
      } else {
        errorMessage = `Error al subir imagen: ${cloudinaryData.error.message}`;
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    if (!cloudinaryData.secure_url) {
      console.error("❌ Cloudinary no devolvió secure_url");
      return NextResponse.json(
        { error: "No se pudo obtener la URL de la imagen." },
        { status: 500 }
      );
    }

    console.log("📝 Guardando usuario en Firestore...");
    console.log(
      "📍 Ruta del usuario:",
      `restaurantes/${restauranteId}/users/${usuario}`
    );

    await setDoc(doc(db, `restaurantes/${restauranteId}/users/${usuario}`), {
      nombreCompleto,
      usuario,
      email,
      password,
      rol,
      imagen: cloudinaryData.secure_url,
      codActivacion,
      creado: Date.now(),
    });

    console.log("✅ Registro exitoso");
    return NextResponse.json({
      success: true,
      restauranteId: restauranteId,
      nombre: nombreRestaurante,
    });
  } catch (error) {
    console.error("❌ Error interno:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
