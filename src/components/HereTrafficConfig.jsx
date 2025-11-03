"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const HereTrafficConfig = ({ onSave }) => {
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Cargar API key guardada
    const savedKey = localStorage.getItem("hereApiKey");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = async () => {
    if (!apiKey || apiKey.trim() === "") {
      Swal.fire("Error", "Por favor ingresa tu HERE API Key", "error");
      return;
    }

    setIsSaving(true);
    try {
      // Guardar en localStorage
      localStorage.setItem("hereApiKey", apiKey.trim());
      
      // Probar la API key con una solicitud de prueba
      const testResponse = await fetch(
        `https://data.traffic.hereapi.com/v7/flow?locationReferencing=shape&in=circle:-34.6037,-58.3816;r=1000&apiKey=${apiKey.trim()}`
      );
      
      if (testResponse.ok) {
        Swal.fire("¡Configurado!", "HERE API Key guardada y verificada correctamente", "success");
        if (onSave) {
          onSave(apiKey.trim());
        }
      } else {
        Swal.fire("Error", "La API Key no es válida. Verifica que sea correcta.", "error");
      }
    } catch (error) {
      console.error("Error verificando API key:", error);
      Swal.fire("Error", "No se pudo verificar la API Key. Asegúrate de tener conexión a internet.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenHereDeveloper = () => {
    window.open("https://developer.here.com/sign-up", "_blank");
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Configurar HERE Traffic API</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          HERE API Key
        </label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Ingresa tu HERE API Key"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-2">
          Obtén tu API Key gratuita (250,000 transacciones/mes) en{" "}
          <button
            onClick={handleOpenHereDeveloper}
            className="text-blue-600 hover:underline"
          >
            HERE Developer Portal
          </button>
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Verificando..." : "Guardar y Verificar"}
      </button>
    </div>
  );
};

export default HereTrafficConfig;

