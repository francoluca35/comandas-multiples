# Configuración de Cloudinary

## Pasos para configurar Cloudinary:

### 1. Crear cuenta en Cloudinary
- Ve a https://cloudinary.com/
- Crea una cuenta gratuita
- Ve a Dashboard

### 2. Obtener credenciales
En el Dashboard de Cloudinary, copia:
- **Cloud Name**
- **API Key** 
- **API Secret**

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

### 4. Beneficios de usar Cloudinary
- ✅ Optimización automática de imágenes
- ✅ Redimensionamiento automático
- ✅ Conversión de formatos
- ✅ Detección de rostros para recorte
- ✅ CDN global para mejor rendimiento
- ✅ Compresión automática

### 5. Funciones disponibles
- `getProfileImageUrl(url, size)` - Para imágenes de perfil
- `transformToCloudinaryUrl(url, options)` - Para transformaciones personalizadas
- `uploadToCloudinary(file)` - Para subir archivos (requiere configuración adicional)

### 6. Ejemplo de uso
```javascript
import { getProfileImageUrl } from '../lib/cloudinary';

// Transformar cualquier URL de imagen a Cloudinary
const optimizedImage = getProfileImageUrl('https://ejemplo.com/imagen.jpg', 150);
```

### 7. Reiniciar el servidor
Después de configurar las variables de entorno, reinicia el servidor de desarrollo:
```bash
npm run dev
``` 