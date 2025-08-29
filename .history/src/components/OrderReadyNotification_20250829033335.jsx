"use client";
import React, { useState, useEffect } from "react";

const OrderReadyNotification = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose();
        }, 300);
      }, 60000); // 1 minuto = 60000ms

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  // Extraer información del pedido
  const pedido = notification.pedido || {};
  const cliente = pedido.cliente || "Cliente";
  const mesa = pedido.mesa || "";
  const tipo = pedido.tipo || "";
  const productos = pedido.productos || [];
  const totalItems = productos.length;

  // Determinar el tipo de pedido y crear el mensaje
  let tipoPedido = "";
  let mensajeCliente = "";
  
  if (tipo === "takeaway" || mesa === "TAKEAWAY") {
    tipoPedido = "TAKEAWAY";
    mensajeCliente = `${cliente}`;
  } else if (tipo === "delivery" || mesa === "DELIVERY") {
    tipoPedido = "DELIVERY";
    mensajeCliente = `${cliente}`;
  } else {
    tipoPedido = "MESA";
    mensajeCliente = `Mesa ${mesa}`;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] transform transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl border-b-2 border-green-400">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white">
                    🎉 Pedido Listo
                  </h3>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
                
                <div className="mt-1">
                  <p className="text-sm font-semibold text-white">
                    {mensajeCliente} - {tipoPedido}
                  </p>
                  <p className="text-xs text-white/80">
                    {totalItems} {totalItems === 1 ? 'producto' : 'productos'} listo{totalItems === 1 ? '' : 's'} para servir
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-white/70">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </span>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onClose(), 300);
                }}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReadyNotification;
