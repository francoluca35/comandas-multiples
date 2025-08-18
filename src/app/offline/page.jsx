"use client";
import React, { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Verificar estado inicial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-400 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            ¡Conexión Restaurada!
          </h1>
          <p className="text-slate-400 mb-4">
            Ya puedes volver a usar la aplicación normalmente.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a la Aplicación
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-orange-400 text-6xl mb-4">📶</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Sin Conexión a Internet
        </h1>
        <p className="text-slate-400 mb-6">
          No tienes conexión a internet en este momento. Algunas funciones
          pueden no estar disponibles.
        </p>

        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">
            Funciones Disponibles Offline:
          </h2>
          <ul className="text-slate-300 space-y-2 text-left">
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✅</span>
              Ver mesas y productos (cache)
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✅</span>
              Crear pedidos (se sincronizarán)
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✅</span>
              Ver historial reciente
            </li>
            <li className="flex items-center">
              <span className="text-red-400 mr-2">❌</span>
              Nuevos productos del servidor
            </li>
            <li className="flex items-center">
              <span className="text-red-400 mr-2">❌</span>
              Actualizaciones en tiempo real
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar Conexión
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-600 transition-colors"
          >
            Continuar Offline
          </button>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          <p>
            Los datos se sincronizarán automáticamente cuando vuelvas a tener
            conexión.
          </p>
        </div>
      </div>
    </div>
  );
}
