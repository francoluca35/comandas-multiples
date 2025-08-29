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
      background: "rgba(0, 0, 0, 0.9)",
      color: "#ffffff",
      confirmButtonColor: "#00ff88",
      confirmButtonText: "Continuar",
      showClass: {
        popup: 'animate__animated animate__fadeIn'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOut'
      },
      customClass: {
        popup: "rounded-xl shadow-lg border border-white border-opacity-20",
        title: "text-base font-bold text-white mb-1",
        content: "text-white text-xs",
        confirmButton: "rounded-md px-4 py-1.5 font-semibold text-black transition-all duration-300 hover:scale-105",
        icon: "text-2xl mb-1"
      },
      imageUrl: "/Assets/LogoApp.png",
      imageWidth: 35,
      imageHeight: 35,
      imageAlt: "Logo",
      imageClass: "rounded-full shadow-sm mb-1",
      timer: icon === "success" ? 1500 : undefined,
      timerProgressBar: false,
      toast: false,
      position: "center",
      width: "250px"
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

  // Pantalla de bienvenida intermedia
  const PantallaBienvenida = () => {
    useEffect(() => {
      // Redirigir automáticamente después de 2 segundos
      const timer = setTimeout(() => {
        router.push("/home-comandas/login");
      }, 2000);

      return () => clearTimeout(timer);
    }, [router]);

    return (
      <div 
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: "url('/Assets/fondo-prepre.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Loader simple */}
        <div className="relative z-10 text-center">
          {/* Spinner */}
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          
          {/* Texto de carga */}
          <p className="text-white text-lg font-medium">Cargando...</p>
        </div>
      </div>
    );
  };

  return (
    <PantallaBienvenida />
  );
}

export default PreLogin;
