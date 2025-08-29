"use client";
import React, { useEffect, useState } from "react";
import { FaUsers, FaSyncAlt, FaPlus, FaFingerprint, FaKey } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useRestaurantUsers } from "../../../hooks/useRestaurantUsers";
import { useBiometricAuth } from "../../../hooks/useBiometricAuth";
import Swal from "sweetalert2";
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
    getLocalCredentials,
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

  // Mostrar automáticamente el formulario si solo existe el usuario "admin"
  useEffect(() => {
    if (!loading && usuarios.length > 0) {
      const usuariosValidos = usuarios.filter(user => user.usuario !== "admin");
      if (usuariosValidos.length === 0) {
        console.log("🔒 Solo existe usuario admin, mostrando formulario de creación");
        setMostrarFormulario(true);
      }
    }
  }, [usuarios, loading]);

  const handleCrearUsuario = async () => {
    try {
      if (!nuevoUsuario.usuario || !nuevoUsuario.password) {
        Swal.fire("Error", "Todos los campos son requeridos", "error");
        return;
      }

      // Verificar que no se intente crear un usuario "admin"
      if (nuevoUsuario.usuario.toLowerCase() === "admin") {
        Swal.fire("Error", "No se puede crear un usuario con el nombre 'admin'", "error");
        return;
      }

      // Verificar límite de usuarios (excluyendo admin)
      const usuariosValidos = usuarios.filter(user => user.usuario !== "admin");
      if (usuariosValidos.length >= restauranteInfo.cantUsuarios) {
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
      
      // Solo ocultar formulario si ya hay usuarios válidos
      const usuariosValidosDespues = usuarios.filter(user => user.usuario !== "admin");
      if (usuariosValidosDespues.length > 0) {
        setMostrarFormulario(false);
      }

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
      // Verificar si el usuario tiene huella digital configurada
      const localCredentials = await getLocalCredentials(usuarioSeleccionado.id);
      
      if (localCredentials.length === 0) {
        // No tiene huella digital configurada, preguntar si quiere configurarla
        const result = await Swal.fire({
          title: "¿Configurar Huella Digital?",
          text: "¿Te gustaría configurar tu huella digital para futuros inicios de sesión?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, configurar",
          cancelButtonText: "No, continuar",
          confirmButtonColor: "#4da6ff",
          cancelButtonColor: "#6c757d",
          reverseButtons: true
        });

        if (result.isConfirmed) {
          // Usuario quiere configurar huella digital
          setSelectedUserForBiometric(usuarioSeleccionado);
          setShowBiometricSetup(true);
          return; // No completar login aún, esperar a que configure la huella
        }
      }
      
      // Continuar con el login normal
      await completeLogin(usuarioSeleccionado);
    } else {
      Swal.fire("Error", "Contraseña incorrecta", "error");
    }
  };

  const handleBiometricLogin = async () => {
    try {
      // Verificar si el usuario tiene credenciales biométricas configuradas
      // Primero intentar con las credenciales locales (IndexedDB)
      const localCredentials = await getLocalCredentials(usuarioSeleccionado.id);
      
      if (localCredentials.length === 0) {
        Swal.fire("Error", "Este usuario no tiene configurada la huella digital", "error");
        return;
      }

      // Realizar autenticación biométrica usando las credenciales locales
      const authenticationData = await authenticateBiometric(
        usuarioSeleccionado.id,
        null // No pasar credenciales, el hook las obtendrá de IndexedDB
      );

      // Si la autenticación biométrica fue exitosa, proceder con el login
      if (authenticationData.success) {
        await completeLogin(usuarioSeleccionado);
      } else {
        // IMPORTANTE: NO borrar credenciales, solo mostrar error
        const errorMessage = authenticationData.error || "Autenticación biométrica fallida";
        Swal.fire({
          title: "Error de Autenticación",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "Intentar Nuevamente",
          showCancelButton: true,
          cancelButtonText: "Usar Contraseña"
        }).then((result) => {
          if (result.isConfirmed) {
            // Permitir reintentar
            setAuthMethod("biometric");
          } else {
            // Cambiar a método de contraseña
            setAuthMethod("password");
          }
        });
      }
    } catch (error) {
      console.error("Error en login biométrico:", error);
      // IMPORTANTE: NO borrar credenciales en caso de error
      Swal.fire({
        title: "Error de Autenticación",
        text: "Error en autenticación biométrica: " + error.message,
        icon: "error",
        confirmButtonText: "Intentar Nuevamente",
        showCancelButton: true,
        cancelButtonText: "Usar Contraseña"
      }).then((result) => {
        if (result.isConfirmed) {
          // Permitir reintentar
          setAuthMethod("biometric");
        } else {
          // Cambiar a método de contraseña
          setAuthMethod("password");
        }
      });
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
    // IMPORTANTE: Usar window.location.href para forzar recarga completa y asegurar que todos los contextos se inicialicen correctamente
    setTimeout(() => {
      console.log("🔄 Redirigiendo al sistema principal con recarga completa...");
      console.log("🛡️ Preservando credenciales biométricas durante la redirección");
      
      // Usar window.location.href para forzar recarga completa
      // Esto asegura que todos los contextos se inicialicen correctamente desde el localStorage
      window.location.href = "/home-comandas/home";
    }, 100);
  };

  const handleSetupBiometric = (user) => {
    setSelectedUserForBiometric(user);
    setShowBiometricSetup(true);
  };

  const handleBiometricSetupSuccess = () => {
    // Si estamos en el flujo de configuración inicial después del login con contraseña
    if (selectedUserForBiometric && authMethod === "password") {
      console.log("✅ Huella digital configurada después del login con contraseña");
      console.log("🔄 Completando login...");
      
      // Completar el login después de configurar la huella digital
      completeLogin(selectedUserForBiometric);
      
      // Limpiar el estado
      setSelectedUserForBiometric(null);
      setShowBiometricSetup(false);
    } else {
      // Flujo normal de configuración desde el botón
      console.log("🔄 Recargando usuarios después de configuración biométrica...");
      console.log("🛡️ Preservando credenciales biométricas durante la recarga");
      
      // Usar router.refresh() en lugar de window.location.reload()
      router.refresh();
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
    <div 
      className="min-h-screen flex justify-center items-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/Assets/fondo-prelogin.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Overlay oscuro para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      {/* Panel principal */}
      <div className="relative z-10 bg-violet-950/50 bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white border-opacity-20 w-full max-w-md">
        {/* Título */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white uppercase tracking-wide">
            FRANCOMPUTER
          </h1>
          <p className="text-white text-sm mt-1">
            Usuarios: {usuarios.filter(user => user.usuario !== "admin").length}/{restauranteInfo.cantUsuarios}
          </p>
        </div>

        {/* Formulario de creación */}
        {mostrarFormulario && (
          <div className="mb-6 p-4 bg-black bg-opacity-40 rounded-xl border border-white border-opacity-20">
            <h3 className="text-lg font-semibold mb-3 text-white">Crear Nuevo Usuario</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={nuevoUsuario.usuario}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, usuario: e.target.value })
                }
                className="w-full p-3 rounded-lg text-black bg-white"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={nuevoUsuario.password}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })
                }
                className="w-full p-3 rounded-lg text-black bg-white"
              />
              <select
                value={nuevoUsuario.rol}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })
                }
                className="w-full p-3 rounded-lg text-black bg-white"
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
                className="w-full p-3 rounded-lg text-black bg-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCrearUsuario}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Crear
                </button>
                <button
                  onClick={() => setMostrarFormulario(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de usuarios */}
        {usuarios.filter(user => user.usuario !== "admin").length > 0 ? (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {usuarios
                .filter(user => user.usuario !== "admin")
                .map((user) => (
                  <UserButton 
                    key={user.id}
                    user={user}
                    isSelected={usuarioSeleccionado?.id === user.id}
                    onSelect={() => {
                      setUsuarioSeleccionado(user);
                      setPassword("");
                    }}
                    getLocalCredentials={getLocalCredentials}
                  />
                ))}
            </div>
          </div>
        ) : (
          <div className="text-center mb-6">
            <div className="text-yellow-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Usuario Admin Bloqueado
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              El usuario "admin" predeterminado está bloqueado por seguridad. 
              Debes crear un nuevo usuario para acceder al sistema.
            </p>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <FaPlus />
              Crear Nuevo Usuario
            </button>
          </div>
        )}

        {/* Sección de autenticación */}
        {usuarioSeleccionado && (
          <div className="mb-6">
            {/* Método de autenticación */}
            <div className="mb-4">
              <label className="block text-sm mb-3 text-white font-medium">
                Método de autenticación para <strong>{usuarioSeleccionado.usuario}</strong>:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAuthMethod("password")}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                    authMethod === "password"
                      ? "border-blue-500 bg-blue-500/20 text-blue-300"
                      : "border-white border-opacity-30 bg-white bg-opacity-10 text-white hover:bg-opacity-20"
                  }`}
                >
                  <FaKey className="w-6 h-6" />
                  <span className="text-sm font-medium">Contraseña</span>
                </button>
                
                <button
                  onClick={() => setAuthMethod("biometric")}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                    authMethod === "biometric"
                      ? "border-blue-500 bg-blue-500/20 text-blue-300"
                      : "border-white border-opacity-30 bg-white bg-opacity-10 text-white hover:bg-opacity-20"
                  }`}
                >
                  <FaFingerprint className="w-6 h-6" />
                  <span className="text-sm font-medium">Huella Digital</span>
                  {!usuarioSeleccionado.biometricEnabled && (
                    <span className="text-xs text-red-400">No configurada</span>
                  )}
                </button>
              </div>
            </div>

            {/* Campo de contraseña */}
            {authMethod === "password" && (
              <div className="mb-4">
                <label className="block text-sm mb-2 text-white font-medium">
                  Contraseña:
                </label>
                <input
                  type="password"
                  className="w-full p-3 rounded-lg text-black bg-white"
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
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all duration-200 ${
                authMethod === "password" && !password
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white shadow-lg"
              }`}
            >
              {authMethod === "password" ? (
                <>
                  <FaKey className="w-5 h-5" />
                  <span>Ingresar con Contraseña</span>
                </>
              ) : (
                <>
                  <FaFingerprint className="w-5 h-5" />
                  <span>Ingresar con Huella Digital</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Botones inferiores */}
        <div className="flex items-center justify-between">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg transition-colors"
            onClick={() => router.push("/home-comandas/register")}
          >
            Registrate
          </button>

          <button
            className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            onClick={() => window.location.reload()}
          >
            <FaSyncAlt />
            Refrescar
          </button>
        </div>
      </div>

      {/* Modal de configuración de huella digital */}
      <BiometricSetupModal
        isOpen={showBiometricSetup}
        onClose={() => setShowBiometricSetup(false)}
        onSuccess={handleBiometricSetupSuccess}
        userId={selectedUserForBiometric?.id}
        username={selectedUserForBiometric?.usuario}
        existingCredentials={selectedUserForBiometric?.biometricCredentials || []}
        isInitialSetup={true}
        isPostLoginSetup={authMethod === "password" && selectedUserForBiometric}
      />
    </div>
  );
}

// Componente para mostrar el botón de usuario con indicador de huella digital
const UserButton = ({ user, isSelected, onSelect, getLocalCredentials }) => {
  const [hasBiometric, setHasBiometric] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBiometric = async () => {
      try {
        const credentials = await getLocalCredentials(user.id);
        setHasBiometric(credentials.length > 0);
      } catch (error) {
        console.error("Error verificando huella digital:", error);
        setHasBiometric(false);
      } finally {
        setLoading(false);
      }
    };

    checkBiometric();
  }, [user.id, getLocalCredentials]);

  return (
    <button
      className={`rounded-lg px-4 py-2 font-semibold flex items-center gap-2 transition-all duration-200 ${
        isSelected
          ? "bg-green-500 text-white shadow-lg"
          : "bg-white text-black hover:bg-gray-100"
      }`}
      onClick={onSelect}
    >
      <span className="bg-gray-200 text-black rounded-full px-2 py-0.5 text-sm font-bold">
        {user.rol}
      </span>
      <span>{user.usuario}</span>
      {!loading && (
        <div className="flex items-center gap-1">
          {hasBiometric ? (
            <FaFingerprint className="w-3 h-3 text-green-600" title="Huella digital configurada" />
          ) : (
            <FaKey className="w-3 h-3 text-gray-400" title="Solo contraseña" />
          )}
        </div>
      )}
    </button>
  );
};

export default Login;
