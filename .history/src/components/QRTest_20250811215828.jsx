"use client";
import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

function QRTest() {
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const testQRGeneration = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("🧪 Testing QR generation with simple URL");
      const testURL = "https://www.mercadopago.com.ar";
      
      const qrDataURL = await QRCode.toDataURL(testURL, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      console.log("✅ Test QR generated successfully");
      setQrCode(qrDataURL);
    } catch (err) {
      console.error("❌ Test QR generation failed:", err);
      setError("Error al generar QR de prueba: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Test de Generación QR</h2>
      
      <button
        onClick={testQRGeneration}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Generar QR de Prueba
      </button>

      {isLoading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p>Generando QR...</p>
        </div>
      )}

      {error && (
        <div className="text-red-600 mb-4">
          <p>Error: {error}</p>
        </div>
      )}

      {qrCode && (
        <div className="text-center">
          <img src={qrCode} alt="QR de prueba" className="mx-auto" />
          <p className="mt-2 text-sm text-gray-600">QR generado exitosamente</p>
        </div>
      )}
    </div>
  );
}

export default QRTest;
