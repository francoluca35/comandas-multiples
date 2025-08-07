// Configuración de Cloudinary
const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "your-cloud-name";

// Función para transformar URLs de imágenes a Cloudinary
export const transformToCloudinaryUrl = (originalUrl, options = {}) => {
  if (!originalUrl) return null;

  // Si ya es una URL de Cloudinary, devolverla tal como está
  if (originalUrl.includes("cloudinary.com")) {
    return originalUrl;
  }

  // Si es una URL de Google Images, extraer la URL directa primero
  let directUrl = originalUrl;
  if (originalUrl.includes("google.com/imgres")) {
    try {
      const urlObj = new URL(originalUrl);
      const imgurl = urlObj.searchParams.get("imgurl");
      if (imgurl) {
        directUrl = decodeURIComponent(imgurl);
      }
    } catch (error) {
      console.error("Error parsing Google Images URL:", error);
      return null;
    }
  }

  // Configuración por defecto para imágenes de perfil
  const defaultOptions = {
    width: 150,
    height: 150,
    crop: "fill",
    gravity: "face",
    quality: "auto",
    format: "auto",
    ...options,
  };

  // Construir la URL de Cloudinary
  const transformations = [
    `w_${defaultOptions.width}`,
    `h_${defaultOptions.height}`,
    `c_${defaultOptions.crop}`,
    `g_${defaultOptions.gravity}`,
    `q_${defaultOptions.quality}`,
    `f_${defaultOptions.format}`,
  ].join(",");

  // Si es una URL externa, usar fetch_url
  if (directUrl.startsWith("http")) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transformations}/${encodeURIComponent(
      directUrl
    )}`;
  }

  // Si es un ID de Cloudinary, usar la transformación directa
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${directUrl}`;
};

// Función para obtener URL de imagen de perfil optimizada
export const getProfileImageUrl = (imageUrl, size = 150) => {
  return transformToCloudinaryUrl(imageUrl, {
    width: size,
    height: size,
    crop: "fill",
    gravity: "face",
    quality: "auto",
    format: "auto",
  });
};

// Función para subir imagen a Cloudinary (requiere configuración adicional)
export const uploadToCloudinary = async (file) => {
  // Esta función requeriría configuración adicional del servidor
  // Por ahora, solo es un placeholder
  console.log("Upload to Cloudinary not implemented yet");
  return null;
};
