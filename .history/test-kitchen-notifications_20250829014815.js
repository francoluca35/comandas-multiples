// Script de prueba para el sistema de notificaciones de cocina
// Ejecutar en la consola del navegador en la página de cocina

console.log("🧪 Iniciando pruebas del sistema de notificaciones de cocina...");

// Función para simular un nuevo pedido
function simularNuevoPedido() {
  console.log("📝 Simulando nuevo pedido...");
  
  const restauranteId = localStorage.getItem("restauranteId");
  if (!restauranteId) {
    console.error("❌ No se encontró restauranteId en localStorage");
    return;
  }

  const pedidoPrueba = {
    restauranteId: restauranteId,
    mesa: "MESA PRUEBA",
    productos: [
      {
        nombre: "Hamburguesa de Prueba",
        cantidad: 2,
        precio: 1500,
        notas: "Sin cebolla"
      },
      {
        nombre: "Papas Fritas",
        cantidad: 1,
        precio: 800,
        notas: ""
      }
    ],
    total: 3800,
    cliente: "Cliente de Prueba",
    notas: "Pedido de prueba para verificar notificaciones",
    tipo: "salon"
  };

  fetch("/api/pedidos-cocina", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pedidoPrueba),
  })
  .then(response => response.json())
  .then(data => {
    console.log("✅ Pedido de prueba creado:", data);
    console.log("🔔 Debería activarse la notificación en los próximos 3-5 segundos...");
  })
  .catch(error => {
    console.error("❌ Error creando pedido de prueba:", error);
  });
}

// Función para verificar el estado del sistema
function verificarEstadoSistema() {
  console.log("🔍 Verificando estado del sistema...");
  
  // Verificar localStorage
  const restauranteId = localStorage.getItem("restauranteId");
  console.log("📍 RestauranteId:", restauranteId ? "✅ Encontrado" : "❌ No encontrado");
  
  // Verificar si estamos en la página de cocina
  const enCocina = window.location.pathname.includes('/cocina');
  console.log("🍳 En página de cocina:", enCocina ? "✅ Sí" : "❌ No");
  
  // Verificar si hay pedidos cargados
  const pedidosElements = document.querySelectorAll('[data-pedido-id]');
  console.log("📊 Pedidos en DOM:", pedidosElements.length);
  
  // Verificar indicador de polling
  const pollingIndicator = document.querySelector('.animate-pulse');
  console.log("🔄 Indicador de polling:", pollingIndicator ? "✅ Activo" : "❌ No encontrado");
  
  // Verificar botón de prueba de sonido
  const testButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Probar Sonido')
  );
  console.log("🔊 Botón de prueba:", testButton ? "✅ Encontrado" : "❌ No encontrado");
}

// Función para limpiar pedidos de prueba
function limpiarPedidosPrueba() {
  console.log("🧹 Limpiando pedidos de prueba...");
  
  const restauranteId = localStorage.getItem("restauranteId");
  if (!restauranteId) {
    console.error("❌ No se encontró restauranteId");
    return;
  }

  // Obtener todos los pedidos
  fetch(`/api/pedidos-cocina?restauranteId=${restauranteId}`)
    .then(response => response.json())
    .then(pedidos => {
      const pedidosPrueba = pedidos.filter(pedido => 
        pedido.mesa === "MESA PRUEBA" || 
        pedido.cliente === "Cliente de Prueba"
      );
      
      console.log(`🗑️ Encontrados ${pedidosPrueba.length} pedidos de prueba para eliminar`);
      
      // Nota: La API actual no tiene DELETE, pero podemos marcarlos como "realizado"
      pedidosPrueba.forEach(pedido => {
        fetch("/api/pedidos-cocina", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            restauranteId: restauranteId,
            pedidoId: pedido.id,
            nuevoEstado: "realizado"
          }),
        })
        .then(() => console.log(`✅ Pedido ${pedido.id} marcado como realizado`))
        .catch(error => console.error(`❌ Error eliminando pedido ${pedido.id}:`, error));
      });
    })
    .catch(error => {
      console.error("❌ Error obteniendo pedidos:", error);
    });
}

// Función para probar el sonido manualmente
function probarSonido() {
  console.log("🔊 Probando sonido manualmente...");
  
  // Buscar el botón de prueba y hacer clic
  const testButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Probar Sonido')
  );
  
  if (testButton) {
    testButton.click();
    console.log("✅ Clic en botón de prueba realizado");
  } else {
    console.log("❌ No se encontró el botón de prueba");
  }
}

// Función para mostrar ayuda
function mostrarAyuda() {
  console.log(`
🧪 SISTEMA DE PRUEBAS DE NOTIFICACIONES DE COCINA

Comandos disponibles:

1. simularNuevoPedido()     - Crea un pedido de prueba para activar notificación
2. verificarEstadoSistema() - Verifica el estado actual del sistema
3. limpiarPedidosPrueba()   - Limpia pedidos de prueba creados
4. probarSonido()          - Prueba el sonido manualmente
5. mostrarAyuda()          - Muestra esta ayuda

Para usar:
1. Abrir la consola del navegador (F12)
2. Ir a la página de cocina
3. Ejecutar los comandos deseados

Ejemplo:
> verificarEstadoSistema()
> simularNuevoPedido()
  `);
}

// Mostrar ayuda al cargar
mostrarAyuda();

// Exportar funciones para uso global
window.testKitchenNotifications = {
  simularNuevoPedido,
  verificarEstadoSistema,
  limpiarPedidosPrueba,
  probarSonido,
  mostrarAyuda
};

console.log("✅ Script de pruebas cargado. Usa testKitchenNotifications.ayuda() para ver comandos disponibles.");
