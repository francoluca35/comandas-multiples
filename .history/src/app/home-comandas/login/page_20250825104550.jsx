"use client";
import React, { useEffect, useState } from "react";
import { FaUsers, FaSyncAlt, FaPlus, FaFingerprint, FaKey } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useRestaurantUsers } from "../../../hooks/useRestaurantUsers";
import { useBiometricAuth } from "../../../hooks/useBiometricAuth";
import Swal from "sweetalert2";
import { AuthDebugger } from "../../../components/AuthDebugger";
import BiometricSetupModal from "../../../components/BiometricSetupModal";

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
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [selectedUserForBiometric, setSelectedUserForBiometric] = useState(null);
  const [authMethod, setAuthMethod] = useState("password"); // "password" o "biometric"
  const router = useRouter();

  // Usar el hook personalizado para usuarios
  const {
    usuarios,
    loading,
    crearUsuario,
    debugRestaurantes,
    debugCrearUsuario,
  } = useRestaurantUsers();

  // Usar el hook de autenticación biométrica
  const {
    isSupported: biometricSupported,
    isAvailable: biometricAvailable,
    authenticateBiometric,
  } = useBiometricAuth();

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

    if (authMethod === "biometric") {
      await handleBiometricLogin();
    } else {
      await handlePasswordLogin();
    }
  };

  const handlePasswordLogin = async () => {
    if (password === usuarioSeleccionado.password) {
      await completeLogin(usuarioSeleccionado);
    } else {
      Swal.fire("Error", "Contraseña incorrecta", "error");
    }
  };

  const handleBiometricLogin = async () => {
    try {
      if (!usuarioSeleccionado.biometricEnabled) {
        Swal.fire("Error", "Este usuario no tiene configurada la huella digital", "error");
        return;
      }

      // Realizar autenticación biométrica
      const authenticationData = await authenticateBiometric(
        usuarioSeleccionado.id,
        usuarioSeleccionado.biometricCredentials
      );

      // Verificar autenticación con el servidor
      const restauranteId = localStorage.getItem("restauranteId");
      const response = await fetch("/api/biometric/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-restaurante-id": restauranteId,
        },
        body: JSON.stringify({
          userId: usuarioSeleccionado.id,
          authenticationData,
        }),
      });

      if (!response.ok) {
        throw new Error("Error en autenticación biométrica");
      }

      const result = await response.json();
      
      if (result.success) {
        await completeLogin(result.user);
      } else {
        Swal.fire("Error", "Autenticación biométrica fallida", "error");
      }
    } catch (error) {
      console.error("Error en login biométrico:", error);
      Swal.fire("Error", "Error en autenticación biométrica", "error");
    }
  };

  const completeLogin = async (userData) => {
    // Obtener el restauranteId del localStorage (debe estar disponible desde la activación)
    const restauranteId = localStorage.getItem("restauranteId");

    if (!restauranteId) {
      Swal.fire(
        "Error",
        "No se encontró información del restaurante. Por favor, active el restaurante primero.",
        "error"
      );
      return;
    }

    // Guardar datos del usuario logueado
    localStorage.setItem("usuario", userData.usuario);
    localStorage.setItem("nombreCompleto", userData.nombreCompleto || userData.usuario);
    localStorage.setItem("rol", userData.rol);
    localStorage.setItem("usuarioId", userData.id);
    localStorage.setItem("userImage", userData.imagen || "");
    localStorage.setItem("imagen", userData.imagen || "");
    // Asegurar que restauranteId esté disponible para la sesión
    localStorage.setItem("restauranteId", restauranteId);

    // Mostrar alerta personalizada con imagen y nombre
    await Swal.fire({
      title: `¡Bienvenido, ${userData.usuario}!`,
      text: `Rol: ${userData.rol}`,
      imageUrl:
        userData.imagen ||
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
    // Pequeño delay para asegurar que localStorage esté disponible
    setTimeout(() => {
      router.push("/home-comandas/home");
    }, 100);
  };

  const handleSetupBiometric = (user) => {
    setSelectedUserForBiometric(user);
    setShowBiometricSetup(true);
  };

  const handleBiometricSetupSuccess = () => {
    // Recargar usuarios para obtener la información actualizada
    window.location.reload();
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
      <AuthDebugger />
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

        {/* Botones de debug */}
        <div className="bg-[#2e2e2e] p-3 rounded mb-4">
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => {
                console.log("🔍 Debug: Estado actual");
                const authData = {
                  usuario: localStorage.getItem("usuario"),
                  rol: localStorage.getItem("rol"),
                  restauranteId: localStorage.getItem("restauranteId"),
                  nombreResto: localStorage.getItem("nombreResto"),
                };
                console.log("📋 Datos de autenticación:", authData);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-3 rounded font-semibold text-sm"
            >
              Debug: Estado
            </button>
            <button
              onClick={() => {
                if (confirm("¿Limpiar estado de autenticación?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded font-semibold text-sm"
            >
              Limpiar Estado
            </button>
          </div>
        </div>

        {usuarioSeleccionado && (
          <div className="mb-4">
            {/* Método de autenticación */}
            <div className="mb-4">
              <label className="block text-sm mb-2 text-white">
                Método de autenticación para <strong>{usuarioSeleccionado.usuario}</strong>:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAuthMethod("password")}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                    authMethod === "password"
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : "border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <FaKey className="w-5 h-5" />
                  <span className="text-sm font-medium">Contraseña</span>
                </button>
                
                <button
                  onClick={() => setAuthMethod("biometric")}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                    authMethod === "biometric"
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : "border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <FaFingerprint className="w-5 h-5" />
                  <span className="text-sm font-medium">Huella Digital</span>
                  {!usuarioSeleccionado.biometricEnabled && (
                    <span className="text-xs text-red-400">No configurada</span>
                  )}
                </button>
              </div>
            </div>

            {/* Debug de compatibilidad biométrica */}
            {authMethod === "biometric" && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 text-sm mb-2">
                  <strong>Debug de compatibilidad:</strong>
                </p>
                <ul className="text-blue-300 text-xs space-y-1">
                  <li>• Método seleccionado: {authMethod}</li>
                  <li>• Huella configurada: {usuarioSeleccionado.biometricEnabled ? "Sí" : "No"}</li>
                  <li>• WebAuthn soportado: {biometricSupported ? "Sí" : "No"}</li>
                  <li>• Sensor disponible: {biometricAvailable ? "Sí" : "No"}</li>
                  <li>• Credenciales guardadas: {usuarioSeleccionado.biometricCredentials ? "Sí" : "No"}</li>
                  <li>• Tipo de credenciales: {usuarioSeleccionado.biometricCredentials ? (Array.isArray(usuarioSeleccionado.biometricCredentials) ? "Array" : "Objeto") : "N/A"}</li>
                </ul>
              </div>
            )}

            {/* Configurar huella digital si no está configurada */}
            {authMethod === "biometric" && !usuarioSeleccionado.biometricEnabled && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm mb-2">
                  Este usuario no tiene configurada la huella digital.
                </p>
                <button
                  onClick={() => handleSetupBiometric(usuarioSeleccionado)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded font-semibold flex items-center justify-center space-x-2"
                >
                  <FaFingerprint className="w-4 h-4" />
                  <span>Configurar Huella Digital</span>
                </button>
              </div>
            )}

            {/* Mensaje si no es compatible */}
            {authMethod === "biometric" && (!biometricSupported || !biometricAvailable) && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm mb-2">
                  <strong>Tu dispositivo no es compatible con autenticación biométrica:</strong>
                </p>
                <ul className="text-red-300 text-xs space-y-1">
                  {!biometricSupported && <li>• Tu navegador no soporta Web Authentication API</li>}
                  {!biometricAvailable && <li>• Tu dispositivo no tiene sensor de huella digital</li>}
                </ul>
                <p className="text-red-300 text-xs mt-2">
                  Usa el método de contraseña para acceder al sistema.
                </p>
              </div>
            )}

            {/* Campo de contraseña (solo para método de contraseña) */}
            {authMethod === "password" && (
              <div className="mb-4">
                <label className="block text-sm mb-1 text-white">
                  Contraseña:
                </label>
                <input
                  type="password"
                  className="w-full p-2 rounded text-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Ingresa tu contraseña"
                />
              </div>
            )}

            {/* Botón de login */}
            <button
              onClick={handleLogin}
              disabled={authMethod === "password" && !password}
              className={`w-full py-3 rounded font-bold flex items-center justify-center space-x-2 ${
                authMethod === "password" && !password
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {authMethod === "password" ? (
                <>
                  <FaKey className="w-4 h-4" />
                  <span>Ingresar con Contraseña</span>
                </>
              ) : (
                <>
                  <FaFingerprint className="w-4 h-4" />
                  <span>Ingresar con Huella Digital</span>
                </>
              )}
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

        {/* Botón de debug temporal */}
        <div className="mt-4">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded text-sm mr-2"
            onClick={debugRestaurantes}
          >
            Debug: Listar Restaurantes
          </button>
          <button
            className="bg-orange-500 text-white px-4 py-2 rounded text-sm"
            onClick={debugCrearUsuario}
          >
            Debug: Verificar Usuarios
          </button>
          <div className="text-xs text-gray-400 mt-2">
            Restaurante ID:{" "}
            {localStorage.getItem("restauranteId") || "No encontrado"}
          </div>
        </div>
      </div>

      {/* Modal de configuración de huella digital */}
      <BiometricSetupModal
        isOpen={showBiometricSetup}
        onClose={() => setShowBiometricSetup(false)}
        onSuccess={handleBiometricSetupSuccess}
        userId={selectedUserForBiometric?.id}
        username={selectedUserForBiometric?.usuario}
      />
    </div>
  );
}

export default Login;
