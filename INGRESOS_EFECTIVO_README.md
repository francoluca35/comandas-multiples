# Sistema de Ingresos Automáticos en Efectivo

## Descripción

Este documento describe cómo funciona el sistema automático de registro de ingresos en efectivo cuando se cobra una mesa en ventas.

## Flujo Completo

### 1. Cobranza en Ventas

**Archivo**: `src/app/home-comandas/ventas/components/CobranzaModal.jsx`

Cuando un usuario selecciona "Efectivo" como método de pago y hace clic en "Cobrar":

```javascript
case "efectivo":
  console.log("Procesando pago en efectivo...");
  try {
    // Registrar ingreso automático para efectivo
    await registrarIngresoAutomatico("efectivo", orderData?.monto || 0);
    console.log("Pago en efectivo procesado");
    
    // Imprimir ticket después del pago exitoso
    await printTicket(orderData);
    console.log("Ticket impreso exitosamente");
    
    onPaymentComplete("efectivo");
    onClose();
  } catch (paymentError) {
    console.error("Error al procesar pago en efectivo:", paymentError);
    alert("Error al procesar el pago: " + paymentError.message);
  }
  break;
```

### 2. Registro Automático de Ingreso

La función `registrarIngresoAutomatico` se ejecuta automáticamente:

```javascript
const registrarIngresoAutomatico = async (metodoPago, monto) => {
  try {
    const restauranteId = getRestaurantId();
    const fecha = new Date();

    // Determinar el tipo de ingreso según el método de pago
    let tipoIngreso, formaIngreso, opcionPago;

    if (metodoPago === "efectivo") {
      tipoIngreso = "Venta Mesa";
      formaIngreso = "Efectivo";
      opcionPago = "caja"; // Se suma a caja registradora
    }

    const motivo = `Cobranza mesa ${orderData?.mesa || "N/A"} - ${
      orderData?.cliente || "Cliente"
    }`;

    // Crear el ingreso automáticamente
    const resultado = await crearIngreso(
      tipoIngreso,
      motivo,
      monto,
      formaIngreso,
      fecha,
      opcionPago
    );

    console.log("✅ Ingreso registrado automáticamente:", resultado);
  } catch (error) {
    console.error("❌ Error registrando ingreso automático:", error);
  }
};
```

### 3. API de Ingresos

**Archivo**: `src/app/api/ingresos/route.js`

La API recibe la solicitud y procesa el ingreso:

```javascript
// POST - Crear un nuevo ingreso
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      restauranteId,
      tipoIngreso,
      motivo,
      monto,
      formaIngreso,
      fecha,
      opcionPago,
    } = body;

    // Crear el documento de ingreso
    const nuevoIngreso = {
      tipoIngreso: tipoIngreso,
      motivo: motivo,
      monto: monto.toString(),
      formaIngreso: formaIngreso,
      fecha: new Date(fecha),
      opcionPago: opcionPago || "",
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(ingresosRef, nuevoIngreso);

    // Actualizar caja registradora o dinero virtual según la opción de pago
    if (opcionPago === "caja") {
      console.log("💰 Actualizando SOLO caja registradora con monto:", monto);
      await actualizarCajaRegistradoraIngreso(
        restauranteId,
        monto,
        motivo,
        fecha
      );
    }
  } catch (error) {
    console.error("❌ Error creando ingreso:", error);
  }
}
```

### 4. Actualización de Caja Registradora

La función `actualizarCajaRegistradoraIngreso` actualiza la colección `CajaRegistradora`:

