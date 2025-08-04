"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

function PreLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codActivacion, setCodActivacion] = useState("");
  const [recordarUsuario, setRecordarUsuario] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const router = useRouter();

  const mostrarAlerta = ({ title, text, icon = "success" }) => {
    return MySwal.fire({
      title,
      text,
      icon,
      background: "#1d253c",
      color: "#ffffff",
      confirmButtonColor: "#00ff88",
      confirmButtonText: "Continuar",
      customClass: {
        popup: "rounded-xl shadow-lg",
      },
      imageUrl: "/Assets/LogoApp.png",
      imageWidth: 80,
      imageHeight: 80,
      imageAlt: "Logo",
    });
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("recordedEmail");
    const rememberedCod = localStorage.getItem("recordedCod");

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRecordarUsuario(true);
    }

    if (rememberedCod) {
      setCodActivacion(rememberedCod);
    }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (intentos >= 3) {
      mostrarAlerta({
        title: "Acceso bloqueado",
        text: "Demasiados intentos fallidos.",
        icon: "error",
      });
      return;
    }

    try {
      const cod = codActivacion.toLowerCase().trim();
      const docRef = doc(db, "codigosactivacion", cod);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        if (data.email === email && data.password === password) {
          mostrarAlerta({
            title: `Bienvenido ${data.resto.toUpperCase()}`,
            text: `Tienes ${data.cantUsuarios} Usuarios permitidos!`,
            icon: "success",
          }).then(() => {
            if (recordarUsuario) {
              localStorage.setItem("recordedEmail", email);
              localStorage.setItem("recordedCod", codActivacion);
              localStorage.setItem("nombreResto", data.resto);
            } else {
              localStorage.removeItem("recordedEmail");
              localStorage.removeItem("recordedCod");
              localStorage.removeItem("nombreResto");
            }

            router.push("/home-comandas/login");
          });
        } else {
          setIntentos((prev) => prev + 1);
          mostrarAlerta({
            title: "Error",
            text: "Email o contraseña incorrectos.",
            icon: "error",
          });
        }
      } else {
        setIntentos((prev) => prev + 1);
        mostrarAlerta({
          title: "Código inválido",
          text: "Código de activación inválido.",
          icon: "warning",
        });
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      mostrarAlerta({
        title: "Error interno",
        text: "Ocurrió un error. Intenta nuevamente.",
        icon: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
      <div className="bg-[#0c14499b] text-white w-full max-w-sm p-6 rounded shadow-md flex flex-col items-center">
        <img src="/Assets/LogoApp.png" alt="Logo" className="w-28 h-28 mb-4" />
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#1d253c] text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#1d253c] text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Código Activación
            </label>
            <input
              type="text"
              required
              value={codActivacion}
              onChange={(e) => setCodActivacion(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#1d253c] text-white focus:outline-none"
            />
          </div>
          <div className="flex items-center text-sm">
            <input
              type="checkbox"
              id="recordar"
              checked={recordarUsuario}
              onChange={() => setRecordarUsuario(!recordarUsuario)}
              className="mr-2"
            />
            <label htmlFor="recordar">¿Querés recordar usuario?</label>
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default PreLogin;
