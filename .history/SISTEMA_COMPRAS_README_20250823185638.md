# Sistema de Compras de Inventario

## Funcionalidades Implementadas

### 1. Modal de Compra
- **Acceso**: Botón "Comprar" en el componente StockActual
- **Campos requeridos**:
  - Nombre del producto
  - Cantidad
  - Precio unitario
  - Tipo de consumo (checkbox)

### 2. Flujo de Consumo Final
Si se marca "Es consumo final":

1. **Categoría**: Seleccionar entre "Bebida" o "Comida"
2. **Subcategoría**: Opciones predefinidas según la categoría
   - Bebidas: Gaseosas, Aguas, Jugos, Cervezas, Vinos, Licores, Café, Té
   - Comidas: Carnes, Pescados, Verduras, Frutas, Lácteos, Panadería, Condimentos, Otros
3. **Precio de venta**: Precio que aparecerá en el menú para las meseras
4. **Integración automática**: Se agrega automáticamente al stock y al menú

### 3. Flujo de Materia Prima
Si NO se marca "Es consumo final":

1. **Campo de uso**: Especificar para qué se va a usar el producto
2. **No se agrega al menú**: Solo se registra en el inventario

### 4. Historial de Compras
- **Acceso**: Botón "Historial" en el componente StockActual
- **Funcionalidades**:
  - Ver todas las compras realizadas
  - Estadísticas de gastos
  - Filtros por tipo (Consumo Final / Materia Prima)
  - Búsqueda por nombre
  - Ordenamiento por fecha

## Estructura de Datos

### Compra
```javascript
{
  id: "string",
  nombre: "string",
  cantidad: number,
  precioUnitario: number,
  precioTotal: number,
  esConsumoFinal: boolean,
  categoria: "bebida" | "comida" | "",
  subcategoria: "string",
  precioVenta: number, // Solo si es consumo final
  uso: "string", // Solo si es materia prima
  tipo: "consumo_final" | "materia_prima",
  fechaCompra: timestamp,
  createdAt: timestamp
}
```

### Producto en Stock (si es consumo final)
```javascript
{
  id: "string",
  nombre: "string",
  tipo: "bebida" | "alimento",
  categoria: "string",
  subcategoria: "string",
  stock: number,
  precio: number, // Precio de venta
  costo: number, // Precio unitario de compra
  imagen: "string",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## API Endpoints

### GET /api/compras
- **Parámetros**: `restauranteId`
- **Retorna**: Lista de todas las compras ordenadas por fecha

### POST /api/compras
- **Body**: Datos de la compra
- **Funcionalidad**: 
  - Guarda la compra en la colección "compras"
  - Si es consumo final, también agrega al stock

## Hooks

### useCompras
```javascript
const {
  compras,
  loading,
  error,
  fetchCompras,
  createCompra,
  getComprasStats,
  searchCompras,
  getComprasByDate
} = useCompras();
```

## Componentes

### CompraModal
- Modal para registrar nuevas compras
- Validación de campos requeridos
- Cálculo automático del precio total
- Campos condicionales según tipo de consumo

### HistorialCompras
- Muestra todas las compras realizadas
- Estadísticas de gastos
- Filtros y búsqueda
- Formato de moneda y fechas

## Flujo de Uso

1. **Registrar Compra**:
   - Hacer clic en "Comprar"
   - Completar información básica
   - Decidir si es consumo final o materia prima
   - Completar campos específicos según el tipo
   - Guardar

2. **Ver Historial**:
   - Hacer clic en "Historial"
   - Ver estadísticas generales
   - Filtrar por tipo de compra
   - Buscar compras específicas

3. **Integración con Menú**:
   - Los productos de consumo final aparecen automáticamente en el menú
   - Las meseras pueden vender estos productos
   - El stock se actualiza automáticamente

## Validaciones

### Campos Requeridos
- Nombre del producto
- Cantidad
- Precio unitario
- Categoría (si es consumo final)
- Subcategoría (si es consumo final)
- Precio de venta (si es consumo final)
- Uso (si es materia prima)

### Validaciones de Negocio
- Cantidad y precios deben ser números positivos
- Si es consumo final, debe tener precio de venta
- Si es materia prima, debe especificar el uso

## Archivos Principales

1. `src/app/api/compras/route.js` - API para manejar compras
2. `src/hooks/useCompras.js` - Hook para gestión de compras
3. `src/app/home-comandas/inventario/components/CompraModal.jsx` - Modal de compra
4. `src/app/home-comandas/inventario/components/HistorialCompras.jsx` - Historial
5. `src/app/home-comandas/inventario/components/StockActual.jsx` - Componente principal

## Notas Importantes

- Las compras se guardan en la colección "compras" de Firestore
- Los productos de consumo final se agregan automáticamente al stock
- El sistema calcula automáticamente el precio total
- Las fechas se guardan como timestamps de Firestore
- El historial se ordena por fecha de compra (más reciente primero)
