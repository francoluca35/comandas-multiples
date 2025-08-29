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
    turnoInfo: localStorage.getItem("turnoInfo")
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
  
  return {
    hasAuthData,
    hasTurnoData,
    turnoData,
    localStorageData
  };
};

// Función para simular evento de login completado
const simulateLoginComplete = () => {
  console.log("🎭 Simulando evento de login completado...");
  
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("userLoginComplete", {
      detail: { 
        userData: {
          usuario: localStorage.getItem("usuario"),
          rol: localStorage.getItem("rol"),
          usuarioId: localStorage.getItem("usuarioId"),
          nombreCompleto: localStorage.getItem("nombreCompleto")
        }
      }
    }));
    
    console.log("✅ Evento userLoginComplete disparado");
  } else {
    console.log("❌ window no está disponible");
  }
};

// Función para forzar actualización de contextos
const forceContextUpdate = () => {
  console.log("🔄 Forzando actualización de contextos...");
  
  // Simular login completado
  simulateLoginComplete();
  
  // Verificar estado después de un breve delay
  setTimeout(() => {
    console.log("📊 Verificando estado después de forzar actualización...");
    checkContextState();
  }, 1000);
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
    const dashboardContent = document.querySelector('[class*="Dashboard"]');
    const turnoContent = document.querySelector('[class*="Turno"]');
    
    if (dashboardContent || turnoContent) {
      console.log("✅ Contenido de la página detectado");
    } else {
      console.log("⚠️ No se detecta contenido de la página");
    }
  } else {
    console.log("ℹ️ No estamos en la página home");
  }
};

// Función principal de debug
const debugContextUpdate = () => {
  console.log("🚀 Iniciando debug completo de contextos...");
  
  // 1. Verificar estado inicial
  const initialState = checkContextState();
  
  // 2. Verificar carga de página
  checkPageLoad();
  
  // 3. Si hay datos de autenticación pero no hay turno, simular login
  if (initialState.hasAuthData && !initialState.hasTurnoData) {
    console.log("🔄 Detectados datos de autenticación sin turno, simulando login...");
    forceContextUpdate();
  }
  
  console.log("\n💡 Comandos disponibles:");
  console.log("- window.debugContextUpdate.checkContextState() - Verificar estado");
  console.log("- window.debugContextUpdate.simulateLoginComplete() - Simular login");
  console.log("- window.debugContextUpdate.forceContextUpdate() - Forzar actualización");
  console.log("- window.debugContextUpdate.checkPageLoad() - Verificar carga de página");
};

// Ejecutar debug
debugContextUpdate();

// Exportar funciones para uso en consola
window.debugContextUpdate = {
  checkContextState,
  simulateLoginComplete,
  forceContextUpdate,
  checkPageLoad,
  debugContextUpdate
};

console.log("\n🎯 PRÓXIMOS PASOS:");
console.log("1. Si la página está en blanco, ejecuta: window.debugContextUpdate.forceContextUpdate()");
console.log("2. Si hay problemas de autenticación, ejecuta: window.debugContextUpdate.checkContextState()");
console.log("3. Si hay problemas de carga, ejecuta: window.debugContextUpdate.checkPageLoad()");
