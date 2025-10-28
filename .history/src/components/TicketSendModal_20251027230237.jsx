"use client";
import React, { useState } from "react";
import { useTicketSender } from "@/hooks/useTicketSender";

function TicketSendModal({ isOpen, onClose, orderData, onSendComplete }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [emailAddress, setEmailAddress] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  
  // Usar datos del cliente si están disponibles
  const clientEmail = orderData?.email || orderData?.datos_cliente?.email || "";
  const clientWhatsapp = orderData?.whatsapp || orderData?.datos_cliente?.whatsapp || "";

  const { downloadAndSendTicket, isSending, error } = useTicketSender();

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    if (method === 'email') {
      setShowEmailInput(true);
      // Pre-llenar con el email del cliente si está disponible
      if (clientEmail) {
        setEmailAddress(clientEmail);
      }
    } else {
      setShowEmailInput(false);
    }
  };

  const handleSendTicket = async () => {
    try {
      if (!selectedMethod) {
        alert("Por favor selecciona un método de envío");
        return;
      }

      // Determinar la dirección de envío
      let sendAddress = "";
      if (selectedMethod === 'email') {
        sendAddress = emailAddress || clientEmail;
        if (!sendAddress.trim()) {
          alert("Por favor ingresa la dirección de email");
          return;
        }
      } else if (selectedMethod === 'whatsapp') {
        sendAddress = clientWhatsapp;
        if (!sendAddress.trim()) {
          alert("No se encontró número de WhatsApp para este cliente");
          return;
        }
      }

      console.log("🚀 Enviando ticket:", {
        method: selectedMethod,
        address: sendAddress,
        clientEmail,
        clientWhatsapp,
        orderData
      });

      await downloadAndSendTicket(orderData, selectedMethod, sendAddress);

      // Notificar éxito
      if (onSendComplete) {
        onSendComplete(selectedMethod, orderData);
      }

      // Cerrar modal
      onClose();
      
      // Mostrar confirmación
      alert(
        `✅ Ticket enviado exitosamente por ${selectedMethod === 'whatsapp' ? 'WhatsApp' : 'Email'}!\n\n` +
        `Cliente: ${orderData?.cliente || 'Cliente'}\n` +
        `Total: $${orderData?.monto?.toLocaleString()}\n` +
        `Método: ${selectedMethod === 'whatsapp' ? 'WhatsApp' : 'Email'}`
      );

    } catch (error) {
      console.error("❌ Error enviando ticket:", error);
      alert(`❌ Error al enviar ticket: ${error.message}`);
    }
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setEmailAddress("");
    setShowEmailInput(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-6 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">Enviar Ticket</h2>
                <p className="text-slate-300 text-sm">Selecciona el método de envío</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Información del Pedido */}
          <div className="bg-slate-700 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-3">Detalles del Pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">
                  {orderData?.mesa ? `Mesa ${orderData.mesa}` : 'Takeaway'}:
                </span>
                <span className="text-white font-medium">
                  {orderData?.cliente || 'Cliente'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Items:</span>
                <span className="text-white font-medium">
                  {orderData?.productos?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Total:</span>
                <span className="text-white font-bold text-lg">
                  ${orderData?.monto?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Métodos de Envío */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Selecciona el método de envío:</h3>
            
            {/* WhatsApp */}
            <button
              onClick={() => handleMethodSelect('whatsapp')}
              className={`w-full rounded-lg p-4 flex items-center justify-between transition-colors ${
                selectedMethod === 'whatsapp'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedMethod === 'whatsapp' ? 'bg-green-500' : 'bg-green-600'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold">WhatsApp</div>
                  <div className="text-sm opacity-90">
                    {clientWhatsapp ? `Enviar a ${clientWhatsapp}` : "Enviar por WhatsApp"}
                  </div>
                </div>
              </div>
              {selectedMethod === 'whatsapp' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* Email */}
            <button
              onClick={() => handleMethodSelect('email')}
              className={`w-full rounded-lg p-4 flex items-center justify-between transition-colors ${
                selectedMethod === 'email'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedMethod === 'email' ? 'bg-blue-500' : 'bg-blue-600'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Email</div>
                  <div className="text-sm opacity-90">
                    {clientEmail ? `Enviar a ${clientEmail}` : "Enviar por email"}
                  </div>
                </div>
              </div>
              {selectedMethod === 'email' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </div>

          {/* Input de Email */}
          {showEmailInput && (
            <div className="mt-6">
              <label className="block text-white font-medium mb-2">
                Dirección de Email del Cliente
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="ejemplo@email.com"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleClose}
              className="flex-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSendTicket}
              disabled={isSending || !selectedMethod || (selectedMethod === 'email' && !emailAddress.trim())}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <span>Enviar Ticket</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketSendModal;
