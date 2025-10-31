"use client";
import React, { useEffect, useState } from "react";
import { FaUsers, FaSyncAlt, FaFingerprint, FaKey } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useRestaurantUsers } from "../../../hooks/useRestaurantUsers";
import { useBiometricAuth } from "../../../hooks/useBiometricAuth";
import Swal from "sweetalert2";
import BiometricSetupModal from "../../../components/BiometricSetupModal";

function Login() {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [password, setPassword] = useState("");
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
          html: `
            <div class="text-left">
              <p class="mb-3">¿Te gustaría configurar tu huella digital para futuros inicios de sesión?</p>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p class="text-blue-800 font-medium mb-1">✅ Beneficios:</p>
                <ul class="text-blue-700 space-y-1">
                  <li>• Inicio de sesión más rápido</li>
                  <li>• Mayor seguridad</li>
                  <li>• No necesitas recordar contraseñas</li>
                </ul>
              </div>
            </div>
          `,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, configurar ahora",
          cancelButtonText: "No, continuar sin configurar",
          confirmButtonColor: "#4da6ff",
          cancelButtonColor: "#6c757d",
          reverseButtons: true,
          width: "500px"
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
        "/Assets/logo-d.png",
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

  const handleBiometricSetupClose = () => {
    // Si estamos en el flujo de configuración post-login y el usuario cierra el modal
    if (selectedUserForBiometric && authMethod === "password") {
      console.log("❌ Usuario canceló configuración de huella digital después del login");
      console.log("🔄 Completando login sin configuración biométrica...");
      
      // Completar el login de todas formas
      completeLogin(selectedUserForBiometric);
      
      // Limpiar el estado
      setSelectedUserForBiometric(null);
      setShowBiometricSetup(false);
    } else {
      // Flujo normal de cierre
      setShowBiometricSetup(false);
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
            {restauranteInfo?.nombre || "Restaurante"}
          </h1>
          <p className="text-white text-sm mt-1">
            Usuarios: {usuarios.filter(user => user.usuario !== "admin").length}/{restauranteInfo.cantUsuarios}
          </p>
        </div>

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
            <p className="text-white text-lg mb-4">
              No hay usuarios disponibles
            </p>
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

            {/* Botón para configurar huella digital manualmente */}
            {usuarioSeleccionado && authMethod === "password" && (
              <button
                onClick={() => {
                  setSelectedUserForBiometric(usuarioSeleccionado);
                  setShowBiometricSetup(true);
                }}
                className="w-full mt-3 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <FaFingerprint className="w-4 h-4" />
                <span>Configurar Huella Digital</span>
              </button>
            )}
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
        onClose={handleBiometricSetupClose}
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
