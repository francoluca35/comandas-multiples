// Script para debuggear el flujo de prelogin y selección de usuario
console.log("🔍 Iniciando debug del flujo de prelogin...");

// Función para verificar estado después del prelogin
const checkPostPreloginState = () => {
  console.log("📋 ESTADO DESPUÉS DEL PRELOGIN");
  console.log("===============================");
  
  // Datos que se guardan después del prelogin exitoso
  const preloginData = {
    codActivacion: localStorage.getItem("codActivacion"),
    nombreResto: localStorage.getItem("nombreResto"),
    emailResto: localStorage.getItem("emailResto"),
    cantUsuarios: localStorage.getItem("cantUsuarios"),
    finanzas: localStorage.getItem("finanzas"),
    logo: localStorage.getItem("logo"),
    restauranteId: localStorage.getItem("restauranteId")
  };
  
  console.log("✅ Datos del restaurante (después del prelogin):", preloginData);
  
  // Datos específicos del usuario (NO deberían existir después del prelogin)
  const userSpecificData = {
    usuario: localStorage.getItem("usuario"),
    rol: localStorage.getItem("rol"),
    usuarioId: localStorage.getItem("usuarioId"),
    nombreCompleto: localStorage.getItem("nombreCompleto"),
    userImage: localStorage.getItem("userImage"),
    imagen: localStorage.getItem("imagen")
  };
  
  console.log("❌ Datos específicos del usuario (NO deberían existir):", userSpecificData);
  
  // Verificar si hay datos de usuario específicos
  const hasUserData = userSpecificData.usuario && userSpecificData.rol && 
                     userSpecificData.usuarioId && userSpecificData.nombreCompleto;
  
  console.log("🔍 ¿Hay datos específicos de usuario?", hasUserData);
  
  if (hasUserData) {
    console.log("⚠️ PROBLEMA: Hay datos específicos de usuario después del prelogin");
    console.log("   Esto causaría redirección automática incorrecta");
  } else {
    console.log("✅ CORRECTO: No hay datos específicos de usuario después del prelogin");
    console.log("   El usuario debería poder seleccionar su cuenta");
  }
  
  return {
    hasRestaurantData: !!preloginData.restauranteId,
    hasUserData: hasUserData,
    shouldAllowUserSelection: !hasUserData
  };
};

// Función para simular el estado después del login exitoso
const checkPostLoginState = () => {
  console.log("\n📋 ESTADO DESPUÉS DEL LOGIN EXITOSO");
  console.log("====================================");
  
  // Simular datos después del login exitoso
  const loginData = {
    usuario: localStorage.getItem("usuario"),
    rol: localStorage.getItem("rol"),
    usuarioId: localStorage.getItem("usuarioId"),
    nombreCompleto: localStorage.getItem("nombreCompleto"),
    userImage: localStorage.getItem("userImage"),
    imagen: localStorage.getItem("imagen"),
    restauranteId: localStorage.getItem("restauranteId")
  };
  
  console.log("✅ Datos después del login:", loginData);
  
  const hasCompleteLoginData = loginData.usuario && loginData.rol && 
                              loginData.usuarioId && loginData.nombreCompleto &&
                              loginData.restauranteId;
  
  console.log("🔍 ¿Hay datos completos de login?", hasCompleteLoginData);
  
  if (hasCompleteLoginData) {
    console.log("✅ CORRECTO: Usuario completamente autenticado");
    console.log("   Debería poder acceder al sistema");
  } else {
    console.log("⚠️ PROBLEMA: Faltan datos de autenticación");
    console.log("   El usuario no debería poder acceder al sistema");
  }
  
  return hasCompleteLoginData;
};

// Función para verificar el flujo completo
const checkCompleteFlow = () => {
  console.log("\n🔄 VERIFICANDO FLUJO COMPLETO");
  console.log("=============================");
  
  const postPrelogin = checkPostPreloginState();
  const postLogin = checkPostLoginState();
  
  console.log("\n📊 RESUMEN DEL FLUJO:");
  console.log("- Después del prelogin:", postPrelogin.shouldAllowUserSelection ? "✅ Permitir selección" : "❌ Redirección incorrecta");
  console.log("- Después del login:", postLogin ? "✅ Acceso permitido" : "❌ Acceso denegado");
  
  if (postPrelogin.shouldAllowUserSelection && postLogin) {
    console.log("\n🎉 FLUJO CORRECTO: El usuario puede seleccionar su cuenta y luego acceder");
  } else {
    console.log("\n⚠️ PROBLEMA EN EL FLUJO: Revisar la lógica de autenticación");
  }
};

// Ejecutar verificación
checkCompleteFlow();

// Exportar funciones para uso en consola
window.debugPreloginFlow = {
  checkPostPreloginState,
  checkPostLoginState,
  checkCompleteFlow
};

console.log("\n💡 Usa window.debugPreloginFlow.checkCompleteFlow() para verificar el flujo");
