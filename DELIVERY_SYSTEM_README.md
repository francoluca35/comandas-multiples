# 🚚 Sistema de Delivery

## 📋 Resumen de Implementación

Se ha implementado un sistema completo de delivery que incluye:

1. **Modal de pago específico para delivery**
2. **Diferenciación visual en cocina** (color púrpura)
3. **Información de dirección en tickets y cocina**
4. **Registro automático de ingresos**
5. **Envío de tickets por WhatsApp/Email**

## 🔧 Componentes Implementados

### 1. DeliveryPaymentModal (`src/app/home-comandas/ventas/components/DeliveryPaymentModal.jsx`)

Modal específico para procesar pagos de delivery con:
- **Efectivo**: Procesamiento directo
- **MercadoPago**: Generación de QR
- **Registro automático de ingresos**:
  - Efectivo → `caja` (Caja Registradora)
  - MercadoPago → `cuenta_restaurante` (Ingreso Virtual)
- **Envío de tickets** por WhatsApp/Email

### 2. DeliveryView (`src/app/home-comandas/ventas/components/DeliveryView.jsx`)

Vista completa para pedidos de delivery con:
- **Datos del cliente**: Nombre y dirección obligatorios
- **Selección de productos** con categorías
- **Cálculo automático de totales**
- **Integración con modal de pago**
- **Envío a cocina** después del pago exitoso

### 3. Cocina - Diferenciación Visual

Los pedidos de delivery se muestran en **color púrpura** para diferenciarlos:
- **Fondo**: `bg-purple-50/90 border-purple-200`
- **Iconos**: `text-purple-600`
- **Etiquetas**: `bg-purple-500 text-white`
- **Productos**: `bg-purple-100/80`
- **Botones**: Gradiente púrpura a rojo

### 4. API de Tickets - Información de Dirección

Los tickets de delivery incluyen:
- **Etiqueta "DELIVERY"** en lugar de mesa
- **Nombre del cliente**
- **Dirección de entrega** (nueva línea)
- **Productos detallados** con precios unitarios

## 📊 Flujo de Trabajo

### 1. Creación del Pedido
```
Cliente ingresa datos → Selecciona productos → Procesa pago → Envía a cocina
```

### 2. Procesamiento de Pago
```
Efectivo: Registro directo → Generación ticket → Envío WhatsApp/Email
MercadoPago: QR → Pago → Registro → Generación ticket → Envío WhatsApp/Email
```

### 3. Cocina
```
Pedido llega → Se muestra en púrpura → Marca como listo → Marca como realizado
```

## 🎯 Estructura de Datos

### Pedido para Cocina
```javascript
{
  mesa: "DELIVERY",
  productos: [
    {
      producto: "Nombre del Producto",
      unidades: 2,
      precio: 1500,
      total: 3000
    }
  ],
  cliente: "Nombre del Cliente",
  direccion: "Dirección de entrega",
  total: 3000,
  estado: "pendiente",
  tipo: "delivery",
  metodoPago: "efectivo" | "mercadopago"
}
```

### Ticket de Delivery
```
┌─────────────────────────────────────┐
│           RESTAURANTE               │
│         CUIL: 20-12345678-9         │
│        Dirección del Restaurante    │
├─────────────────────────────────────┤
│           TICKET DE VENTA           │
│              DELIVERY               │
│        Fecha: 15/12/2024 14:30      │
├─────────────────────────────────────┤
│              CLIENTE:               │
│           Carlos López              │
│        Dirección: Av. San Martín 123│
├─────────────────────────────────────┤
│             PRODUCTOS:              │
│                                     │
│ Pizza Hawaiana                      │
│ Precio: $2,500    Cantidad: 1       │
│                    Subtotal: $2,500 │
├─────────────────────────────────────┤
│           TOTAL: $2,500             │
├─────────────────────────────────────┤
│        ¡Gracias por su compra!      │
│           Vuelva pronto             │
└─────────────────────────────────────┘
```

## ✅ Beneficios

1. **Diferenciación Clara**: Los pedidos de delivery se identifican fácilmente en cocina
2. **Información Completa**: Dirección visible en cocina y tickets
3. **Flujo Automatizado**: Registro de ingresos automático
4. **Comunicación**: Tickets enviados por WhatsApp/Email
5. **Consistencia**: Misma estructura que takeaway y salón

## 🔄 Compatibilidad

- ✅ **Estructura de datos**: Compatible con sistema existente
- ✅ **API de cocina**: Maneja productos con `nombre` o `producto`
- ✅ **API de tickets**: Maneja cantidades con `cantidad` o `unidades`
- ✅ **Sistema de pagos**: Integrado con MercadoPago y efectivo
- ✅ **Registro de ingresos**: Automático según método de pago

## 📝 Notas Técnicas

- Los pedidos de delivery usan `mesa: "DELIVERY"` como identificador
- La dirección se almacena en `pedido.direccion`
- Los productos mantienen compatibilidad con `nombre`/`producto` y `cantidad`/`unidades`
- El color púrpura (#8B5CF6) se usa para diferenciar delivery
- Los ingresos se registran automáticamente según el método de pago
