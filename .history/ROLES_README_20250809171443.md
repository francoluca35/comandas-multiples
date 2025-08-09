# Sistema de Roles y Permisos

## Descripción General

Este sistema implementa un control de acceso basado en roles (RBAC) para la aplicación de gestión de restaurantes. Cada usuario tiene un rol específico que determina qué funcionalidades puede acceder.

## Roles Disponibles

### 1. ADMIN
- **Acceso**: Total sin restricciones
- **Permisos**: Todos los permisos del sistema
- **Funcionalidades disponibles**:
  - Dashboard (Home)
  - Ventas
  - Gestión de Mesas
  - Productos
  - Pagos
  - Inventario
  - Reportes
  - Promociones
  - Gestión de usuarios
  - Gestión del restaurante
  - Acceso a todos los datos

### 2. MESERO
- **Acceso**: Limitado a funciones de ventas
- **Permisos**: Solo acceso a dashboard y ventas
- **Funcionalidades disponibles**:
  - Dashboard (Home)
  - Ventas
  - Gestión de turno (abrir/cerrar)

### 3. COCINA
- **Acceso**: Limitado a funciones de ventas
- **Permisos**: Solo acceso a dashboard y ventas
- **Funcionalidades disponibles**:
  - Dashboard (Home)
  - Ventas
  - Gestión de turno (abrir/cerrar)

## Permisos del Sistema

### Permisos Base (Todos los roles)
- `canManageTurno`: Todos pueden abrir y cerrar su turno

### Permisos Específicos por Rol
- `canAccessHome`: Acceso al dashboard principal
- `canAccessVentas`: Acceso al módulo de ventas
- `canAccessMesas`: Gestión de mesas (solo ADMIN)
- `canAccessProductos`: Gestión de productos (solo ADMIN)
- `canAccessPagos`: Gestión de pagos (solo ADMIN)
- `canAccessInventario`: Gestión de inventario (solo ADMIN)
- `canAccessReportes`: Acceso a reportes (solo ADMIN)
- `canAccessPromociones`: Gestión de promociones (solo ADMIN)
- `canManageUsers`: Gestión de usuarios (solo ADMIN)
- `canManageRestaurant`: Gestión del restaurante (solo ADMIN)
- `canViewAllData`: Acceso a todos los datos (solo ADMIN)

## Implementación Técnica

### 1. Contexto de Roles (`RoleContext`)
- Maneja la lógica de permisos
- Proporciona información del rol actual
- Gestiona el estado de los permisos

### 2. Hook de Permisos (`useRolePermissions`)
- Proporciona acceso fácil a los permisos
- Incluye helpers para verificar acceso
- Métodos para obtener información del rol

### 3. Componente de Protección (`RoleGuard`)
- Protege rutas según permisos
- Redirige usuarios sin permisos
- Muestra fallbacks personalizados

### 4. Sidebar Adaptativo
- Muestra solo las opciones permitidas
- Se adapta automáticamente al rol del usuario
- Incluye indicador visual del rol

## Uso en Componentes

### Verificar Permisos
```jsx
import { useRolePermissions } from '../hooks/useRolePermissions';

function MiComponente() {
  const { canAccessVentas, isAdmin, permissions } = useRolePermissions();

  if (!canAccessVentas) {
    return <div>No tienes permisos para acceder a ventas</div>;
  }

  return <div>Contenido de ventas</div>;
}
```

### Proteger Rutas
```jsx
import RoleGuard from '../components/RoleGuard';

function PaginaProtegida() {
  return (
    <RoleGuard requiredPermission="canAccessPagos">
      <div>Contenido de pagos</div>
    </RoleGuard>
  );
}
```

### Renderizado Condicional
```jsx
function Dashboard() {
  const { canAccessReportes, canAccessInventario } = useRolePermissions();

  return (
    <div>
      <h1>Dashboard</h1>
      
      {canAccessReportes && (
        <div>Sección de reportes</div>
      )}
      
      {canAccessInventario && (
        <div>Sección de inventario</div>
      )}
    </div>
  );
}
```

## Configuración

### 1. Agregar el Provider
El `RoleProvider` debe estar incluido en el árbol de providers:

```jsx
// En AppProvider.jsx
<AuthHandler>
  <RoleProvider>
    <TurnoProvider>
      {children}
    </TurnoProvider>
  </RoleProvider>
</AuthHandler>
```

### 2. Verificar el Rol del Usuario
El sistema automáticamente detecta el rol del usuario desde el contexto de autenticación.

### 3. Personalizar Permisos
Para agregar nuevos permisos, modificar el `RoleContext.js`:

```jsx
case "admin":
  return {
    ...basePermissions,
    canAccessNuevaFuncionalidad: true,
  };
```

## Seguridad

- Los permisos se verifican tanto en el frontend como en el backend
- El `RoleGuard` protege las rutas de acceso no autorizado
- El Sidebar solo muestra opciones permitidas
- Los permisos se validan en tiempo real

## Notas Importantes

1. **Todos los roles pueden gestionar su turno**: Esta es una funcionalidad básica disponible para todos
2. **El rol se determina automáticamente**: Se obtiene del contexto de autenticación
3. **Los permisos son reactivos**: Se actualizan automáticamente si cambia el rol
4. **Fallbacks personalizables**: Se pueden mostrar mensajes específicos para acceso denegado

## Ejemplos de Uso

### Verificar Múltiples Permisos
```jsx
const { canAccessMultiple } = useRolePermissions();

const puedeGestionarInventario = canAccessMultiple([
  'canAccessInventario',
  'canAccessProductos'
]);
```

### Obtener Información del Rol
```jsx
const { getRoleDisplayName, getRoleColor } = useRolePermissions();

return (
  <div className={getRoleColor()}>
    Rol: {getRoleDisplayName()}
  </div>
);
```

### Protección con Fallback
```jsx
<RoleGuard 
  requiredPermission="canAccessReportes"
  fallback={<div>No tienes permisos para ver reportes</div>}
>
  <ReportesComponent />
</RoleGuard>
```
