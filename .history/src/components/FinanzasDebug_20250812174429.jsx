"use client";
import React, { useState, useEffect } from "react";

export default function FinanzasDebug() {
  const [estado, setEstado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restauranteId, setRestauranteId] = useState("");

  // Obtener el restauranteId del localStorage
  useEffect(() => {
    const id = localStorage.getItem("restauranteId");
    if (id) {
      setRestauranteId(id);
      verificarEstado(id);
    }
  }, []);

  const verificarEstado = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/inicializar-finanzas?restauranteId=${id}`);
      const data = await response.json();
      
      if (data.success) {
        setEstado(data.data);
        console.log("📊 Estado de estructuras financieras:", data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Error al verificar el estado");
      console.error("Error verificando estado:", err);
    } finally {
      setLoading(false);
    }
  };

  const inicializarEstructuras = async () => {
    if (!restauranteId) {
      setError("No hay restaurante seleccionado");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/inicializar-finanzas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ restauranteId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log("✅ Estructuras inicializadas:", data.data);
        // Verificar el estado después de inicializar
        await verificarEstado(restauranteId);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Error al inicializar estructuras");
      console.error("Error inicializando:", err);
    } finally {
      setLoading(false);
    }
  };

  const recargarDineroActual = async () => {
    if (!restauranteId) {
      setError("No hay restaurante seleccionado");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dinero-actual?restauranteId=${restauranteId}`);
      const data = await response.json();
      
      if (data.success) {
        console.log("💰 Dinero actual cargado:", data.data);
        // Verificar el estado después de cargar
        await verificarEstado(restauranteId);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Error al cargar dinero actual");
      console.error("Error cargando dinero:", err);
    } finally {
      setLoading(false);
    }
  };

  const probarIngresoEfectivo = async () => {
    if (!restauranteId) {
      setError("No hay restaurante seleccionado");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Simular un ingreso de efectivo de $1000
      const response = await fetch("/api/ingresos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId,
          tipoIngreso: "Venta Mesa",
          motivo: "Prueba de ingreso efectivo - Mesa 1",
          monto: 1000,
          formaIngreso: "Efectivo",
          fecha: new Date().toISOString(),
          opcionPago: "caja",
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log("✅ Ingreso de prueba creado:", data.data);
        // Verificar el estado después del ingreso
        await verificarEstado(restauranteId);
        // Recargar dinero actual
        await recargarDineroActual();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Error al crear ingreso de prueba");
      console.error("Error creando ingreso:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!restauranteId) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <strong>Error:</strong> No hay restaurante seleccionado
      </div>
    );
  }

  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">🔧 Debug Finanzas</h3>
      
      <div className="mb-3">
        <strong>Restaurante ID:</strong> {restauranteId}
      </div>

      {loading && (
        <div className="text-blue-600 mb-3">
          ⏳ Procesando...
        </div>
      )}

      {error && (
        <div className="text-red-600 mb-3">
          ❌ {error}
        </div>
      )}

      {estado && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Estado Actual:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className={estado.tieneCajaRegistradora ? "text-green-600" : "text-red-600"}>
                {estado.tieneCajaRegistradora ? "✅" : "❌"} Caja Registradora
              </span>
            </div>
            <div>
              <span className={estado.tieneDineroVirtual ? "text-green-600" : "text-red-600"}>
                {estado.tieneDineroVirtual ? "✅" : "❌"} Dinero Virtual
              </span>
            </div>
            {estado.efectivoActual !== undefined && (
              <div>
                <span className="text-blue-600">
                  💰 Efectivo: ${estado.efectivoActual}
                </span>
              </div>
            )}
            {estado.virtualActual !== undefined && (
              <div>
                <span className="text-blue-600">
                  💳 Virtual: ${estado.virtualActual}
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-2">
            <span className={estado.estructurasCompletas ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {estado.estructurasCompletas ? "✅ Estructuras Completas" : "❌ Estructuras Incompletas"}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => verificarEstado(restauranteId)}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          🔍 Verificar Estado
        </button>
        
        <button
          onClick={inicializarEstructuras}
          disabled={loading}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          🛠️ Inicializar Estructuras
        </button>
        
        <button
          onClick={recargarDineroActual}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          💰 Recargar Dinero Actual
        </button>
      </div>
    </div>
  );
}
