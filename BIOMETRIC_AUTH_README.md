# 🔐 Sistema de Autenticación Biométrica

## 📋 Descripción General

Este sistema implementa autenticación por huella digital (biométrica) junto con el método tradicional de contraseña para el sistema de comandas de restaurantes. Los usuarios pueden elegir entre ambos métodos de autenticación según su preferencia y compatibilidad del dispositivo.

## ✨ Características Principales

### 🔑 **Doble Método de Autenticación**
- **Contraseña tradicional**: Método clásico con usuario y contraseña
- **Huella digital**: Autenticación biométrica usando la Web Authentication API

### 📱 **Compatibilidad**
- Soporte para dispositivos con sensores de huella digital
- Detección automática de compatibilidad
- Fallback automático a contraseña si no hay soporte biométrico

### 🛡️ **Seguridad**
- Credenciales biométricas almacenadas de forma segura
- Verificación en el servidor
- Integración con el sistema de roles existente

## 🏗️ Arquitectura del Sistema

### 📁 **Archivos Principales**

```
src/
├── hooks/
│   └── useBiometricAuth.js          # Hook para autenticación biométrica
├── components/
│   └── BiometricSetupModal.jsx      # Modal de configuración
├── app/
│   ├── api/biometric/
│   │   ├── save-credentials/        # API para guardar credenciales
│   │   └── authenticate/            # API para autenticar
│   └── home-comandas/login/
│       └── page.jsx                 # Página de login actualizada
```

### 🔧 **Componentes Clave**

#### 1. **useBiometricAuth Hook**
```javascript
const {
  isSupported,        // Si el navegador soporta WebAuthn
  isAvailable,        // Si hay autenticador disponible
  registerBiometric,  // Registrar nueva huella
  authenticateBiometric, // Autenticar con huella
} = useBiometricAuth();
```

#### 2. **BiometricSetupModal**
- Verificación de compatibilidad
- Guía paso a paso para configuración
- Manejo de errores y estados

#### 3. **APIs de Backend**
- `/api/biometric/save-credentials`: Guarda credenciales en Firestore
- `/api/biometric/authenticate`: Verifica autenticación biométrica

## 🚀 Flujo de Uso

### 📝 **Registro de Huella Digital**

1. **Selección de Usuario**: El usuario selecciona su cuenta en el login
2. **Verificación de Compatibilidad**: El sistema verifica si el dispositivo soporta biometría
3. **Configuración**: Si es compatible, se muestra el modal de configuración
4. **Registro**: El usuario registra su huella siguiendo las instrucciones del sistema
5. **Almacenamiento**: Las credenciales se guardan de forma segura en Firestore

### 🔐 **Autenticación**

1. **Selección de Método**: El usuario elige entre contraseña o huella digital
2. **Verificación**: 
   - **Contraseña**: Validación tradicional
   - **Huella**: Autenticación biométrica + verificación en servidor
3. **Acceso**: Login exitoso y redirección al sistema

## 💾 Estructura de Datos

### **Usuario en Firestore**
```javascript
{
  id: "usuario_id",
  usuario: "nombre_usuario",
  password: "contraseña_hash",
  rol: "admin|usuario",
  imagen: "url_imagen",
  biometricEnabled: true,                    // ✅ Nuevo
  biometricCredentials: {                    // ✅ Nuevo
    id: "credential_id",
    type: "public-key",
    rawId: [...],
    response: {
      attestationObject: [...],
      clientDataJSON: [...]
    }
  },
  biometricSetupDate: "2024-01-01T00:00:00Z" // ✅ Nuevo
}
```

## 🔧 Configuración

### **Variables de Entorno**
No se requieren variables adicionales. El sistema usa la configuración existente de Firebase.

### **Dependencias**
- **Web Authentication API**: Nativa del navegador
- **Firebase Firestore**: Para almacenamiento de credenciales
- **React Hooks**: Para manejo de estado

## 🛠️ Implementación Técnica

### **Web Authentication API**
```javascript
// Registro de credenciales
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: new Uint8Array(32),
    rp: { name: "Sistema de Comandas", id: window.location.hostname },
    user: { id: new Uint8Array(16), name: username },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required"
    }
  }
});
```

### **Seguridad**
- **Challenge aleatorio**: Previene ataques de replay
- **Verificación en servidor**: Doble validación
- **Almacenamiento seguro**: Credenciales encriptadas en Firestore

## 🎨 Interfaz de Usuario

### **Estados Visuales**
- ✅ **Compatible**: Verde, disponible para configuración
- ⚠️ **No configurado**: Amarillo, requiere configuración
- ❌ **No compatible**: Rojo, solo contraseña disponible

### **Botones de Acción**
- 🔑 **Contraseña**: Método tradicional
- 👆 **Huella Digital**: Método biométrico
- ⚙️ **Configurar**: Para usuarios sin huella configurada

## 🐛 Solución de Problemas

### **Problemas Comunes**

1. **"No compatible"**
   - Verificar que el dispositivo tenga sensor de huella
   - Asegurar que el navegador soporte WebAuthn
   - Probar en HTTPS (requerido para WebAuthn)

2. **"Error en configuración"**
   - Verificar permisos del navegador
   - Asegurar que no haya huellas duplicadas
   - Revisar consola para errores específicos

3. **"Autenticación fallida"**
   - Verificar que la huella esté bien configurada
   - Limpiar sensor de huellas
   - Reconfigurar huella si es necesario

### **Debug**
```javascript
// Verificar soporte
console.log("WebAuthn soportado:", !!window.PublicKeyCredential);
console.log("Autenticador disponible:", await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
```

## 🔄 Migración y Compatibilidad

### **Usuarios Existentes**
- Los usuarios existentes mantienen su funcionalidad actual
- Pueden optar por configurar huella digital
- No se requiere migración de datos

### **Nuevos Usuarios**
- Pueden configurar ambos métodos desde el inicio
- Recomendación de configurar huella para mayor seguridad

## 📈 Próximas Mejoras

### **Funcionalidades Futuras**
- [ ] Soporte para Face ID (iOS)
- [ ] Autenticación por patrón de desbloqueo
- [ ] Backup de credenciales biométricas
- [ ] Múltiples huellas por usuario
- [ ] Estadísticas de uso de métodos de autenticación

### **Optimizaciones**
- [ ] Cache de credenciales para mejor rendimiento
- [ ] Autenticación offline con credenciales locales
- [ ] Integración con sistema de auditoría

## 📞 Soporte

Para problemas o consultas sobre el sistema de autenticación biométrica:

1. **Verificar compatibilidad del dispositivo**
2. **Revisar logs de la consola del navegador**
3. **Probar en diferentes navegadores**
4. **Contactar al equipo de desarrollo**

---

**Nota**: Este sistema requiere HTTPS para funcionar correctamente, ya que la Web Authentication API solo está disponible en contextos seguros.
