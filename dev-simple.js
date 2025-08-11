const { spawn } = require("child_process");

console.log("🚀 Iniciando aplicación Electron (modo simple)...");

// Iniciar Next.js
const nextProcess = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  shell: true,
});

// Esperar 5 segundos y luego iniciar Electron
setTimeout(() => {
  console.log("⚡ Iniciando Electron...");
  const electronProcess = spawn("electron", ["."], {
    stdio: "inherit",
    shell: true,
  });

  // Manejar cierre
  const cleanup = () => {
    console.log("🛑 Cerrando aplicación...");
    nextProcess.kill();
    electronProcess.kill();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}, 5000);
