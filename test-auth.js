// Test script to verify authentication flow
console.log("🧪 Testing Authentication Flow");

// Simulate the authentication process
function testAuthFlow() {
  console.log("1. Clearing localStorage...");
  localStorage.clear();

  console.log("2. Setting restaurant data...");
  localStorage.setItem("nombreResto", "Test Restaurant");
  localStorage.setItem("codActivacion", "TEST123");

  console.log("3. Setting user data...");
  localStorage.setItem("usuario", "testuser");
  localStorage.setItem("rol", "admin");

  console.log("4. Checking authentication data...");
  const restauranteId = localStorage.getItem("restauranteId");
  const usuario = localStorage.getItem("usuario");
  const rol = localStorage.getItem("rol");
  const nombreResto = localStorage.getItem("nombreResto");
  const codActivacion = localStorage.getItem("codActivacion");

  console.log("📋 Authentication Data:", {
    restauranteId,
    usuario,
    rol,
    nombreResto,
    codActivacion,
  });

  const isAuthenticated =
    restauranteId && usuario && rol && nombreResto && codActivacion;
  console.log(
    "✅ Authentication Status:",
    isAuthenticated ? "AUTHENTICATED" : "NOT AUTHENTICATED"
  );

  return isAuthenticated;
}

// Run the test
if (typeof window !== "undefined") {
  testAuthFlow();
} else {
  console.log("This script should be run in a browser environment");
}
