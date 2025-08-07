"use client";
import React from "react";

function TicketPreview({ ticketContent, onClose, onPrint }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Vista Previa del Ticket
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Vista previa del ticket */}
        <div className="border-2 border-gray-300 rounded-lg p-4 mb-4 bg-white">
          <div
            className="mx-auto bg-white"
            style={{ 
              width: "219px",
              fontFamily: "monospace",
              fontSize: "10px",
              lineHeight: "1.2",
              color: "#000000"
            }}
            dangerouslySetInnerHTML={{ __html: ticketContent }}
          />
        </div>

        {/* Debug info */}
        <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
          <div className="font-bold mb-2">Debug Info:</div>
          <div>Contenido HTML generado: {ticketContent ? "✅ Sí" : "❌ No"}</div>
          <div>Longitud del contenido: {ticketContent?.length || 0} caracteres</div>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={onPrint}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Imprimir Ticket
          </button>
        </div>
      </div>
    </div>
  );
}

export default TicketPreview;
