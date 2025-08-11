# PWA - Comandas Múltiples

## 🚀 Funcionalidades PWA Implementadas

### ✅ Características Principales

1. **Instalación como App Nativa**
   - Prompt de instalación automático
   - Iconos adaptativos para diferentes tamaños
   - Manifest.json configurado

2. **Modo Offline**
   - Service Worker para cacheo
   - Indicador de estado de conexión
   - Funcionamiento sin internet

3. **Experiencia de App Nativa**
   - Pantalla completa (standalone)
   - Barra de estado personalizada
   - Accesos directos (shortcuts)

### 📱 Compatibilidad

- **Chrome/Edge**: Soporte completo
- **Firefox**: Soporte básico
- **Safari (iOS)**: Soporte limitado
- **Android**: Soporte completo

### 🛠️ Configuración Técnica

#### Archivos Configurados:

1. **`next.config.mjs`**
   - Configuración de next-pwa
   - Cacheo inteligente
   - Service Worker automático

2. **`public/manifest.json`**
   - Metadatos de la app
   - Iconos y colores
   - Accesos directos

3. **`src/app/layout.js`**
   - Meta tags para PWA
   - Configuración de iconos
   - Componentes PWA integrados

#### Componentes Creados:

1. **`PWAInstallPrompt.jsx`**
   - Prompt de instalación personalizado
   - Manejo de eventos de instalación

2. **`OfflineIndicator.jsx`**
   - Indicador de estado offline
   - Notificación visual de conexión

3. **`useOfflineStatus.js`**
   - Hook para estado de conexión
   - Detección de app instalada

### 🎯 Accesos Directos Configurados

- **Nueva Comanda**: `/home-comandas/ventas`
- **Inventario**: `/home-comandas/inventario`

### 🔧 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo (PWA deshabilitada)
npm run dev

# Producción (PWA habilitada)
npm run build
npm start
```

### 📊 Métricas PWA

Para verificar que la PWA funciona correctamente:

1. **Lighthouse Audit**
   - Performance: 90+
   - Accessibility: 90+
   - Best Practices: 90+
   - SEO: 90+
   - PWA: 90+

2. **Chrome DevTools**
   - Application > Manifest
   - Application > Service Workers
   - Application > Storage

### 🚨 Notas Importantes

1. **Desarrollo vs Producción**
   - PWA solo funciona en producción
   - Service Worker deshabilitado en desarrollo

2. **HTTPS Requerido**
   - PWA necesita HTTPS en producción
   - Service Worker no funciona en HTTP

3. **Iconos**
   - Usar `/Assets/LogoApp.png` como base
   - Generar múltiples tamaños si es necesario

### 🔄 Actualizaciones

Para actualizar la PWA:

1. Cambiar la versión en `manifest.json`
2. Reconstruir la aplicación
3. Los usuarios recibirán la actualización automáticamente

### 📱 Testing

1. **Chrome DevTools**
   - Application > Manifest
   - Application > Service Workers
   - Network > Offline

2. **Dispositivos Móviles**
   - Instalar la app
   - Probar modo offline
   - Verificar accesos directos

### 🎨 Personalización

Para personalizar la PWA:

1. **Colores**: Cambiar en `manifest.json` y `layout.js`
2. **Iconos**: Reemplazar `/Assets/LogoApp.png`
3. **Nombre**: Actualizar en `manifest.json`
4. **Accesos directos**: Modificar en `manifest.json`
