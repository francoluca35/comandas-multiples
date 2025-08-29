# Sistema de Notificaciones de Cocina

## Descripción
Sistema de notificaciones en tiempo real para la vista de cocina que alerta automáticamente cuando se reciben nuevos pedidos desde cualquier canal de ventas (salón, takeaway, delivery).

## Características

### 🔔 Notificaciones Automáticas
- **Detección en tiempo real**: Sistema de polling automático que actualiza los pedidos cada 3 segundos
- **Sonido dinámico**: Generación de sonidos de notificación usando Web Audio API
- **Notificación visual**: Mensajes emergentes con información del pedido
- **Configuración flexible**: Control de volumen y activación/desactivación

### 🎵 Sistema de Audio
- **Sonido profesional**: Generación dinámica de sonidos modulados usando Web Audio API
- **Fallback robusto**: Sistema de respaldo con sonido simple si falla el principal
- **Control de volumen**: Slider para ajustar el volumen de las notificaciones
- **Prueba de sonido**: Botón para probar el sonido sin esperar un pedido

### 📊 Monitoreo en Tiempo Real
- **Polling automático**: Actualización automática de pedidos cada 3 segundos
- **Indicador visual**: Muestra el estado de la actualización automática
- **Logs detallados**: Console logs para debugging y monitoreo
- **Detección inteligente**: Identifica nuevos pedidos comparando con el estado anterior

## Componentes

### `useKitchenNotifications` Hook
```javascript
const {
  isEnabled,           // Estado de activación
  setIsEnabled,        // Función para activar/desactivar
  volume,              // Volumen actual (0-1)
  setVolume,           // Función para cambiar volumen
  lastNotification,    // Última notificación mostrada
  notifyNewOrder,      // Función para notificar nuevo pedido
  clearNotification,   // Función para limpiar notificación
  testSound,          // Función para probar sonido
} = useKitchenNotifications();
```

### `KitchenNotification` Component
- **Visualización**: Muestra notificaciones emergentes
- **Configuración**: Panel de control para ajustes
- **Auto-ocultado**: Las notificaciones se ocultan automáticamente después de 5 segundos
- **Tipos de notificación**: Diferentes estilos para nuevos pedidos, pruebas, e información

### `usePedidosCocina` Hook Mejorado
- **Polling automático**: Actualización cada 3 segundos
- **Detección de cambios**: Identifica nuevos pedidos automáticamente
- **Logs detallados**: Información completa para debugging
- **Estado de actualización**: Tracking de la última actualización

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

### 2. Detección Automática
```javascript
// El hook detecta automáticamente nuevos pedidos
useEffect(() => {
  if (pedidos.length > 0) {
    const pedidoMasReciente = pedidosOrdenados[0];
    const diferenciaSegundos = (ahora - tiempoPedido) / 1000;
    
    if (diferenciaSegundos < 60 && pedidoMasReciente.estado === "pendiente") {
      notifyNewOrder(pedidoMasReciente);
    }
  }
}, [pedidos, notifyNewOrder]);
```

### 3. Notificación
```javascript
// Generación de sonido y notificación visual
const playNotificationSound = async () => {
  const audioContext = new AudioContext();
  // Generar sonido profesional con modulación
  // ...
};

const showNotification = (message, type) => {
  setLastNotification({ message, type, timestamp: new Date() });
  playNotificationSound();
};
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
🍳 Hook usePedidosCocina: Iniciando...
🔄 Iniciando polling automático de pedidos...
🔄 Polling: Actualizando pedidos...
📊 Pedidos obtenidos: 5 pedidos
🔍 Analizando pedidos para detectar nuevos: 5 pedidos
📅 Pedido más reciente: {id: "abc123", ...}
⏰ Diferencia de tiempo: 15 segundos
📊 Estado del pedido: pendiente
🔔 Detectado nuevo pedido, notificando...
🔔 Sonido de notificación reproducido
```

### Información de Estado
- **Polling activo**: Indicador verde pulsante
- **Última actualización**: Timestamp de la última actualización
- **Estado de notificaciones**: Activadas/Desactivadas
- **Volumen actual**: Porcentaje del volumen

## Integración

### En la Vista de Cocina
```javascript
// src/app/home-comandas/cocina/page.jsx
import useKitchenNotifications from "../../../hooks/useKitchenNotifications";
import KitchenNotification from "../../../components/KitchenNotification";

function CocinaContent() {
  const {
    isEnabled, setIsEnabled, volume, setVolume,
    lastNotification, notifyNewOrder, clearNotification, testSound
  } = useKitchenNotifications();

  // El sistema funciona automáticamente
  // Solo se necesita el componente visual
  return (
    <div>
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

### No se detectan nuevos pedidos
1. Verificar que el polling esté activo (indicador verde)
2. Revisar console logs para errores
3. Verificar que los pedidos tengan estado "pendiente"
4. Comprobar que el timestamp sea reciente (< 60 segundos)

### No se reproduce el sonido
1. Verificar que las notificaciones estén activadas
2. Comprobar el volumen del sistema
3. Usar el botón "Probar Sonido"
4. Revisar permisos de audio del navegador

### Actualización lenta
1. El polling es cada 3 segundos por defecto
2. Verificar conexión a internet
3. Revisar logs de la API

## Mejoras Implementadas

### v2.0 - Sistema de Polling Automático
- ✅ Polling automático cada 3 segundos
- ✅ Detección inteligente de nuevos pedidos
- ✅ Logs detallados para debugging
- ✅ Indicador visual del estado de actualización
- ✅ Margen de tiempo aumentado a 60 segundos

### v1.0 - Sistema Básico
- ✅ Notificaciones visuales y auditivas
- ✅ Control de volumen y activación
- ✅ Generación dinámica de sonidos
- ✅ Integración con la vista de cocina

## Próximas Mejoras

### Posibles Implementaciones Futuras
- [ ] WebSockets para actualización instantánea
- [ ] Notificaciones push del navegador
- [ ] Configuración persistente en localStorage
- [ ] Diferentes tipos de sonidos por tipo de pedido
- [ ] Estadísticas de notificaciones
