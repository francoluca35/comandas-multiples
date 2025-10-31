import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// GET - Obtener todos los pedidos de cocina
export async function GET(request) {
  try {
    console.log("🍳 API: Recibiendo request para obtener pedidos de cocina");
    const { searchParams } = new URL(request.url);
    const restauranteId = searchParams.get("restauranteId");
    const estado = searchParams.get("estado"); // "pendiente", "en_preparacion", "listo"

    console.log("📍 RestauranteId:", restauranteId);
    console.log("📍 Estado filtro:", estado);

    if (!restauranteId) {
      return NextResponse.json(
        { error: "restauranteId es requerido" },
        { status: 400 }
      );
    }

    let q = collection(db, `restaurantes/${restauranteId}/pedidosCocina`);

    if (estado) {
      q = query(q, where("estado", "==", estado));
    }

    q = query(q, orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(q);
    const pedidos = [];

    querySnapshot.forEach((doc) => {
      pedidos.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log("📊 API: Encontrados", pedidos.length, "pedidos");
    console.log("📋 API: Pedidos completos:", pedidos);

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos de cocina:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo pedido de cocina
export async function POST(request) {
  try {
    const body = await request.json();
    const { restauranteId, mesa, productos, total, cliente, notas, direccion, whatsapp, metodoPago } = body;

    if (!restauranteId || !mesa || !productos || productos.length === 0) {
      return NextResponse.json(
        { error: "Datos incompletos para crear el pedido" },
        { status: 400 }
      );
    }

    const pedidoData = {
      mesa: mesa,
      productos: productos,
      total: total,
      cliente: cliente || "Sin nombre",
      notas: notas || "",
      direccion: direccion || "", // Guardar dirección para pedidos de delivery
      whatsapp: whatsapp || "", // Guardar WhatsApp para pedidos de delivery
      metodoPago: metodoPago || "efectivo", // Guardar método de pago
      estado: "pendiente", // pendiente, en_preparacion, listo
      timestamp: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, `restaurantes/${restauranteId}/pedidosCocina`),
      pedidoData
    );

    console.log("Pedido de cocina creado exitosamente:", docRef.id);

    return NextResponse.json({
      id: docRef.id,
      message: "Pedido de cocina creado exitosamente",
      ...pedidoData,
    });
  } catch (error) {
    console.error("Error al crear pedido de cocina:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar estado de un pedido de cocina
export async function PUT(request) {
  try {
    const body = await request.json();
    const { restauranteId, pedidoId, nuevoEstado } = body;

    if (!restauranteId || !pedidoId || !nuevoEstado) {
      return NextResponse.json(
        { error: "Datos incompletos para actualizar el pedido" },
        { status: 400 }
      );
    }

    const pedidoRef = doc(
      db,
      `restaurantes/${restauranteId}/pedidosCocina/${pedidoId}`
    );

    // Obtener el pedido actual para acceder a la información de la mesa
    const pedidoDoc = await getDoc(pedidoRef);
    if (!pedidoDoc.exists()) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    const pedidoData = pedidoDoc.data();

    await updateDoc(pedidoRef, {
      estado: nuevoEstado,
      updatedAt: serverTimestamp(),
    });

    // Si el pedido se marca como "listo" y es un pedido de DELIVERY, actualizar en colección delivery
    if (nuevoEstado === "listo" && pedidoData.mesa === "DELIVERY") {
      try {
        console.log("🚴 Pedido de delivery marcado como listo, actualizando colección delivery...");
        console.log("📋 Datos del pedido:", {
          cliente: pedidoData.cliente,
          direccion: pedidoData.direccion,
          total: pedidoData.total,
          productos: pedidoData.productos?.length || 0,
        });
        
        const deliveryRef = collection(db, `restaurantes/${restauranteId}/delivery`);
        
        // Buscar si ya existe un pedido de delivery con pedidoCocinaId o por cliente y dirección reciente
        let deliveryDocRef = null;
        let deliveryId = null;
        
        // Primero buscar por pedidoCocinaId si existe
        if (pedidoData.pedidoCocinaId) {
          const deliveryQueryById = query(
            deliveryRef,
            where("pedidoCocinaId", "==", pedidoData.pedidoCocinaId || pedidoId)
          );
          const deliverySnapshotById = await getDocs(deliveryQueryById);
          
          if (!deliverySnapshotById.empty) {
            const existingDelivery = deliverySnapshotById.docs[0];
            deliveryDocRef = doc(
              db,
              `restaurantes/${restauranteId}/delivery/${existingDelivery.id}`
            );
            deliveryId = existingDelivery.id;
          }
        }
        
        // Si no se encontró por ID, buscar por cliente y dirección (pedidos recientes)
        if (!deliveryDocRef) {
          const deliveryQuery = query(
            deliveryRef,
            where("cliente", "==", pedidoData.cliente || "Sin nombre"),
            where("direccion", "==", pedidoData.direccion || ""),
            orderBy("fechaVenta", "desc")
          );
          
          try {
            const deliverySnapshot = await getDocs(deliveryQuery);
            
            if (!deliverySnapshot.empty) {
              // Tomar el pedido más reciente
              const existingDelivery = deliverySnapshot.docs[0];
              deliveryDocRef = doc(
                db,
                `restaurantes/${restauranteId}/delivery/${existingDelivery.id}`
              );
              deliveryId = existingDelivery.id;
            }
          } catch (queryError) {
            // Si la query falla (porque fechaVenta no está indexado), buscar sin orderBy
            const deliveryQuerySimple = query(
              deliveryRef,
              where("cliente", "==", pedidoData.cliente || "Sin nombre"),
              where("direccion", "==", pedidoData.direccion || "")
            );
            const deliverySnapshot = await getDocs(deliveryQuerySimple);
            
            if (!deliverySnapshot.empty) {
              const existingDelivery = deliverySnapshot.docs[0];
              deliveryDocRef = doc(
                db,
                `restaurantes/${restauranteId}/delivery/${existingDelivery.id}`
              );
              deliveryId = existingDelivery.id;
            }
          }
        }
        
        if (deliveryDocRef) {
          // Si existe, actualizar el pedido existente
          await updateDoc(deliveryDocRef, {
            status: "listo", // Cambiar estado a "listo" para que aparezca en el dashboard del repartidor
            cliente: pedidoData.cliente || "Sin nombre",
            direccion: pedidoData.direccion || "", // Asegurar que la dirección se guarde
            productos: pedidoData.productos || [],
            total: pedidoData.total || 0,
            metodoPago: pedidoData.metodoPago || pedidoData.paymentMethod || "efectivo",
            fechaVenta: pedidoData.timestamp || serverTimestamp(),
            updatedAt: serverTimestamp(),
            fechaListo: serverTimestamp(), // Fecha cuando cocina marcó como listo
            pedidoCocinaId: pedidoId, // Guardar referencia al pedido de cocina
            whatsapp: pedidoData.whatsapp || "", // Asegurar que el WhatsApp se guarde
          });
          
          console.log("✅ Pedido de delivery actualizado en colección delivery:", deliveryId);
        } else {
          // Si no existe, crear un nuevo pedido en la colección delivery
          const nuevoPedidoDelivery = {
            cliente: pedidoData.cliente || "Sin nombre",
            direccion: pedidoData.direccion || "",
            productos: pedidoData.productos || [],
            total: pedidoData.total || 0,
            metodoPago: pedidoData.metodoPago || pedidoData.paymentMethod || "efectivo",
            status: "listo", // Estado "listo" para que aparezca en el dashboard del repartidor
            fechaVenta: pedidoData.timestamp || serverTimestamp(),
            fechaListo: serverTimestamp(), // Fecha cuando cocina marcó como listo
            updatedAt: serverTimestamp(),
            pedidoCocinaId: pedidoId, // Guardar referencia al pedido de cocina
            // Incluir datos adicionales si existen
            whatsapp: pedidoData.whatsapp || "",
            notas: pedidoData.notas || "",
          };
          
          const newDeliveryDoc = await addDoc(deliveryRef, nuevoPedidoDelivery);
          console.log("✅ Nuevo pedido de delivery creado en colección delivery:", newDeliveryDoc.id);
        }
      } catch (deliveryError) {
        console.error("❌ Error al actualizar pedido en colección delivery:", deliveryError);
        // No fallar el pedido si hay error al actualizar delivery
      }
    }

    // Si el pedido se marca como "listo", actualizar el estado de la mesa a "ocupado" (solo para mesas, no delivery)
    if (nuevoEstado === "listo" && pedidoData.mesa && pedidoData.mesa !== "DELIVERY" && pedidoData.mesa !== "TAKEAWAY") {
      try {
        // Buscar la mesa por número
        const tablesRef = collection(
          db,
          `restaurantes/${restauranteId}/tables`
        );
        const mesaQuery = query(
          tablesRef,
          where("numero", "==", pedidoData.mesa)
        );
        const mesaSnapshot = await getDocs(mesaQuery);

        if (!mesaSnapshot.empty) {
          const mesaDoc = mesaSnapshot.docs[0];
          const mesaRef = doc(
            db,
            `restaurantes/${restauranteId}/tables/${mesaDoc.id}`
          );

          await updateDoc(mesaRef, {
            estado: "ocupado", // Volver a estado ocupado (rojo) cuando cocina termine
            updatedAt: serverTimestamp(),
          });

          console.log(`Mesa ${pedidoData.mesa} marcada como ocupada (pedido listo)`);
        }
      } catch (mesaError) {
        console.error("Error al actualizar estado de la mesa:", mesaError);
        // No fallar el pedido si hay error al actualizar la mesa
      }

      // Enviar notificación de pedido listo a dashboard y ventas
      try {
        const notificationData = {
          type: "order-ready",
          pedido: {
            id: pedidoId,
            mesa: pedidoData.mesa,
            cliente: pedidoData.cliente,
            productos: pedidoData.productos,
            total: pedidoData.total,
            tipo: pedidoData.tipo || "salon"
          },
          timestamp: new Date().toISOString(),
          restauranteId: restauranteId
        };

        // Guardar la notificación en Firestore para que las otras páginas la detecten
        const notificationsRef = collection(
          db,
          `restaurantes/${restauranteId}/notificaciones`
        );
        
        await addDoc(notificationsRef, {
          ...notificationData,
          createdAt: serverTimestamp(),
          leida: false
        });

        console.log("🔔 Notificación de pedido listo enviada a dashboard y ventas");
      } catch (notificationError) {
        console.error("Error al enviar notificación de pedido listo:", notificationError);
        // No fallar el pedido si hay error al enviar notificación
      }
    }

    console.log("Estado del pedido actualizado exitosamente");

    return NextResponse.json({
      message: "Estado del pedido actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un pedido de cocina
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { restauranteId, pedidoId } = body;

    if (!restauranteId || !pedidoId) {
      return NextResponse.json(
        { error: "restauranteId y pedidoId son requeridos" },
        { status: 400 }
      );
    }

    const pedidoRef = doc(
      db,
      `restaurantes/${restauranteId}/pedidosCocina/${pedidoId}`
    );

    // Verificar que el pedido existe
    const pedidoDoc = await getDoc(pedidoRef);
    if (!pedidoDoc.exists()) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar el pedido
    await deleteDoc(pedidoRef);

    console.log("Pedido eliminado exitosamente:", pedidoId);

    return NextResponse.json({
      message: "Pedido eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar pedido:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
