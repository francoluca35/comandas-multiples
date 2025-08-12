"use client";
import React, { useState, useEffect } from "react";

const FirestoreIndexWarning = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [indexInfo, setIndexInfo] = useState(null);

  useEffect(() => {
    // Verificar si hay errores de índices en la consola
    const checkForIndexErrors = () => {
      const hasIndexErrors = localStorage.getItem("firestore_index_errors");
      if (hasIndexErrors) {
        setShowWarning(true);
        fetchIndexInfo();
      }
    };

    checkForIndexErrors();

    // Escuchar errores de Firestore
    const originalError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(" ");
      if (errorMessage.includes("requires an index")) {
        localStorage.setItem("firestore_index_errors", "true");
        setShowWarning(true);
        fetchIndexInfo();
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const fetchIndexInfo = async () => {
    try {
      const response = await fetch("/api/firestore-indexes");
      const data = await response.json();
      setIndexInfo(data);
    } catch (error) {
      console.error("Error fetching index info:", error);
    }
  };

  const handleDismiss = () => {
    setShowWarning(false);
    localStorage.removeItem("firestore_index_errors");
  };

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg max-w-md z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Configuración de Base de Datos Requerida
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Se detectaron errores de índices en Firestore. Para un funcionamiento
              óptimo, necesitas crear algunos índices compuestos.
            </p>
            {indexInfo && (
              <div className="mt-3">
                <p className="font-medium">Índices necesarios:</p>
                <ul className="mt-1 space-y-1">
                  {indexInfo.indexes.map((index, i) => (
                    <li key={i} className="text-xs">
                      • {index.description}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 space-y-2">
                  <a
                    href="https://console.firebase.google.com/v1/r/project/comandas-multiples/firestore/indexes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 border border-yellow-400 rounded text-xs font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                  >
                    Ver Índices en Firebase
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="inline-flex text-yellow-400 hover:text-yellow-600"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirestoreIndexWarning;
