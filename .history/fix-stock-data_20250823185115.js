// Script para limpiar datos corruptos en el stock
import { db } from "./lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const fixStockData = async () => {
  try {
    // Obtener el restauranteId del localStorage
    const restauranteId = localStorage.getItem("restauranteId");
    console.log("🏪 Restaurante ID:", restauranteId);

    if (!restauranteId) {
      console.error("❌ No hay restaurante seleccionado");
      return;
    }

    // Obtener todos los productos del stock
    const stockRef = collection(db, "restaurantes", restauranteId, "stock");
    const querySnapshot = await getDocs(stockRef);

    console.log(`📦 Encontrados ${querySnapshot.size} productos en stock`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      const docId = docSnapshot.id;
      
      console.log(`\n🔍 Revisando producto: ${data.nombre || 'Sin nombre'}`);
      console.log("   Stock original:", data.stock, "Tipo:", typeof data.stock);
      console.log("   Precio original:", data.precio, "Tipo:", typeof data.precio);
      console.log("   Costo original:", data.costo, "Tipo:", typeof data.costo);

      let needsUpdate = false;
      const updateData = {};

      // Verificar y corregir stock
      if (data.stock === undefined || data.stock === null || isNaN(data.stock)) {
        updateData.stock = 0;
        needsUpdate = true;
        console.log("   ⚠️ Stock corrupto, estableciendo a 0");
      }

      // Verificar y corregir precio
      if (data.precio === undefined || data.precio === null || isNaN(data.precio)) {
        updateData.precio = 0;
        needsUpdate = true;
        console.log("   ⚠️ Precio corrupto, estableciendo a 0");
      }

      // Verificar y corregir costo
      if (data.costo === undefined || data.costo === null || isNaN(data.costo)) {
        updateData.costo = 0;
        needsUpdate = true;
        console.log("   ⚠️ Costo corrupto, estableciendo a 0");
      }

      // Aplicar correcciones si es necesario
      if (needsUpdate) {
        try {
          const docRef = doc(db, "restaurantes", restauranteId, "stock", docId);
          await updateDoc(docRef, updateData);
          fixedCount++;
          console.log("   ✅ Producto corregido");
        } catch (error) {
          errorCount++;
          console.error("   ❌ Error corrigiendo producto:", error);
        }
      } else {
        console.log("   ✅ Producto OK");
      }
    }

    console.log(`\n📊 RESUMEN:`);
    console.log(`   Productos corregidos: ${fixedCount}`);
    console.log(`   Errores: ${errorCount}`);
    console.log(`   Total revisados: ${querySnapshot.size}`);

  } catch (error) {
    console.error("❌ Error en fixStockData:", error);
  }
};

// Ejecutar la corrección
fixStockData();
