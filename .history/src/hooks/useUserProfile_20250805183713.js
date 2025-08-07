import { useState, useEffect } from "react";
import { useAuth } from "../app/context/AuthContext";
import { getProfileImageUrl } from "../../lib/cloudinary";

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

      // Transformar URL a Cloudinary
      const cloudinaryUrl = getProfileImageUrl(imageUrl, 150);
      console.log("🖼️ URL de imagen procesada:", {
        original: imageUrl,
        cloudinary: cloudinaryUrl,
      });

      setUserImage(cloudinaryUrl);
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
