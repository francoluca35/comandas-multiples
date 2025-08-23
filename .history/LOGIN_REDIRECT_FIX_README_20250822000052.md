# Solución para Problema de Redirección de Login

## Problema
El usuario se loguea correctamente pero es redirigido nuevamente a `home-comandas` en lugar de mantenerse en la sesión.

## Causa del Problema
El problema se debe a que el sistema de autenticación no está verificando correctamente si el usuario ya está autenticado cuando accede a la página de login, causando un bucle de redirección.

## Soluciones Implementadas

### 1. Componente AutoRedirect
Se ha creado un componente `AutoRedirect` que:
- Verifica automáticamente el estado de autenticación
- Redirige al usuario a `/home-comandas/home` si ya está autenticado
- Redirige al usuario a `/home-comandas/login` si no está autenticado
- Se ejecuta cada 3 segundos para detectar cambios en localStorage

### 2. Componente AuthDebugger
Se ha agregado un componente de debug que muestra en tiempo real:
- El estado de autenticación
- Los datos en localStorage
- La ruta actual
- Cualquier problema detectado

### 3. Botones de Debug
Se han agregado botones en la página de login para:
- Ver el estado actual de autenticación en la consola
- Limpiar completamente el estado de autenticación

## Cómo Usar

### Para Debuggear:
1. Abre la consola del navegador (F12)
2. Ve a la página de login
3. Observa el componente de debug en la esquina inferior derecha
4. Usa los botones "Debug: Estado" y "Limpiar Estado" si es necesario

### Para Solucionar el Problema:
1. Si el usuario está atrapado en un bucle de redirección:
   - Haz clic en "Limpiar Estado" en la página de login
   - Confirma la limpieza
   - El sistema te redirigirá al prelogin

2. Si el problema persiste:
   - Ejecuta el script `clear-auth-state.js` en la consola
   - O ejecuta manualmente:
   ```javascript
   localStorage.clear();
   window.location.href = "/comandas/prelogin";
   ```

## Archivos Modificados

1. **`src/components/AutoRedirect.jsx`** - Nuevo componente para redirección automática
2. **`src/components/AuthDebugger.jsx`** - Componente de debug mejorado
3. **`src/app/layout.js`** - Agregado AutoRedirect al layout principal
4. **`src/app/home-comandas/login/page.jsx`** - Agregados botones de debug

## Scripts de Debug

- **`debug-auth-state.js`** - Script para verificar el estado de autenticación
- **`clear-auth-state.js`** - Script para limpiar el estado de autenticación

## Verificación

Para verificar que el problema está solucionado:

1. Loguea normalmente
2. Deberías ser redirigido a `/home-comandas/home`
3. Si recargas la página, deberías permanecer en home
4. Si vas manualmente a `/home-comandas/login`, deberías ser redirigido automáticamente a home

## Notas Importantes

- El componente AutoRedirect solo funciona en el sistema de restaurantes (`/home-comandas`)
- La verificación se hace cada 3 segundos para evitar sobrecarga
- Los componentes de debug solo se muestran en desarrollo
- Si el problema persiste, verifica que todos los datos necesarios estén en localStorage:
  - `usuario`
  - `rol`
  - `restauranteId`
  - `nombreResto`
