# Problema de Usuarios Duplicados - Solucionado

## Problema Identificado

Se estaba creando una estructura incorrecta en Firebase cuando se registraban nuevos usuarios en comandas. El problema era que:

1. **API `/api/register-comanda/route.js`** estaba usando `uuidv4()` para generar IDs aleatorios
2. **Hook `useRestaurantUsers.js`** estaba usando `addDoc()` que también genera IDs aleatorios
3. Esto causaba que los usuarios se guardaran con IDs como `abc123-def456-ghi789` en lugar de usar el nombre de usuario como ID

## Estructura Incorrecta (Antes)
```
restaurantes/
  deamondd/
    users/
      abc123-def456-ghi789/  ← ID aleatorio
        usuario: "juan"
        nombreCompleto: "Juan Pérez"
        ...
      xyz789-uvw123-abc456/  ← ID aleatorio
        usuario: "maria"
        nombreCompleto: "María García"
        ...
```

## Estructura Correcta (Después)
```
restaurantes/
  deamondd/
    users/
      juan/  ← Nombre de usuario como ID
        usuario: "juan"
        nombreCompleto: "Juan Pérez"
        ...
      maria/  ← Nombre de usuario como ID
        usuario: "maria"
        nombreCompleto: "María García"
        ...
```

## Cambios Realizados

### 1. API de Registro (`/api/register-comanda/route.js`)
- ❌ **Antes**: `const userId = uuidv4();`
- ✅ **Después**: Usar `usuario` como ID del documento
- ❌ **Antes**: `logo: logoUrl`
- ✅ **Después**: `imagen: logoUrl` (consistencia con otra API)
- ❌ **Antes**: `creadoEn: new Date().toISOString()`
- ✅ **Después**: `creado: Date.now()` (consistencia con otra API)

### 2. Hook de Usuarios (`useRestaurantUsers.js`)
- ❌ **Antes**: `addDoc(usersRef, {...})`
- ✅ **Después**: `setDoc(doc(db, path, userData.usuario), {...})`

### 3. Eliminación de Dependencias
- Removido `import { v4 as uuidv4 } from "uuid"` de register-comanda
- Removido `import { addDoc }` de useRestaurantUsers

## Script de Limpieza

Se creó un script para limpiar usuarios duplicados existentes:

```bash
npm run cleanup-users
```

**⚠️ IMPORTANTE**: Antes de ejecutar este script, necesitas:
1. Configurar las credenciales de Firebase en el script
2. Hacer una copia de seguridad de tu base de datos

## Verificación

Para verificar que todo funciona correctamente:

1. **Registrar un nuevo usuario** desde comandas
2. **Verificar en Firebase** que el documento se crea con el nombre de usuario como ID
3. **Verificar que no hay duplicados** en la colección users

## Archivos Modificados

- `src/app/api/register-comanda/route.js` - Corregida la creación de usuarios
- `src/hooks/useRestaurantUsers.js` - Corregida la creación de usuarios
- `cleanup-duplicate-users.js` - Script de limpieza (nuevo)
- `USUARIOS_DUPLICADOS_README.md` - Esta documentación (nuevo)

## Prevención

Para evitar este problema en el futuro:

1. **Siempre usar nombres de usuario como IDs** para documentos de usuarios
2. **Mantener consistencia** en los nombres de campos entre APIs
3. **Usar `setDoc` con ID específico** en lugar de `addDoc` cuando se conoce el ID
4. **Revisar la estructura de datos** antes de implementar nuevas funcionalidades

## Estado Actual

✅ **Problema solucionado** - Los nuevos usuarios se crearán correctamente
✅ **Estructura consistente** - Todas las APIs usan la misma estructura
✅ **Script de limpieza disponible** - Para limpiar datos existentes
⚠️ **Requiere limpieza manual** - Para usuarios duplicados existentes
