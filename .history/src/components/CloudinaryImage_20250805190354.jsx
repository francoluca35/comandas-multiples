"use client";
import React, { useState } from "react";
import { getProfileImageUrl } from "../../lib/cloudinary";

const CloudinaryImage = ({
  src,
  alt = "Imagen",
  size = 150,
  className = "",
  fallbackInitials = "U",
  onError,
  onLoad,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Transformar la URL a Cloudinary
  const cloudinaryUrl = getProfileImageUrl(src, size);

  // Calcular el tamaño en píxeles para las clases CSS
  const sizeClass = `w-${Math.round(size / 10)} h-${Math.round(size / 10)}`;
  
  // Si se proporciona className, usarla en lugar de sizeClass
  const finalClassName = className || sizeClass;

  console.log("🔍 CloudinaryImage renderizando:", {
    src,
    cloudinaryUrl,
    size,
    sizeClass,
    fallbackInitials,
  });

  const handleImageError = (e) => {
    console.log("❌ Error cargando imagen de Cloudinary:", cloudinaryUrl);
    setImageError(true);
    if (onError) onError(e);
  };

  const handleImageLoad = (e) => {
    console.log(
      "✅ Imagen cargada exitosamente desde Cloudinary:",
      cloudinaryUrl
    );
    setImageLoaded(true);
    if (onLoad) onLoad(e);
  };

  // Si no hay URL o hubo error, mostrar iniciales
  if (!src || imageError) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-slate-600 hover:border-slate-400 transition-all duration-300 ${className}`}
      >
        {fallbackInitials}
      </div>
    );
  }

  return (
    <>
      <img
        src={cloudinaryUrl}
        alt={alt}
        className={`${sizeClass} rounded-full object-cover border-2 border-slate-600 hover:border-slate-400 transition-all duration-300 ${className}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: imageError ? "none" : "block" }}
      />
      {/* Fallback que se muestra si la imagen falla */}
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-slate-600 hover:border-slate-400 transition-all duration-300 ${className}`}
        style={{ display: imageError ? "flex" : "none" }}
      >
        {fallbackInitials}
      </div>
    </>
  );
};

export default CloudinaryImage;
