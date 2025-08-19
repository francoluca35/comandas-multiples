const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

// Configuración de Firebase (ajusta según tu configuración)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "tu_api_key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "tu_auth_domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "tu_project_id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "tu_storage_bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "tu_messaging_sender_id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "tu_app_id",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugAuthState() {
  try {
    console.log("🔍 DEBUG: Verificando estado de autenticación...");

    // Verificar usuarios superadmin
    console.log("\n📋 Verificando usuarios superadmin...");
    const usuariosRef = collection(db, "usuarios");
    const usuariosSnapshot = await getDocs(usuariosRef);
    
    const superadmins = [];
    usuariosSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.rol === "superadmin") {
        superadmins.push({
          email: doc.id,
          ...data,
        });
      }
    });

    console.log(`✅ Encontrados ${superadmins.length} superadministradores:`);
    superadmins.forEach((admin, index) => {
      console.log(`  ${index + 1}. ${admin.email}`);
      console.log(`     - Rol: ${admin.rol}`);
      console.log(`     - Imagen: ${admin.imagen || "No disponible"}`);
      console.log(`     - Creado: ${admin.creado ? new Date(admin.creado).toLocaleString() : "No disponible"}`);
    });

    // Verificar restaurantes
    console.log("\n🏪 Verificando restaurantes...");
    const restaurantesRef = collection(db, "restaurantes");
    const restaurantesSnapshot = await getDocs(restaurantesRef);
    
    const restaurantes = [];
    restaurantesSnapshot.forEach((doc) => {
      restaurantes.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log(`✅ Encontrados ${restaurantes.length} restaurantes:`);
    restaurantes.forEach((rest, index) => {
      console.log(`  ${index + 1}. ${rest.nombre || rest.id}`);
      console.log(`     - ID: ${rest.id}`);
      console.log(`     - Código Activación: ${rest.codigoActivacion || "No disponible"}`);
      console.log(`     - Email: ${rest.email || "No disponible"}`);
      console.log(`     - Creado: ${rest.creadoEn ? new Date(rest.creadoEn).toLocaleString() : "No disponible"}`);
    });

    // Verificar códigos de activación
    console.log("\n🔑 Verificando códigos de activación...");
    const codigosRef = collection(db, "codigosactivacion");
    const codigosSnapshot = await getDocs(codigosRef);
    
    const codigos = [];
    codigosSnapshot.forEach((doc) => {
      codigos.push({
        codigo: doc.id,
        ...doc.data(),
      });
    });

    console.log(`✅ Encontrados ${codigos.length} códigos de activación:`);
    codigos.forEach((codigo, index) => {
      console.log(`  ${index + 1}. ${codigo.codigo}`);
      console.log(`     - Email: ${codigo.email || "No disponible"}`);
      console.log(`     - Restaurante: ${codigo.resto || "No disponible"}`);
      console.log(`     - Cantidad Usuarios: ${codigo.cantUsuarios || "No disponible"}`);
      console.log(`     - Finanzas: ${codigo.finanzas ? "Sí" : "No"}`);
      console.log(`     - Timestamp: ${codigo.timestamp ? new Date(codigo.timestamp).toLocaleString() : "No disponible"}`);
    });

    console.log("\n✅ Verificación completada exitosamente");

  } catch (error) {
    console.error("❌ Error durante la verificación:", error);
  }
}

// Ejecutar la verificación
debugAuthState();
