# Vista de Cocina

## Descripción
La vista de cocina es una interfaz especializada para que el personal de cocina pueda gestionar y dar seguimiento a los pedidos en tiempo real.

## Características

### Permisos de Acceso
- **ADMIN**: Acceso completo
- **COCINA**: Acceso completo
- **MESERO**: Sin acceso
- **USUARIO**: Sin acceso

### Funcionalidades

#### 1. Primeros Pedidos (Sección Azul)
- Muestra los pedidos que están en preparación
- Cada pedido incluye:
  - Número de mesa
  - Lista de items con cantidades
  - Notas especiales (si las hay)
  - Botón "Listo" (verde) para marcar como terminado

#### 2. Pedidos Hechos (Sección Verde)
- Muestra los pedidos que ya están listos
- Cada pedido incluye:
  - Misma información que en "Primeros Pedidos"
  - Botón "Realizado" (rojo) para confirmar entrega

### Flujo de Trabajo
1. **Pedido Recibido** → Aparece en "Primeros Pedidos"
2. **En Preparación** → El cocinero ve los detalles y prepara
3. **Listo** → Al hacer clic en "Listo", el pedido se mueve a "Pedidos Hechos"
4. **Entregado** → Al hacer clic en "Realizado", el pedido se elimina del sistema

### Componentes

#### PedidoCard
- Componente reutilizable para mostrar información de pedidos
- Se adapta automáticamente según el estado del pedido
- Muestra tarjetas vacías cuando no hay pedidos

#### CocinaPage
- Página principal que gestiona el estado de los pedidos
- Controla la lógica de movimiento entre secciones
- Incluye validación de permisos y autenticación

### Estructura de Datos

```javascript
const pedido = {
  id: Number,
  mesa: String,
  items: [
    {
      cantidad: Number,
      nombre: String,
      notas: String (opcional)
    }
  ],
  timestamp: Date,
  estado: "en_preparacion" | "listo" | "realizado"
}
```

### Personalización

#### Colores
- **Fondo principal**: Azul oscuro (`bg-blue-900`)
- **Primeros pedidos**: Azul claro (`bg-blue-200`)
- **Pedidos hechos**: Verde claro (`bg-green-200`)
- **Botón Listo**: Verde (`bg-green-500`)
- **Botón Realizado**: Rojo (`bg-red-500`)

#### Responsive Design
- Layout de una columna en móviles
- Layout de dos columnas en pantallas grandes
- Tarjetas adaptativas con altura fija

### Integración Futura

Para una implementación completa, se recomienda:

1. **API de Pedidos**: Conectar con el sistema de ventas para obtener pedidos reales
2. **WebSockets**: Implementar actualizaciones en tiempo real
3. **Notificaciones**: Alertas sonoras cuando lleguen nuevos pedidos
4. **Historial**: Mantener registro de pedidos completados
5. **Estadísticas**: Tiempo promedio de preparación por tipo de pedido

### Testing

La página incluye un botón "Agregar Pedido de Ejemplo" para probar la funcionalidad sin necesidad de datos reales.

### Seguridad

- Validación de autenticación en cada carga
- Verificación de permisos de rol
- Redirección automática si no se cumplen los requisitos
