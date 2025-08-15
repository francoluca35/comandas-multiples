# Ingresos Automáticos al Cobrar Mesas

## 📋 Descripción

Esta funcionalidad registra automáticamente los ingresos cuando se cobra una mesa, según el método de pago utilizado:

- **Efectivo** → Se suma a "Ingresos Efectivo" (caja registradora)
- **MercadoPago** → Se suma a "Ingresos Virtual" (dinero virtual)

## 🔧 Implementación

### 1. Componente CobranzaModal

**Archivo:** `src/app/home-comandas/ventas/components/CobranzaModal.jsx`

#### Funcionalidades agregadas:

- **Hook de ingresos:** Importa `useIngresos` para manejar la creación de ingresos
- **Función `registrarIngresoAutomatico`:** Registra automáticamente el ingreso según el método de pago
- **Integración en `handleCobrar`:** Llama a la función de registro automático para pagos en efectivo

#### Lógica de registro:

```javascript
// Para efectivo
tipoIngreso: "Venta Mesa"
formaIngreso: "Efectivo"
opcionPago: "caja" // Se suma a caja registradora

// Para MercadoPago (tarjeta/QR)
tipoIngreso: "Venta Mesa"
formaIngreso: "MercadoPago"
opcionPago: "cuenta_restaurante" // Se suma a dinero virtual
```

### 2. Webhook de Pagos

**Archivo:** `src/app/api/pagos/webhook/route.js`

#### Funcionalidades agregadas:

- **Función `registrarIngresoAutomaticoWebhook`:** Registra ingresos automáticamente cuando se confirma un pago de MercadoPago
- **Función `actualizarDineroVirtualIngreso`:** Actualiza el dinero virtual del restaurante
- **Integración en `handleApprovedPayment`:** Llama al registro automático cuando se aprueba un pago

#### Lógica de registro desde webhook:

```javascript
// Para pagos aprobados de MercadoPago
tipoIngreso: "Venta Mesa"
motivo: "Cobranza mesa {numero} - {cliente} (MercadoPago)"
formaIngreso: "MercadoPago"
opcionPago: "cuenta_restaurante"
externalReference: "{referencia_del_pago}"
```

## 📊 Flujo de Funcionamiento

### Pago en Efectivo:
1. Usuario selecciona "Efectivo" como método de pago
2. Al hacer clic en "Cobrar":
   - Se registra automáticamente el ingreso en la caja registradora
   - Se imprime el ticket
   - Se libera la mesa

### Pago con MercadoPago:
1. Usuario selecciona "Tarjeta" o "QR" como método de pago
2. Al hacer clic en "Cobrar":
   - Se procesa el pago con MercadoPago
   - Se redirige al usuario a MercadoPago
3. Cuando MercadoPago confirma el pago (webhook):
   - Se registra automáticamente el ingreso en dinero virtual
   - Se libera la mesa automáticamente

## 🗂️ Estructura de Datos

### Ingreso Automático:
```javascript
{
  tipoIngreso: "Venta Mesa",
  motivo: "Cobranza mesa {numero} - {cliente}",
  monto: "{monto}",
  formaIngreso: "Efectivo" | "MercadoPago",
  fecha: Date,
  opcionPago: "caja" | "cuenta_restaurante",
  externalReference?: "{referencia}" // Solo para MercadoPago
}
```

### Actualización de Caja/Dinero:
- **Caja Registradora:** Se actualiza el campo `Apertura` y se agrega a `Ingresos`
- **Dinero Virtual:** Se actualiza el campo `Virtual` y se agrega a `IngresosVirtual`

## 🔍 Monitoreo y Logs

### Logs de Registro Automático:
- `💰 Registrando ingreso automático:` - Cuando se inicia el registro
- `✅ Ingreso registrado automáticamente` - Cuando se completa exitosamente
- `❌ Error registrando ingreso automático:` - Si hay algún error

### Logs del Webhook:
- `💰 Registrando ingreso automático desde webhook:` - Cuando se inicia desde webhook
- `✅ Ingreso registrado automáticamente desde webhook con ID:` - Cuando se completa
- `💳 Actualizando dinero virtual (ingreso):` - Cuando se actualiza dinero virtual

## ⚠️ Manejo de Errores

- Los errores en el registro automático **NO** interrumpen el flujo de cobranza
- Se registran en consola para debugging pero no afectan la experiencia del usuario
- Si falla el registro automático, el pago sigue procesándose normalmente

## 🧪 Testing

### Casos de Prueba:

1. **Pago en Efectivo:**
   - Verificar que se registre en caja registradora
   - Verificar que el monto se sume correctamente

2. **Pago con MercadoPago:**
   - Verificar que se registre en dinero virtual
   - Verificar que se incluya la referencia externa
   - Verificar que se actualice el saldo virtual

3. **Errores:**
   - Verificar que los errores no interrumpan el flujo
   - Verificar que se registren en consola

## 📈 Beneficios

- **Automatización:** No requiere intervención manual para registrar ingresos
- **Precisión:** Elimina errores de registro manual
- **Trazabilidad:** Cada ingreso tiene información detallada del origen
- **Separación:** Mantiene separados efectivo y dinero virtual
- **Auditoría:** Permite rastrear todos los ingresos por método de pago
