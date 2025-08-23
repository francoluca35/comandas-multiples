// Script para debuggear el problema del stock NaN
const debugStockIssue = async () => {
  try {
    // Obtener el restauranteId del localStorage
    const restauranteId = localStorage.getItem("restauranteId");
    console.log("🏪 Restaurante ID:", restauranteId);

    if (!restauranteId) {
      console.error("❌ No hay restaurante seleccionado");
      return;
    }

    // Hacer la petición a la API de stock
    const response = await fetch(`/api/stock?restauranteId=${restauranteId}`);
    console.log("📡 Response status:", response.status);
    console.log("📡 Response ok:", response.ok);

    if (!response.ok) {
      console.error("❌ Error en la respuesta:", response.status, response.statusText);
      return;
    }

    const productos = await response.json();
    console.log("📦 Productos obtenidos:", productos.length);
    console.log("📦 Productos:", productos);

    // Analizar cada producto para encontrar problemas
    productos.forEach((producto, index) => {
      console.log(`\n🔍 Producto ${index + 1}:`, producto.nombre);
      console.log("   Stock:", producto.stock, "Tipo:", typeof producto.stock);
      console.log("   Precio:", producto.precio, "Tipo:", typeof producto.precio);
      console.log("   Costo:", producto.costo, "Tipo:", typeof producto.costo);
      
      // Verificar si hay valores problemáticos
      if (producto.stock === undefined || producto.stock === null || isNaN(producto.stock)) {
        console.error("   ❌ PROBLEMA CON STOCK:", producto.stock);
      }
      if (producto.precio === undefined || producto.precio === null || isNaN(producto.precio)) {
        console.error("   ❌ PROBLEMA CON PRECIO:", producto.precio);
      }
      if (producto.costo === undefined || producto.costo === null || isNaN(producto.costo)) {
        console.error("   ❌ PROBLEMA CON COSTO:", producto.costo);
      }
    });

    // Simular el cálculo que hace useStock
    const totalStock = productos.reduce((total, producto) => {
      const stockValue = Number(producto.stock) || 0;
      console.log(`   Sumando stock de ${producto.nombre}: ${stockValue} (original: ${producto.stock})`);
      return total + stockValue;
    }, 0);

    console.log("\n📊 RESULTADO DEL CÁLCULO:");
    console.log("   Total Stock:", totalStock);
    console.log("   Es NaN:", isNaN(totalStock));

  } catch (error) {
    console.error("❌ Error en debug:", error);
  }
};

// Ejecutar el debug
debugStockIssue();
