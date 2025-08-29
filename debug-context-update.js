// Script para debuggear la actualización de contextos después del login
console.log("🔍 Iniciando debug de actualización de contextos...");

// Función para verificar estado de contextos
const checkContextState = () => {
  console.log("📋 ESTADO DE CONTEXTOS");
  console.log("=====================");
  
  // Verificar datos en localStorage
  const localStorageData = {
    usuario: localStorage.getItem("usuario"),
    rol: localStorage.getItem("rol"),
    usuarioId: localStorage.getItem("usuarioId"),
    nombreCompleto: localStorage.getItem("nombreCompleto"),
    restauranteId: localStorage.getItem("restauranteId"),
    turnoInfo: localStorage.getItem("turnoInfo"),
    nombreResto: localStorage.getItem("nombreResto"),
    codActivacion: localStorage.getItem("codActivacion")
  };
  
  console.log("💾 Datos en localStorage:", localStorageData);
  
  // Verificar si hay datos de turno
  let turnoData = null;
  if (localStorageData.turnoInfo) {
    try {
      turnoData = JSON.parse(localStorageData.turnoInfo);
      console.log("🔄 Datos del turno:", turnoData);
    } catch (error) {
      console.error("❌ Error al parsear datos del turno:", error);
    }
  }
  
  // Verificar estado de autenticación
  const hasAuthData = localStorageData.usuario && localStorageData.rol && 
                     localStorageData.usuarioId && localStorageData.nombreCompleto;
  
  console.log("🔐 ¿Hay datos de autenticación?", hasAuthData);
  
  // Verificar estado del turno
  const hasTurnoData = turnoData && turnoData.abierto;
  console.log("🕐 ¿Hay turno abierto?", hasTurnoData);
  
  // Verificar datos del restaurante
  const hasRestaurantData = localStorageData.nombreResto && localStorageData.codActivacion;
  console.log("🏪 ¿Hay datos del restaurante?", hasRestaurantData);
  
  // Verificar si es admin
  const isAdmin = localStorageData.rol?.toLowerCase() === "admin";
  console.log("👑 ¿Es admin?", isAdmin);
  
  return {
    hasAuthData,
    hasTurnoData,
    hasRestaurantData,
    isAdmin,
    turnoData,
    localStorageData
  };
};

// Función para verificar si la página está cargando correctamente
const checkPageLoad = () => {
  console.log("🌐 Verificando carga de página...");
  
  const currentPath = window.location.pathname;
  console.log("📍 Ruta actual:", currentPath);
  
  // Verificar si estamos en la página home
  if (currentPath === "/home-comandas/home") {
    console.log("✅ Estamos en la página home");
    
    // Verificar si hay contenido visible
    const turnoContent = document.querySelector('[class*="Turno"]');
    const ventasContent = document.querySelector('[class*="Ventas"]');
    const dineroContent = document.querySelector('[class*="Dinero"]');
    const stockContent = document.querySelector('[class*="Stock"]');
    const dispositivosContent = document.querySelector('[class*="Dispositivos"]');
    
    console.log("🔍 Contenido detectado:");
    console.log("  - Turno:", !!turnoContent);
    console.log("  - Ventas:", !!ventasContent);
    console.log("  - Dinero:", !!dineroContent);
    console.log("  - Stock:", !!stockContent);
    console.log("  - Dispositivos:", !!dispositivosContent);
    
    // Verificar si es admin y debería mostrar todo
    const isAdmin = localStorage.getItem("rol")?.toLowerCase() === "admin";
    if (isAdmin) {
      console.log("👑 Usuario es admin, debería mostrar dashboard completo");
      const hasAllContent = turnoContent && ventasContent && dineroContent && stockContent && dispositivosContent;
      console.log("✅ ¿Tiene todo el contenido?", hasAllContent);
    } else {
      console.log("👤 Usuario no es admin, dashboard limitado");
      const hasLimitedContent = turnoContent && ventasContent;
      console.log("✅ ¿Tiene contenido limitado?", hasLimitedContent);
    }
  } else {
    console.log("ℹ️ No estamos en la página home");
  }
};

// Función para recargar la página
const reloadPage = () => {
  console.log("🔄 Recargando página...");
  window.location.reload();
};

// Función principal de debug
const debugContextUpdate = () => {
  console.log("🚀 Iniciando debug completo de contextos...");
  
  // 1. Verificar estado inicial
  const initialState = checkContextState();
  
  // 2. Verificar carga de página
  checkPageLoad();
  
  console.log("\n💡 Comandos disponibles:");
  console.log("- window.debugContextUpdate.checkContextState() - Verificar estado");
  console.log("- window.debugContextUpdate.checkPageLoad() - Verificar carga de página");
  console.log("- window.debugContextUpdate.reloadPage() - Recargar página");
};

// Ejecutar debug
debugContextUpdate();

// Exportar funciones para uso en consola
window.debugContextUpdate = {
  checkContextState,
  checkPageLoad,
  reloadPage,
  debugContextUpdate
};

console.log("\n🎯 PRÓXIMOS PASOS:");
console.log("1. Si la página está en blanco, ejecuta: window.debugContextUpdate.reloadPage()");
console.log("2. Si hay problemas de autenticación, ejecuta: window.debugContextUpdate.checkContextState()");
console.log("3. Si hay problemas de carga, ejecuta: window.debugContextUpdate.checkPageLoad()");
