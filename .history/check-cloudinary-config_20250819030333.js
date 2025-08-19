#!/usr/bin/env node

// Script para verificar la configuración de Cloudinary
console.log("🔧 Verificando configuración de Cloudinary...\n");

// Verificar variables de entorno
const envVars = {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,
};

console.log("📋 Variables de entorno:");
Object.entries(envVars).forEach(([key, value]) => {
  const status = value ? "✅" : "❌";
  const displayValue = value ? (key.includes("SECRET") ? "***" : value) : "No configurada";
  console.log(`  ${status} ${key}: ${displayValue}`);
});

// Verificar configuración actual
const cloudName = envVars.CLOUDINARY_CLOUD_NAME || envVars.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "diwlchtx1";
const uploadPreset = envVars.CLOUDINARY_UPLOAD_PRESET || "ml_default";

console.log("\n🔧 Configuración actual:");
console.log(`  Cloud Name: ${cloudName}`);
console.log(`  Upload Preset: ${uploadPreset}`);

// Verificar si las APIs están disponibles
console.log("\n🌐 Verificando APIs...");

// Verificar API de registro de usuarios
const testUserRegistration = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/usuarios/registro", {
      method: "POST",
      body: new FormData(),
    });
    console.log(`  ✅ API /api/usuarios/registro: ${response.status}`);
  } catch (error) {
    console.log(`  ❌ API /api/usuarios/registro: ${error.message}`);
  }
};

// Verificar API de registro de comandas
const testComandaRegistration = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/register-comanda", {
      method: "POST",
      body: new FormData(),
    });
    console.log(`  ✅ API /api/register-comanda: ${response.status}`);
  } catch (error) {
    console.log(`  ❌ API /api/register-comanda: ${error.message}`);
  }
};

// Ejecutar verificaciones si el servidor está corriendo
if (process.env.NODE_ENV !== "production") {
  testUserRegistration();
  testComandaRegistration();
}

console.log("\n📝 Recomendaciones:");
if (!envVars.CLOUDINARY_CLOUD_NAME && !envVars.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  console.log("  ❌ Configura CLOUDINARY_CLOUD_NAME en tu archivo .env.local");
}
if (!envVars.CLOUDINARY_UPLOAD_PRESET) {
  console.log("  ❌ Configura CLOUDINARY_UPLOAD_PRESET en tu archivo .env.local");
}
if (!envVars.CLOUDINARY_API_KEY || !envVars.CLOUDINARY_API_SECRET) {
  console.log("  ⚠️  Para funcionalidades avanzadas, configura API_KEY y API_SECRET");
}

console.log("\n📖 Para más información, consulta CLOUDINARY_SETUP.md");
