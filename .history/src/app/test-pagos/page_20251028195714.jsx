"use client";
import { useState, useEffect } from "react";

export default function TestPagos() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/pagos-resumen?restauranteId=francomputer");
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        console.log("✅ API optimizada funcionando:", result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
      console.error("❌ Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Test API Optimizada</h1>
        
        <div className="mb-6">
          <button
            onClick={testAPI}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Probando..." : "Probar API"}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-6">
            <h3 className="text-red-400 font-bold mb-2">Error:</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {data && (
          <div className="bg-slate-800/50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Datos Optimizados:</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Dinero Actual</h3>
                <p className="text-white">Efectivo: ${data.dineroActual.efectivo}</p>
                <p className="text-white">Virtual: ${data.dineroActual.virtual}</p>
                <p className="text-white">Cajas: {data.dineroActual.totalCajas}</p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Ventas</h3>
                <p className="text-white">Efectivo: ${data.ventas.efectivo}</p>
                <p className="text-white">Virtual: ${data.ventas.virtual}</p>
                <p className="text-white">Total: ${data.ventas.total}</p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Ingresos</h3>
                <p className="text-white">Total: ${data.ingresos.totalIngresos}</p>
                <p className="text-white">Registros: {data.ingresos.ingresos.length}</p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Egresos</h3>
                <p className="text-white">Total: ${data.egresos.totalEgresos}</p>
                <p className="text-white">Registros: {data.egresos.egresos.length}</p>
              </div>
            </div>

            <div className="mt-6 bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Totales Combinados:</h3>
              <p className="text-white">Efectivo Total: ${data.dineroActual.efectivo + data.ventas.efectivo}</p>
              <p className="text-white">Virtual Total: ${data.dineroActual.virtual + data.ventas.virtual}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
