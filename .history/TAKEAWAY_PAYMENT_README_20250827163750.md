# Sistema de Pago Takeaway - Nueva Funcionalidad

## Descripción

Se ha implementado un sistema completo de pago para pedidos takeaway que permite cobrar al cliente antes de enviar el pedido a cocina. El sistema soporta dos métodos de pago: **Efectivo** y **MercadoPago**.

## Flujo de Trabajo

### 1. **Selección de Productos**
- El usuario selecciona productos del menú
- Completa los datos del cliente (nombre)
- Selecciona el método de pago preferido

### 2. **Proceso de Pago**
- Al hacer clic en "Procesar Pago", se abre el modal de pago
- El usuario puede cambiar el método de pago si es necesario
- Se procesa el pago según el método seleccionado

### 3. **Métodos de Pago**

#### **Efectivo**
- Genera automáticamente un PDF del ticket
- Permite enviar por WhatsApp
- El pedido se envía inmediatamente a cocina

#### **MercadoPago**
- Genera un código QR para el pago
- El cliente escanea el QR con su celular
- Una vez confirmado el pago, genera el PDF del ticket
- El pedido se envía a cocina después del pago exitoso

## Componentes Implementados

### 1. **TakeawayPaymentModal.jsx**
**Ubicación**: `src/app/home-comandas/ventas/components/TakeawayPaymentModal.jsx`

**Funcionalidades**:
- Modal para selección de método de pago
- Integración con `usePaymentProcessor` para procesar pagos
- Integración con `useTicketGenerator` para generar tickets
- Integración con `usePaymentStatus` para monitorear pagos de MercadoPago
- Manejo de estados de carga y errores
- Interfaz intuitiva con iconos y colores diferenciados

### 2. **TakeawayView.jsx (Modificado)**
**Cambios principales**:
- Integración del nuevo modal de pago
- Modificación del flujo: primero pago, luego envío a cocina
- Nuevo estado para controlar el modal de pago
- Función `handlePaymentComplete` para manejar el éxito del pago
- Cambio del botón de "Procesar Pedido" a "Procesar Pago"

## Hooks Utilizados

### 1. **usePaymentProcessor**
- Procesa pagos con MercadoPago
- Maneja diferentes métodos de pago
- Retorna URLs de pago y referencias externas

### 2. **useTicketGenerator**
- Genera PDFs de tickets
- Formato optimizado para impresión
- Soporte para envío por WhatsApp

### 3. **usePaymentStatus**
- Monitorea el estado de pagos de MercadoPago
- Detecta automáticamente pagos aprobados
- Maneja estados pendientes y rechazados

### 4. **useMercadoPagoConfig**
- Configuración de credenciales de MercadoPago
- Validación de configuración
- Manejo de entornos (producción/sandbox)

## Flujo Técnico

### **Efectivo**
```javascript
1. Usuario selecciona "Efectivo"
2. Se procesa el pago (validación local)
3. Se genera el PDF del ticket
4. Se envía el pedido a cocina
5. Se muestra confirmación
```

### **MercadoPago**
```javascript
1. Usuario selecciona "MercadoPago"
2. Se procesa el pago con la API de MercadoPago
3. Se genera y muestra el código QR
4. Se monitorea el estado del pago
5. Al confirmarse el pago:
   - Se genera el PDF del ticket
   - Se envía el pedido a cocina
   - Se muestra confirmación
```

## Estructura de Datos

### **Datos del Pedido**
```javascript
{
  cliente: "string",
  total: number,
  productos: [
    {
      nombre: "string",
      cantidad: number,
      precio: number,
      total: number,
      notas: "string"
    }
  ],
  metodoPago: "efectivo" | "mercadopago",
  timestamp: Date
}
```

### **Datos para Cocina**
```javascript
{
  mesa: "TAKEAWAY",
  productos: [...],
  total: number,
  cliente: "string",
  notas: "string",
  timestamp: Date,
  estado: "pendiente",
  restauranteId: "string",
  tipo: "takeaway",
  metodoPago: "string" // Nuevo campo
}
```

## Configuración Requerida

### **MercadoPago**
- Credenciales configuradas en la aplicación
- API keys de producción
- Webhooks configurados para notificaciones de pago

### **Generación de Tickets**
- Configuración de formato de ticket
- Integración con WhatsApp (opcional)
- Configuración de impresora térmica (opcional)

## Beneficios

### **Para el Negocio**
- ✅ Cobro anticipado antes de preparar el pedido
- ✅ Reducción de pérdidas por pedidos no retirados
- ✅ Múltiples métodos de pago
- ✅ Automatización del proceso de cobro

### **Para el Cliente**
- ✅ Flexibilidad en métodos de pago
- ✅ Proceso de pago rápido y seguro
- ✅ Confirmación automática
- ✅ Ticket digital disponible

### **Para el Personal**
- ✅ Flujo de trabajo optimizado
- ✅ Reducción de errores de cobro
- ✅ Interfaz intuitiva
- ✅ Confirmaciones automáticas

## Manejo de Errores

### **Errores de Pago**
- Validación de datos del cliente
- Verificación de configuración de MercadoPago
- Manejo de errores de red
- Mensajes de error claros para el usuario

### **Errores de Ticket**
- Fallback si falla la generación del PDF
- Opción de reimpresión
- Logs detallados para debugging

### **Errores de Cocina**
- Reintentos automáticos
- Notificaciones de error
- Opción de envío manual

## Próximas Mejoras

### **Funcionalidades Adicionales**
- [ ] Integración con WhatsApp Business API
- [ ] Notificaciones push para confirmación de pago
- [ ] Historial de pagos detallado
- [ ] Reportes de ventas por método de pago

### **Optimizaciones**
- [ ] Cache de configuración de MercadoPago
- [ ] Optimización de generación de tickets
- [ ] Mejoras en la UI/UX
- [ ] Soporte para más métodos de pago

## Notas de Desarrollo

### **Buenas Prácticas Implementadas**
- ✅ Separación de responsabilidades
- ✅ Manejo de estados de carga
- ✅ Validaciones robustas
- ✅ Manejo de errores consistente
- ✅ UI/UX intuitiva
- ✅ Código documentado
- ✅ Estructura escalable

### **Consideraciones de Seguridad**
- ✅ Validación de datos en frontend y backend
- ✅ Manejo seguro de credenciales
- ✅ Sanitización de inputs
- ✅ Logs de auditoría
- ✅ Manejo de errores sin exponer información sensible
