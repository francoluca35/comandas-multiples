"use client";
import React, { useState, useEffect } from "react";

const DeliveryDeliveredNotification = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose();
        }, 300);
      }, 10000); // 10 segundos

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  // Extraer información del pedido
  const pedido = notification.pedido || {};
  const cliente = pedido.cliente || "Cliente";
  const direccion = pedido.direccion || "Sin dirección";
  // Obtener número de orden: primero intentar pedido.id, luego notification.id (que es el ID de Firestore del pedido)
  let numeroOrden = pedido.id || notification.id || "N/A";
  // Si es un ID largo de Firestore, mostrar solo los últimos 8 caracteres
  if (numeroOrden && numeroOrden.length > 8) {
    numeroOrden = numeroOrden.substring(numeroOrden.length - 8).toUpperCase();
  }

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
      style={{ maxWidth: "400px", width: "calc(100% - 2rem)" }}
    >
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-2xl p-4 border-l-4 border-green-400">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Icono */}
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-2">Pedido Entregado</h3>
              <div className="space-y-1 text-sm">
                <p className="text-white/95">
                  <strong className="font-semibold">Cliente:</strong> {cliente}
                </p>
                <p className="text-white/90 truncate">
                  <strong className="font-semibold">Dirección:</strong> {direccion}
                </p>
                <p className="text-white/95">
                  <strong className="font-semibold">Orden #:</strong> {typeof numeroOrden === 'string' ? numeroOrden : numeroOrden.toString()}
                </p>
              </div>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(), 300);
            }}
            className="flex-shrink-0 ml-2 text-white/80 hover:text-white transition-colors"
            aria-label="Cerrar notificación"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDeliveredNotification;

