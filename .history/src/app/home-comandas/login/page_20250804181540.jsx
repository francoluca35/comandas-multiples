"use client";
import React, { useEffect, useState } from "react";
import { FaUsers, FaSyncAlt, FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useRestaurantUsers } from "../../../hooks/useRestaurantUsers";
import Swal from "sweetalert2";

function Login() {
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

  // Usar el hook personalizado para usuarios
  const { usuarios, loading, crearUsuario, debugRestaurantes } = useRestaurantUsers();

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

  const handleCrearUsuario = async () => {
    try {
      if (!nuevoUsuario.usuario || !nuevoUsuario.password) {
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

      await crearUsuario(nuevoUsuario);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center p-4">
        <div className="text-white">Cargando usuarios...</div>
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
                  onClick={handleCrearUsuario}
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
