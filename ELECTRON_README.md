# Comandas Múltiples - Versión Electron

Esta es la versión de escritorio de la aplicación Comandas Múltiples, construida con Electron.

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Instalación de dependencias
```bash
npm install
```

## 🛠️ Scripts Disponibles

### Desarrollo
```bash
# Iniciar en modo desarrollo (Next.js + Electron) - MÁS RECOMENDADO
npm run electron-dev-simple-fixed

# Iniciar en modo desarrollo corregido
npm run electron-dev-fixed

# Iniciar en modo desarrollo simple
npm run electron-dev-simple

# Iniciar en modo desarrollo robusto (con detección de puertos)
npm run electron-dev-robust

# Iniciar en modo desarrollo original
npm run electron-dev

# Probar solo Electron (sin Next.js)
npm run electron-test

# Solo iniciar Next.js
npm run dev

# Solo iniciar Electron (requiere que Next.js esté corriendo)
npm run electron
```

### Producción
```bash
# Construir aplicación para distribución
npm run build-electron

# Construir solo Next.js
npm run build

# Construir solo Electron
npm run electron-dist
```

## 📁 Estructura de Archivos

```
comandas-multiples/
├── electron/
│   ├── main.js          # Proceso principal de Electron
│   └── preload.js       # Script de precarga para seguridad
├── src/                 # Código fuente de Next.js
├── public/              # Archivos estáticos
├── build-electron.js    # Script de construcción
└── package.json         # Configuración del proyecto
```

## 🔧 Configuración

### Configuración de Electron
- **main.js**: Maneja la ventana principal y eventos de la aplicación
- **preload.js**: Expone APIs seguras al renderer process
- **package.json**: Configuración de electron-builder para distribución

### Configuración de Next.js
- **next.config.mjs**: Configuración optimizada para Electron
- **trailingSlash**: Habilitado para compatibilidad
- **images.unoptimized**: Habilitado para mejor rendimiento

## 🚀 Desarrollo

### Modo Desarrollo
1. Ejecuta `npm run electron-dev`
2. Esto iniciará tanto Next.js como Electron
3. Los cambios en el código se reflejarán automáticamente

### Debugging
- Las herramientas de desarrollo se abren automáticamente en modo desarrollo
- Puedes usar `Ctrl+Shift+I` (Windows/Linux) o `Cmd+Option+I` (Mac) para abrir las herramientas

## 📦 Distribución

### Construir para Windows
```bash
npm run build-electron
```
Los archivos se generarán en la carpeta `dist/`

### Configuración de Build
- **Windows**: Instalador NSIS
- **macOS**: App bundle
- **Linux**: AppImage

## 🔒 Seguridad

La aplicación implementa las mejores prácticas de seguridad de Electron:

- **Context Isolation**: Habilitado
- **Node Integration**: Deshabilitado
- **Remote Module**: Deshabilitado
- **Preload Script**: Para APIs seguras

## 🐛 Solución de Problemas

### Error: "Module not found"
- Verifica que todas las dependencias estén instaladas
- Ejecuta `npm install` nuevamente

### Error: "Port already in use"
- Asegúrate de que el puerto 3000 esté libre
- Cierra otras instancias de la aplicación

### Error: "Build failed"
- Verifica que Node.js esté actualizado
- Limpia la caché: `npm run build -- --clean`

## 📝 Notas Importantes

1. **APIs**: La aplicación usa las mismas APIs que la versión web
2. **Base de Datos**: Se conecta a la misma base de datos Firebase
3. **Archivos**: Los archivos se manejan a través de las APIs web
4. **Notificaciones**: Usa las notificaciones nativas del sistema

## 🤝 Contribución

Para contribuir al desarrollo:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Haz tus cambios
4. Prueba con `npm run electron-dev`
5. Envía un pull request

## 📄 Licencia

Este proyecto mantiene la misma licencia que la aplicación web original.
