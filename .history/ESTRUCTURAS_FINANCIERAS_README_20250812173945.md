# Estructuras Financieras - Inicialización Automática

## Descripción

Este documento describe la inicialización automática de las estructuras financieras necesarias para el funcionamiento correcto del sistema de ingresos y egresos.

## Problema Identificado

Cuando se registraba un restaurante, no se creaban automáticamente las estructuras financieras necesarias:
- **Caja Registradora**: Para manejar el dinero en efectivo
- **Documento de Dinero Virtual**: Para manejar pagos con tarjeta/QR

Esto causaba que cuando se intentaban registrar ingresos, el sistema no encontraba estas estructuras y no podía actualizar los montos correctamente.

## Solución Implementada

### 1. Registro de Restaurantes Nuevos

**Archivo**: `src/app/api/registrar-restaurante/route.js`

Cuando se registra un nuevo restaurante, ahora se crean automáticamente:

```javascript
// 5. Crear caja registradora inicial
const cajaRef = collection(db, "restaurantes", restaurante, "CajaRegistradora");
await addDoc(cajaRef, {
  Apertura: "0",
  Cierre: "",
  Extraccion: {},
  Ingresos: {},
  ultimaActualizacion: serverTimestamp(),
});

// 6. Crear documento de dinero virtual inicial
const dineroRef = collection(db, "restaurantes", restaurante, "Dinero");
await addDoc(dineroRef, {
  Virtual: "0",
  IngresosVirtual: {},
  EgresosVirtual: {},
  ultimaActualizacion: serverTimestamp(),
});
```

### 2. Inicialización Automática para Restaurantes Existentes

**Archivo**: `src/app/api/dinero-actual/route.js`

Se agregó la función `inicializarEstructurasFinancieras()` que se ejecuta automáticamente cuando se consulta el dinero actual:

```javascript
async function inicializarEstructurasFinancieras(restauranteId) {
  // Verifica si existen las estructuras y las crea si no existen
  // - Caja Registradora
  // - Documento de Dinero Virtual
}
```

### 3. Manejo de Casos Edge en Registro de Ingresos

**Archivo**: `src/app/api/ingresos/route.js`

Se modificaron las funciones auxiliares para manejar casos donde las estructuras no existen:

- `actualizarCajaRegistradoraIngreso()`: Crea una nueva caja si no existe
- `actualizarDineroVirtualIngreso()`: Crea un nuevo documento de dinero virtual si no existe

## Estructuras de Datos

### Caja Registradora

```javascript
{
  Apertura: "0", // Monto inicial de apertura
  Cierre: "", // Monto de cierre (vacío hasta que se cierre)
  Extraccion: {}, // Historial de extracciones
  Ingresos: {}, // Historial de ingresos
  ultimaActualizacion: serverTimestamp()
}
```

### Dinero Virtual

```javascript
{
  Virtual: "0", // Monto actual en dinero virtual
  IngresosVirtual: {}, // Historial de ingresos virtuales
  EgresosVirtual: {}, // Historial de egresos virtuales
  ultimaActualizacion: serverTimestamp()
}
```

## Flujo de Funcionamiento

1. **Registro de Restaurante**: Se crean automáticamente las estructuras financieras
2. **Consulta de Dinero Actual**: Si las estructuras no existen, se crean automáticamente
3. **Registro de Ingresos**: Si las estructuras no existen, se crean automáticamente
4. **Actualización de Montos**: Los montos se actualizan correctamente en las estructuras existentes

## Beneficios

- ✅ **Inicialización Automática**: No requiere intervención manual
- ✅ **Compatibilidad**: Funciona con restaurantes existentes y nuevos
- ✅ **Robustez**: Maneja casos edge donde las estructuras no existen
- ✅ **Consistencia**: Garantiza que todos los restaurantes tengan las estructuras necesarias

## Monitoreo

Los logs del sistema mostrarán cuando se crean las estructuras:

```
🔧 Inicializando estructuras financieras para: restaurante123
📦 Creando caja registradora inicial...
✅ Caja registradora creada
💳 Creando documento de dinero virtual inicial...
✅ Documento de dinero virtual creado
✅ Estructuras financieras inicializadas correctamente
```

## Pruebas

Para verificar que funciona correctamente:

1. **Restaurante Nuevo**: Registrar un nuevo restaurante y verificar que se crean las estructuras
2. **Restaurante Existente**: Consultar el dinero actual de un restaurante existente sin estructuras
3. **Registro de Ingresos**: Intentar registrar un ingreso en un restaurante sin estructuras

## Notas Importantes

- Las estructuras se crean con montos iniciales de $0
- Los historiales (Ingresos, EgresosVirtual, etc.) se inicializan como objetos vacíos
- La función de inicialización es idempotente (puede ejecutarse múltiples veces sin efectos secundarios)
