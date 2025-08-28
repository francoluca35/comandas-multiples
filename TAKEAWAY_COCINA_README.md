# Sistema de Takeaway y Cocina Mejorado

## Nuevas Funcionalidades Implementadas

### 1. Envío de Pedidos Takeaway a Cocina

**Problema resuelto**: Los pedidos de takeaway ahora se envían automáticamente a la pantalla de cocina.

**Cambios realizados**:
- Modificado `TakeawayView.jsx` para enviar pedidos a la API de cocina
- Los pedidos takeaway se identifican con `mesa: "TAKEAWAY"` y `tipo: "takeaway"`
- Se incluye información del cliente en el pedido

**Flujo del pedido takeaway**:
1. Usuario selecciona productos en TakeawayView
2. Completa datos del cliente
3. Al hacer clic en "Procesar Pedido", se envía a cocina
4. El pedido aparece en la pantalla de cocina con etiqueta "TAKEAWAY"

### 2. Diferenciación Visual en Cocina

**Colores implementados**:
- **SALÓN**: Amarillo claro (`bg-yellow-50/90`, `border-yellow-200`)
- **TAKEAWAY**: Naranja (`bg-orange-50/90`, `border-orange-200`)

**Elementos diferenciados**:
- **Fondo de las tarjetas**: Colores diferentes según el tipo
- **Iconos**: Amarillo para salón, naranja para takeaway
- **Etiquetas**: "SALÓN" en amarillo, "TAKEAWAY" en naranja
- **Productos**: Fondo y elementos con colores correspondientes
- **Botones**: Gradientes diferenciados por tipo

### 3. Etiquetas y Identificación

**Etiquetas agregadas**:
- Cada pedido muestra claramente "SALÓN" o "TAKEAWAY"
- Los pedidos de takeaway muestran el nombre del cliente
- Los pedidos de salón muestran el número de mesa

**Ejemplos**:
- Salón: "Mesa 5" con etiqueta "SALÓN"
- Takeaway: "TAKEAWAY - Juan Pérez" con etiqueta "TAKEAWAY"

### 4. Leyenda Visual

**Nueva sección agregada**:
- Leyenda explicativa en la parte inferior de la pantalla de cocina
- Muestra los colores y significados
- Ayuda al personal de cocina a identificar rápidamente el tipo de pedido

## Archivos Modificados

### 1. `src/app/home-comandas/ventas/components/TakeawayView.jsx`
- **Función `handleSubmitOrder`**: Ahora envía pedidos a cocina
- **Datos del pedido**: Incluye tipo "takeaway" y mesa "TAKEAWAY"
- **Manejo de errores**: Validación y notificaciones mejoradas

### 2. `src/app/home-comandas/cocina/page.jsx`
- **Componente `PedidoCard`**: Diferenciación visual por tipo
- **Colores dinámicos**: Cambio automático según tipo de pedido
- **Etiquetas**: Identificación clara de SALÓN vs TAKEAWAY
- **Leyenda**: Explicación visual de los colores

## Estructura de Datos

### Pedido de Salón (existente)
```javascript
{
  mesa: "5",
  productos: [...],
  total: 1500,
  cliente: "Cliente Mesa 5",
  estado: "pendiente",
  tipo: "salon" // implícito
}
```

### Pedido de Takeaway (nuevo)
```javascript
{
  mesa: "TAKEAWAY",
  productos: [...],
  total: 1200,
  cliente: "Juan Pérez",
  estado: "pendiente",
  tipo: "takeaway"
}
```

## Beneficios

1. **Identificación rápida**: El personal de cocina puede distinguir inmediatamente el tipo de pedido
2. **Priorización**: Los pedidos takeaway pueden tener prioridad diferente
3. **Organización**: Mejor flujo de trabajo en cocina
4. **Trazabilidad**: Seguimiento completo de pedidos takeaway
5. **Experiencia visual**: Interfaz más intuitiva y profesional

## Próximos Pasos Sugeridos

1. **Sonidos diferenciados**: Notificaciones diferentes para takeaway vs salón
2. **Prioridades**: Sistema de priorización automática
3. **Tiempos estimados**: Diferentes tiempos de preparación por tipo
4. **Estadísticas**: Reportes separados por tipo de pedido
5. **Notificaciones push**: Alertas específicas para takeaway

## Uso

### Para crear un pedido takeaway:
1. Ir a Ventas → Takeaway
2. Seleccionar productos
3. Completar datos del cliente
4. Hacer clic en "Procesar Pedido"
5. El pedido aparecerá en cocina con etiqueta naranja "TAKEAWAY"

### Para ver en cocina:
1. Ir a Cocina
2. Los pedidos aparecen con colores diferenciados:
   - Amarillo = SALÓN
   - Naranja = TAKEAWAY
3. Cada pedido tiene su etiqueta correspondiente
4. La leyenda explica los colores
