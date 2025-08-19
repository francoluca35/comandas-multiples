# Fix: IDs de Restaurantes Duplicados

## Problema Identificado

Se detectó que el sistema estaba creando documentos de restaurantes con IDs inconsistentes:

- **Nombre del restaurante**: "DeamonDD"
- **ID esperado**: "deamondd" (generado por la función `generarRestauranteId`)
- **ID incorrecto creado**: "DeamonDD" (usando el nombre directamente)

Esto causaba que se crearan documentos duplicados en Firestore:
- `restaurantes/DeamonDD` (incorrecto)
- `restaurantes/deamondd` (correcto)

## Causa del Problema

El problema estaba en dos archivos que usaban el nombre del restaurante directamente como ID del documento en lugar de usar la función `generarRestauranteId`:

1. **`src/app/api/registrar-restaurante/route.js`** (línea 28)
2. **`src/app/api/usuarios/registro/route.js`** (línea 91)

## Solución Implementada

### 1. Corrección de APIs

#### `src/app/api/registrar-restaurante/route.js`
- ✅ Agregada función `generarRestauranteId`
- ✅ Uso del ID generado para crear el documento del restaurante
- ✅ Uso del ID generado para todas las subcolecciones
- ✅ Guardado tanto del nombre original como del ID generado

#### `src/app/api/usuarios/registro/route.js`
- ✅ Agregada función `generarRestauranteId`
- ✅ Uso del ID generado para crear usuarios
- ✅ Compatibilidad con documentos existentes que ya tienen `restauranteId`

### 2. Script de Limpieza

Creado `cleanup-duplicate-restaurants.js` para:
- 🔍 Detectar documentos duplicados
- ✅ Mover datos al ID correcto
- 🗑️ Eliminar documentos con IDs incorrectos
- 📊 Verificar el estado final

### 3. Función `generarRestauranteId`

```javascript
const generarRestauranteId = (nombre) => {
  return nombre
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
};
```

**Ejemplos:**
- "DeamonDD" → "deamondd"
- "Mi Restaurante" → "mi_restaurante"
- "Café & Bar" → "cafe_bar"

## Archivos Afectados

### Corregidos
- ✅ `src/app/api/registrar-restaurante/route.js`
- ✅ `src/app/api/usuarios/registro/route.js`

### Ya Correctos
- ✅ `src/app/api/restaurants/route.js`
- ✅ `src/app/comandas/prelogin/page.jsx`
- ✅ `src/hooks/useRestaurantUsers.js`

## Cómo Ejecutar la Limpieza

```bash
npm run cleanup-restaurants
```

**⚠️ IMPORTANTE**: Antes de ejecutar, asegúrate de:
1. Tener una copia de seguridad de tu base de datos
2. Configurar correctamente las credenciales de Firebase en el script
3. Ejecutar en un entorno de desarrollo primero

## Verificación

Después de la corrección, verifica que:

1. **Solo existe un documento por restaurante** en `restaurantes/`
2. **El ID del documento coincide** con el resultado de `generarRestauranteId(nombre)`
3. **Todas las subcolecciones** están bajo el ID correcto
4. **Los usuarios se crean** en la ubicación correcta

## Estado Actual

- ✅ APIs corregidas para usar IDs consistentes
- ✅ Script de limpieza disponible
- ✅ Documentación completa
- 🔄 Pendiente: Ejecutar limpieza en producción

## Próximos Pasos

1. Ejecutar el script de limpieza en desarrollo
2. Verificar que no hay regresiones
3. Ejecutar en producción
4. Monitorear que no se creen nuevos documentos duplicados
