# 🍳 Sistema de Notificaciones de Cocina

## 📋 Resumen

Sistema completo de notificaciones en tiempo real para la cocina que alerta automáticamente cuando se reciben nuevos pedidos desde cualquier canal de ventas (salón, takeaway, delivery).

## 🎯 Características Principales

### ✅ **Notificaciones en Tiempo Real**
- **Server-Sent Events (SSE)**: Conexión persistente para notificaciones instantáneas
- **Sin polling**: No hay actualizaciones constantes que afecten el rendimiento
- **Detección automática**: Nuevos pedidos se detectan inmediatamente

### 🔊 **Sistema de Sonidos Múltiples**
- **5 tipos de sonidos disponibles**:
  1. **🔊 Potente (Alarma de Cocina)**: Sonido fuerte y llamativo para cocinas ruidosas
  2. **🔔 Simple**: Sonido básico y suave para ambientes tranquilos  
  3. **💬 WhatsApp**: Sonido característico de notificación de WhatsApp
  4. **🍳 Cocina Tradicional**: Sonido cálido y suave para ambientes acogedores
  5. **📁 Archivo Personalizado**: Sube tu propio archivo MP3, WAV, OGG, M4A

### 🎛️ **Controles Avanzados**
- **Volumen ajustable**: Control de volumen del 0% al 100%
- **Activación/desactivación**: Toggle para habilitar/deshabilitar notificaciones
- **Prueba de sonidos**: Botones para probar cada tipo de sonido individualmente
- **Drag & Drop**: Arrastra archivos de audio directamente a la interfaz

## 🏗️ Arquitectura del Sistema

### **Componentes Principales**

#### 1. **Hook `useKitchenNotifications`**
```javascript
// Gestión centralizada de notificaciones
const {
  isEnabled, setIsEnabled,           // Estado de activación
  volume, setVolume,                 // Control de volumen
  soundType, setSoundType,           // Tipo de sonido seleccionado
  customAudioFile, customAudioUrl,   // Archivo personalizado
  handleCustomAudioFile,             // Función para subir archivos
  testSound, testSpecificSound,      // Funciones de prueba
  notifyNewOrder,                    // Notificar nuevo pedido
  // ... más funciones
} = useKitchenNotifications();
```

#### 2. **Hook `useRealTimeNotifications`**
```javascript
// Conexión SSE para tiempo real
const {
  isConnected, connectionStatus,     // Estado de conexión
  onNewOrder,                        // Callback para nuevos pedidos
} = useRealTimeNotifications();
```

#### 3. **API Route `/api/pedidos-cocina/events`**
```javascript
// Endpoint SSE que escucha cambios en Firestore
export async function GET(request) {
  // Configuración de SSE
  // Escucha en tiempo real de pedidos "pendiente"
  // Envío de eventos cuando se detectan nuevos pedidos
}
```

### **Flujo de Datos**

```
1. Nuevo Pedido (Salón/Takeaway/Delivery)
   ↓
2. Firestore Database (estado: "pendiente")
   ↓
3. SSE API Route (onSnapshot detecta cambio)
   ↓
4. Evento SSE enviado al cliente
   ↓
5. useRealTimeNotifications recibe evento
   ↓
6. notifyNewOrder() ejecutado
   ↓
7. playNotificationSound() reproduce audio
   ↓
8. showNotification() muestra notificación visual
```

## 🎵 Sistema de Sonidos

### **Sonidos Generados por Web Audio API**

#### **1. 🔊 Potente (Alarma de Cocina)**
- **Duración**: 0.8 segundos
- **Características**: 3 osciladores (square, sawtooth, triangle)
- **Frecuencias**: 600Hz-1400Hz con modulación dinámica
- **Efectos**: Compresor agresivo, filtro lowpass
- **Uso**: Cocinas ruidosas, máxima atención

#### **2. 🔔 Simple**
- **Duración**: 0.3 segundos
- **Características**: 1 oscilador sine
- **Frecuencia**: 1000Hz constante
- **Efectos**: Envelope simple
- **Uso**: Ambientes tranquilos

#### **3. 💬 WhatsApp**
- **Duración**: 0.6 segundos
- **Características**: 2 osciladores (sine + triangle)
- **Patrón**: Tres tonos ascendentes + tono final bajo
- **Frecuencias**: 800Hz → 1000Hz → 1200Hz → 600Hz
- **Uso**: Sonido familiar y reconocible

#### **4. 🍳 Cocina Tradicional**
- **Duración**: 0.7 segundos
- **Características**: 3 osciladores (triangle, sine, triangle)
- **Frecuencias**: 600Hz-1200Hz con modulación suave
- **Efectos**: Filtro lowpass cálido, compresor suave
- **Uso**: Ambientes acogedores

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

## 🎨 Interfaz de Usuario

### **Página de Configuración (`/home-comandas/configuracion`)**

#### **Sección de Sonidos**
- **Estado de notificaciones**: Toggle para activar/desactivar
- **Control de volumen**: Slider con porcentaje visual
- **Grid de sonidos**: 5 tarjetas interactivas para cada tipo
- **Área de archivo personalizado**: Drag & drop con previsualización
- **Botón de aplicar**: Confirma la selección

#### **Características de la UI**
- **Diseño responsivo**: Funciona en móviles y desktop
- **Feedback visual**: Estados activos, hover, loading
- **Accesibilidad**: Controles de teclado y lectores de pantalla
- **Animaciones**: Transiciones suaves y efectos visuales

### **Componente `KitchenNotification`**

