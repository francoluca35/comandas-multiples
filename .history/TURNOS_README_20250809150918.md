# Sistema de Turnos - Comandas Múltiples

## Descripción General

El sistema de turnos es una funcionalidad que controla el acceso a la aplicación completa. Solo cuando un turno está abierto, los usuarios pueden acceder a todas las funcionalidades del dashboard.

## Características Principales

### 🔒 Control de Acceso
- **Turno Cerrado**: Solo se muestra el componente de turno, bloqueando el acceso al dashboard completo
- **Turno Abierto**: Se muestra el dashboard completo con todas las funcionalidades

### 👤 Información del Turno
- **Usuario**: Nombre del usuario que abrió el turno
- **Hora de Apertura**: Fecha y hora exacta cuando se abrió el turno
- **Duración**: Tiempo transcurrido desde la apertura (se actualiza en tiempo real)
- **Restaurante ID**: Identificador del restaurante asociado al turno

### 💾 Persistencia de Datos
- Los datos del turno se guardan en `localStorage`
- Validación automática de turnos antiguos (más de 24 horas)
- Recuperación automática del estado al recargar la página

## Componentes Principales

### TurnoContext (`src/app/context/TurnoContext.js`)
- **Estado Global**: Maneja el estado del turno en toda la aplicación
- **Funciones Principales**:
  - `abrirTurno()`: Abre un nuevo turno
  - `cerrarTurno()`: Cierra el turno actual
  - `obtenerDuracionTurno()`: Calcula la duración del turno
  - `limpiarTurno()`: Elimina completamente los datos del turno

### TurnoCard (`src/app/home-comandas/home/components/TurnoCerradoCard.jsx`)
- **Componente Adaptativo**: Cambia su apariencia según el estado del turno
- **Estados Visuales**:
  - **Cerrado**: Diseño atractivo con información del usuario y botón para abrir
  - **Abierto**: Información del turno activo con opción de cerrar
  - **Loading**: Indicador de carga mientras se verifica el estado

## Flujo de Uso

### 1. Login del Usuario
- El usuario se autentica en la aplicación
- Se carga el contexto de turnos desde `localStorage`

### 2. Turno Cerrado (Estado Inicial)
- Solo se muestra el componente de turno
- Información del usuario actual
- Hora actual
- Botón "Abrir Turno"

### 3. Apertura del Turno
- Al hacer clic en "Abrir Turno":
  - Se valida que haya un usuario autenticado
  - Se crea un nuevo registro de turno
  - Se guarda en `localStorage`
  - Se muestra confirmación al usuario

### 4. Turno Abierto
- Se muestra el dashboard completo
- Banner superior con información del turno
- Todas las funcionalidades disponibles
- Componente de turno muestra estado "Abierto"

### 5. Cierre del Turno
- Al hacer clic en "Cerrar Turno":
  - Confirmación del usuario
  - Se registra la hora de cierre
  - Se vuelve al estado "Cerrado"

## Estructura de Datos

### Turno Abierto
```json
{
  "abierto": true,
  "usuario": "Nombre del Usuario",
  "horaApertura": "01/01/2024, 09:00",
  "timestamp": 1704096000000,
  "restauranteId": "rest_123"
}
```

### Turno Cerrado
```json
{
  "abierto": false,
  "usuario": "Nombre del Usuario",
  "horaApertura": "01/01/2024, 09:00",
  "horaCierre": "01/01/2024, 17:00",
  "timestamp": 1704124800000,
  "restauranteId": "rest_123"
}
```

## Validaciones y Seguridad

### Validaciones Automáticas
- **Turnos Antiguos**: Se cierran automáticamente después de 24 horas
- **Usuario Autenticado**: Solo usuarios autenticados pueden abrir turnos
- **Datos Corruptos**: Se limpian automáticamente si hay errores en `localStorage`

### Manejo de Errores
- Logs detallados en consola para debugging
- Fallbacks seguros en caso de errores
- Limpieza automática de datos corruptos

## Integración con la Aplicación

### AppProvider
- El `TurnoProvider` está integrado en el `AppProvider` principal
- Disponible en toda la aplicación
- No requiere configuración adicional

### Páginas que lo Utilizan
- **Dashboard Principal**: Controla la visualización completa
- **Componentes de Turno**: Muestran el estado actual
- **Sidebar**: Siempre disponible para navegación

## Personalización

### Estilos
- Utiliza Tailwind CSS para el diseño
- Colores adaptativos según el estado
- Diseño responsive para móviles y desktop

### Mensajes
- Textos en español
- Confirmaciones claras para el usuario
- Información contextual relevante

## Mantenimiento

### Logs
- Todos los cambios de estado se registran en consola
- Fácil debugging en desarrollo
- Trazabilidad completa de acciones

### Limpieza
- Función `limpiarTurno()` para mantenimiento
- Limpieza automática de datos antiguos
- Gestión de errores robusta

## Consideraciones Futuras

### Mejoras Posibles
- Sincronización con base de datos
- Historial de turnos
- Estadísticas de uso
- Notificaciones push
- Integración con relojes de entrada/salida

### Escalabilidad
- Sistema preparado para múltiples usuarios
- Arquitectura modular y extensible
- Separación clara de responsabilidades
