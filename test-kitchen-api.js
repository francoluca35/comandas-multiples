// Script de prueba para la API de pedidos de cocina
const testKitchenAPI = async () => {
  const testOrder = {
    restauranteId: "test-restaurant",
    mesa: "TAKEAWAY",
    productos: [
      {
        id: "test-product-1",
        nombre: "Hamburguesa Clásica",
        precio: 15.99,
        cantidad: 2,
        descuento: 0
      }
    ],
    total: 31.98,
    cliente: "Cliente de Prueba",
    notas: "Método de pago: efectivo | Monto recibido: $35.00 | Vuelto: $3.02",
    metodoPago: "efectivo",
    montoRecibido: 35.00,
    vuelto: 3.02,
    whatsapp: "5491234567890",
    timestamp: new Date(),
    estado: "pendiente"
  };

  console.log("🧪 Probando API de pedidos de cocina...");
  console.log("📦 Datos del pedido:", testOrder);

  try {
    const response = await fetch("/api/pedidos-cocina", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testOrder),
    });

    console.log("📡 Respuesta del servidor:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Pedido creado exitosamente:", result);
    } else {
      const errorData = await response.json();
      console.error("❌ Error del servidor:", errorData);
    }
  } catch (error) {
    console.error("❌ Error de red:", error);
  }
};

// Ejecutar la prueba
testKitchenAPI();
