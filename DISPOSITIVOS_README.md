# Sistema de Dispositivos y Mensajes - ADMIN

## 📱 **Descripción General**

El sistema de dispositivos permite a los administradores monitorear en tiempo real todos los dispositivos conectados, usuarios activos y enviar mensajes globales a todos los usuarios del sistema.

## 🎯 **Funcionalidades Principales**

### **1. Monitoreo de Dispositivos**
- **Dispositivos Conectados**: Muestra la cantidad de dispositivos activos en tiempo real
- **Usuarios Permitidos**: Visualiza el uso actual vs. límite de usuarios contratados
- **Barra de Progreso**: Indicador visual del porcentaje de uso (verde/amarillo/rojo)
- **Lista de Dispositivos**: Muestra los últimos 3 dispositivos conectados

### **2. Sistema de Mensajes Globales**
- **Envío Masivo**: Solo para administradores
- **Mensajes Pendientes**: Se almacenan para usuarios no conectados
- **Notificaciones en Tiempo Real**: Badge con contador de mensajes no leídos
- **Historial de Mensajes**: Accesible desde el dropdown de notificaciones

### **3. Control de Acceso**
- **Verificación de Rol**: Solo admins pueden enviar mensajes globales
- **Registro Automático**: Los dispositivos se registran automáticamente al conectar
- **Desconexión Inteligente**: Detecta cuando el usuario sale o cambia de pestaña

## 🏗️ **Arquitectura del Sistema**

### **Hooks Principales**

#### **`useDispositivos`**
```javascript
// Funcionalidades principales
- registrarDispositivo(usuarioId, dispositivoInfo)
- desconectarDispositivo(usuarioId)
- obtenerDispositivos()
- obtenerUsuariosActivos()
- enviarMensajeATodos(mensaje, adminId)
- obtenerEstadisticas()
```

#### **`useMensajesUsuario`**
```javascript
// Gestión de mensajes del usuario
- obtenerMensajes()
- marcarComoLeido(mensajeId)
- marcarTodosComoLeidos()
- eliminarMensaje(mensajeId)
```

#### **`useRegistroDispositivo`**
```javascript
// Registro automático de dispositivos
- conectarDispositivo()
- desconectarDispositivoActual()
- obtenerInfoDispositivo()
```

### **Componentes**

#### **`DispositivosCard`**
- Dashboard principal para administradores
- Estadísticas en tiempo real
- Botón de mensaje global (solo para admins)
- Lista de dispositivos conectados

#### **`MensajeGlobalModal`**
- Modal para escribir y enviar mensajes
- Validación de permisos de administrador
- Confirmación de envío exitoso

#### **`NotificacionesMensajes`**
- Componente de notificaciones en el header
- Badge con contador de mensajes no leídos
- Dropdown con lista de mensajes pendientes
- Funcionalidad para marcar como leído

## 🔄 **Flujo de Funcionamiento**

### **1. Conexión de Usuario**
```
Usuario se loguea → useRegistroDispositivo se ejecuta → 
Dispositivo se registra en Firestore → 
DispositivosCard se actualiza en tiempo real
```

### **2. Envío de Mensaje Global**
```
Admin abre modal → Escribe mensaje → 
Se envía a todos los usuarios activos → 
Se almacena como pendiente para usuarios inactivos → 
Notificaciones se actualizan en tiempo real
```

### **3. Recepción de Mensajes**
```
Usuario recibe notificación → 
Puede ver mensaje en dropdown → 
Al hacer clic se marca como leído → 
Badge se actualiza automáticamente
```

## 📊 **Estructura de Datos**

### **Colección: `dispositivos`**
```javascript
{
  usuarioId: "string",
  restauranteId: "string",
  conectado: boolean,
  ultimaConexion: timestamp,
  ultimaDesconexion: timestamp,
  nombreUsuario: "string",
  email: "string",
  rol: "string",
  tipoDispositivo: "desktop|mobile|tablet",
  navegador: "string",
  resolucion: "string",
  platform: "string",
  language: "string",
  timezone: "string",
  timestamp: timestamp
}
```

