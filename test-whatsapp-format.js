// Script de prueba para validar formato de WhatsApp
const testWhatsAppFormats = () => {
  const testNumbers = [
    "5491234567890", // Formato correcto con código de país
    "91234567890",   // Con 9 pero sin 54
    "1234567890",    // Número local de 10 dígitos
    "12345678",      // Número local de 8 dígitos
    "123456789",     // Número local de 9 dígitos
    "12345678901",   // Número local de 11 dígitos
    "123456789012",  // Número local de 12 dígitos (muy largo)
    "1234567",       // Número muy corto
    "549-123-456-7890", // Con guiones
    "549 123 456 7890", // Con espacios
    "+5491234567890",   // Con signo +
    "",              // Vacío
    "abc123def456",  // Con letras
  ];

  console.log("🧪 Probando formatos de WhatsApp...\n");

  testNumbers.forEach((number, index) => {
    console.log(`Test ${index + 1}: "${number}"`);
    
    try {
      // Simular la lógica de validación
      const cleanNumber = number.replace(/[^\d]/g, '');
      console.log(`  Número limpio: "${cleanNumber}"`);
      
      if (!cleanNumber || cleanNumber.length < 8) {
        throw new Error(`Formato de número de WhatsApp inválido: ${number}. Debe tener al menos 8 dígitos.`);
      }
      
      let formattedNumber = cleanNumber;
      
      if (cleanNumber.startsWith('54')) {
        formattedNumber = cleanNumber;
      } else if (cleanNumber.startsWith('9')) {
        formattedNumber = '54' + cleanNumber;
      } else if (cleanNumber.length >= 8 && cleanNumber.length <= 11) {
        formattedNumber = '549' + cleanNumber;
      } else {
        throw new Error(`Formato de número de WhatsApp inválido: ${number}. Número limpio: ${cleanNumber}`);
      }
      
      console.log(`  ✅ Formateado: "${formattedNumber}"`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log("");
  });
};

// Ejecutar la prueba
testWhatsAppFormats();
