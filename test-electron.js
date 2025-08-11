const { spawn } = require("child_process");

console.log("🧪 Probando Electron con página simple...");

// Crear una página HTML simple para probar
const fs = require("fs");
const path = require("path");

const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Electron</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        h1 { margin-bottom: 1rem; }
        p { margin-bottom: 0.5rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 ¡Electron funciona!</h1>
        <p>La aplicación Electron se está ejecutando correctamente.</p>
        <p>Versión: ${process.env.npm_package_version || "1.0.0"}</p>
        <p>Plataforma: ${process.platform}</p>
        <p>Node.js: ${process.version}</p>
    </div>
</body>
</html>
`;

// Guardar el archivo HTML temporal
const testPath = path.join(__dirname, "test.html");
fs.writeFileSync(testPath, testHTML);

// Iniciar Electron con el archivo de prueba
const electronProcess = spawn("electron", [testPath], {
  stdio: "inherit",
  shell: true,
});

// Limpiar cuando se cierre
electronProcess.on("close", () => {
  console.log("🧹 Limpiando archivo temporal...");
  try {
    fs.unlinkSync(testPath);
  } catch (error) {
    console.log("Archivo temporal ya eliminado");
  }
  process.exit(0);
});

// Manejar errores
electronProcess.on("error", (error) => {
  console.error("❌ Error en Electron:", error);
  try {
    fs.unlinkSync(testPath);
  } catch (e) {}
  process.exit(1);
});

// Manejar señales de cierre
process.on("SIGINT", () => {
  console.log("🛑 Cerrando prueba...");
  electronProcess.kill();
});

process.on("SIGTERM", () => {
  console.log("🛑 Cerrando prueba...");
  electronProcess.kill();
});
