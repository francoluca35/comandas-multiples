// Script para debuggear el bloqueo del usuario admin
console.log("🔒 Iniciando debug del bloqueo de usuario admin...");

// Función para verificar estado de usuarios
const checkUserState = () => {
  console.log("📋 ESTADO DE USUARIOS");
  console.log("====================");
  
  // Simular datos de usuarios (esto debería venir del hook useRestaurantUsers)
  const mockUsers = [
    { id: "1", usuario: "admin", rol: "admin", activo: true },
    { id: "2", usuario: "usuario1", rol: "usuario", activo: true },
    { id: "3", usuario: "manager", rol: "admin", activo: true }
  ];
  
  console.log("👥 Todos los usuarios:", mockUsers);
  
  // Filtrar usuarios válidos (excluyendo admin)
  const usuariosValidos = mockUsers.filter(user => user.usuario !== "admin");
  console.log("✅ Usuarios válidos (sin admin):", usuariosValidos);
  
  // Verificar si solo existe admin
  const soloAdmin = usuariosValidos.length === 0;
  console.log("🔒 Solo existe admin:", soloAdmin ? "✅ SÍ" : "❌ NO");
  
  // Verificar conteo
  console.log(`📊 Conteo: ${usuariosValidos.length} usuarios válidos`);
  
  return {
    todosLosUsuarios: mockUsers,
    usuariosValidos,
    soloAdmin,
    conteo: usuariosValidos.length
  };
};

// Función para simular diferentes escenarios
const simulateScenarios = () => {
  console.log("🎭 SIMULANDO ESCENARIOS");
  console.log("=======================");
  
  // Escenario 1: Solo admin
  console.log("📋 Escenario 1: Solo admin existe");
  const scenario1 = [
    { id: "1", usuario: "admin", rol: "admin", activo: true }
  ];
  const validos1 = scenario1.filter(user => user.usuario !== "admin");
  console.log(`   Usuarios válidos: ${validos1.length}`);
  console.log(`   Debe mostrar formulario: ${validos1.length === 0 ? "✅ SÍ" : "❌ NO"}`);
  
  // Escenario 2: Admin + otros usuarios
  console.log("📋 Escenario 2: Admin + otros usuarios");
  const scenario2 = [
    { id: "1", usuario: "admin", rol: "admin", activo: true },
    { id: "2", usuario: "usuario1", rol: "usuario", activo: true },
    { id: "3", usuario: "manager", rol: "admin", activo: true }
  ];
  const validos2 = scenario2.filter(user => user.usuario !== "admin");
  console.log(`   Usuarios válidos: ${validos2.length}`);
  console.log(`   Debe mostrar formulario: ${validos2.length === 0 ? "✅ SÍ" : "❌ NO"}`);
  
  // Escenario 3: Sin admin
  console.log("📋 Escenario 3: Sin admin");
  const scenario3 = [
    { id: "2", usuario: "usuario1", rol: "usuario", activo: true },
    { id: "3", usuario: "manager", rol: "admin", activo: true }
  ];
  const validos3 = scenario3.filter(user => user.usuario !== "admin");
  console.log(`   Usuarios válidos: ${validos3.length}`);
  console.log(`   Debe mostrar formulario: ${validos3.length === 0 ? "✅ SÍ" : "❌ NO"}`);
  
  // Escenario 4: Sin usuarios
  console.log("📋 Escenario 4: Sin usuarios");
  const scenario4 = [];
  const validos4 = scenario4.filter(user => user.usuario !== "admin");
  console.log(`   Usuarios válidos: ${validos4.length}`);
  console.log(`   Debe mostrar formulario: ${validos4.length === 0 ? "✅ SÍ" : "❌ NO"}`);
};

// Función para verificar validaciones
const checkValidations = () => {
  console.log("🔍 VERIFICANDO VALIDACIONES");
  console.log("===========================");
  
  const testUsernames = [
    "admin",
    "Admin",
    "ADMIN",
    "administrator",
    "usuario1",
    "manager",
    "test_user"
  ];
  
  testUsernames.forEach(username => {
    const isBlocked = username.toLowerCase() === "admin";
    console.log(`   "${username}": ${isBlocked ? "❌ BLOQUEADO" : "✅ PERMITIDO"}`);
  });
};

