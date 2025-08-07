// Ejemplo de configuración de Cloudinary
// Copia este archivo como .env.local y reemplaza los valores con tus credenciales

// Variables de entorno necesarias:
// NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
// CLOUDINARY_API_KEY=tu-api-key
// CLOUDINARY_API_SECRET=tu-api-secret

// Para obtener estas credenciales:
// 1. Ve a https://cloudinary.com/
// 2. Crea una cuenta gratuita
// 3. Ve a Dashboard
// 4. Copia tu Cloud Name, API Key y API Secret
// 5. Crea un archivo .env.local en la raíz del proyecto
// 6. Agrega las variables con tus valores reales

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
}; 