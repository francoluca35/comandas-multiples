# Funcionalidades de Botones de Stock

## 📍 Ubicación
Los botones se encuentran en el componente `StockCard` en la página principal del dashboard.

## 🔵 Botón "Comprar"

### Funcionalidad
Abre un modal para registrar una nueva compra de inventario con todas las funcionalidades solicitadas.

### Flujo de Uso

#### 1. Información Básica
- **Nombre del producto**: Nombre descriptivo del producto
- **Cantidad**: Cantidad comprada
- **Precio unitario**: Precio por unidad
- **Precio total**: Se calcula automáticamente (cantidad × precio unitario)

#### 2. Tipo de Consumo
- **Checkbox "¿Es consumo final?"**: Determina el flujo posterior

#### 3A. Si es Consumo Final (Se vende al cliente)
- **Categoría**: Seleccionar entre "Bebida" o "Comida"
- **Subcategoría**: Opciones predefinidas según la categoría
  - **Bebidas**: Gaseosas, Aguas, Jugos, Cervezas, Vinos, Licores, Café, Té
  - **Comidas**: Carnes, Pescados, Verduras, Frutas, Lácteos, Panadería, Condimentos, Otros
- **Precio de venta al público**: Precio que aparecerá en el menú para las meseras
- **Integración automática**: Se agrega automáticamente al stock y al menú de ventas

#### 3B. Si NO es Consumo Final (Materia prima)
- **Campo de uso**: Especificar para qué se va a usar el producto
- **Solo inventario**: Se registra en el inventario pero no aparece en el menú

### Validaciones
- Todos los campos básicos son obligatorios
- Si es consumo final: categoría, subcategoría y precio de venta son obligatorios
- Si es materia prima: el campo de uso es obligatorio

## 🔴 Botón "Destruir"

### Funcionalidad
Permite eliminar stock de productos existentes con registro de la operación.

### Flujo de Uso

#### 1. Búsqueda de Producto
- **Campo de búsqueda**: Buscar productos por nombre
- **Lista de resultados**: Mostrar productos que coincidan con la búsqueda
- **Información mostrada**: Nombre, stock actual, precio

#### 2. Selección de Producto
- **Click en producto**: Selecciona el producto para eliminar stock
- **Información detallada**: Muestra nombre, stock actual, precio, categoría

#### 3. Configuración de Eliminación
- **Cantidad a eliminar**: Especificar cuánto stock eliminar
- **Validación**: No puede ser mayor al stock disponible
- **Stock restante**: Se muestra automáticamente
- **Motivo**: Especificar razón de la eliminación (obligatorio)

### Validaciones
- Debe seleccionar un producto
- La cantidad debe ser mayor a 0 y menor o igual al stock disponible
- El motivo es obligatorio

## 🔧 Integración Técnica

### Archivos Creados
1. **`CompraModal.jsx`**: Modal para registrar compras
2. **`DestruirStockModal.jsx`**: Modal para eliminar stock
3. **`StockCard.jsx`**: Componente principal actualizado

### Hooks Utilizados
- **`useStock`**: Para obtener estadísticas y actualizar productos
- **`useCompras`**: Para guardar las compras

### APIs Utilizadas
- **`/api/compras`**: Para guardar compras
- **`/api/stock`**: Para actualizar stock de productos

## 📊 Flujo de Datos

### Compra
1. Usuario completa formulario
2. Se valida la información
3. Se guarda en colección "compras"
4. Si es consumo final, se agrega al stock y menú
5. Se actualizan las estadísticas

### Eliminación de Stock
1. Usuario selecciona producto
2. Especifica cantidad y motivo
3. Se valida la operación
4. Se actualiza el stock del producto
5. Se registra la operación
6. Se actualizan las estadísticas

## 🎯 Beneficios

### Para el Negocio
- **Control de inventario**: Registro completo de entradas y salidas
- **Trazabilidad**: Historial de todas las operaciones
- **Integración automática**: Productos de consumo final aparecen automáticamente en el menú
- **Prevención de errores**: Validaciones en cada paso

### Para el Usuario
- **Interfaz intuitiva**: Modales claros y fáciles de usar
- **Validaciones en tiempo real**: Feedback inmediato sobre errores
- **Cálculos automáticos**: Precio total y stock restante se calculan automáticamente
- **Búsqueda eficiente**: Encuentra productos rápidamente

## 🚀 Próximas Mejoras Sugeridas

1. **Historial de operaciones**: Ver todas las compras y eliminaciones
2. **Reportes**: Exportar datos de inventario
3. **Alertas**: Notificaciones de stock bajo
4. **Códigos de barras**: Escanear productos
5. **Fotos de productos**: Agregar imágenes a los productos