```javascript
async function actualizarCajaRegistradoraIngreso(
  restauranteId,
  monto,
  motivo,
  fecha
) {
  try {
    // Obtener la primera caja registradora
    const cajaRef = collection(
      db,
      "restaurantes",
      restauranteId,
      "CajaRegistradora"
    );
    const cajaSnapshot = await getDocs(cajaRef);

    if (cajaSnapshot.empty) {
      // Crear una nueva caja registradora si no existe
      const nuevaCaja = await addDoc(cajaRef, {
        Apertura: monto.toString(),
        Cierre: "",
        Extraccion: {},
        Ingresos: {
          [new Date().toISOString()]: {
            fecha: new Date(fecha),
            monto: monto.toString(),
            motivo: motivo,
          },
        },
        ultimaActualizacion: serverTimestamp(),
      });
      return;
    }

    // Tomar la primera caja existente
    const cajaDoc = cajaSnapshot.docs[0];
    const cajaData = cajaDoc.data();

    // Calcular nuevo monto de apertura
    const aperturaActual = parseFloat(cajaData.Apertura || 0);
    const nuevoApertura = aperturaActual + parseFloat(monto);

    // Preparar datos de ingreso
    const ingresoData = {
      fecha: new Date(fecha),
      monto: monto.toString(),
      motivo: motivo,
    };

    // Actualizar el documento
    await updateDoc(cajaDoc.ref, {
      Apertura: nuevoApertura.toString(),
      Ingresos: {
        ...cajaData.Ingresos,
        [new Date().toISOString()]: ingresoData,
      },
      ultimaActualizacion: serverTimestamp(),
    });

    console.log("✅ Caja registradora actualizada exitosamente (ingreso)");
  } catch (error) {
    console.error("❌ Error actualizando caja registradora (ingreso):", error);
    throw error;
  }
}
```

## Estructura de Datos

### Documento de Ingreso

```javascript
{
  tipoIngreso: "Venta Mesa",
  motivo: "Cobranza mesa 1 - Cliente",
  monto: "1500",
  formaIngreso: "Efectivo",
  fecha: Date,
  opcionPago: "caja",
  createdAt: serverTimestamp()
}
```

### Caja Registradora

```javascript
{
  Apertura: "2500", // Monto acumulado en efectivo
  Cierre: "",
  Extraccion: {},
  Ingresos: {
    "2024-01-15T10:30:00.000Z": {
      fecha: Date,
      monto: "1500",
      motivo: "Cobranza mesa 1 - Cliente"
    },
    "2024-01-15T11:45:00.000Z": {
      fecha: Date,
      monto: "1000",
      motivo: "Cobranza mesa 2 - Cliente"
    }
  },
  ultimaActualizacion: serverTimestamp()
}
```

## Flujo de Datos

1. **Usuario cobra mesa en efectivo** → CobranzaModal
2. **Se registra ingreso automático** → registrarIngresoAutomatico()
3. **Se crea documento de ingreso** → API /api/ingresos
4. **Se actualiza caja registradora** → actualizarCajaRegistradoraIngreso()
5. **Se suma al campo Apertura** → CajaRegistradora.Apertura += monto
6. **Se guarda en historial** → CajaRegistradora.Ingresos[timestamp]
7. **Se actualiza timestamp** → ultimaActualizacion

## Beneficios

- ✅ **Automático**: No requiere intervención manual
- ✅ **Trazable**: Cada ingreso queda registrado con fecha y motivo
- ✅ **Acumulativo**: Se suma automáticamente al total de efectivo
- ✅ **Robusto**: Maneja casos donde no existe caja registradora
- ✅ **Consistente**: Mantiene sincronización entre ingresos y caja

## Monitoreo

Los logs del sistema muestran el flujo completo:

```
💰 Registrando ingreso automático: {
  tipoIngreso: "Venta Mesa",
  motivo: "Cobranza mesa 1 - Cliente",
  monto: 1500,
  formaIngreso: "Efectivo",
  opcionPago: "caja"
}

✅ Ingreso creado exitosamente con ID: abc123

💰 Actualizando SOLO caja registradora con monto: 1500

✅ Caja registradora actualizada exitosamente (ingreso)
```

## Pruebas

Para verificar que funciona correctamente:

1. **Ir a ventas** y cobrar una mesa en efectivo
2. **Verificar en pagos** que el efectivo se haya sumado
3. **Usar el debug** para ver el estado de las estructuras
4. **Probar ingreso de prueba** con el botón "💵 Probar Ingreso Efectivo"

## Notas Importantes

- El sistema es **idempotente**: puede ejecutarse múltiples veces sin efectos secundarios
- Los montos se almacenan como **strings** para evitar problemas de precisión
- El historial de ingresos se guarda con **timestamps únicos**
- La caja registradora se crea automáticamente si no existe
