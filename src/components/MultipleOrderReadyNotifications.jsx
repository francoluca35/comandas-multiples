"use client";
import React, { useState, useEffect } from "react";

const MultipleOrderReadyNotifications = ({ notifications, onClose }) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      setVisibleNotifications(notifications);
    }
  }, [notifications]);

  if (!notifications || notifications.length === 0) return null;

  const handleClose = (notificationId) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (onClose) {
      onClose(notificationId);
    }
  };

  const handleCloseAll = () => {
    setVisibleNotifications([]);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] space-y-2 p-2">
      {/* Header con contador y botón de cerrar todo */}
      {notifications.length > 1 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">{notifications.length}</span>
              </div>
              <span className="font-semibold">Pedidos Listos</span>
            </div>
            <button
              onClick={handleCloseAll}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Lista de notificaciones */}
      <div className="space-y-2">
        {visibleNotifications.map((notification, index) => {
          const pedido = notification.pedido || {};
          const cliente = pedido.cliente || "Cliente";
          const mesa = pedido.mesa || "";
          const tipo = pedido.tipo || "";
          const productos = pedido.productos || [];
          const totalItems = productos.length;

          // Determinar el tipo de pedido y crear el mensaje
          let tipoPedido = "";
          let mensajeCliente = "";
          let bgColor = "";
          let borderColor = "";
          
          if (tipo === "takeaway" || mesa === "TAKEAWAY") {
            tipoPedido = "TAKEAWAY";
            mensajeCliente = `${cliente}`;
            bgColor = "from-orange-500 to-red-600";
            borderColor = "border-orange-400";
          } else if (tipo === "delivery" || mesa === "DELIVERY") {
            tipoPedido = "DELIVERY";
            mensajeCliente = `${cliente}`;
            bgColor = "from-purple-500 to-red-600";
            borderColor = "border-purple-400";
          } else {
            tipoPedido = "MESA";
            mensajeCliente = `Mesa ${mesa}`;
            bgColor = "from-green-500 to-emerald-600";
            borderColor = "border-green-400";
          }

          return (
            <div
              key={notification.id}
              className={`bg-gradient-to-r ${bgColor} text-white shadow-2xl border-b-2 ${borderColor} rounded-lg transform transition-all duration-300 animate-in slide-in-from-top-2`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-4">
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
                        {cliente && cliente !== "Cliente" && (
                          <p className="text-xs text-white/90 mt-1">
                            👤 {cliente}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-white/70">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => handleClose(notification.id)}
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
          );
        })}
      </div>
    </div>
  );
};

export default MultipleOrderReadyNotifications;
