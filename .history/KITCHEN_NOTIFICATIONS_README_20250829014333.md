# Sistema de Notificaciones de Cocina

## Descripción

Se ha implementado un sistema completo de notificaciones de sonido para la cocina que alerta automáticamente cuando llegan nuevos pedidos desde cualquier canal de ventas (salón, takeaway, delivery).

## Funcionalidades Implementadas

### 🔔 **Notificaciones Automáticas**
- **Detección automática** de nuevos pedidos en tiempo real
- **Sonido de alerta** cuando llega un pedido nuevo
- **Notificación visual** con información del pedido
- **Diferenciación por tipo**: Salón, Takeaway, Delivery

### 🎵 **Sistema de Sonido**
- **Sonido profesional**: Generado dinámicamente usando Web Audio API
- **Sonido de notificación**: Diseñado específicamente para alertas de cocina
- **Control de volumen**: Ajuste de volumen desde 0% a 100%
- **Fallback robusto**: Sistema de respaldo para garantizar que siempre funcione

### ⚙️ **Configuración en Tiempo Real**
- **Toggle de notificaciones**: Activar/desactivar en cualquier momento
- **Control de volumen**: Ajuste dinámico del volumen
- **Botón de prueba**: Probar el sonido sin esperar un pedido
- **Estado visual**: Indicadores de estado de las notificaciones

## Componentes Creados

### 1. `useKitchenNotifications.js`
Hook personalizado que maneja toda la lógica de notificaciones:
- Gestión de audio y sonidos
- Detección de nuevos pedidos
- Configuración de volumen y estado
- Fallbacks automáticos

### 2. `KitchenNotification.jsx`
Componente visual para mostrar notificaciones:
- Notificación principal con información del pedido
- Panel de configuración integrado
- Animaciones suaves y profesionales
- Auto-ocultado después de 5 segundos

## Flujo de Funcionamiento

### 1. **Detección de Nuevos Pedidos**
```
Venta completada → Pedido creado en Firestore → Cocina detecta cambio → Notificación automática
```

### 2. **Proceso de Notificación**
```
Nuevo pedido detectado → Verificar si es reciente (< 30 segundos) → Reproducir sonido → Mostrar notificación visual
```

### 3. **Sistema de Sonido**
```
Sonido profesional generado → Fallback: Sonido simple
```

## Configuración

### Archivo de Sonido Personalizado
1. Reemplazar `/public/notification-sound.mp3` con tu archivo de audio
2. **Recomendaciones**:
   - Duración: 1-3 segundos
   - Tamaño: < 100KB
   - Formato: MP3
   - Sonido: Claro y distintivo

### Configuración en la Interfaz
- **Activar/Desactivar**: Toggle en el panel de configuración
- **Volumen**: Control deslizante de 0% a 100%
- **Probar**: Botón "Probar Sonido" para verificar configuración

## Tipos de Notificaciones

### 🍽️ **Pedidos de Salón**
- Mensaje: "🆕 Nuevo pedido MESA X - Y productos"
- Color: Amarillo
- Prioridad: Normal

### 🥡 **Pedidos Takeaway**
- Mensaje: "🆕 Nuevo pedido TAKEAWAY para [Cliente] - Y productos"
- Color: Naranja
- Prioridad: Normal

### 🚚 **Pedidos Delivery**
- Mensaje: "🆕 Nuevo pedido DELIVERY para [Cliente] - Y productos"
- Color: Púrpura
- Prioridad: Alta

## Integración con el Sistema

### Puntos de Integración
- **TakeawayCashPaymentModal.jsx**: Notificación al completar pago takeaway
- **CashPaymentModal.jsx**: Notificación al completar pago delivery
- **QRPaymentModal.jsx**: Notificación al completar pago por QR
- **MesaOcupadaView.jsx**: Notificación al completar pago de salón

### APIs Modificadas
- **`/api/pedidos-cocina`**: Crea pedidos que activan notificaciones
- **Hook `usePedidosCocina`**: Detecta cambios en pedidos

## Beneficios

### 🚀 **Eficiencia Operativa**
- **Respuesta inmediata**: La cocina sabe instantáneamente cuando hay nuevos pedidos
- **Reducción de errores**: No se pierden pedidos por falta de atención
- **Mejor coordinación**: Equipo de cocina más eficiente

### 🎯 **Experiencia de Usuario**
- **Sonido profesional**: Notificaciones claras y no molestas
- **Configuración flexible**: Cada cocina puede personalizar según sus necesidades
- **Interfaz intuitiva**: Controles fáciles de usar

### 🔧 **Mantenibilidad**
- **Fallbacks robustos**: Sistema funciona incluso si falla el archivo de audio
- **Código modular**: Fácil de mantener y extender
- **Logs detallados**: Para debugging y monitoreo

## Consideraciones Técnicas

### Compatibilidad
- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, tablet, móvil
- **Audio**: Web Audio API + HTML5 Audio

### Rendimiento
- **Ligero**: No impacta el rendimiento de la aplicación
- **Eficiente**: Solo reproduce sonido cuando es necesario
- **Optimizado**: Carga de audio asíncrona

### Seguridad
- **Permisos**: Requiere interacción del usuario para reproducir audio
- **Privacidad**: No almacena información de audio
- **Control**: Usuario puede desactivar en cualquier momento

## Próximas Mejoras Sugeridas

1. **Notificaciones Push**: Para dispositivos móviles
2. **Sonidos Personalizados**: Diferentes sonidos por tipo de pedido
3. **Configuración Persistente**: Guardar preferencias en localStorage
4. **Métricas**: Seguimiento de tiempos de respuesta
5. **Notificaciones de Escritorio**: Para aplicaciones desktop

## Archivos Relacionados

- `src/hooks/useKitchenNotifications.js` - Lógica de notificaciones
- `src/components/KitchenNotification.jsx` - Componente visual
- `src/app/home-comandas/cocina/page.jsx` - Integración en cocina
- `public/notification-sound.mp3` - Archivo de sonido
- APIs de pedidos-cocina y modales de pago

## Instalación y Uso

1. **Reemplazar archivo de sonido** (opcional):
   ```bash
   # Reemplazar el archivo placeholder con tu sonido
   cp tu-sonido.mp3 public/notification-sound.mp3
   ```

2. **Configurar en la cocina**:
   - Ir a la vista de cocina
   - Usar el panel de configuración para ajustar volumen
   - Probar el sonido con el botón "Probar Sonido"

3. **Verificar funcionamiento**:
   - Hacer una venta desde cualquier canal
   - Verificar que suene la notificación en cocina
   - Ajustar configuración según necesidades

¡El sistema está listo para usar! 🎉
