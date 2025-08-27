# Corrección del Flujo de Login

## Problema Identificado

Cuando un usuario completaba el prelogin y era redirigido a `/home-comandas/login`, el sistema automáticamente lo redirigía a `/home-comandas/home` sin permitirle elegir el usuario y poner la contraseña.

## Causa del Problema

El componente `AutoRedirect` estaba considerando que un usuario ya estaba "autenticado" si tenía datos del restaurante en localStorage (después del prelogin), sin verificar si realmente había un usuario específico logueado.

### Datos que se guardan después del prelogin:
- `restauranteId`
- `nombreResto` 
- `cantUsuarios`
- `finanzas`
- `logo`

### Datos que se guardan después del login específico:
- `usuario`
- `rol`
- `usuarioId`
- `nombreCompleto`
- `userImage`

## Solución Implementada

### 1. Modificación en `AutoRedirect.jsx`

**Antes:**
```javascript
if (isOnLoginPage && usuario && rol && restauranteId && nombreResto) {
  // Redirigir automáticamente a home
}
```

**Después:**
```javascript
if (isOnLoginPage && usuario && rol && restauranteId && nombreResto) {
  // Verificar que realmente hay un usuario específico logueado
  const usuarioId = localStorage.getItem("usuarioId");
  const nombreCompleto = localStorage.getItem("nombreCompleto");
  
  if (usuarioId && nombreCompleto) {
    // Solo entonces redirigir a home
  } else {
    // Permitir que el usuario elija usuario y contraseña
  }
}
```

### 2. Modificación en `AuthContext.js`

**Antes:**
```javascript
if (restauranteId && usuarioLocal && rolLocal) {
  // Considerar usuario autenticado
}
```

**Después:**
```javascript
if (restauranteId && usuarioLocal && rolLocal) {
  const usuarioId = localStorage.getItem("usuarioId");
  
  if (usuarioId && nombreCompleto) {
    // Solo entonces considerar usuario autenticado
  } else {
    // No hay usuario específico logueado
  }
}
```

## Flujo Corregido

1. **Prelogin**: Usuario ingresa email, contraseña y código de activación
2. **Datos guardados**: Solo información del restaurante
3. **Redirección**: A `/home-comandas/login`
4. **Login específico**: Usuario puede elegir usuario y poner contraseña
5. **Datos guardados**: Información específica del usuario
6. **Redirección**: A `/home-comandas/home`

## Archivos Modificados

- `src/components/AutoRedirect.jsx`
- `src/app/context/AuthContext.js`

## Resultado

Ahora el usuario puede:
- Completar el prelogin normalmente
- Ser redirigido a la página de login
- Elegir el usuario específico
- Ingresar la contraseña
- Acceder al sistema

El sistema ya no redirige automáticamente sin permitir la selección de usuario y contraseña.
