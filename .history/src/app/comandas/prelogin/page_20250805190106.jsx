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

                // Verificar si el documento admin ya existe
                const adminDocRef = doc(usersRef, "admin");
                const adminDocSnap = await getDoc(adminDocRef);

                if (!adminDocSnap.exists()) {
                  // Solo crear el documento si no existe
                  await setDoc(adminDocRef, {
                    usuario: "admin",
                    password: data.password,
                    rol: "admin",
                    imagen: data.logo || "",
                    fechaCreacion: new Date().toISOString(),
                    activo: true,
                    esAdmin: true,
                  });
                  console.log("✅ Documento admin creado exitosamente");
                } else {
                  console.log(
                    "✅ Documento admin ya existe, no se sobrescribe"
                  );
                }
              } catch (error) {
                console.log("Error al verificar/crear documento admin:", error);
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
