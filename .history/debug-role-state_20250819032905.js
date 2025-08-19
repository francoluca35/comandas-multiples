// Script para debuggear el estado del rol y localStorage
console.log("🔍 DEBUG: Verificando estado del rol y localStorage");

// Verificar datos en localStorage
const localStorageData = {
  // Datos de restaurante
  restauranteId: localStorage.getItem("restauranteId"),
  nombreResto: localStorage.getItem("nombreResto"),
  codActivacion: localStorage.getItem("codActivacion"),
  emailResto: localStorage.getItem("emailResto"),
  cantUsuarios: localStorage.getItem("cantUsuarios"),
  finanzas: localStorage.getItem("finanzas"),
  logo: localStorage.getItem("logo"),
  
  // Datos de usuario
  usuario: localStorage.getItem("usuario"),
  nombreCompleto: localStorage.getItem("nombreCompleto"),
  rol: localStorage.getItem("rol"),
  usuarioId: localStorage.getItem("usuarioId"),
  userImage: localStorage.getItem("userImage"),
  imagen: localStorage.getItem("imagen"),
  
  // Datos de superadmin
  superadmin_email: localStorage.getItem("superadmin_email"),
  superadmin_rol: localStorage.getItem("superadmin_rol"),
  superAdminUser: localStorage.getItem("superAdminUser"),
  superAdminRole: localStorage.getItem("superAdminRole"),
  superadminImage: localStorage.getItem("superadminImage"),
};

console.log("📋 Datos en localStorage:", localStorageData);

// Verificar la ruta actual
const currentPath = window.location.pathname;
const isSuperAdminSystem = currentPath.includes("/home-master");
const isRestaurantSystem = currentPath.includes("/home-comandas");

console.log("📍 Ruta actual:", {
  path: currentPath,
  isSuperAdminSystem,
  isRestaurantSystem,
});

// Función para generar ID del restaurante
const generarRestauranteId = (nombre) => {
  return nombre
    ? nombre
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "")
    : null;
};

// Verificar consistencia del restauranteId
if (localStorageData.nombreResto) {
  const expectedRestauranteId = generarRestauranteId(localStorageData.nombreResto);
  const actualRestauranteId = localStorageData.restauranteId;
  
  console.log("🔧 Verificación de restauranteId:", {
    nombreResto: localStorageData.nombreResto,
    expectedRestauranteId,
    actualRestauranteId,
    coincide: expectedRestauranteId === actualRestauranteId,
  });
  
  if (expectedRestauranteId !== actualRestauranteId) {
    console.warn("⚠️ RestauranteId no coincide con el nombre del restaurante");
    console.warn("  - Esperado:", expectedRestauranteId);
    console.warn("  - Actual:", actualRestauranteId);
  }
}

// Verificar estado de autenticación
if (isRestaurantSystem) {
  console.log("🏪 Sistema de restaurantes detectado");
  
  if (localStorageData.restauranteId && localStorageData.usuario && localStorageData.rol) {
    console.log("✅ Usuario autenticado en restaurante:", {
      restauranteId: localStorageData.restauranteId,
      usuario: localStorageData.usuario,
      rol: localStorageData.rol,
      nombreCompleto: localStorageData.nombreCompleto,
    });
  } else {
    console.log("❌ Usuario no autenticado en restaurante - datos faltantes:", {
      restauranteId: !!localStorageData.restauranteId,
      usuario: !!localStorageData.usuario,
      rol: !!localStorageData.rol,
    });
  }
} else if (isSuperAdminSystem) {
  console.log("👑 Sistema de superadmin detectado");
  
  if (localStorageData.superadmin_email && localStorageData.superadmin_rol) {
    console.log("✅ Superadmin autenticado:", {
      email: localStorageData.superadmin_email,
      rol: localStorageData.superadmin_rol,
    });
  } else {
    console.log("❌ Superadmin no autenticado");
  }
} else {
  console.log("❓ Sistema no reconocido");
}

// Función para limpiar datos de restaurante
const limpiarDatosRestaurante = () => {
  console.log("🧹 Limpiando datos de restaurante...");
  
  localStorage.removeItem("restauranteId");
  localStorage.removeItem("nombreResto");
  localStorage.removeItem("codActivacion");
  localStorage.removeItem("emailResto");
  localStorage.removeItem("cantUsuarios");
  localStorage.removeItem("finanzas");
  localStorage.removeItem("logo");
  localStorage.removeItem("usuario");
  localStorage.removeItem("nombreCompleto");
  localStorage.removeItem("rol");
  localStorage.removeItem("usuarioId");
  localStorage.removeItem("userImage");
  localStorage.removeItem("imagen");
  
  console.log("✅ Datos de restaurante limpiados");
};

// Función para limpiar datos de superadmin
const limpiarDatosSuperadmin = () => {
  console.log("🧹 Limpiando datos de superadmin...");
  
  localStorage.removeItem("superadmin_email");
  localStorage.removeItem("superadmin_rol");
  localStorage.removeItem("superAdminUser");
  localStorage.removeItem("superAdminRole");
  localStorage.removeItem("superadminImage");
  
  console.log("✅ Datos de superadmin limpiados");
};

// Función para corregir restauranteId
const corregirRestauranteId = () => {
  if (localStorageData.nombreResto) {
    const expectedRestauranteId = generarRestauranteId(localStorageData.nombreResto);
    const actualRestauranteId = localStorageData.restauranteId;
    
    if (expectedRestauranteId !== actualRestauranteId) {
      console.log("🔧 Corrigiendo restauranteId...");
      localStorage.setItem("restauranteId", expectedRestauranteId);
      console.log("✅ RestauranteId corregido:", expectedRestauranteId);
      return true;
    }
  }
  return false;
};

// Exponer funciones para uso en consola
window.debugRoleState = {
  localStorageData,
  limpiarDatosRestaurante,
  limpiarDatosSuperadmin,
  corregirRestauranteId,
  generarRestauranteId,
};

console.log("🔧 Funciones disponibles en window.debugRoleState:");
console.log("  - localStorageData: Ver datos actuales");
console.log("  - limpiarDatosRestaurante(): Limpiar datos de restaurante");
console.log("  - limpiarDatosSuperadmin(): Limpiar datos de superadmin");
console.log("  - corregirRestauranteId(): Corregir restauranteId si es necesario");
console.log("  - generarRestauranteId(nombre): Generar ID para un nombre");
