import { NextResponse } from "next/server";
import { db } from "../../../../../lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";

// Server-Sent Events endpoint para notificaciones en tiempo real
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const restauranteId = searchParams.get("restauranteId");

  if (!restauranteId) {
    return NextResponse.json(
      { error: "restauranteId es requerido" },
      { status: 400 }
    );
  }

  // Configurar headers para SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      console.log("🔌 SSE: Conexión iniciada para restaurante:", restauranteId);

      // Crear query para escuchar cambios en pedidos
      const pedidosRef = collection(db, `restaurantes/${restauranteId}/pedidosCocina`);
      const q = query(pedidosRef, orderBy("timestamp", "desc"));

      // Escuchar cambios en tiempo real
      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const pedido = {
              id: change.doc.id,
              ...change.doc.data(),
            };

            // Solo notificar pedidos nuevos con estado "pendiente"
            if (pedido.estado === "pendiente") {
              console.log("🔔 SSE: Nuevo pedido detectado:", pedido.id);
              
              const eventData = {
                type: "new-order",
                data: pedido,
                timestamp: new Date().toISOString(),
              };

              // Enviar evento SSE
              const event = `data: ${JSON.stringify(eventData)}\n\n`;
              controller.enqueue(encoder.encode(event));
            }
          }
        });
      }, (error) => {
        console.error("❌ SSE: Error en listener:", error);
        const errorEvent = `data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`;
        controller.enqueue(encoder.encode(errorEvent));
      });

      // Manejar desconexión del cliente
      const handleDisconnect = () => {
        console.log("🔌 SSE: Cliente desconectado");
        unsubscribe();
        controller.close();
      };

      // Enviar evento de conexión establecida
      const connectEvent = `data: ${JSON.stringify({ type: "connected", message: "Conexión establecida" })}\n\n`;
      controller.enqueue(encoder.encode(connectEvent));

      // Cleanup cuando se cierre la conexión
      return () => {
        unsubscribe();
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
