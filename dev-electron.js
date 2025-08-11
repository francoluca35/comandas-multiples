const { spawn } = require("child_process");

console.log("🚀 Iniciando aplicación Electron...");

// Función para limpiar procesos
const cleanup = () => {
  console.log("🛑 Cerrando aplicación...");
  process.exit(0);
};

// Manejar señales de cierre
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Iniciar Next.js
console.log("🔨 Iniciando servidor Next.js...");
const nextProcess = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NODE_ENV: "development" },
});

// Esperar 8 segundos para que Next.js se inicie completamente
setTimeout(() => {
  console.log("⚡ Iniciando Electron...");
  const electronProcess = spawn("electron", ["."], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, NODE_ENV: "development" },
  });

  // Manejar cierre de Electron
  electronProcess.on("close", () => {
    console.log("🛑 Electron cerrado, cerrando Next.js...");
    nextProcess.kill();
    process.exit(0);
  });

  electronProcess.on("error", (error) => {
    console.error("❌ Error en Electron:", error);
    nextProcess.kill();
    process.exit(1);
  });
}, 8000);

// Manejar errores de Next.js
nextProcess.on("error", (error) => {
  console.error("❌ Error en Next.js:", error);
  process.exit(1);
});
