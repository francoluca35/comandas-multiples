# Sistema de Ventas - Comandas Múltiples

## Descripción
Este módulo implementa un sistema completo de gestión de ventas para restaurantes, incluyendo gestión de mesas, pedidos, takeaway y delivery.

## Estructura de Archivos

```
ventas/
├── page.jsx                 # Componente principal que maneja la navegación
├── components/
│   ├── MesasView.jsx        # Vista de grilla de mesas
│   ├── PedidoView.jsx       # Vista de toma de pedidos
│   ├── TakeawayView.jsx     # Vista de pedidos para llevar
│   └── DeliveryView.jsx     # Vista de pedidos de delivery
└── README.md               # Este archivo
```

## Funcionalidades

### 1. Vista de Mesas (MesasView)
- **Grilla de 50 mesas** (001-050)
- **Modos de operación**: Salón, Takeaway, Delivery
- **Filtros**: Grilla+, Z1, Todas
- **Acciones**: Proformas, Historial salón
- **Mesa activa**: La mesa 001 muestra información de pedido activo

### 2. Vista de Pedidos (PedidoView)
- **Información del cliente**: Número de comensales, cliente, notas
- **Categorías de productos**: 9 categorías (Adicionales, Bebidas, Brunch, etc.)
- **Productos adicionales**: 8 productos con precios
- **Acciones**: Cancelar, ver total, terminar pedido
- **Opciones de entrada**: Cámara y teclado

### 3. Vista de Takeaway (TakeawayView)
- **Takeaway Local**: Pedidos para retirar en el local
- **Takeaway Web**: Pedidos desde la web
- **Takeaway PedidosYa**: Pedidos desde la plataforma

### 4. Vista de Delivery (DeliveryView)
- **Delivery Local**: Entregas en la zona local
- **Delivery Web**: Pedidos desde la web
- **Delivery PedidosYa**: Pedidos desde la plataforma

## Navegación

### Desde el Sidebar
- Al hacer clic en "Mesas" en el sidebar, se navega a `/home-comandas/ventas`

### Entre Vistas
- **Mesas → Pedido**: Hacer clic en una mesa
- **Mesas → Takeaway**: Hacer clic en el botón "Takeaway"
- **Mesas → Delivery**: Hacer clic en el botón "Delivery"
- **Volver**: Botón "← Volver a Mesas" en todas las vistas

## Estados

### Mesa Activa
- **Mesa 001**: Muestra información completa del pedido
  - Monto: $2.250
  - Cantidad: X1
  - Usuario: admin
  - Fecha: 29 jul 20:15

### Productos Disponibles
- **Adicionales**: 8 productos con precios desde $80 hasta $300
- **Categorías**: 9 categorías diferentes de productos

## Tecnologías Utilizadas
- **React**: Framework principal
- **Tailwind CSS**: Estilos y diseño responsivo
- **Next.js**: Enrutamiento y estructura de aplicación

## Uso

1. **Acceder al sistema**: Navegar a `/home-comandas/ventas`
2. **Seleccionar modo**: Elegir entre Salón, Takeaway o Delivery
3. **Gestionar mesas**: Hacer clic en una mesa para tomar pedido
4. **Tomar pedido**: Seleccionar productos y cantidades
5. **Finalizar**: Usar el botón "Terminar" para completar el pedido

## Características Técnicas

- **Responsive Design**: Adaptable a diferentes tamaños de pantalla
- **Dark Theme**: Interfaz oscura para mejor experiencia visual
- **Estado Local**: Gestión de estado con React hooks
- **Componentes Modulares**: Arquitectura reutilizable y mantenible 