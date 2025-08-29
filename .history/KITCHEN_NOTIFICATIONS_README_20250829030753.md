# Sistema de Notificaciones de Cocina en Tiempo Real

## Descripción
Sistema de notificaciones instantáneas para la vista de cocina que alerta automáticamente cuando se reciben nuevos pedidos desde cualquier canal de ventas (salón, takeaway, delivery) usando Server-Sent Events (SSE) para comunicación en tiempo real.

## 🎯 Características Principales

### ✅ **Notificaciones en Tiempo Real**
- **Server-Sent Events (SSE)**: Conexión persistente para notificaciones instantáneas
- **Sin polling**: No hay actualizaciones constantes que afecten el rendimiento
- **Detección automática**: Nuevos pedidos se detectan inmediatamente

### 🔊 **Sistema de Sonidos Múltiples**
- **4 tipos de sonidos disponibles**:
  1. **🔔 Simple**: Sonido básico y suave para ambientes tranquilos
  2. **🍳 Cocina Tradicional**: Sonido cálido y suave para ambientes acogedores
  3. **🎵 Sonido 1**: Primer archivo de audio personalizado (sonido1.mp3)
  4. **🎵 Sonido 2**: Segundo archivo de audio personalizado (sonido2.mp3)

### 🎛️ **Controles Avanzados**
- **Volumen ajustable**: Control de volumen del 0% al 100%
- **Activación/desactivación**: Toggle para habilitar/deshabilitar notificaciones
- **Prueba de sonidos**: Botones para probar cada tipo de sonido individualmente
- **Archivos predefinidos**: Sonido 1 y Sonido 2 siempre disponibles

### 💾 **Persistencia en Base de Datos**
- **Configuración automática**: Se guarda automáticamente en Firestore
- **Sincronización entre dispositivos**: Cambios se reflejan en todos los dispositivos
- **Carga automática**: Al iniciar la app, se cargan las preferencias guardadas
- **Archivos personalizados**: Se almacenan como base64 en la base de datos
- **Estado de carga**: Indicadores visuales durante la carga y guardado

### **📁 Archivos Personalizados**

#### **Funcionalidades**
- **Formatos soportados**: MP3, WAV, OGG, M4A
- **Tamaño máximo**: 10MB
- **Drag & Drop**: Arrastra archivos directamente
- **Validación**: Solo archivos de audio válidos
- **Previsualización**: Muestra nombre y tamaño del archivo
- **Prueba**: Botón para reproducir antes de aplicar

#### **Implementación**
```javascript
// Función para manejar archivos personalizados
const handleCustomAudioFile = useCallback((file) => {
  // Validación de tipo de archivo
  if (!file.type.startsWith('audio/')) {
    console.error('El archivo debe ser un archivo de audio');
    return false;
  }

  // Crear URL para el archivo
  const url = URL.createObjectURL(file);
  setCustomAudioFile(file);
  setCustomAudioUrl(url);
  setSoundType("custom");
  
  return true;
}, [customAudioUrl]);

// Función para reproducir archivo personalizado
const playCustomAudio = async (audioContext) => {
  const audio = new Audio(customAudioUrl);
  audio.volume = volume;
  await audio.play();
};
```

### **💾 Persistencia en Base de Datos**

#### **Estructura de Datos**
```javascript
// Documento en Firestore: /restaurantes/{restaurantId}/configuracion/notificaciones
{
  isEnabled: boolean,           // Estado de activación
  volume: number,               // Volumen (0-1)
  soundType: string,            // Tipo de sonido seleccionado
  customAudioData: string,      // Archivo en base64 (si es personalizado)
  customAudioName: string,      // Nombre del archivo
  customAudioMimeType: string,  // Tipo MIME del archivo
  updatedAt: timestamp          // Fecha de última actualización
}
```

