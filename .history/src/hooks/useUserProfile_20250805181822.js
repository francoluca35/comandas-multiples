import { useState, useEffect } from "react";
import { useAuth } from "../app/context/AuthContext";

export const useUserProfile = () => {
  const { usuario } = useAuth();
  const [userImage, setUserImage] = useState("");
  const [userInitials, setUserInitials] = useState("");

  useEffect(() => {
    const getUserProfile = () => {
      if (!usuario) {
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
      } else if (usuario.tipo === "superadmin") {
        // Para superadmin
        imageUrl =
          localStorage.getItem("superadminImage") ||
          localStorage.getItem("imagen") ||
          "";
        initials = usuario.email?.charAt(0)?.toUpperCase() || "A";
      }

      setUserImage(imageUrl);
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
