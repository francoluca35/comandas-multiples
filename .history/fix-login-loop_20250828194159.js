// Script para solucionar el bucle infinito de login
console.log("🔧 Iniciando solución para bucle infinito de login...");

// Función para limpiar datos problemáticos
const clearProblematicData = () => {
  console.log("🧹 Limpiando datos problemáticos...");
  
  // Datos que pueden causar problemas de autenticación
  const problematicKeys = [
    "usuario",
    "rol", 
    "usuarioId",
    "nombreCompleto",
    "userImage",
    "imagen"
  ];
  
  problematicKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      console.log(`🗑️ Eliminando ${key}: ${value}`);
      localStorage.removeItem(key);
    }
  });
  
  console.log("✅ Datos problemáticos eliminados");
};

// Función para verificar datos del restaurante
const checkRestaurantData = () => {
  console.log("🏪 Verificando datos del restaurante...");
  
  const restaurantData = {
    codActivacion: localStorage.getItem("codActivacion"),
    nombreResto: localStorage.getItem("nombreResto"),
    emailResto: localStorage.getItem("emailResto"),
    cantUsuarios: localStorage.getItem("cantUsuarios"),
    finanzas: localStorage.getItem("finanzas"),
    logo: localStorage.getItem("logo"),
    restauranteId: localStorage.getItem("restauranteId")
  };
  
  console.log("📋 Datos del restaurante:", restaurantData);
  
  const hasRestaurantData = restaurantData.restauranteId && restaurantData.nombreResto;
  
  if (hasRestaurantData) {
    console.log("✅ Datos del restaurante están presentes");
    return true;
  } else {
    console.log("❌ Faltan datos del restaurante");
    return false;
  }
};

// Función para verificar estado actual
const checkCurrentState = () => {
  console.log("🔍 Verificando estado actual...");
  
  const currentPath = window.location.pathname;
  console.log("📍 Ruta actual:", currentPath);
  
  const userData = {
    usuario: localStorage.getItem("usuario"),
    rol: localStorage.getItem("rol"),
    usuarioId: localStorage.getItem("usuarioId"),
    nombreCompleto: localStorage.getItem("nombreCompleto")
  };
  
  console.log("👤 Datos de usuario:", userData);
  
  const hasUserData = userData.usuario && userData.rol && userData.usuarioId && userData.nombreCompleto;
  
  if (hasUserData) {
    console.log("⚠️ Hay datos de usuario - esto puede causar problemas");
    return "hasUserData";
  } else {
    console.log("✅ No hay datos de usuario - estado correcto");
    return "noUserData";
  }
};

// Función principal para solucionar el problema
const fixLoginLoop = () => {
  console.log("🚀 Iniciando solución completa...");
  
  // 1. Verificar estado actual
  const currentState = checkCurrentState();
  
  // 2. Verificar datos del restaurante
  const hasRestaurantData = checkRestaurantData();
  
  // 3. Si hay datos de usuario, limpiarlos
  if (currentState === "hasUserData") {
    console.log("🔄 Limpiando datos de usuario para permitir login manual...");
    clearProblematicData();
  }
  
  // 4. Verificar resultado
  const finalState = checkCurrentState();
  
  console.log("\n📊 RESUMEN:");
  console.log("- Datos del restaurante:", hasRestaurantData ? "✅ Presentes" : "❌ Faltantes");
  console.log("- Datos de usuario:", finalState === "noUserData" ? "✅ Limpios" : "❌ Problemáticos");
  
  if (hasRestaurantData && finalState === "noUserData") {
    console.log("\n🎉 PROBLEMA SOLUCIONADO:");
    console.log("✅ Puedes ir a /home-comandas/login y seleccionar tu usuario");
    console.log("✅ No habrá redirección automática");
    console.log("✅ Podrás iniciar sesión normalmente");
  } else if (!hasRestaurantData) {
    console.log("\n⚠️ PROBLEMA DETECTADO:");
    console.log("❌ Faltan datos del restaurante");
    console.log("💡 Ve a /comandas/prelogin para activar el restaurante");
  }
  
  return {
    restaurantDataOk: hasRestaurantData,
    userDataClean: finalState === "noUserData",
    canLogin: hasRestaurantData && finalState === "noUserData"
  };
};

// Función para habilitar AutoRedirect nuevamente (cuando esté listo)
const enableAutoRedirect = () => {
  console.log("🔧 Para habilitar AutoRedirect nuevamente:");
  console.log("1. Ve a src/components/AutoRedirect.jsx");
  console.log("2. Comenta las líneas 8-10:");
  console.log("   // TEMPORALMENTE DESHABILITADO PARA EVITAR BUCLES INFINITOS");
  console.log("   // console.log(\"🚫 AutoRedirect temporalmente deshabilitado...\");");
  console.log("   // return () => {};");
  console.log("3. Descomenta el resto del código");
};

// Ejecutar solución
const result = fixLoginLoop();

// Exportar funciones para uso en consola
window.fixLoginLoop = {
  fixLoginLoop,
  clearProblematicData,
  checkCurrentState,
  checkRestaurantData,
  enableAutoRedirect
};

console.log("\n💡 Comandos disponibles:");
console.log("- window.fixLoginLoop.fixLoginLoop() - Solucionar problema");
console.log("- window.fixLoginLoop.checkCurrentState() - Verificar estado");
console.log("- window.fixLoginLoop.enableAutoRedirect() - Instrucciones para habilitar AutoRedirect");

// Mostrar resultado final
if (result.canLogin) {
  console.log("\n🎯 PRÓXIMOS PASOS:");
  console.log("1. Ve a /home-comandas/login");
  console.log("2. Selecciona tu usuario");
  console.log("3. Inicia sesión con contraseña o huella digital");
  console.log("4. Una vez que funcione, puedes habilitar AutoRedirect nuevamente");
}
