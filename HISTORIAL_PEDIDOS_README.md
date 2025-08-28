# Historial de Pedidos - Nueva Funcionalidad

## Descripción

Se ha implementado una nueva funcionalidad de **Historial de Pedidos** que reemplaza el anterior "Historial de Salón" y ahora muestra todos los pedidos entregados por cocina, incluyendo tanto pedidos de salón como de takeaway.

## Cambios Realizados

### 1. Nuevo Componente: `HistorialPedidos.jsx`

**Ubicación**: `src/app/home-comandas/ventas/components/HistorialPedidos.jsx`

**Funcionalidades**:
- Muestra todos los pedidos con estado "realizado" (entregados por cocina)
- Filtrado por tipo: Todos, Salón, Takeaway
- Diferenciación visual por tipo de pedido
- Información detallada de cada pedido
- Formato de fecha y moneda localizado

### 2. Actualización del NavigationBar

**Cambios**:
- Texto del botón cambiado de "Historial salón" a "Historial de Pedidos"
- Agregada funcionalidad para abrir el modal de historial
- Nueva prop `onHistorialClick` para manejar el evento

### 3. Integración en la Página de Ventas

**Cambios**:
- Importación del nuevo componente `HistorialPedidos`
- Estado para controlar la visibilidad del modal
- Funciones para abrir y cerrar el historial
- Modal integrado en la interfaz

## Características del Historial

### Filtros Disponibles
1. **Todos**: Muestra todos los pedidos entregados
2. **Salón**: Solo pedidos de mesas (fondo amarillo)
3. **Takeaway**: Solo pedidos para llevar (fondo naranja)

### Información Mostrada por Pedido
- **Identificación**: Mesa número o "TAKEAWAY - Nombre Cliente"
- **Fecha y hora**: Cuándo se completó el pedido
- **Tipo**: Etiqueta "SALÓN" o "TAKEAWAY"
- **Total**: Monto total del pedido
- **Productos**: Lista detallada con cantidades y precios
- **Notas**: Información adicional si existe

### Diferenciación Visual
- **Salón**: Bordes y elementos amarillos
- **Takeaway**: Bordes y elementos naranjas
- **Contadores**: Muestra cantidad de pedidos por tipo en los filtros

## Estructura de Datos

### Pedidos de Salón
```javascript
{
  id: "pedido_id",
  mesa: "5",
  productos: [...],
  total: 1500,
  cliente: "Cliente Mesa 5",
  estado: "realizado",
  timestamp: Date,
  tipo: "salon" // implícito
}
```

### Pedidos de Takeaway
```javascript
{
  id: "pedido_id",
  mesa: "TAKEAWAY",
  productos: [...],
  total: 1200,
  cliente: "Juan Pérez",
  estado: "realizado",
  timestamp: Date,
  tipo: "takeaway"
}
```

## Archivos Modificados

### 1. `src/app/home-comandas/ventas/components/HistorialPedidos.jsx` (NUEVO)
- Componente completo para mostrar el historial
- Filtros por tipo de pedido
- Diseño responsivo y moderno
- Manejo de errores y estados de carga

### 2. `src/app/home-comandas/ventas/components/NavigationBar.jsx`
- Cambio de texto: "Historial salón" → "Historial de Pedidos"
- Agregada función `handleHistorial`
- Nueva prop `onHistorialClick`

### 3. `src/app/home-comandas/ventas/page.jsx`
- Importación del nuevo componente
- Estado `showHistorial`
- Funciones `handleHistorialClick` y `handleCloseHistorial`
- Integración del modal

## Uso

### Para acceder al historial:
1. Ir a Ventas (cualquier modo: Salón, Takeaway, Delivery)
2. Hacer clic en el botón "Historial de Pedidos" en la barra de navegación
3. Se abrirá un modal con todos los pedidos entregados

### Para filtrar pedidos:
1. En el modal de historial, usar los botones de filtro:
   - **Todos**: Ver todos los pedidos
   - **Salón**: Solo pedidos de mesas
   - **Takeaway**: Solo pedidos para llevar

### Para cerrar el historial:
- Hacer clic en el botón "X" en la esquina superior derecha
- O hacer clic fuera del modal

## Beneficios

1. **Visión completa**: Acceso a todos los pedidos entregados en un solo lugar
2. **Filtrado inteligente**: Separación clara entre salón y takeaway
3. **Información detallada**: Todos los datos relevantes de cada pedido
4. **Interfaz moderna**: Diseño consistente con el resto de la aplicación
5. **Trazabilidad**: Seguimiento completo del flujo de pedidos

## Próximos Pasos Sugeridos

1. **Exportación**: Agregar funcionalidad para exportar el historial a PDF/Excel
2. **Búsqueda**: Implementar búsqueda por cliente, mesa o fecha
3. **Estadísticas**: Agregar gráficos y estadísticas del historial
4. **Filtros avanzados**: Por rango de fechas, monto, etc.
5. **Notificaciones**: Alertas para pedidos recientes

## Compatibilidad

- ✅ Funciona con pedidos existentes de salón
- ✅ Funciona con nuevos pedidos de takeaway
- ✅ Compatible con todos los modos de venta
- ✅ Diseño responsivo para diferentes tamaños de pantalla
