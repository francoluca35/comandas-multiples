"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../../lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
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
      const cod = codActivacion.trim();
      const docRef = doc(db, "codigosactivacion", cod);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        if (data.email === email && data.password === password) {
          // Crear el ID del restaurante basado en el nombre (igual que en la API)
          const restauranteId = data.resto
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_|_$/g, "");

          console.log(
            "🔍 Buscando restaurante con ID generado:",
            restauranteId
          );

          // Verificar que el restaurante existe en la colección restaurantes
          try {
            const restauranteRef = doc(db, "restaurantes", restauranteId);
            const restauranteSnap = await getDoc(restauranteRef);

            if (restauranteSnap.exists()) {
              console.log("✅ Restaurante encontrado con ID:", restauranteId);

              // Crear la subcolección users si no existe
              try {
                const usersRef = collection(
                  db,
                  `restaurantes/${restauranteId}/users`
                );
                // Crear un documento inicial en la subcolección users para asegurar que existe
                await setDoc(doc(usersRef, "admin"), {
                  usuario: "admin",
                  password: data.password,
                  rol: "admin",
                  imagen: data.logo || "",
                  fechaCreacion: new Date().toISOString(),
                  activo: true,
                  esAdmin: true,
                });
                console.log("✅ Subcolección users creada exitosamente");
              } catch (error) {
                console.log(
                  "La subcolección users ya existe o hubo un error:",
                  error
                );
              }
            } else {
              console.error(
                "❌ Restaurante no encontrado con ID:",
                restauranteId
              );
              throw new Error("Restaurante no encontrado");
            }
          } catch (error) {
            console.error("❌ Error al verificar restaurante:", error);
            throw new Error("Error al verificar restaurante");
          }

          mostrarAlerta({
            title: `Bienvenido ${data.resto.toUpperCase()}`,
            text: `Tienes ${data.cantUsuarios} Usuarios permitidos!`,
            icon: "success",
          }).then(() => {
            if (recordarUsuario) {
              localStorage.setItem("recordedEmail", email);
              localStorage.setItem("recordedCod", codActivacion);
            } else {
              localStorage.removeItem("recordedEmail");
              localStorage.removeItem("recordedCod");
            }

            // Guardar información completa del restaurante
            localStorage.setItem("codActivacion", codActivacion);
            localStorage.setItem("nombreResto", data.resto);
            localStorage.setItem("emailResto", data.email);
            localStorage.setItem("cantUsuarios", data.cantUsuarios);
            localStorage.setItem("finanzas", data.finanzas);
            localStorage.setItem("logo", data.logo || "");

            if (restauranteId) {
              localStorage.setItem("restauranteId", restauranteId);
              console.log(
                "✅ RestauranteId guardado en localStorage:",
                restauranteId
              );
            } else {
              console.error(
                "❌ No se pudo guardar restauranteId - es null o vacío"
              );
              localStorage.removeItem("restauranteId");
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
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/Assets/fondo-prelogin.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Overlay oscuro para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      {/* Contenido principal */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Título de la app */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'cursive' }}>
            My Restaurant App
          </h1>
          <h2 className="text-xl text-white font-medium">Register</h2>
        </div>

        {/* Formulario */}
        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white border-opacity-20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Full Name */}
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-transparent border-b-2 border-white border-opacity-50 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-white transition-colors duration-300 py-2"
                />
              </div>
            </div>

            {/* Campo Email */}
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div className="flex-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-transparent border-b-2 border-white border-opacity-50 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-white transition-colors duration-300 py-2"
                />
              </div>
            </div>

            {/* Campo Password */}
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent border-b-2 border-white border-opacity-50 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-white transition-colors duration-300 py-2"
                />
              </div>
            </div>

            {/* Campo Código de Activación */}
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8A6 6 0 006 8c0 3.314-4.03 8-6 8s6 4.686 6 8a6 6 0 0012 0c0-3.314 4.03-8 6-8s-6 4.686-6 8z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  required
                  value={codActivacion}
                  onChange={(e) => setCodActivacion(e.target.value)}
                  placeholder="Código de Activación"
                  className="w-full bg-transparent border-b-2 border-white border-opacity-50 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-white transition-colors duration-300 py-2"
                />
              </div>
            </div>

            {/* Checkbox Recordar Usuario */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recordar"
                checked={recordarUsuario}
                onChange={() => setRecordarUsuario(!recordarUsuario)}
                className="w-4 h-4 text-orange-500 bg-transparent border-white border-opacity-50 rounded focus:ring-orange-500 focus:ring-2"
              />
              <label htmlFor="recordar" className="text-white text-sm">
                ¿Querés recordar usuario?
              </label>
            </div>

            {/* Botón Register */}
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-300 transform hover:scale-105 shadow-lg"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PreLogin;