### **Colección: `mensajes`**
```javascript
{
  mensaje: "string",
  adminId: "string",
  timestamp: timestamp,
  leido: boolean,
  tipo: "global",
  restauranteId: "string"
}
```

### **Subcolección: `usuarios/{userId}/mensajes`**
```javascript
{
  mensaje: "string",
  adminId: "string",
  timestamp: timestamp,
  leido: boolean,
  tipo: "global",
  restauranteId: "string",
  fechaLectura: timestamp,
  eliminado: boolean,
  fechaEliminacion: timestamp
}
```

## 🚀 **Implementación**

### **1. Integración en AppProvider**
```javascript
// El sistema se integra automáticamente
// No requiere configuración adicional
```

### **2. Uso en Componentes**
```javascript
import { useDispositivos } from "@/hooks/useDispositivos";
import { useRegistroDispositivo } from "@/hooks/useRegistroDispositivo";

// En el componente principal
const { dispositivos, usuariosActivos } = useDispositivos();
useRegistroDispositivo(); // Registro automático
```

### **3. Notificaciones en Header**
```javascript
import NotificacionesMensajes from "@/components/NotificacionesMensajes";

// Agregar al header/navbar
<NotificacionesMensajes />
```

## 🔒 **Seguridad y Permisos**

### **Niveles de Acceso**
- **Usuario Normal**: Solo puede ver notificaciones y marcar mensajes como leídos
- **Administrador**: Acceso completo a monitoreo y envío de mensajes globales

### **Validaciones**
- Verificación de rol antes de enviar mensajes
- Validación de restauranteId en todas las operaciones
- Sanitización de mensajes (máximo 500 caracteres)

## 📱 **Responsive Design**

- **Mobile**: Layout adaptativo con scroll horizontal en listas
- **Tablet**: Vista intermedia optimizada
- **Desktop**: Vista completa con todas las funcionalidades

## 🎨 **Características de UI/UX**

### **Indicadores Visuales**
- **Verde**: Uso bajo (< 60%)
- **Amarillo**: Uso medio (60-80%)
- **Rojo**: Uso alto (> 80%)

### **Animaciones**
- Badge de notificaciones con `animate-pulse`
- Transiciones suaves en hover y focus
- Loading states con spinners

### **Feedback del Usuario**
- Confirmaciones de envío exitoso
- Alertas de error con mensajes descriptivos
- Indicadores de estado en tiempo real

## 🔧 **Mantenimiento y Debugging**

### **Logs del Sistema**
```javascript
// Todos los hooks incluyen logging detallado
console.log("✅ Dispositivo registrado:", usuarioId);
console.error("❌ Error registrando dispositivo:", error);
```

### **Manejo de Errores**
- Try-catch en todas las operaciones async
- Fallbacks para datos faltantes
- Mensajes de error user-friendly

## 📈 **Métricas y Analytics**

### **Datos Recopilados**
- Cantidad de dispositivos conectados
- Porcentaje de uso de licencias
- Tiempo de conexión por dispositivo
- Tipos de dispositivos y navegadores

### **Reportes Disponibles**
- Uso en tiempo real
- Historial de conexiones
- Estadísticas de mensajes enviados/leídos

## 🚀 **Próximas Mejoras**

### **Funcionalidades Planificadas**
- [ ] Notificaciones push para dispositivos móviles
- [ ] Dashboard de analytics más detallado
- [ ] Sistema de plantillas de mensajes
- [ ] Programación de mensajes automáticos
- [ ] Exportación de reportes en PDF/Excel

### **Optimizaciones Técnicas**
- [ ] Implementación de WebSockets para tiempo real
- [ ] Cache local para mensajes frecuentes
- [ ] Compresión de datos de dispositivos
- [ ] Lazy loading de mensajes antiguos

---

## 📝 **Notas de Desarrollo**

Este sistema está diseñado para ser escalable y mantenible. Utiliza React Hooks para la lógica de negocio y Firestore para la persistencia de datos. La arquitectura permite fácil extensión y modificación según las necesidades del negocio.

Para cualquier consulta o mejora, contactar al equipo de desarrollo.
