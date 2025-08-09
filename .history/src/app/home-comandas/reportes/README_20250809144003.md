# Sección de Reportes

## Descripción
La sección de reportes permite generar reportes detallados del restaurante en diferentes formatos (Excel, CSV, PDF) para análisis y control.

## Componentes

### 1. ReportStats.jsx
- Muestra estadísticas de reportes generados
- Incluye métricas como cantidad de reportes, tiempo promedio, tasa de éxito
- Diseño responsivo con cards informativas

### 2. ReportesGenerator.jsx
- Componente principal para generar reportes
- Permite seleccionar tipo de reporte
- Configuración de filtros y rango de fechas
- Selección de formato de salida
- Barra de progreso durante la generación

## Tipos de Reportes Disponibles

### 1. Reporte de Ventas
- **Descripción**: Detalle completo de todas las ventas realizadas
- **Filtros**: Tipo de venta, empleado, método de pago
- **Icono**: 🛒

### 2. Reporte de Productos
- **Descripción**: Inventario y rendimiento de productos
- **Filtros**: Categoría, stock mínimo, estado activo
- **Icono**: 📦

### 3. Reporte Financiero
- **Descripción**: Ingresos, egresos y balance general
- **Filtros**: Tipo de movimiento, categoría, empleado
- **Icono**: 💰

### 4. Reporte de Empleados
- **Descripción**: Rendimiento y pagos de empleados
- **Filtros**: Rol, estado activo, fecha de contratación
- **Icono**: 👥

### 5. Reporte de Mesas
- **Descripción**: Ocupación y rendimiento de mesas
- **Filtros**: Estado, capacidad
- **Icono**: 🪑

### 6. Reporte de Inventario
- **Descripción**: Stock actual y movimientos de inventario
- **Filtros**: Categoría, proveedor, stock bajo
- **Icono**: 📊

## Formatos de Salida

### Excel (.xlsx)
- Formato más completo y estructurado
- Ideal para análisis detallado
- Tiempo de generación: ~2 segundos

### CSV (.csv)
- Formato ligero y compatible
- Ideal para importar en otras herramientas
- Tiempo de generación: ~1.5 segundos

### PDF (.pdf)
- Formato de presentación
- Ideal para compartir y archivar
- Tiempo de generación: ~1 segundo

## Funcionalidades

### Filtros de Fecha
- Selección de rango de fechas personalizable
- Validación de fechas (fecha inicio < fecha fin)
- Formato ISO estándar

### Filtros Específicos
- Cada tipo de reporte tiene filtros únicos
- Filtros dinámicos según el contexto
- Validación de entrada según el tipo

### Barra de Progreso
- Indicador visual del progreso de generación
- Porcentaje de completado en tiempo real
- Animación suave y responsiva

## Hook Personalizado

### useReportGenerator
- Maneja el estado de generación de reportes
- Funciones para cada formato de salida
- Control de progreso y errores
- Simulación de descarga de archivos

## Uso

1. **Seleccionar Tipo de Reporte**: Hacer clic en el tipo deseado
2. **Configurar Fechas**: Establecer rango de fechas
3. **Aplicar Filtros**: Configurar filtros específicos si es necesario
4. **Elegir Formato**: Seleccionar formato de salida (Excel, CSV, PDF)
5. **Generar Reporte**: Hacer clic en el botón de generación
6. **Descargar**: El archivo se descargará automáticamente

## Estructura de Archivos

```
src/app/home-comandas/reportes/
├── page.jsx                 # Página principal
├── components/
│   ├── ReportesGenerator.jsx  # Generador principal
│   └── ReportStats.jsx        # Estadísticas
└── README.md                 # Esta documentación
```

## Dependencias

- **@heroicons/react**: Iconos de la interfaz
- **React Hooks**: Estado y efectos
- **Tailwind CSS**: Estilos y diseño responsivo

## Futuras Mejoras

- [ ] Integración con APIs reales para datos
- [ ] Almacenamiento de reportes generados
- [ ] Programación de reportes automáticos
- [ ] Envío por email
- [ ] Plantillas personalizables
- [ ] Exportación a Google Sheets
- [ ] Gráficos y visualizaciones
- [ ] Historial de reportes generados
