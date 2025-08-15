# Test de Ingresos Automáticos

## 🧪 Instrucciones de Prueba

### Prueba 1: Pago en Efectivo

1. **Preparación:**
   - Ir a la sección de ventas
   - Seleccionar una mesa
   - Agregar productos por un total de $12.000

2. **Proceso de Cobranza:**
   - Hacer clic en "Cobrar"
   - Seleccionar "Efectivo" como método de pago
   - Confirmar el pago

3. **Verificación:**
   - Ir a la sección "Pagos" o "Dinero"
   - Verificar que en "Ingreso Efectivo" aparezca $12.000,00
   - Verificar que en "Ingreso Virtual" aparezca $0,00
   - El total de ingresos debe ser $12.000,00

### Prueba 2: Pago con MercadoPago

1. **Preparación:**
   - Ir a la sección de ventas
   - Seleccionar una mesa
   - Agregar productos por un total de $15.000

2. **Proceso de Cobranza:**
   - Hacer clic en "Cobrar"
   - Seleccionar "Tarjeta" o "QR" como método de pago
   - Completar el pago en MercadoPago

3. **Verificación:**
   - Esperar a que se confirme el pago (webhook)
   - Ir a la sección "Pagos" o "Dinero"
   - Verificar que en "Ingreso Efectivo" aparezca $0,00
   - Verificar que en "Ingreso Virtual" aparezca $15.000,00
   - El total de ingresos debe ser $15.000,00

## 🔍 Logs a Verificar

### En la Consola del Navegador:

**Para Pago en Efectivo:**
```
💰 Registrando ingreso automático: {
  tipoIngreso: "Venta Mesa",
  motivo: "Cobranza mesa X - Cliente",
  monto: 12000,
  formaIngreso: "Efectivo",
  opcionPago: "caja",
  metodoPago: "efectivo"
}
✅ Ingreso registrado automáticamente
```

**Para Pago con MercadoPago:**
```
💰 Registrando ingreso automático desde webhook: {
  restaurantId: "...",
  monto: 15000,
  mesa: "X",
  cliente: "Cliente",
  externalRef: "..."
}
✅ Ingreso registrado automáticamente desde webhook con ID: ...
```

### En los Logs del Servidor:

**API de Ingresos:**
```
🔍 API Ingresos - Creando ingreso: {
  restauranteId: "...",
  tipoIngreso: "Venta Mesa",
  motivo: "Cobranza mesa X - Cliente",
  monto: 12000,
  formaIngreso: "Efectivo",
  opcionPago: "caja"
}
🔧 Decidiendo qué actualizar según opcionPago: caja
💰 Actualizando SOLO caja registradora con monto: 12000
```

## ❌ Problemas Comunes y Soluciones

### Problema: Los ingresos se dividen automáticamente
**Síntoma:** Si pagas $12.000 en efectivo, aparece $6.000 en efectivo y $6.000 en virtual.

**Causa:** La lógica anterior en `DineroCard.jsx` dividía proporcionalmente.

**Solución:** Ya corregida. Ahora calcula basándose en los datos reales registrados.

### Problema: No se registra el ingreso automático
**Síntoma:** El pago se procesa pero no aparece en los ingresos.

**Verificar:**
1. Que el hook `useIngresos` esté importado correctamente
2. Que la función `registrarIngresoAutomatico` se esté llamando
3. Que no haya errores en la consola

### Problema: Error en el webhook
**Síntoma:** Los pagos de MercadoPago no registran ingresos automáticamente.

**Verificar:**
1. Que el webhook esté configurado correctamente
2. Que las credenciales de MercadoPago sean válidas
3. Que la función `registrarIngresoAutomaticoWebhook` se ejecute

## 📊 Verificación de Datos

### En Firestore:

**Colección Ingresos:**
```javascript
{
  tipoIngreso: "Venta Mesa",
  motivo: "Cobranza mesa X - Cliente",
  monto: "12000",
  formaIngreso: "Efectivo",
  opcionPago: "caja",
  fecha: Timestamp,
  createdAt: Timestamp
}
```

**Colección CajaRegistradora:**
```javascript
{
  Apertura: "12000", // Debe incrementarse
  Ingresos: {
    "timestamp": {
      fecha: Timestamp,
      monto: "12000",
      motivo: "Cobranza mesa X - Cliente"
    }
  }
}
```

**Colección Dinero (para MercadoPago):**
```javascript
{
  Virtual: "15000", // Debe incrementarse
  IngresosVirtual: {
    "timestamp": {
      fecha: Timestamp,
      monto: "15000",
      motivo: "Cobranza mesa X - Cliente (MercadoPago)"
    }
  }
}
```

## ✅ Criterios de Aceptación

- [ ] Pago en efectivo registra 100% en "Ingreso Efectivo"
- [ ] Pago con MercadoPago registra 100% en "Ingreso Virtual"
- [ ] No hay división automática de montos
- [ ] Los logs muestran la información correcta
- [ ] Los datos se guardan correctamente en Firestore
- [ ] La interfaz muestra los valores correctos
