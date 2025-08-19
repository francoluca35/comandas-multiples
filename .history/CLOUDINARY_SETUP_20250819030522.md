# Configuración de Cloudinary

## Problema
El error "cloud_name is disabled" ocurre cuando las variables de entorno de Cloudinary no están configuradas correctamente.

## Solución

### 1. Crear archivo .env.local
Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu-cloud-name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
CLOUDINARY_UPLOAD_PRESET=tu-upload-preset
```

### 2. Obtener credenciales de Cloudinary

1. Ve a [Cloudinary Console](https://console.cloudinary.com/)
2. Inicia sesión o crea una cuenta
3. En el Dashboard, copia:
   - **Cloud Name**: Se muestra en la parte superior
   - **API Key**: En la sección "Account Details"
   - **API Secret**: En la sección "Account Details"

### 3. Configurar Upload Preset

1. En Cloudinary Console, ve a **Settings** > **Upload**
2. En la sección "Upload presets", crea uno nuevo o usa uno existente
3. Asegúrate de que esté configurado como "Unsigned" para subidas desde el frontend
4. Copia el nombre del preset

### 4. Configuración actual del proyecto

El proyecto ya tiene configurado un fallback con `cloud_name: "diwlchtx1"`, pero es recomendable configurar tus propias credenciales.

### 5. Verificar configuración

Después de configurar las variables de entorno, reinicia el servidor de desarrollo:

```bash
npm run dev
```

### 6. Archivos que usan Cloudinary

- `src/app/api/usuarios/registro/route.js` - Registro de usuarios
- `src/app/api/register-comanda/route.js` - Registro de comandas
- `lib/cloudinary.js` - Utilidades de Cloudinary

### 7. Troubleshooting

Si sigues teniendo problemas:

1. Verifica que el archivo `.env.local` esté en la raíz del proyecto
2. Asegúrate de que las variables no tengan espacios extra
3. Reinicia el servidor después de cambiar las variables
4. Verifica que el upload preset esté configurado como "Unsigned"

### 8. Configuración de seguridad

Para producción, considera:
- Usar variables de entorno del servidor de hosting
- Configurar CORS en Cloudinary
- Limitar el tamaño de archivos
- Configurar transformaciones automáticas