// Función para verificar localStorage
const checkLocalStorage = () => {
  console.log("💾 VERIFICANDO LOCALSTORAGE");
  console.log("============================");
  
  const authData = {
    usuario: localStorage.getItem("usuario"),
    nombreCompleto: localStorage.getItem("nombreCompleto"),
    usuarioId: localStorage.getItem("usuarioId"),
    rol: localStorage.getItem("rol"),
    restauranteId: localStorage.getItem("restauranteId")
  };
  
  console.log("📦 Datos de autenticación:", authData);
  
  // Verificar si el usuario actual es admin
  const isCurrentUserAdmin = authData.usuario === "admin";
  console.log(`🔒 Usuario actual es admin: ${isCurrentUserAdmin ? "⚠️ SÍ" : "✅ NO"}`);
  
  if (isCurrentUserAdmin) {
    console.log("⚠️ ADVERTENCIA: Usuario admin detectado en localStorage");
    console.log("💡 Recomendación: Limpiar datos y crear nuevo usuario");
  }
  
  return {
    authData,
    isCurrentUserAdmin
  };
};

// Función para limpiar datos de admin
const clearAdminData = () => {
  console.log("🧹 LIMPIANDO DATOS DE ADMIN");
  console.log("===========================");
  
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
  
  let removedCount = 0;
  keysToRemove.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`   🗑️ Removido: ${key} = "${value}"`);
    }
  });
  
  console.log(`✅ Total removidos: ${removedCount} items`);
  console.log("🔄 Recomendación: Recargar página para aplicar cambios");
  
  return removedCount;
};

// Función para verificar estado del formulario
const checkFormState = () => {
  console.log("📝 VERIFICANDO ESTADO DEL FORMULARIO");
  console.log("====================================");
  
  // Simular lógica del formulario
  const mockUsers = [
    { id: "1", usuario: "admin", rol: "admin", activo: true }
  ];
  
  const usuariosValidos = mockUsers.filter(user => user.usuario !== "admin");
  const shouldShowForm = usuariosValidos.length === 0;
  
  console.log(`👥 Usuarios totales: ${mockUsers.length}`);
  console.log(`✅ Usuarios válidos: ${usuariosValidos.length}`);
  console.log(`📝 Debe mostrar formulario: ${shouldShowForm ? "✅ SÍ" : "❌ NO"}`);
  
  if (shouldShowForm) {
    console.log("💡 El formulario debería mostrarse automáticamente");
    console.log("💡 No se puede cerrar hasta crear un usuario válido");
  } else {
    console.log("💡 El formulario se puede mostrar/ocultar normalmente");
  }
  
  return {
    totalUsers: mockUsers.length,
    validUsers: usuariosValidos.length,
    shouldShowForm
  };
};

// Función para generar reporte completo
const generateReport = () => {
  console.log("📊 REPORTE COMPLETO DE BLOQUEO ADMIN");
  console.log("====================================");
  
  const userState = checkUserState();
  const localStorageState = checkLocalStorage();
  const formState = checkFormState();
  
  console.log("\n🎯 RESUMEN:");
  console.log(`   - Usuarios válidos: ${userState.conteo}`);
  console.log(`   - Solo admin existe: ${userState.soloAdmin ? "✅ SÍ" : "❌ NO"}`);
  console.log(`   - Usuario actual es admin: ${localStorageState.isCurrentUserAdmin ? "⚠️ SÍ" : "✅ NO"}`);
  console.log(`   - Formulario debe mostrarse: ${formState.shouldShowForm ? "✅ SÍ" : "❌ NO"}`);
  
  if (userState.soloAdmin) {
    console.log("\n🔒 RECOMENDACIONES:");
    console.log("   1. Crear un nuevo usuario");
    console.log("   2. No usar el usuario 'admin'");
    console.log("   3. Configurar credenciales biométricas");
  }
  
  if (localStorageState.isCurrentUserAdmin) {
    console.log("\n⚠️ ADVERTENCIAS:");
    console.log("   1. Usuario admin detectado en sesión");
    console.log("   2. Considerar limpiar datos");
    console.log("   3. Crear nuevo usuario para uso");
  }
  
  return {
    userState,
    localStorageState,
    formState
  };
};

// Exportar funciones para uso manual
if (typeof window !== "undefined") {
  window.adminBlockDebug = {
    checkUserState,
    simulateScenarios,
    checkValidations,
    checkLocalStorage,
    clearAdminData,
    checkFormState,
    generateReport
  };
  
  console.log("🔧 Funciones de debug disponibles:");
  console.log("  - window.adminBlockDebug.checkUserState()");
  console.log("  - window.adminBlockDebug.simulateScenarios()");
  console.log("  - window.adminBlockDebug.checkValidations()");
  console.log("  - window.adminBlockDebug.checkLocalStorage()");
  console.log("  - window.adminBlockDebug.clearAdminData()");
  console.log("  - window.adminBlockDebug.checkFormState()");
  console.log("  - window.adminBlockDebug.generateReport()");
}

// Ejecutar reporte inicial automáticamente
generateReport();
