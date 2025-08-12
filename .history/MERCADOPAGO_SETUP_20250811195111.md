# 🔐 Sistema de Mercado Pago Seguro por Restaurante

## 📋 Resumen del Sistema

Este sistema implementa una **configuración segura y aislada de Mercado Pago por restaurante**, donde cada restaurante tiene sus propias credenciales almacenadas de forma segura en la base de datos.

## 🏗️ Arquitectura del Sistema

### 1. **Almacenamiento Seguro**
```javascript
// Estructura en Firestore
restaurantes/{restaurantId}/
├── mercadopago/
│   ├── accessToken: "APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
│   ├── publicKey: "APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
│   ├── isActive: true
│   ├── configuredAt: Timestamp
│   ├── lastValidated: Timestamp
│   └── accountType: "production" | "sandbox"
└── informacion/
    ├── nombre: "Restaurante"
    ├── direccion: "..."
    └── ...
```

### 2. **Aislamiento por Restaurante**
- ✅ Cada restaurante tiene su propio `restaurantId` único
- ✅ Las credenciales están aisladas por restaurante
- ✅ No hay cruce de datos entre restaurantes
- ✅ Validación de permisos por restaurante

## 🔧 APIs Implementadas

### 1. **Configuración de Mercado Pago**
```javascript
POST /api/pagos/validate-credentials
// Valida las credenciales antes de guardarlas

GET /api/restaurants/{id}/mercadopago-config
// Obtiene configuración pública (sin accessToken)
```

### 2. **Procesamiento de Pagos**
```javascript
POST /api/pagos
// Crea preferencias de pago usando credenciales del restaurante

GET /api/pagos?payment_id={id}&restaurant_id={id}
// Verifica estado del pago usando credenciales del restaurante
```

### 3. **Webhook de Notificaciones**
```javascript
POST /api/pagos/webhook
// Procesa notificaciones usando credenciales del restaurante correcto
```

## 🛡️ Medidas de Seguridad

### 1. **Validación de Credenciales**
- ✅ Formato de credenciales validado
- ✅ Validación con API de Mercado Pago antes de guardar
- ✅ Verificación de permisos de cuenta

### 2. **Aislamiento de Datos**
- ✅ Cada restaurante solo accede a sus propios datos
- ✅ Validación de `restaurantId` en todas las operaciones
- ✅ No hay acceso cruzado entre restaurantes

### 3. **Manejo Seguro de Credenciales**
- ✅ `accessToken` solo se usa en el backend
- ✅ `publicKey` disponible para el frontend
- ✅ Credenciales encriptadas en tránsito

## 📱 Flujo de Configuración

### 1. **Acceso a Configuración**
```
Usuario → Configuración → Validación de Permisos → Formulario
```

### 2. **Validación de Credenciales**
```
Ingreso Credenciales → Validación Formato → Validación API → Guardado
```

### 3. **Procesamiento de Pagos**
```
Pago → Obtener Credenciales → Configurar MP → Crear Preferencia → Redirección
```

## 🔄 Flujo de Pago Completo

### 1. **Inicio del Pago**
```javascript
// Frontend envía datos del pedido
const paymentData = {
  orderData: { /* datos del pedido */ },
  restaurantId: "restaurante_id",
  restaurantName: "Nombre Restaurante"
};
```

### 2. **Backend Procesa**
```javascript
// API obtiene credenciales del restaurante
const restaurantData = await getDoc(doc(db, "restaurantes", restaurantId));
const accessToken = restaurantData.mercadopago.accessToken;

// Configura Mercado Pago
mercadopago.configure({ access_token: accessToken });

// Crea preferencia
const preference = await mercadopago.preferences.create({...});
```

### 3. **Redirección a Mercado Pago**
```javascript
// Frontend redirige al usuario
window.location.href = preference.sandbox_init_point;
```

### 4. **Webhook de Notificación**
```javascript
// Mercado Pago notifica el resultado
// Sistema identifica el restaurante y usa sus credenciales
const restaurantId = paymentData.additional_info.restaurant_id;
const restaurantData = await getDoc(doc(db, "restaurantes", restaurantId));
mercadopago.configure({ access_token: restaurantData.mercadopago.accessToken });
```

## 🎯 Beneficios del Sistema

### 1. **Seguridad**
- ✅ Credenciales aisladas por restaurante
- ✅ Validación antes de guardar
- ✅ No hay acceso cruzado de datos

### 2. **Escalabilidad**
- ✅ Cada restaurante maneja sus propios pagos
- ✅ No hay límites de cuentas compartidas
- ✅ Fácil agregar nuevos restaurantes

### 3. **Flexibilidad**
- ✅ Cada restaurante puede usar su propia cuenta de Mercado Pago
- ✅ Configuración independiente por restaurante
- ✅ Soporte para sandbox y producción

## 🚀 Implementación

### 1. **Configuración Inicial**
```bash
# El restaurante debe:
1. Crear cuenta en Mercado Pago Developers
2. Obtener Access Token y Public Key
3. Configurar en la aplicación
```

### 2. **Validación Automática**
```javascript
// El sistema valida automáticamente:
- Formato de credenciales
- Validez con API de Mercado Pago
- Permisos de la cuenta
```

### 3. **Procesamiento Seguro**
```javascript
// Cada pago usa las credenciales correctas:
- Identifica el restaurante
- Obtiene sus credenciales
- Procesa el pago de forma aislada
```

## 🔍 Monitoreo y Debugging

### 1. **Logs de Seguridad**
```javascript
// El sistema registra:
- Validación de credenciales
- Intentos de acceso
- Errores de configuración
- Procesamiento de pagos
```

### 2. **Métricas**
```javascript
// Se pueden monitorear:
- Configuraciones exitosas
- Errores de validación
- Pagos procesados por restaurante
- Tiempo de respuesta
```

## 📞 Soporte

### Problemas Comunes:
1. **Credenciales inválidas**: Verificar formato y permisos
2. **Restaurante no encontrado**: Verificar ID del restaurante
3. **Configuración inactiva**: Activar en panel de configuración

### Contacto:
- Para problemas técnicos: Revisar logs del sistema
- Para configuración: Usar panel de configuración
- Para pagos: Verificar credenciales y estado de cuenta
