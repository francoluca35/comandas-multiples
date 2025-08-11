const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Iniciando build de Electron...");

try {
  // 1. Limpiar directorios anteriores
  console.log("📁 Limpiando directorios anteriores...");
  if (fs.existsSync("out")) {
    fs.rmSync("out", { recursive: true, force: true });
  }
  if (fs.existsSync("dist")) {
    fs.rmSync("dist", { recursive: true, force: true });
  }
  if (fs.existsSync(".next")) {
    fs.rmSync(".next", { recursive: true, force: true });
  }

  // 2. Construir la aplicación Next.js
  console.log("🔨 Construyendo aplicación Next.js...");
  execSync("npm run build", { stdio: "inherit" });

  // 3. Construir la aplicación Electron
  console.log("⚡ Construyendo aplicación Electron...");
  execSync("npx electron-builder --publish=never", { stdio: "inherit" });

  console.log("✅ Build completado exitosamente!");
  console.log('📦 Los archivos de distribución están en la carpeta "dist"');

  // 4. Mostrar información de los archivos generados
  if (fs.existsSync("dist")) {
    const distFiles = fs.readdirSync("dist");
    console.log("📋 Archivos generados:");
    distFiles.forEach((file) => {
      console.log(`   - ${file}`);
    });
  }
} catch (error) {
  console.error("❌ Error durante el build:", error.message);
  process.exit(1);
}
