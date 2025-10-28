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

      // Variable para controlar si el stream está cerrado
      let isStreamClosed = false;

      // Escuchar cambios en tiempo real
      const unsubscribe = onSnapshot(q, (snapshot) => {
        // Verificar si el stream está cerrado antes de procesar
        if (isStreamClosed) {
          console.log("🔌 SSE: Stream cerrado, ignorando cambios");
          return;
        }

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

              // Verificar si el controlador está cerrado antes de enviar
              try {
                const event = `data: ${JSON.stringify(eventData)}\n\n`;
                controller.enqueue(encoder.encode(event));
              } catch (error) {
                console.log("🔌 SSE: Controlador cerrado, deteniendo listener");
                isStreamClosed = true;
                unsubscribe();
              }
            }
          }
        });
      }, (error) => {
        console.error("❌ SSE: Error en listener:", error);
        if (!isStreamClosed) {
          try {
            const errorEvent = `data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`;
            controller.enqueue(encoder.encode(errorEvent));
          } catch (e) {
            console.log("🔌 SSE: Error al enviar evento de error, stream cerrado");
            isStreamClosed = true;
          }
        }
      });

      // Manejar desconexión del cliente
      const handleDisconnect = () => {
        console.log("🔌 SSE: Cliente desconectado");
        isStreamClosed = true;
        unsubscribe();
        try {
          controller.close();
        } catch (error) {
          console.log("🔌 SSE: Controlador ya estaba cerrado");
        }
      };

      // Enviar evento de conexión establecida
      const connectEvent = `data: ${JSON.stringify({ type: "connected", message: "Conexión establecida" })}\n\n`;
      controller.enqueue(encoder.encode(connectEvent));

      // Cleanup cuando se cierre la conexión
      return () => {
        console.log("🔌 SSE: Cleanup ejecutado");
        isStreamClosed = true;
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
