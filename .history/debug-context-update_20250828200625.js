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

// Función para forzar actualización inmediata y completa
const forceImmediateUpdate = () => {
  console.log("🚀 Forzando actualización inmediata y completa...");
  
  // Disparar múltiples eventos con diferentes delays
  if (typeof window !== "undefined") {
    const userData = {
      usuario: localStorage.getItem("usuario"),
      rol: localStorage.getItem("rol"),
      usuarioId: localStorage.getItem("usuarioId"),
      nombreCompleto: localStorage.getItem("nombreCompleto")
    };
    
    // Disparo inmediato
    window.dispatchEvent(new CustomEvent("userLoginComplete", {
      detail: { userData }
    }));
    
    // Disparos con delays
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("userLoginComplete", {
        detail: { userData }
      }));
    }, 100);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("userLoginComplete", {
        detail: { userData }
      }));
    }, 300);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("userLoginComplete", {
        detail: { userData }
      }));
    }, 500);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("userLoginComplete", {
        detail: { userData }
      }));
    }, 1000);
  }
  
  // Verificar estado después de todos los disparos
  setTimeout(() => {
    console.log("📊 Verificando estado después de actualización completa...");
    checkContextState();
    checkPageLoad();
  }, 1500);
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
    const ventasContent = document.querySelector('[class*="Ventas"]');
    const dineroContent = document.querySelector('[class*="Dinero"]');
    const stockContent = document.querySelector('[class*="Stock"]');
    const dispositivosContent = document.querySelector('[class*="Dispositivos"]');
    
    console.log("🔍 Contenido detectado:");
    console.log("  - Dashboard:", !!dashboardContent);
    console.log("  - Turno:", !!turnoContent);
    console.log("  - Ventas:", !!ventasContent);
    console.log("  - Dinero:", !!dineroContent);
    console.log("  - Stock:", !!stockContent);
    console.log("  - Dispositivos:", !!dispositivosContent);
    
    // Verificar si es admin y debería mostrar todo
    const isAdmin = localStorage.getItem("rol")?.toLowerCase() === "admin";
    if (isAdmin) {
      console.log("👑 Usuario es admin, debería mostrar dashboard completo");
      const hasAllContent = dashboardContent || (turnoContent && ventasContent && dineroContent && stockContent && dispositivosContent);
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

// Función para verificar contextos específicos
const checkSpecificContexts = () => {
  console.log("🔍 Verificando contextos específicos...");
  
  // Verificar si los contextos están disponibles en el DOM
  const contextProviders = document.querySelectorAll('[class*="Provider"]');
  console.log("📦 Providers detectados:", contextProviders.length);
  
  // Verificar si hay elementos que dependen de contextos
  const authDependentElements = document.querySelectorAll('[class*="usuario"], [class*="user"]');
  const roleDependentElements = document.querySelectorAll('[class*="admin"], [class*="rol"]');
  const turnoDependentElements = document.querySelectorAll('[class*="turno"], [class*="shift"]');
  
  console.log("🔗 Elementos dependientes:");
  console.log("  - Auth:", authDependentElements.length);
  console.log("  - Role:", roleDependentElements.length);
  console.log("  - Turno:", turnoDependentElements.length);
};

// Función para recargar la página de forma inteligente
const smartReload = () => {
  console.log("🔄 Recarga inteligente...");
  
  // Verificar si hay datos de autenticación
  const hasAuthData = localStorage.getItem("usuario") && 
                     localStorage.getItem("rol") && 
                     localStorage.getItem("usuarioId") && 
                     localStorage.getItem("nombreCompleto");
  
  if (hasAuthData) {
    console.log("✅ Datos de autenticación encontrados, recargando página...");
    window.location.reload();
  } else {
    console.log("❌ No hay datos de autenticación, redirigiendo a login...");
    window.location.href = "/home-comandas/login";
  }
};

// Función principal de debug
const debugContextUpdate = () => {
  console.log("🚀 Iniciando debug completo de contextos...");
  
  // 1. Verificar estado inicial
  const initialState = checkContextState();
  
  // 2. Verificar carga de página
  checkPageLoad();
  
  // 3. Verificar contextos específicos
  checkSpecificContexts();
  
  // 4. Si hay datos de autenticación pero no hay turno, simular login
  if (initialState.hasAuthData && !initialState.hasTurnoData) {
    console.log("🔄 Detectados datos de autenticación sin turno, simulando login...");
    forceContextUpdate();
  }
  
  console.log("\n💡 Comandos disponibles:");
  console.log("- window.debugContextUpdate.checkContextState() - Verificar estado");
  console.log("- window.debugContextUpdate.simulateLoginComplete() - Simular login");
  console.log("- window.debugContextUpdate.forceContextUpdate() - Forzar actualización");
  console.log("- window.debugContextUpdate.forceImmediateUpdate() - Forzar actualización inmediata");
  console.log("- window.debugContextUpdate.checkPageLoad() - Verificar carga de página");
  console.log("- window.debugContextUpdate.checkSpecificContexts() - Verificar contextos específicos");
  console.log("- window.debugContextUpdate.smartReload() - Recarga inteligente");
};

// Ejecutar debug
debugContextUpdate();

// Exportar funciones para uso en consola
window.debugContextUpdate = {
  checkContextState,
  simulateLoginComplete,
  forceContextUpdate,
  forceImmediateUpdate,
  checkPageLoad,
  checkSpecificContexts,
  smartReload,
  debugContextUpdate
};

console.log("\n🎯 PRÓXIMOS PASOS:");
console.log("1. Si la página está en blanco, ejecuta: window.debugContextUpdate.forceImmediateUpdate()");
console.log("2. Si hay problemas de autenticación, ejecuta: window.debugContextUpdate.checkContextState()");
console.log("3. Si hay problemas de carga, ejecuta: window.debugContextUpdate.checkPageLoad()");
console.log("4. Si hay problemas de contextos, ejecuta: window.debugContextUpdate.checkSpecificContexts()");
console.log("5. Si nada funciona, ejecuta: window.debugContextUpdate.smartReload()");
