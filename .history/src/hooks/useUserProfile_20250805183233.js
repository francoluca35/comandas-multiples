import { useState, useEffect } from "react";
import { useAuth } from "../app/context/AuthContext";

// Función para extraer URL directa de imagen desde URLs de Google Images
const extractDirectImageUrl = (url) => {
  if (!url) return "";

  // Si es una URL de Google Images, extraer la URL directa
  if (url.includes("google.com/imgres")) {
    try {
      const urlObj = new URL(url);
      const imgurl = urlObj.searchParams.get("imgurl");
      if (imgurl) {
        return decodeURIComponent(imgurl);
      }
    } catch (error) {
      console.error("Error parsing Google Images URL:", error);
    }
  }

  // Si no es una URL de Google Images, devolver la URL original
  return url;
};

export const useUserProfile = () => {
  const { usuario } = useAuth();
  const [userImage, setUserImage] = useState("");
  const [userInitials, setUserInitials] = useState("");

  useEffect(() => {
    const getUserProfile = () => {
      console.log("🔄 useUserProfile ejecutándose con usuario:", usuario);

      if (!usuario) {
        console.log("❌ No hay usuario, estableciendo valores por defecto");
        setUserImage("");
        setUserInitials("U");
        return;
      }

      let imageUrl = "";
      let initials = "U";

      if (usuario.tipo === "restaurante") {
        // Para usuarios de restaurante
        imageUrl =
          localStorage.getItem("userImage") ||
          localStorage.getItem("imagen") ||
          localStorage.getItem("logo") ||
          "";
        initials = usuario.usuario?.charAt(0)?.toUpperCase() || "U";
        console.log("🏪 Usuario restaurante:", {
          usuario: usuario.usuario,
          initials,
          imageUrl,
        });
      } else if (usuario.tipo === "superadmin") {
        // Para superadmin
        imageUrl =
          localStorage.getItem("superadminImage") ||
          localStorage.getItem("imagen") ||
          "";
        initials = usuario.email?.charAt(0)?.toUpperCase() || "A";
        console.log("👑 Usuario superadmin:", {
          email: usuario.email,
          initials,
          imageUrl,
        });
      }

      // Extraer URL directa de imagen si es necesario
      const directImageUrl = extractDirectImageUrl(imageUrl);
      console.log("🖼️ URL de imagen procesada:", {
        original: imageUrl,
        processed: directImageUrl,
      });

      setUserImage(directImageUrl);
      setUserInitials(initials);
    };

    getUserProfile();
  }, [usuario]);

  return {
    userImage,
    userInitials,
    usuario,
  };
};
