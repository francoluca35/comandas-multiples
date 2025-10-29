# 🔄 Reset de Datos Financieros

Este conjunto de scripts te permite resetear completamente todos los datos financieros de la aplicación para empezar desde cero y probar correctamente.

## 📋 ¿Qué se resetea?

- ✅ **Ingresos**: Todos los ingresos registrados
- ✅ **Egresos**: Todos los egresos registrados  
- ✅ **Caja Registradora**: Apertura y cierre en $0
- ✅ **Dinero Virtual**: Saldo virtual en $0
- ✅ **Mesas Pagadas**: Vuelven a estado "libre"
- ✅ **Takeaway Pagados**: Se eliminan completamente
- ✅ **Delivery Pagados**: Se eliminan completamente

## 🚀 Opciones de Reset

### Opción 1: Script de Navegador (Recomendado)
1. Abre la aplicación en el navegador
2. Ve a la sección de "Pagos"
3. Abre la consola del navegador (F12)
4. Copia y pega el contenido de `reset-financial-data-browser.js`
5. Presiona Enter

### Opción 2: Script Simple
1. Abre la aplicación en el navegador
2. Abre la consola del navegador (F12)
3. Copia y pega el contenido de `reset-simple.js`
4. Presiona Enter

### Opción 3: Script de Node.js
1. Instala las dependencias de Firebase:
   ```bash
   npm install firebase
   ```
2. Ejecuta el script:
   ```bash
   node reset-financial-data.js
   ```

## ⚠️ Advertencias

- **ESTE RESET ES IRREVERSIBLE**: Todos los datos financieros se perderán
- **Haz una copia de seguridad** si necesitas conservar los datos
- **Solo ejecuta en ambiente de desarrollo/testing**
- **No ejecutes en producción** a menos que estés seguro

## 🎯 Después del Reset

Una vez ejecutado el reset:
1. Todas las secciones mostrarán $0,00
2. Las mesas estarán todas libres
3. Podrás probar el flujo completo desde cero
4. Los cálculos de rendimiento serán precisos

## 🔧 Personalización

Si necesitas cambiar el `restauranteId`:
1. Abre el script que vas a usar
2. Busca la línea: `const restauranteId = 'francomputer';`
3. Cambia `'francomputer'` por tu ID de restaurante

## 📞 Soporte

Si tienes problemas con el reset:
1. Verifica que estés en la página correcta de la app
2. Asegúrate de que Firebase esté cargado
3. Revisa la consola para mensajes de error
4. Intenta recargar la página y ejecutar nuevamente
