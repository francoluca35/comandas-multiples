# 🔐 Guía: Configuración del Webhook Secret de MercadoPago

## 📋 ¿Qué es el Webhook Secret?

El **Webhook Secret** es una clave secreta que MercadoPago usa para **verificar que los webhooks realmente vienen de ellos** y no de un atacante. Es una medida de seguridad importante.

## 🎯 ¿Por qué lo necesitas?

- ✅ **Seguridad**: Verifica que los webhooks son legítimos
- ✅ **Prevención de fraudes**: Evita pagos falsos
- ✅ **Confianza**: Asegura que solo MercadoPago puede notificar pagos

## 📍 ¿Dónde obtenerlo?

### **Opción 1: Dashboard de MercadoPago (Recomendado)**

1. **Ve a MercadoPago Developers**
   - Abre: [https://www.mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers)
   - Inicia sesión con tu cuenta

2. **Accede a tu aplicación**
   - Ve a **"Tus integraciones"**
   - Selecciona tu aplicación

3. **Configura Webhooks**
   - Ve a la sección **"Webhooks"**
   - Haz clic en **"Crear webhook"**

4. **Configura el webhook**
   ```
   URL: https://tu-dominio.com/api/pagos/webhook
   Eventos: payment.created, payment.updated
   ```

5. **Obtén el Webhook Secret**
   - Una vez creado, verás el **"Webhook Secret"**
   - Cópialo (es una cadena larga de caracteres)

### **Opción 2: Si ya tienes un webhook configurado**

1. Ve a **"Tus integraciones"** → **"Webhooks"**
2. Selecciona tu webhook existente
3. En la configuración verás el **"Webhook Secret"**

## 🔧 ¿Cómo configurarlo en tu aplicación?

### **1. En la configuración de MercadoPago**

1. Ve a **Configuración** → **MercadoPago**
2. Completa los tres campos:
   - ✅ **Access Token**
   - ✅ **Public Key** 
   - ✅ **Webhook Secret** ← **NUEVO CAMPO**

3. Haz clic en **"Configurar MercadoPago"**

### **2. Verificación automática**

La aplicación verificará:
- ✅ Que el Access Token sea válido
- ✅ Que el Public Key sea válido
- ✅ Que el Webhook Secret esté presente

## 🏪 ¿Cómo funciona para múltiples restaurantes?

### **Opción 1: Webhook Secret único (Recomendado)**
```javascript
// Un solo webhook para todos los restaurantes
WEBHOOK_URL: https://tu-app.com/api/pagos/webhook
```

**Ventajas:**
- ✅ Más simple de configurar
- ✅ Un solo webhook para toda la aplicación
- ✅ Menos configuración en MercadoPago

### **Opción 2: Webhook Secret por restaurante**
```javascript
// Cada restaurante puede tener su propio webhook secret
restaurante1: { webhookSecret: "secret1" }
restaurante2: { webhookSecret: "secret2" }
```

**Ventajas:**
- ✅ Mayor seguridad por restaurante
- ✅ Control granular
- ✅ Aislamiento de configuraciones

## 🔍 ¿Cómo verificar que funciona?

### **1. Verificar en logs**
```bash
# En los logs de tu aplicación verás:
🔐 Webhook secret configurado para el restaurante: restaurante_id
```

### **2. Probar un pago**
1. Haz un pago de prueba
2. Verifica que el webhook se recibe correctamente
3. Confirma que la mesa se libera automáticamente

## ⚠️ Problemas comunes

### **Error: "Webhook secret no configurado"**
**Solución:**
1. Verifica que agregaste el webhook secret en la configuración
2. Asegúrate de que no tenga espacios extra
3. Copia exactamente desde MercadoPago

### **Error: "Webhook inválido"**
**Solución:**
1. Verifica que la URL del webhook sea correcta
2. Asegúrate de que el webhook esté activo en MercadoPago
3. Verifica que los eventos estén configurados

### **Error: "Firma no válida"**
**Solución:**
1. Verifica que el webhook secret sea correcto
2. Asegúrate de que no haya caracteres extra
3. Regenera el webhook secret si es necesario

## 🚀 Próximos pasos

### **1. Configurar webhook en MercadoPago**
- Crea el webhook con la URL correcta
- Configura los eventos necesarios
- Obtén el webhook secret

### **2. Configurar en tu aplicación**
- Ve a Configuración → MercadoPago
- Agrega el webhook secret
- Guarda la configuración

### **3. Probar el sistema**
- Haz un pago de prueba
- Verifica que el webhook funciona
- Confirma que la mesa se libera

## 📞 Soporte

Si tienes problemas:
1. Verifica que el webhook secret sea correcto
2. Revisa los logs de la aplicación
3. Contacta soporte si persiste el problema

---

**¡Con esto tendrás un sistema de pagos completamente seguro y funcional!** 🎉