#### **Funciones de Persistencia**
```javascript
// Cargar configuración desde Firestore
const loadConfiguration = async () => {
  const configDoc = await getDoc(doc(db, "restaurantes", restaurant.id, "configuracion", "notificaciones"));
  
  if (configDoc.exists()) {
    const config = configDoc.data();
    // Aplicar configuración guardada
    setIsEnabled(config.isEnabled);
    setVolume(config.volume);
    setSoundType(config.soundType);
    
    // Cargar archivo personalizado si existe
    if (config.customAudioData && config.soundType === "custom") {
      // Convertir base64 de vuelta a archivo
      const file = base64ToFile(config.customAudioData, config.customAudioName, config.customAudioMimeType);
      setCustomAudioFile(file);
      setCustomAudioUrl(URL.createObjectURL(file));
    }
  }
};

// Guardar configuración en Firestore
const saveConfiguration = async (config) => {
  await setDoc(doc(db, "restaurantes", restaurant.id, "configuracion", "notificaciones"), {
    ...config,
    updatedAt: new Date()
  });
};

// Actualizar configuración con guardado automático
const updateConfiguration = async (updates) => {
  // Aplicar cambios localmente
  if (updates.isEnabled !== undefined) setIsEnabled(updates.isEnabled);
  if (updates.volume !== undefined) setVolume(updates.volume);
  if (updates.soundType !== undefined) setSoundType(updates.soundType);
  
  // Guardar en BD
  await saveConfiguration(updates);
};
```

#### **Características de la Persistencia**
- **Guardado automático**: Cada cambio se guarda inmediatamente en Firestore
- **Carga automática**: Al iniciar la app, se cargan las preferencias guardadas
- **Sincronización**: Cambios se reflejan en todos los dispositivos conectados
- **Archivos personalizados**: Se almacenan como base64 para persistencia completa
- **Estados de carga**: Indicadores visuales durante carga y guardado
- **Manejo de errores**: Fallbacks automáticos si falla la carga/guardado

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

### Página de Configuración Dedicada
- **Ruta**: `/home-comandas/configuracion`
- **Acceso**: Desde el sidebar principal
- **Permisos**: Solo administradores y personal de cocina

### Características de la Página de Configuración

#### 🎵 Sección de Sonidos
- **Estado general**: Toggle para activar/desactivar notificaciones
- **Control de volumen**: Slider con indicador de porcentaje
- **Selección de sonidos**: Grid interactivo con 4 opciones
- **Prueba individual**: Botón de reproducción para cada sonido
- **Aplicación**: Botón para aplicar el sonido seleccionado

#### 🎛️ Controles Disponibles
- **Activación/Desactivación**: Toggle principal
- **Volumen**: Slider de 0% a 100% con aplicación inmediata
- **Selección de sonido**: Click en tarjeta para seleccionar
- **Prueba**: Botón de reproducción en cada tarjeta
- **Aplicación**: Botón para confirmar cambios

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

### Logs de persistencia en base de datos
```javascript
// Logs importantes a monitorear
console.log("🔔 Sonido POTENTE reproducido");
console.log("💬 Sonido de WhatsApp reproducido");
console.log("🎵 Archivo de audio personalizado reproducido");
console.log("🔔 Notificación de nuevo pedido SALÓN:", orderData);
console.log("✅ Conexión SSE establecida");

// Logs de persistencia en base de datos
console.log("🎵 Configuración cargada desde BD:", config);
console.log("🎵 Configuración guardada en BD:", configToSave);
console.log("🎵 Configuración actualizada y guardada:", updates);
console.log("🎵 Archivo personalizado cargado desde BD:", file.name);
console.log("🎵 Archivo de audio personalizado cargado y guardado:", file.name);
console.log("🎵 No hay configuración guardada, usando valores por defecto");
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
- ✅ Página de configuración dedicada con interfaz completa
- ✅ Prueba individual de cada tipo de sonido
- ✅ Aplicación inmediata de cambios

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
