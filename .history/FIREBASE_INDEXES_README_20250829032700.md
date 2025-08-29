# 🔥 Firebase Indexes - Solución de Problemas

## ❌ Error Común: "The query requires an index"

### **Problema**
```
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/...
```

### **Causa**
Firebase Firestore requiere índices compuestos cuando se usan múltiples filtros (`where`) junto con `orderBy` en la misma consulta.

### **Solución Implementada**

#### **1. Consulta Simplificada**
```javascript
// ❌ Consulta que requiere índice compuesto
const q = query(
  notificationsRef,
  where("type", "==", "order-ready"),
  where("leida", "==", false),
  orderBy("createdAt", "desc"),
  limit(1)
);

// ✅ Consulta simplificada (sin índice compuesto)
const q = query(
  notificationsRef,
  where("type", "==", "order-ready")
);
```

#### **2. Filtrado en Cliente**
```javascript
// Filtrar en el cliente en lugar de en la consulta
snapshot.docChanges().forEach((change) => {
  if (change.type === 'added') {
    const notificationData = {
      id: change.doc.id,
      ...change.doc.data()
    };
    
    // Solo procesar notificaciones no leídas
    if (!notificationData.leida) {
      showOrderReadyNotification(notificationData);
    }
  }
});
```

### **Si Necesitas el Índice Compuesto**

#### **Opción 1: Crear Índice Manualmente**
1. Ve al enlace proporcionado en el error
2. Haz clic en "Create Index"
3. Espera a que se complete la creación

#### **Opción 2: Usar firestore.indexes.json**
```json
{
  "indexes": [
    {
      "collectionGroup": "notificaciones",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "type",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "leida",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ]
}
```

### **Mejores Prácticas**

#### **1. Evitar Consultas Complejas**
- Usa filtros simples cuando sea posible
- Filtra en el cliente para consultas complejas
- Limita el uso de `orderBy` con múltiples `where`

#### **2. Optimizar Estructura de Datos**
```javascript
// ✅ Estructura optimizada
{
  type: "order-ready",
  leida: false,
  createdAt: timestamp,
  pedido: { ... }
}

// ❌ Estructura que requiere índices complejos
{
  type: "order-ready",
  leida: false,
  createdAt: timestamp,
  restauranteId: "xxx", // Redundante
  userId: "xxx"         // Redundante
}
```

#### **3. Usar Subcolecciones**
```javascript
// ✅ Mejor estructura
restaurantes/{restaurantId}/notificaciones/{notificationId}

// ❌ Estructura plana
notificaciones/{notificationId} // Requiere filtros adicionales
```

### **Monitoreo de Índices**

#### **Ver Índices Existentes**
1. Firebase Console → Firestore Database
2. Índices → Composite
3. Ver todos los índices creados

#### **Eliminar Índices No Usados**
- Los índices no utilizados se pueden eliminar
- Ahorra espacio y mejora el rendimiento

### **Debugging**

#### **Logs Útiles**
```javascript
console.log("🔔 Iniciando escucha de notificaciones...");
console.log("🔔 Nueva notificación recibida:", notificationData);
console.error("Error escuchando notificaciones:", error);
```

#### **Verificar Consultas**
```javascript
// Log de la consulta para debugging
console.log("Query:", q);
```

### **Alternativas**

#### **1. Server-Sent Events (SSE)**
- Para notificaciones en tiempo real
- No requiere índices complejos
- Más eficiente para este caso de uso

#### **2. WebSockets**
- Conexión bidireccional
- Ideal para notificaciones instantáneas
- Requiere servidor adicional

#### **3. Polling Simple**
- Consultas periódicas simples
- No requiere índices complejos
- Menos eficiente pero más simple