#### **Panel de Control**
- **Notificación visual**: Muestra información del pedido
- **Grid de prueba**: 5 botones para probar sonidos
- **Dropdown de selección**: Lista todos los tipos disponibles
- **Control de volumen**: Slider integrado
- **Auto-ocultado**: Se oculta automáticamente después de 5 segundos

## 🔧 Configuración y Uso

### **1. Acceso a la Configuración**
```
Navegación: Sidebar → Configuración → Sección "Sonidos"
Permisos: canAccessCocina (personal de cocina y administradores)
```

### **2. Configurar Sonidos**
```
1. Ir a Configuración → Sonidos
2. Activar notificaciones (toggle verde)
3. Ajustar volumen (slider 0-100%)
4. Seleccionar tipo de sonido:
   - Hacer clic en una tarjeta de sonido
   - O usar el dropdown "Sonido Seleccionado"
5. Probar sonido (botón ▶️ en cada tarjeta)
6. Aplicar cambios (botón "Aplicar Sonido Seleccionado")
```

### **3. Subir Archivo Personalizado**
```
1. Seleccionar "Archivo Personalizado" en la configuración
2. Arrastrar archivo de audio al área punteada
   O hacer clic en "Seleccionar Archivo"
3. Verificar que el archivo se cargó correctamente
4. Probar el sonido (botón "Probar")
5. Aplicar como sonido activo
```

### **4. Uso en Cocina**
```
1. Abrir vista de cocina (/home-comandas/cocina)
2. Verificar estado de conexión SSE (indicador verde)
3. Realizar pedido desde cualquier canal
4. Escuchar notificación automática
5. Ver notificación visual con detalles del pedido
```

## 🐛 Solución de Problemas

### **Problemas Comunes**

#### **1. No se escuchan las notificaciones**
```
✅ Verificar:
- Notificaciones activadas (toggle verde)
- Volumen no en 0%
- Conexión SSE establecida (indicador verde)
- Permisos de audio del navegador
```

#### **2. Archivo personalizado no funciona**
```
✅ Verificar:
- Formato soportado (MP3, WAV, OGG, M4A)
- Tamaño menor a 10MB
- Archivo de audio válido (no corrupto)
- Navegador compatible con Web Audio API
```

#### **3. Conexión SSE perdida**
```
✅ Verificar:
- Conexión a internet estable
- Firestore accesible
- Restaurante configurado correctamente
- Consola del navegador para errores
```

### **Logs de Debug**
```javascript
// Logs importantes a monitorear
console.log("🔔 Sonido POTENTE reproducido");
console.log("💬 Sonido de WhatsApp reproducido");
console.log("🎵 Archivo de audio personalizado reproducido");
console.log("🔔 Notificación de nuevo pedido SALÓN:", orderData);
console.log("✅ Conexión SSE establecida");
```

## 🚀 Optimizaciones Implementadas

### **1. Rendimiento**
- **SSE en lugar de polling**: Reduce carga del servidor
- **Web Audio API**: Generación dinámica de sonidos
- **Lazy loading**: Componentes cargados bajo demanda
- **Cleanup automático**: URLs de archivos liberadas

### **2. Experiencia de Usuario**
- **Feedback inmediato**: Notificaciones instantáneas
- **Controles intuitivos**: Drag & drop, sliders visuales
- **Estados claros**: Indicadores de conexión y estado
- **Responsive design**: Funciona en todos los dispositivos

### **3. Robustez**
- **Fallbacks**: Sonidos de respaldo si falla el principal
- **Validación**: Verificación de archivos y formatos
- **Error handling**: Manejo graceful de errores
- **Reconexión automática**: SSE se reconecta automáticamente

## 📱 Compatibilidad

### **Navegadores Soportados**
- ✅ Chrome 66+
- ✅ Firefox 60+
- ✅ Safari 11.1+
- ✅ Edge 79+

### **Dispositivos**
- ✅ Desktop (Windows, macOS, Linux)
- ✅ Móviles (iOS Safari, Chrome Mobile)
- ✅ Tablets (iPad, Android)

### **Formatos de Audio**
- ✅ MP3 (más compatible)
- ✅ WAV (sin compresión)
- ✅ OGG (libre, eficiente)
- ✅ M4A (Apple)

## 🔮 Próximas Mejoras

### **Funcionalidades Planificadas**
- [ ] **Persistencia de configuración**: Guardar preferencias en Firestore
- [ ] **Sonidos por tipo de pedido**: Diferentes sonidos para salón/takeaway/delivery
- [ ] **Programación de sonidos**: Horarios específicos para notificaciones
- [ ] **Biblioteca de sonidos**: Colección predefinida de sonidos profesionales
- [ ] **Notificaciones push**: Para dispositivos móviles
- [ ] **Análisis de uso**: Métricas de notificaciones y sonidos más usados

### **Optimizaciones Técnicas**
- [ ] **Web Workers**: Procesamiento de audio en background
- [ ] **Audio streaming**: Reproducción sin descarga completa
- [ ] **Compresión inteligente**: Optimización automática de archivos
- [ ] **Cache de archivos**: Almacenamiento local de sonidos frecuentes

---

## 📞 Soporte

Para problemas técnicos o sugerencias de mejora:
- **Logs**: Revisar consola del navegador
- **Documentación**: Este archivo README
- **Código**: Archivos en `src/hooks/useKitchenNotifications.js` y relacionados

**¡El sistema está listo para hacer tu cocina más eficiente! 🍳✨**
