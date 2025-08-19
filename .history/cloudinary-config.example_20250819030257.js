// Ejemplo de configuración de Cloudinary
// Copia este archivo como .env.local y configura tus variables

// Variables de entorno necesarias para Cloudinary:
// CLOUDINARY_CLOUD_NAME=tu-cloud-name
// NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
// CLOUDINARY_API_KEY=tu-api-key
// CLOUDINARY_API_SECRET=tu-api-secret
// CLOUDINARY_UPLOAD_PRESET=tu-upload-preset

// Configuración actual del proyecto:
const config = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "diwlchtx1",
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default"
};

console.log("🔧 Cloudinary Config:", config);

module.exports = config;
