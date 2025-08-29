# Sistema de Notificaciones de Cocina en Tiempo Real

## Descripción
Sistema de notificaciones instantáneas para la vista de cocina que alerta automáticamente cuando se reciben nuevos pedidos desde cualquier canal de ventas (salón, takeaway, delivery) usando Server-Sent Events (SSE) para comunicación en tiempo real.

## Características

### 🔔 Notificaciones Instantáneas
- **Tiempo real verdadero**: Usando Server-Sent Events (SSE) para comunicación instantánea
- **Sin polling**: No hay actualizaciones constantes, solo notificaciones cuando hay cambios
- **Sonido dinámico**: Generación de sonidos de notificación usando Web Audio API
- **Notificación visual**: Mensajes emergentes con información del pedido
- **Configuración flexible**: Control de volumen y activación/desactivación

### 🎵 Sistema de Audio Avanzado
- **4 tipos de sonido diferentes**: 
  - 🔊 **Potente**: Alarma de cocina con múltiples osciladores y compresión
  - 🔔 **Simple**: Sonido básico y suave
  - 🚨 **Alarma Industrial**: Efecto de sirena alternada
  - 🍳 **Cocina Tradicional**: Sonido cálido y suave para ambientes tranquilos
- **Área de prueba interactiva**: Grid de botones para probar cada sonido
- **Sonidos generados dinámicamente**: Usando Web Audio API para máxima compatibilidad
- **Compresión de audio**: Para sonidos más potentes y llamativos
- **Control de volumen**: Slider para ajustar el volumen de las notificaciones
- **Prueba de sonido**: Botón para probar el sonido sin esperar un pedido
- **Selector de tipo**: Dropdown para elegir el tipo de sonido preferido

### 📡 Comunicación en Tiempo Real
- **Server-Sent Events**: Conexión persistente para notificaciones instantáneas
- **Reconexión automática**: Se reconecta automáticamente si se pierde la conexión
- **Indicador de estado**: Muestra el estado de la conexión en tiempo real
- **Logs detallados**: Console logs para debugging y monitoreo

## Componentes

### `useRealTimeNotifications` Hook
```javascript
const {
  isConnected,        // Estado de conexión
  connectionStatus,   // Estado detallado (connected, connecting, error, disconnected)
  connect,           // Función para conectar manualmente
  disconnect,        // Función para desconectar
  onNewOrder,        // Función para configurar callback de nuevos pedidos
} = useRealTimeNotifications();
```

### `useKitchenNotifications` Hook
```javascript
const {
  isEnabled,           // Estado de activación
  setIsEnabled,        // Función para activar/desactivar
  volume,              // Volumen actual (0-1)
  setVolume,           // Función para cambiar volumen
  soundType,           // Tipo de sonido actual ("powerful", "simple", "alarm", "kitchen")
  setSoundType,        // Función para cambiar tipo de sonido
  lastNotification,    // Última notificación mostrada
  notifyNewOrder,      // Función para notificar nuevo pedido
  clearNotification,   // Función para limpiar notificación
  testSound,          // Función para probar sonido actual
  testSpecificSound,  // Función para probar sonido específico
} = useKitchenNotifications();
```

### `KitchenNotification` Component
- **Visualización**: Muestra notificaciones emergentes
- **Configuración**: Panel de control para ajustes
- **Área de prueba de sonidos**: Grid de 4 botones para probar cada tipo de sonido
- **Selector de tipo de sonido**: Dropdown para elegir entre 4 tipos de sonido
- **Control de volumen**: Slider para ajustar el volumen
- **Auto-ocultado**: Las notificaciones se ocultan automáticamente después de 5 segundos
- **Tipos de notificación**: Diferentes estilos para nuevos pedidos, pruebas, e información

### `usePedidosCocina` Hook Simplificado
- **Carga única**: Solo carga pedidos al montar el componente
- **Sin polling**: No hay actualizaciones constantes
- **Agregar pedidos**: Función para agregar nuevos pedidos recibidos por SSE
- **Gestión de estado**: Actualización local de pedidos

## Flujo de Funcionamiento

### 1. Creación de Pedido
```javascript
// Cuando se crea un pedido desde ventas
const pedidoCocina = {
  mesa: "DELIVERY",
  productos: orderData.productos,
  total: orderData.total,
  cliente: orderData.cliente,
  estado: "pendiente",
  timestamp: new Date(),
  tipo: "delivery"
};

await fetch("/api/pedidos-cocina", {
  method: "POST",
  body: JSON.stringify(pedidoCocina)
});
```

### 2. Detección en Tiempo Real
```javascript
// El endpoint SSE detecta automáticamente nuevos pedidos
// /api/pedidos-cocina/events
const unsubscribe = onSnapshot(q, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added" && change.doc.data().estado === "pendiente") {
      // Enviar notificación SSE inmediatamente
      const event = `data: ${JSON.stringify({ type: "new-order", data: pedido })}\n\n`;
      controller.enqueue(encoder.encode(event));
    }
  });
});
```

