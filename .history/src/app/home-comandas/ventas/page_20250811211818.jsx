"use client";
import React from "react";

export default function VentasPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Página de Ventas</h1>
      <p>Página de ventas funcionando correctamente.</p>
      <div className="mt-4">
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => alert("Funcionalidad de QR en desarrollo")}
        >
          Probar Pago con QR
        </button>
      </div>
    </div>
  );
}
