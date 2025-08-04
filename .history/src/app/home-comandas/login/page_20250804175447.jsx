"use client";
import React, { useEffect, useState } from "react";
import { FaUsers, FaSyncAlt, FaPlus } from "react-icons/fa";
import { db } from "../../../../lib/firebase";
import { collection, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

function Login() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [password, setPassword] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    usuario: "",
    password: "",
    rol: "usuario",
    imagen: "",
  });
  const [restauranteInfo, setRestauranteInfo] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const cargarRestauranteInfo = () => {
      const nombreResto = localStorage.getItem("nombreResto");
      const cantUsuarios = localStorage.getItem("cantUsuarios");
      const finanzas = localStorage.getItem("finanzas");
      const logo = localStorage.getItem("logo");

      if (nombreResto) {
        setRestauranteInfo({
          nombre: nombreResto,
          cantUsuarios: parseInt(cantUsuarios) || 1,
          finanzas: finanzas === "true",
          logo: logo || "",
        });
      }
    };

    cargarRestauranteInfo();
  }, []);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const nombreResto = localStorage.getItem("nombreResto");
        const codActivacion = localStorage.getItem("codActivacion");

        if (!nombreResto || !codActivacion) {
          router.push("/comandas/prelogin");
          return;
        }

        // Buscar el restaurante en la colección restaurantes usando nombre Y código
        const restaurantesRef = collection(db, "restaurantes");
        const restaurantesSnapshot = await getDocs(restaurantesRef);
        let restauranteId = null;

        restaurantesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (
            data.nombre === nombreResto &&
            data.codigoActivacion === codActivacion
          ) {
            restauranteId = doc.id;
          }
        });

        if (!restauranteId) {
          console.error("Restaurante no encontrado");
          return;
        }

        // Guardar el ID del restaurante en localStorage para uso futuro
        localStorage.setItem("restauranteId", restauranteId);

        // Obtener usuarios del restaurante específico
        const usersRef = collection(db, `restaurantes/${restauranteId}/users`);
        const snapshot = await getDocs(usersRef);
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsuarios(usersData);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    fetchUsuarios();
  }, [router]);

  const crearUsuario = async () => {
    try {
      const nombreResto = localStorage.getItem("nombreResto");
      const restauranteId = localStorage.getItem("restauranteId");
      
      if (!nombreResto || !restauranteId || !nuevoUsuario.usuario || !nuevoUsuario.password) {
        Swal.fire("Error", "Todos los campos son requeridos", "error");
        return;
      }

      // Verificar límite de usuarios
      if (usuarios.length >= restauranteInfo.cantUsuarios) {
        Swal.fire(
          "Error",
          `Solo puedes crear ${restauranteInfo.cantUsuarios} usuarios`,
          "error"
        );
        return;
      }

      // Crear usuario en el restaurante específico usando el ID guardado
      const usersRef = collection(db, `restaurantes/${restauranteId}/users`);
      await addDoc(usersRef, {
        usuario: nuevoUsuario.usuario,
        password: nuevoUsuario.password,
        rol: nuevoUsuario.rol,
        imagen: nuevoUsuario.imagen || "",
        fechaCreacion: new Date().toISOString(),
        activo: true,
      });

      // Recargar usuarios
      const snapshot = await getDocs(usersRef);
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(usersData);

      // Limpiar formulario
      setNuevoUsuario({
        usuario: "",
        password: "",
        rol: "usuario",
        imagen: "",
      });
      setMostrarFormulario(false);

      Swal.fire("Éxito", "Usuario creado correctamente", "success");
    } catch (error) {
      console.error("Error al crear usuario:", error);
      Swal.fire("Error", "Error al crear usuario", "error");
    }
  };

  const handleLogin = async () => {
    if (!usuarioSeleccionado) return;

    if (password === usuarioSeleccionado.password) {
      // Guardar datos del usuario logueado
      localStorage.setItem("usuario", usuarioSeleccionado.usuario);
      localStorage.setItem("rol", usuarioSeleccionado.rol);
      localStorage.setItem("usuarioId", usuarioSeleccionado.id);

      // Mostrar alerta personalizada con imagen y nombre
      await Swal.fire({
        title: `¡Bienvenido, ${usuarioSeleccionado.usuario}!`,
        text: `Rol: ${usuarioSeleccionado.rol}`,
        imageUrl:
          usuarioSeleccionado.imagen ||
          restauranteInfo?.logo ||
          "/Assets/LogoApp.png",
        imageWidth: 100,
        imageHeight: 100,
        imageAlt: "Foto de perfil",
        background: "#1c1c1c",
        color: "#fff",
        confirmButtonColor: "#4da6ff",
        confirmButtonText: "Entrar al sistema",
      });

      // Redirigir después de aceptar la alerta
      router.push("/home-comandas/home");
    } else {
      Swal.fire("Error", "Contraseña incorrecta", "error");
    }
  };

  if (!restauranteInfo) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center p-4">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex justify-center p-4">
      <div className="bg-[#1c1c1c] h-full p-6 rounded-lg shadow-lg w-[400px] text-white">
        <div className="flex items-center justify-center mb-4 text-white text-xl font-semibold">
          <FaUsers className="mr-2" />
          {restauranteInfo.nombre}
        </div>

        <div className="bg-[#2e2e2e] p-3 rounded mb-4">
          <p className="text-sm text-center mb-2">
            Usuarios: {usuarios.length}/{restauranteInfo.cantUsuarios}
          </p>
          {usuarios.length < restauranteInfo.cantUsuarios && (
            <button
              onClick={() => setMostrarFormulario(true)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold flex items-center justify-center gap-2"
            >
              <FaPlus />
              Crear Usuario
            </button>
          )}
        </div>

        {mostrarFormulario && (
          <div className="bg-[#2e2e2e] p-4 rounded mb-4">
            <h3 className="text-lg font-semibold mb-3">Crear Nuevo Usuario</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={nuevoUsuario.usuario}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, usuario: e.target.value })
                }
                className="w-full p-2 rounded text-black"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={nuevoUsuario.password}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })
                }
                className="w-full p-2 rounded text-black"
              />
              <select
                value={nuevoUsuario.rol}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })
                }
                className="w-full p-2 rounded text-black"
              >
                <option value="usuario">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
              <input
                type="url"
                placeholder="URL de imagen (opcional)"
                value={nuevoUsuario.imagen}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, imagen: e.target.value })
                }
                className="w-full p-2 rounded text-black"
              />
              <div className="flex gap-2">
                <button
                  onClick={crearUsuario}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold"
                >
                  Crear
                </button>
                <button
                  onClick={() => setMostrarFormulario(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#2e2e2e] p-3 rounded justify-center flex flex-wrap gap-2 mb-4">
          {usuarios.map((user) => (
            <button
              key={user.id}
              className={`rounded px-3 py-1 font-semibold flex items-center gap-2 ${
                usuarioSeleccionado?.id === user.id
                  ? "bg-green-500 text-white"
                  : "bg-white text-black"
              }`}
              onClick={() => {
                setUsuarioSeleccionado(user);
                setPassword("");
              }}
            >
              <span className="bg-gray-200 text-black rounded-full px-2 py-0.5 text-sm font-bold">
                {user.rol}
              </span>
              {user.usuario}
            </button>
          ))}
        </div>

        {usuarioSeleccionado && (
          <div className="mb-4">
            <label className="block text-sm mb-1">
              Contraseña para <strong>{usuarioSeleccionado.usuario}</strong>:
            </label>
            <input
              type="password"
              className="w-full p-2 rounded text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <button
              onClick={handleLogin}
              className="bg-green-500 text-white w-full mt-2 py-2 rounded font-bold"
            >
              Ingresar
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            className="bg-[#4da6ff] text-black font-bold px-4 py-2 rounded"
            onClick={() => router.push("/home-comandas/register")}
          >
            Registrate
          </button>

          <button
            className="bg-[#c084fc] text-black font-semibold px-4 py-2 rounded flex items-center gap-1"
            onClick={() => window.location.reload()}
          >
            <FaSyncAlt />
            Refrescar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
