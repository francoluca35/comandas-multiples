# Sistema de Gestión de Productos - Comandas Múltiples

## 📋 Descripción General

Sistema completo y profesional para la gestión de productos/menús de restaurantes, desarrollado con Next.js, Firebase Firestore y Tailwind CSS. El sistema incluye gestión de categorías, productos con descuentos, y una interfaz moderna y responsive.

## 🏗️ Arquitectura del Sistema

### Estructura de Base de Datos (Firestore)
```
restaurantes/
  └── francomputer/
      └── menus/
          ├── bebidas/
          │   └── items/
          │       ├── producto1
          │       └── producto2
          ├── comidas/
          │   └── items/
          │       ├── producto3
          │       └── producto4
          └── postres/
              └── items/
                  └── producto5
```

### Estructura de Archivos
```
src/
├── hooks/
│   ├── useProducts.js          # Hook para operaciones directas con Firestore
│   └── useProductAPI.js        # Hook para operaciones vía API
├── app/
│   ├── api/
│   │   ├── productos/
│   │   │   └── route.js        # API REST para productos
│   │   └── categorias/
│   │       └── route.js        # API REST para categorías
│   └── home-comandas/
│       └── productos/
│           └── page.jsx        # Página principal de gestión
└── lib/
    └── firebase.js             # Configuración de Firebase
```

## 🚀 Características Principales

### ✅ Gestión de Categorías
- **Crear categorías** dinámicamente
- **Validación** de nombres únicos
- **Eliminación** con confirmación
- **Actualización** de nombres (mueve productos automáticamente)

### ✅ Gestión de Productos
- **CRUD completo** (Crear, Leer, Actualizar, Eliminar)
- **Categorización** automática
- **Descuentos** configurables (0-100%)
- **Estados** activo/inactivo
- **Validaciones** robustas

### ✅ Interfaz de Usuario
- **Diseño responsive** con Tailwind CSS
- **Modales** para formularios
- **Filtros** por categoría
- **Indicadores** de estado
- **Navegación** intuitiva

### ✅ API REST
- **Endpoints** estandarizados
- **Validaciones** del lado servidor
- **Manejo de errores** robusto
- **Respuestas** consistentes

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Estado**: React Hooks (useState, useEffect)

## 📖 Uso del Sistema

### 1. Acceso a la Gestión de Productos
- Navegar a `/home-comandas/productos`
- O usar el botón "Productos" en el sidebar

### 2. Crear Nueva Categoría
1. Hacer click en "Nueva Categoría"
2. Ingresar nombre de la categoría
3. Confirmar creación

### 3. Crear Nuevo Producto
1. Hacer click en "Nuevo Producto"
2. Seleccionar categoría
3. Completar formulario:
   - **Nombre** (obligatorio)
   - **Precio** (obligatorio, > 0)
   - **Descuento** (opcional, 0-100%)
   - **Descripción** (opcional)
4. Guardar producto

### 4. Editar Producto
1. Hacer click en el ícono de editar
2. Modificar campos necesarios
3. Guardar cambios

### 5. Eliminar Producto
1. Hacer click en el ícono de eliminar
2. Confirmar eliminación

## 🔧 API Endpoints

### Productos

#### GET `/api/productos`
- **Query params**: `restaurantId`, `categoryId` (opcional)
- **Respuesta**: Lista de productos

#### POST `/api/productos`
- **Body**: `{ categoryId, name, price, discount, description, restaurantId }`
- **Respuesta**: Producto creado

#### PUT `/api/productos`
- **Body**: `{ productId, categoryId, name, price, discount, description, activo, restaurantId }`
- **Respuesta**: Producto actualizado

#### DELETE `/api/productos`
- **Query params**: `productId`, `categoryId`, `restaurantId`
- **Respuesta**: Confirmación de eliminación

### Categorías

#### GET `/api/categorias`
- **Query params**: `restaurantId`
- **Respuesta**: Lista de categorías

#### POST `/api/categorias`
- **Body**: `{ name, restaurantId }`
- **Respuesta**: Categoría creada

#### PUT `/api/categorias`
- **Body**: `{ oldName, newName, restaurantId }`
- **Respuesta**: Categoría actualizada

#### DELETE `/api/categorias`
- **Query params**: `name`, `restaurantId`
- **Respuesta**: Confirmación de eliminación

## 🎨 Hooks Personalizados

### `useProducts()`
Hook para operaciones directas con Firestore:
```javascript
const {
  products,
  categories,
  loading,
  error,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct
} = useProducts();
```

### `useProductAPI()`
Hook para operaciones vía API:
```javascript
const {
  loading,
  error,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  createCategory
} = useProductAPI();
```

## 🔒 Validaciones y Seguridad

### Validaciones del Cliente
- Campos obligatorios
- Rangos de precios y descuentos
- Nombres únicos de categorías
- Formato de datos

### Validaciones del Servidor
- Verificación de existencia de recursos
- Validación de permisos
- Sanitización de datos
- Manejo de errores

### Seguridad
- Validación en ambos extremos
- Manejo seguro de errores
- Logs de auditoría
- Estructura de datos consistente

## 📊 Estructura de Datos

### Producto
```javascript
{
  id: "string",
  categoryId: "string",
  nombre: "string",
  precio: number,
  descuento: number,
  descripcion: "string",
  activo: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Categoría
```javascript
{
  id: "string",
  name: "string",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🚀 Despliegue

### Requisitos
- Node.js 18+
- Firebase project configurado
- Variables de entorno configuradas

### Variables de Entorno
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Comandos de Despliegue
```bash
npm install
npm run build
npm start
```

## 🔧 Mantenimiento

### Logs y Monitoreo
- Errores registrados en consola
- Respuestas de API estandarizadas
- Estados de carga visibles

### Backup y Recuperación
- Datos almacenados en Firestore
- Estructura de datos versionada
- Documentación actualizada

## 📝 Notas de Desarrollo

### Buenas Prácticas Implementadas
- ✅ Separación de responsabilidades
- ✅ Hooks reutilizables
- ✅ Validaciones robustas
- ✅ Manejo de errores consistente
- ✅ UI/UX intuitiva
- ✅ Código documentado
- ✅ Estructura escalable

### Consideraciones para Auditoría
- Código limpio y documentado
- Validaciones en múltiples capas
- Manejo seguro de datos
- Logs de auditoría
- Estructura de base de datos normalizada
- API RESTful estandarizada

## 🤝 Contribución

Para contribuir al proyecto:
1. Seguir las convenciones de código
2. Documentar cambios
3. Probar funcionalidades
4. Validar con el equipo

---

**Desarrollado con ❤️ para Comandas Múltiples** 