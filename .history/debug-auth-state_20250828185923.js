// Script para debuggear el estado de autenticación
console.log("🔍 Iniciando debug de estado de autenticación...");

// Función para verificar estado completo
const checkAuthState = () => {
  console.log("📋 ESTADO DE AUTENTICACIÓN");
  console.log("==========================");
  
  // Verificar localStorage
  const localStorageData = {
    usuario: localStorage.getItem("usuario"),
    nombreCompleto: localStorage.getItem("nombreCompleto"),
    restauranteId: localStorage.getItem("restauranteId"),
    usuarioId: localStorage.getItem("usuarioId"),
    rol: localStorage.getItem("rol"),
    userImage: localStorage.getItem("userImage"),
    imagen: localStorage.getItem("imagen"),
    nombreResto: localStorage.getItem("nombreResto"),
    codActivacion: localStorage.getItem("codActivacion"),
    emailResto: localStorage.getItem("emailResto"),
    cantUsuarios: localStorage.getItem("cantUsuarios"),
    finanzas: localStorage.getItem("finanzas"),
    logo: localStorage.getItem("logo")
  };
  
  console.log("📦 localStorage:", localStorageData);
  
  // Verificar URL actual
  console.log("🌐 URL actual:", window.location.href);
  console.log("📍 Pathname:", window.location.pathname);
  
  // Verificar si estamos en sistema de restaurantes
  const isRestaurantSystem = window.location.pathname.includes("/home-comandas");
  console.log("🏪 Sistema de restaurantes:", isRestaurantSystem);
  
  // Verificar estado de turno
  const turnoInfo = localStorage.getItem("turnoInfo");
  console.log("⏰ Info de turno:", turnoInfo ? JSON.parse(turnoInfo) : null);
  
  // Verificar si hay usuario autenticado
  const hasUser = localStorageData.usuario && localStorageData.usuarioId && localStorageData.nombreCompleto;
  console.log("👤 Usuario autenticado:", hasUser ? "✅ SÍ" : "❌ NO");
  
  if (hasUser) {
    console.log("✅ Datos de usuario completos:");
    console.log(`   - Usuario: ${localStorageData.usuario}`);
    console.log(`   - Nombre completo: ${localStorageData.nombreCompleto}`);
    console.log(`   - ID: ${localStorageData.usuarioId}`);
    console.log(`   - Rol: ${localStorageData.rol}`);
    console.log(`   - Restaurante: ${localStorageData.restauranteId}`);
  } else {
    console.log("❌ Datos faltantes:");
    if (!localStorageData.usuario) console.log("   - usuario");
    if (!localStorageData.usuarioId) console.log("   - usuarioId");
    if (!localStorageData.nombreCompleto) console.log("   - nombreCompleto");
  }
  
  return {
    hasUser,
    localStorageData,
    isRestaurantSystem,
    turnoInfo: turnoInfo ? JSON.parse(turnoInfo) : null
  };
};

// Función para simular login
const simulateLogin = () => {
  console.log("🔄 Simulando datos de login...");
  
  // Establecer datos de usuario
  localStorage.setItem("usuario", "test_user");
  localStorage.setItem("nombreCompleto", "Usuario de Prueba");
  localStorage.setItem("usuarioId", "test_id_123");
  localStorage.setItem("rol", "admin");
  localStorage.setItem("restauranteId", "test_restaurant");
  localStorage.setItem("userImage", "");
  localStorage.setItem("imagen", "");
  
  console.log("✅ Datos de login simulados");
  checkAuthState();
};

// Función para limpiar datos
const clearAuthData = () => {
  console.log("🧹 Limpiando datos de autenticación...");
  
  const keysToRemove = [
    "usuario",
    "nombreCompleto", 
    "usuarioId",
    "rol",
    "restauranteId",
    "userImage",
    "imagen",
    "turnoInfo"
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log("✅ Datos de autenticación limpiados");
  checkAuthState();
};

// Función para verificar AuthContext
const checkAuthContext = () => {
  console.log("🔍 Verificando AuthContext...");
  
  // Intentar acceder al contexto de autenticación
  try {
    // Esto solo funcionará si el componente está montado
    console.log("⚠️ AuthContext solo puede verificarse desde un componente React");
    console.log("💡 Usa checkAuthState() para verificar localStorage directamente");
  } catch (error) {
    console.log("❌ Error accediendo a AuthContext:", error.message);
  }
};

// Función para verificar TurnoContext
const checkTurnoContext = () => {
  console.log("🔍 Verificando TurnoContext...");
  
  const turnoInfo = localStorage.getItem("turnoInfo");
  if (turnoInfo) {
    const turno = JSON.parse(turnoInfo);
    console.log("⏰ Estado del turno:", turno);
    console.log(`   - Abierto: ${turno.abierto ? "✅ SÍ" : "❌ NO"}`);
    console.log(`   - Usuario: ${turno.usuario}`);
    console.log(`   - Hora apertura: ${turno.horaApertura}`);
    console.log(`   - Restaurante: ${turno.restauranteId}`);
  } else {
    console.log("❌ No hay información de turno");
  }
};

// Función para forzar recarga de AuthContext
const forceAuthRefresh = () => {
  console.log("🔄 Forzando recarga de AuthContext...");
  
  // Disparar evento personalizado para que AuthContext se actualice
  window.dispatchEvent(new CustomEvent('authRefresh'));
  
  // También recargar la página si es necesario
  console.log("💡 Si el problema persiste, considera recargar la página");
};

// Función para verificar si el problema es de sincronización
const checkSyncIssues = () => {
  console.log("🔍 Verificando problemas de sincronización...");
  
  const state = checkAuthState();
  
  if (state.hasUser) {
    console.log("✅ Usuario autenticado correctamente");
    console.log("💡 El problema puede ser de sincronización entre AuthContext y localStorage");
    console.log("💡 TurnoContext ahora usa localStorage directamente");
  } else {
    console.log("❌ Usuario no autenticado");
    console.log("💡 Verifica que el login se completó correctamente");
  }
};

// Exportar funciones para uso manual
if (typeof window !== "undefined") {
  window.authDebug = {
    checkAuthState,
    simulateLogin,
    clearAuthData,
    checkAuthContext,
    checkTurnoContext,
    forceAuthRefresh,
    checkSyncIssues
  };
  
  console.log("🔧 Funciones de debug disponibles:");
  console.log("  - window.authDebug.checkAuthState()");
  console.log("  - window.authDebug.simulateLogin()");
  console.log("  - window.authDebug.clearAuthData()");
  console.log("  - window.authDebug.checkAuthContext()");
  console.log("  - window.authDebug.checkTurnoContext()");
  console.log("  - window.authDebug.forceAuthRefresh()");
  console.log("  - window.authDebug.checkSyncIssues()");
}

// Verificar estado inicial automáticamente
checkAuthState();
