const { spawn } = require("child_process");
const { execSync } = require("child_process");

console.log("🚀 Iniciando aplicación Electron en modo desarrollo...");

// Función para verificar si un puerto está en uso
function isPortInUse(port) {
  try {
    execSync(`netstat -an | findstr :${port}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Función para esperar a que un servidor esté disponible
function waitForServer(url, maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkServer = () => {
      attempts++;

      try {
        execSync(`curl -s ${url} > /dev/null`, { stdio: "ignore" });
        console.log(`✅ Servidor disponible en ${url}`);
        resolve(url);
      } catch (error) {
        if (attempts >= maxAttempts) {
          reject(new Error(`Timeout esperando servidor en ${url}`));
          return;
        }

        console.log(
          `⏳ Esperando servidor... (intento ${attempts}/${maxAttempts})`
        );
        setTimeout(checkServer, 1000);
      }
    };

    checkServer();
  });
}

// Función principal
async function startElectronDev() {
  try {
    // 1. Iniciar Next.js en segundo plano
    console.log("🔨 Iniciando servidor Next.js...");
    const nextProcess = spawn("npm", ["run", "dev"], {
      stdio: "pipe",
      shell: true,
    });

    // 2. Esperar a que el servidor esté disponible
    let serverURL;
    try {
      serverURL = await waitForServer("http://localhost:3000");
    } catch {
      console.log("🔄 Puerto 3000 ocupado, intentando puerto 3001...");
      serverURL = await waitForServer("http://localhost:3001");
    }

    // 3. Iniciar Electron
    console.log("⚡ Iniciando Electron...");
    const electronProcess = spawn("electron", ["."], {
      stdio: "inherit",
      shell: true,
      env: { ...process.env, ELECTRON_START_URL: serverURL },
    });

    // 4. Manejar el cierre de procesos
    const cleanup = () => {
      console.log("🛑 Cerrando aplicación...");
      nextProcess.kill();
      electronProcess.kill();
      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    // 5. Manejar errores
    nextProcess.on("error", (error) => {
      console.error("❌ Error en Next.js:", error);
      cleanup();
    });

    electronProcess.on("error", (error) => {
      console.error("❌ Error en Electron:", error);
      cleanup();
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

startElectronDev();
