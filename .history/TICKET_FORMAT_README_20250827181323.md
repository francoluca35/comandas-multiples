# 🎫 Mejoras en el Formato de Tickets

## 📋 Resumen de Cambios

Se han implementado mejoras significativas en el formato de tickets para cumplir con los requisitos del usuario:

1. **Diferenciación entre Takeaway, Delivery y Salón**
2. **Visualización detallada de productos** (nombre, precio unitario, cantidad, subtotal)
3. **Estructura de datos consistente** entre takeaway, delivery y salón
4. **Información adicional del cliente** (nombre y dirección para delivery)

## 🔧 Cambios Realizados

### 1. API de Tickets (`src/app/api/tickets/route.js`)

#### Diferenciación Takeaway/Salón
```javascript
// Diferenciar entre Takeaway y Salón
const tipoPedido = orderData.mesa === "TAKEAWAY" ? "TAKEAWAY" : "SALÓN";
content += `<div style="font-size: 11px; font-weight: bold; color: #000000; margin-bottom: 3px;">${tipoPedido}</div>`;

if (orderData.mesa !== "TAKEAWAY") {
  content += `<div style="font-size: 10px; color: #000000;">Mesa: ${orderData.mesa}</div>`;
}
```

#### Visualización Detallada de Productos
```javascript
orderData.productos.forEach((item, index) => {
  const precioUnitario = item.precio || (item.total / (item.unidades || 1));
  const cantidad = item.unidades || 1;
  const subtotal = item.total || (precioUnitario * cantidad);
  
  content += `<div style="margin-bottom: 4px; border-bottom: 1px dotted #ccc; padding-bottom: 2px;">`;
  // Nombre del producto
  content += `<div style="font-size: 10px; font-weight: bold; color: #000000; margin-bottom: 1px;">${
    item.producto || "Producto sin nombre"
  }</div>`;
  // Detalles del producto (precio unitario y cantidad)
  content += `<div style="display: flex; justify-content: space-between; font-size: 9px; color: #000000; margin-bottom: 1px;">`;
  content += `<span style="color: #000000;">Precio: $${precioUnitario.toLocaleString()}</span>`;
  content += `<span style="color: #000000;">Cantidad: ${cantidad}</span>`;
  content += `</div>`;
  // Subtotal del producto
  content += `<div style="text-align: right; font-size: 10px; font-weight: bold; color: #000000;">Subtotal: $${subtotal.toLocaleString()}</div>`;
  content += `</div>`;
});
```

### 2. TakeawayView (`src/app/home-comandas/ventas/components/TakeawayView.jsx`)

#### Corrección de Estructura de Datos
```javascript
// Preparar datos del pedido
const orderData = {
  cliente: clientData.nombre,
  total: calculateTotal(),
  productos: selectedProducts.map((item) => ({
    producto: item.nombre, // Cambiar nombre por producto para el ticket
    unidades: item.cantidad, // Cambiar cantidad por unidades para el ticket
    precio: item.precio,
    total: item.precio * item.cantidad,
    notas: "",
  })),
  metodoPago: clientData.mPago,
};
```

### 3. DeliveryView (`src/app/home-comandas/ventas/components/DeliveryView.jsx`)

#### Implementación Completa del Sistema de Pago
```javascript
// Preparar datos del pedido
const orderData = {
  cliente: clientData.nombre,
  direccion: clientData.direccion,
  total: calculateTotal(),
  productos: selectedProducts.map((item) => ({
    producto: item.nombre, // Cambiar nombre por producto para el ticket
    unidades: item.cantidad, // Cambiar cantidad por unidades para el ticket
    precio: item.precio,
    total: item.precio * item.cantidad,
    notas: "",
  })),
  metodoPago: clientData.mPago,
};
```

### 4. DeliveryPaymentModal (`src/app/home-comandas/ventas/components/DeliveryPaymentModal.jsx`)

#### Nuevo Modal de Pago para Delivery
- Modal específico para procesar pagos de delivery
- Integración con MercadoPago y efectivo
- Registro automático de ingresos
- Envío de tickets por WhatsApp/Email

## 📊 Estructura de Datos Esperada

### Para el API de Tickets
```javascript
{
  mesa: "TAKEAWAY" | "DELIVERY" | "1" | "2" | etc., // "TAKEAWAY" para takeaway, "DELIVERY" para delivery, número de mesa para salón
  cliente: "Nombre del Cliente",
  direccion: "Dirección de entrega", // Solo para delivery
  productos: [
    {
      producto: "Nombre del Producto",
      unidades: 2,
      precio: 1500,
      total: 3000
    }
  ],
  monto: 3000
}
```

## 🎯 Resultado Final

### Ticket Takeaway
```
┌─────────────────────────────────────┐
│           RESTAURANTE               │
│         CUIL: 20-12345678-9         │
│        Dirección del Restaurante    │
├─────────────────────────────────────┤
│           TICKET DE VENTA           │
│              TAKEAWAY               │
│        Fecha: 15/12/2024 14:30      │
├─────────────────────────────────────┤
│              CLIENTE:               │
│           Juan Pérez                │
├─────────────────────────────────────┤
│             PRODUCTOS:              │
│                                     │
│ Pizza Margherita                    │
│ Precio: $1,500    Cantidad: 2       │
│                    Subtotal: $3,000 │
│                                     │
│ Coca Cola                          │
│ Precio: $500      Cantidad: 1       │
│                    Subtotal: $500   │
├─────────────────────────────────────┤
│           TOTAL: $3,500             │
├─────────────────────────────────────┤
│        ¡Gracias por su compra!      │
│           Vuelva pronto             │
└─────────────────────────────────────┘
```

### Ticket Salón
```
┌─────────────────────────────────────┐
│           RESTAURANTE               │
│         CUIL: 20-12345678-9         │
│        Dirección del Restaurante    │
├─────────────────────────────────────┤
│           TICKET DE VENTA           │
│               SALÓN                 │
│              Mesa: 3                │
│        Fecha: 15/12/2024 14:30      │
├─────────────────────────────────────┤
│              CLIENTE:               │
│           María García              │
├─────────────────────────────────────┤
│             PRODUCTOS:              │
│                                     │
│ Pasta Carbonara                     │
│ Precio: $2,000    Cantidad: 1       │
│                    Subtotal: $2,000 │
│                                     │
│ Vino Tinto                          │
│ Precio: $800      Cantidad: 2       │
│                    Subtotal: $1,600 │
├─────────────────────────────────────┤
│           TOTAL: $3,600             │
├─────────────────────────────────────┤
│        ¡Gracias por su compra!      │
│           Vuelva pronto             │
└─────────────────────────────────────┘
```

## ✅ Beneficios

1. **Claridad Visual**: Los tickets ahora muestran claramente si es takeaway o salón
2. **Transparencia**: Cada producto muestra su precio unitario, cantidad y subtotal
3. **Consistencia**: Misma estructura de datos para ambos tipos de pedidos
4. **Profesionalismo**: Formato más detallado y profesional para los clientes

## 🔄 Compatibilidad

- ✅ **Takeaway**: Datos corregidos para usar `producto` y `unidades`
- ✅ **Salón**: Ya usaba la estructura correcta
- ✅ **API de Tickets**: Actualizada para manejar ambos tipos
- ✅ **Envío por WhatsApp/Email**: Funciona con el nuevo formato

## 📝 Notas Técnicas

- Los tickets mantienen el ancho de 58mm (ticket térmico)
- Se usa fuente monospace para mejor legibilidad
- Los precios se formatean con separadores de miles
- Se mantiene la compatibilidad con el sistema de envío existente
