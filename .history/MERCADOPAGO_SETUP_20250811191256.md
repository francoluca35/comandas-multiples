# Configuración de Mercado Pago

## 🚀 Integración de Pagos con Tarjeta

Este sistema permite procesar pagos con tarjeta de crédito/débito usando Mercado Pago.

## 📋 Requisitos Previos

1. **Cuenta de Mercado Pago**: Necesitas una cuenta en [Mercado Pago](https://www.mercadopago.com.ar)
2. **Credenciales de API**: Obtén tus credenciales desde el [Panel de Desarrolladores](https://www.mercadopago.com.ar/developers/panel/credentials)

## ⚙️ Configuración

### 1. Crear archivo de variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```bash
# Mercado Pago Configuration
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# URL base de tu aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Obtener credenciales de Mercado Pago

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/credentials)
2. Inicia sesión con tu cuenta
3. Selecciona tu aplicación o crea una nueva
4. Copia el **Access Token** (Producción o Sandbox)

### 3. Configurar URLs de retorno

En el panel de Mercado Pago, configura las siguientes URLs:

- **Success URL**: `https://tu-dominio.com/pago-exitoso`
- **Failure URL**: `https://tu-dominio.com/pago-error`
- **Pending URL**: `https://tu-dominio.com/pago-pendiente`

## 🧪 Modo de Prueba (Sandbox)

Para pruebas, usa el Access Token de Sandbox:

```bash
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Tarjetas de prueba disponibles:

- **Visa**: 4509 9535 6623 3704
- **Mastercard**: 5031 4332 1540 6351
- **American Express**: 3711 8030 3257 522

**CVV**: 123
**Fecha de vencimiento**: Cualquier fecha futura

## 🔄 Flujo de Pago

1. **Cliente selecciona "Tarjeta de Crédito"** en el modal de cobranza
2. **Sistema crea preferencia** de pago en Mercado Pago
3. **Cliente es redirigido** a Mercado Pago para completar el pago
4. **Mercado Pago procesa** el pago y redirige de vuelta
5. **Sistema verifica** el estado del pago
6. **Se muestra confirmación** de pago exitoso o error

## 📱 Funcionalidades Implementadas

### ✅ Completadas
- [x] Integración con Mercado Pago
- [x] Procesamiento de pagos con tarjeta
- [x] Páginas de éxito y error
- [x] Verificación de estado de pagos
- [x] Modal de confirmación de pago
- [x] Comprobantes de pago
- [x] Manejo de errores

### 🔄 Estados de Pago
- **Aprobado**: Pago procesado exitosamente
- **Pendiente**: Pago en proceso de verificación
- **Rechazado**: Pago denegado
- **Cancelado**: Pago cancelado por el usuario

## 🛠️ Archivos Principales

- `src/app/api/pagos/route.js` - API para procesar pagos
- `src/hooks/usePaymentProcessor.js` - Hook para manejar pagos
- `src/components/PaymentStatusModal.jsx` - Modal de estado de pago
- `src/app/pago-exitoso/page.jsx` - Página de pago exitoso
- `src/app/pago-error/page.jsx` - Página de error de pago

## 🔒 Seguridad

- Las credenciales se almacenan en variables de entorno
- No se almacenan datos de tarjeta en el servidor
- Todas las transacciones pasan por Mercado Pago
- Verificación de estado de pagos antes de confirmar

## 📞 Soporte

Para problemas con Mercado Pago:
- [Documentación oficial](https://www.mercadopago.com.ar/developers/es/docs)
- [Centro de ayuda](https://www.mercadopago.com.ar/developers/es/support)

## 🚀 Producción

Para usar en producción:

1. Cambia a credenciales de producción
2. Actualiza `NEXT_PUBLIC_BASE_URL` con tu dominio
3. Configura las URLs de retorno en Mercado Pago
4. Prueba con tarjetas reales

---

**¡Listo!** Tu sistema ya puede procesar pagos con tarjeta de crédito/débito. 🎉