### 3. Recepción y Notificación
```javascript
// El hook recibe la notificación y la procesa
const handleNewOrder = (nuevoPedido) => {
  // Agregar el pedido a la lista
  addNewPedido(nuevoPedido);
  
  // Notificar inmediatamente
  notifyNewOrder(nuevoPedido);
};

// Configurar el callback
onNewOrder(handleNewOrder);
```

## Configuración

### Activación/Desactivación
- Toggle en el panel de configuración
- Estado persistente durante la sesión
- Indicador visual del estado

### Control de Volumen
- Slider de 0% a 100%
- Aplicación inmediata
- Persistencia durante la sesión

### Prueba de Sonido
- Botón "Probar Sonido" en la interfaz
- Permite verificar el audio sin esperar pedidos
- Útil para configuración inicial

## Logs de Debugging

### Console Logs Principales
```
🚀 Hook useRealTimeNotifications: Iniciando...
🔌 Conectando a SSE...
✅ SSE: Conexión establecida
📨 SSE: Mensaje recibido: { type: "connected", message: "Conexión establecida" }
🔔 SSE: Nuevo pedido recibido: { id: "abc123", ... }
🔔 Nuevo pedido recibido en tiempo real: { id: "abc123", ... }
🔔 Sonido de notificación reproducido
```

### Información de Estado
- **Conexión SSE**: Verde (conectado), Amarillo (conectando), Rojo (error)
- **Estado de notificaciones**: Activadas/Desactivadas
- **Volumen actual**: Porcentaje del volumen

## Integración

### En la Vista de Cocina
```javascript
// src/app/home-comandas/cocina/page.jsx
import useRealTimeNotifications from "../../../hooks/useRealTimeNotifications";
import useKitchenNotifications from "../../../hooks/useKitchenNotifications";
import KitchenNotification from "../../../components/KitchenNotification";

function CocinaContent() {
  const {
    isConnected, connectionStatus, onNewOrder
  } = useRealTimeNotifications();

  const {
    isEnabled, setIsEnabled, volume, setVolume,
    lastNotification, notifyNewOrder, clearNotification, testSound
  } = useKitchenNotifications();

  // Configurar callback para nuevos pedidos
  useEffect(() => {
    const handleNewOrder = (nuevoPedido) => {
      addNewPedido(nuevoPedido);
      notifyNewOrder(nuevoPedido);
    };
    onNewOrder(handleNewOrder);
  }, [onNewOrder, addNewPedido, notifyNewOrder]);

  return (
    <div>
      {/* Indicador de conexión */}
      <div className={`w-2 h-2 rounded-full ${getConnectionColor()}`}></div>
      <span>{getConnectionText()}</span>
      
      {/* Contenido de cocina */}
      <KitchenNotification
        notification={lastNotification}
        onClose={clearNotification}
        isEnabled={isEnabled}
        onToggleEnabled={() => setIsEnabled(!isEnabled)}
        volume={volume}
        onVolumeChange={setVolume}
        onTestSound={testSound}
      />
    </div>
  );
}
```

## Solución de Problemas

### No se reciben notificaciones
1. Verificar que la conexión SSE esté activa (indicador verde)
2. Revisar console logs para errores de conexión
3. Verificar que los pedidos tengan estado "pendiente"
4. Comprobar que el endpoint SSE esté funcionando

### No se reproduce el sonido
1. Verificar que las notificaciones estén activadas
2. Comprobar el volumen del sistema
3. Usar el botón "Probar Sonido"
4. Revisar permisos de audio del navegador

### Problemas de conexión
1. El sistema se reconecta automáticamente cada 5 segundos
2. Verificar conexión a internet
3. Revisar logs del servidor SSE

## Mejoras Implementadas

### v3.0 - Sistema de Tiempo Real con SSE
- ✅ Server-Sent Events para comunicación instantánea
- ✅ Sin polling ni actualizaciones constantes
- ✅ Reconexión automática en caso de errores
- ✅ Indicador visual del estado de conexión
- ✅ Notificaciones instantáneas al crear pedidos
- ✅ 4 tipos de sonido diferentes (Potente, Simple, Alarma Industrial, Cocina Tradicional)
- ✅ Área de prueba interactiva con grid de botones
- ✅ Selector de tipo de sonido en la interfaz
- ✅ Sonidos más potentes y llamativos para ambiente de cocina

### v2.0 - Sistema de Polling Automático
- ✅ Polling automático cada 3 segundos
- ✅ Detección inteligente de nuevos pedidos
- ✅ Logs detallados para debugging
- ✅ Indicador visual del estado de actualización

### v1.0 - Sistema Básico
- ✅ Notificaciones visuales y auditivas
- ✅ Control de volumen y activación
- ✅ Generación dinámica de sonidos
- ✅ Integración con la vista de cocina

## Próximas Mejoras

### Posibles Implementaciones Futuras
- [ ] WebSockets para comunicación bidireccional
- [ ] Notificaciones push del navegador
- [ ] Configuración persistente en localStorage
- [ ] Diferentes tipos de sonidos por tipo de pedido
- [ ] Estadísticas de notificaciones
- [ ] Modo offline con sincronización automática
