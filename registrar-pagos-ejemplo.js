const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  doc,
  getDocs
} = require('firebase/firestore');

// ⚠️ IMPORTANTE: Reemplaza estas credenciales con las tuyas
const firebaseConfig = {
  apiKey: "AIzaSyBqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq",
  authDomain: "comandas-multiples.firebaseapp.com",
  projectId: "comandas-multiples",
  storageBucket: "comandas-multiples.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ⚠️ CAMBIA ESTO: ID de tu restaurante
const restauranteId = 'francomputer';

// Función para registrar pago en efectivo
async function registrarPagoEfectivo() {
  try {
    console.log('💰 Registrando pago en EFECTIVO de $10.000...');
    
    // 1. Crear el ingreso en la colección Ingresos
    const ingresoData = {
      tipoIngreso: "Ingreso Manual",
      motivo: "Pago de prueba en efectivo",
      monto: "10000",
      formaIngreso: "Efectivo",
      fecha: serverTimestamp(),
      opcionPago: "caja",
      restauranteId: restauranteId,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'restaurantes', restauranteId, 'Ingresos'), ingresoData);
    console.log('✅ Ingreso registrado en colección Ingresos');

    // 2. Actualizar la caja registradora (sumar $10.000)
    const cajaRef = collection(db, 'restaurantes', restauranteId, 'CajaRegistradora');
    const cajaSnapshot = await getDocs(cajaRef);
    
    if (!cajaSnapshot.empty) {
      const cajaDoc = cajaSnapshot.docs[0];
      const cajaData = cajaDoc.data();
      const aperturaActual = parseFloat(cajaData.Apertura || 0);
      
      await updateDoc(cajaDoc.ref, {
        Apertura: (aperturaActual + 10000).toString(),
        ultimaActualizacion: serverTimestamp()
      });
      console.log(`✅ Caja actualizada: ${aperturaActual} + 10.000 = ${aperturaActual + 10000}`);
    } else {
      // Crear caja si no existe
      await addDoc(cajaRef, {
        Apertura: '10000',
        estado: 'activa',
        nombre: 'Caja Principal',
        fechaCreacion: serverTimestamp(),
        ultimaActualizacion: serverTimestamp()
      });
      console.log('✅ Nueva caja creada con $10.000');
    }

    console.log('✅✅✅ PAGO EN EFECTIVO REGISTRADO EXITOSAMENTE');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error registrando pago en efectivo:', error);
    throw error;
  }
}

// Función para registrar pago virtual
async function registrarPagoVirtual() {
  try {
    console.log('💳 Registrando pago VIRTUAL de $10.000...');
    
    // 1. Crear el ingreso en la colección Ingresos
    const ingresoData = {
      tipoIngreso: "Ingreso Manual",
      motivo: "Pago de prueba virtual",
      monto: "10000",
      formaIngreso: "MercadoPago",
      fecha: serverTimestamp(),
      opcionPago: "cuenta_restaurante",
      restauranteId: restauranteId,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'restaurantes', restauranteId, 'Ingresos'), ingresoData);
    console.log('✅ Ingreso registrado en colección Ingresos');

    // 2. Actualizar el dinero virtual (sumar $10.000)
    const dineroRef = collection(db, 'restaurantes', restauranteId, 'Dinero');
    const dineroSnapshot = await getDocs(dineroRef);
    
    if (!dineroSnapshot.empty) {
      const dineroDoc = dineroSnapshot.docs[0];
      const dineroData = dineroDoc.data();
      const virtualActual = parseFloat(dineroData.Virtual || 0);
      
      await updateDoc(dineroDoc.ref, {
        Virtual: (virtualActual + 10000).toString(),
        fechaActualizacion: serverTimestamp()
      });
      console.log(`✅ Dinero virtual actualizado: ${virtualActual} + 10.000 = ${virtualActual + 10000}`);
    } else {
      // Crear documento si no existe
      await addDoc(dineroRef, {
        Efectivo: '0',
        Virtual: '10000',
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp()
      });
      console.log('✅ Nuevo dinero virtual creado con $10.000');
    }

    console.log('✅✅✅ PAGO VIRTUAL REGISTRADO EXITOSAMENTE');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error registrando pago virtual:', error);
    throw error;
  }
}

// Función principal
async function registrarPagosEjemplo() {
  try {
    console.log('=====================================');
    console.log('🚀 REGISTRANDO PAGOS DE EJEMPLO');
    console.log('=====================================');
    console.log(`🏪 Restaurante: ${restauranteId}`);
    console.log('');
    
    // Registrar pago en efectivo
    await registrarPagoEfectivo();
    
    // Registrar pago virtual
    await registrarPagoVirtual();
    
    console.log('=====================================');
    console.log('🎉 TODOS LOS PAGOS REGISTRADOS');
    console.log('=====================================');
    console.log('✅ $10.000 en EFECTIVO agregado a la caja');
    console.log('✅ $10.000 en VIRTUAL agregado a la cuenta');
    console.log('');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ ERROR GENERAL:', error);
    process.exit(1);
  }
}

// Ejecutar
registrarPagosEjemplo();

