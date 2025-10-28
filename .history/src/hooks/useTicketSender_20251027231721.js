import { useState } from "react";

export const useTicketSender = () => {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const sendTicketWhatsApp = async (orderData, pdfBlob, whatsappNumber) => {
    setIsSending(true);
    setError(null);

    try {
      console.log("📱 Enviando ticket por WhatsApp a:", whatsappNumber);

      // Limpiar el número de WhatsApp (remover espacios, guiones, etc.)
      const cleanNumber = whatsappNumber.replace(/[^\d]/g, '');
      
      // Verificar que el número tenga el formato correcto
      let formattedNumber = cleanNumber;
      if (cleanNumber.startsWith('54')) {
        // Ya tiene código de país
        formattedNumber = cleanNumber;
      } else if (cleanNumber.startsWith('9')) {
        // Tiene el 9 pero no el 54
        formattedNumber = '54' + cleanNumber;
      } else if (cleanNumber.length === 10) {
        // Número local, agregar 549
        formattedNumber = '549' + cleanNumber;
      } else {
        throw new Error('Formato de número de WhatsApp inválido');
      }

      // Crear un archivo temporal para compartir
      const file = new File([pdfBlob], `ticket_${orderData.mesa || 'takeaway'}_${orderData.cliente || 'cliente'}_${Date.now()}.pdf`, {
        type: 'application/pdf'
      });

      const message = `¡Hola! 👋\n\n` +
        `Aquí tienes tu ticket de compra:\n\n` +
        `📋 *Detalles del pedido:*\n` +
        `• ${orderData.mesa ? `Mesa: ${orderData.mesa}` : 'Tipo: Takeaway'}\n` +
        `• Cliente: ${orderData.cliente || 'Cliente'}\n` +
        `• Total: $${orderData.monto?.toLocaleString()}\n` +
        `• Fecha: ${new Date().toLocaleString()}\n\n` +
        `¡Gracias por elegirnos! 🙏`;

      // Método optimizado para tablets/notebooks: Descarga automática + WhatsApp Web
      
      // 1. Crear y descargar el PDF automáticamente en segundo plano
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket_${orderData.mesa || 'takeaway'}_${orderData.cliente || 'cliente'}_${Date.now()}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log("📄 PDF descargado automáticamente en segundo plano");

      // 2. Abrir WhatsApp Web inmediatamente (sin esperar)
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
      
      // Para tablets/notebooks, usar window.location para mejor experiencia
      if (window.innerWidth >= 768) {
        // Dispositivos más grandes: abrir en nueva pestaña
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      } else {
        // Móviles: abrir en la misma ventana
        window.location.href = whatsappUrl;
      }
      
      console.log(`✅ WhatsApp Web abierto directamente para ${formattedNumber}`);
      
      // 3. Mostrar notificación más elegante para tablets/notebooks
      const isTabletOrNotebook = window.innerWidth >= 768;
      
      if (isTabletOrNotebook) {
        // Notificación más profesional para tablets/notebooks
        alert(
          "📱 WhatsApp Web abierto\n\n" +
          "✅ El PDF se descargó automáticamente a tu dispositivo\n" +
          "✅ WhatsApp Web se abrió con el chat del cliente\n\n" +
          "📎 Para enviar el PDF:\n" +
          "1. Busca el archivo descargado en tu carpeta de Descargas\n" +
          "2. Arrastra el PDF al chat de WhatsApp Web\n" +
          "3. Envía el mensaje\n\n" +
          `Cliente: ${orderData.cliente || 'Cliente'}\n` +
          `Número: ${formattedNumber}`
        );
      } else {
        // Notificación más simple para móviles
        alert(
          "📱 WhatsApp abierto\n\n" +
          "✅ PDF descargado\n" +
          "✅ Chat del cliente abierto\n\n" +
          "📎 Arrastra el PDF al chat y envía"
        );
      }
      
      return true;
    } catch (err) {
      const errorMessage = err.message || "Error al enviar por WhatsApp";
      setError(errorMessage);
      console.error("❌ Error enviando por WhatsApp:", err);
      throw new Error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const sendTicketEmail = async (orderData, pdfBlob, emailAddress) => {
    setIsSending(true);
    setError(null);

    try {
      console.log("📧 Enviando ticket por email...");

      // Crear el asunto y cuerpo del email
      const subject = encodeURIComponent(
        `Ticket - ${orderData.mesa ? `Mesa ${orderData.mesa}` : 'Takeaway'} - ${orderData.cliente || 'Cliente'}`
      );
      
      const body = encodeURIComponent(
        `Hola,\n\n` +
        `Adjunto el ticket de su pedido:\n\n` +
        `📋 Detalles del pedido:\n` +
        `- ${orderData.mesa ? `Mesa: ${orderData.mesa}` : 'Tipo: Takeaway'}\n` +
        `- Cliente: ${orderData.cliente || 'Cliente'}\n` +
        `- Total: $${orderData.monto?.toLocaleString()}\n` +
        `- Fecha: ${new Date().toLocaleString()}\n\n` +
        `Gracias por su compra.\n\n` +
        `Saludos cordiales,\n` +
        `Equipo del restaurante`
      );

      // Abrir cliente de email predeterminado
      const mailtoLink = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
      window.open(mailtoLink, '_blank');

      // Mostrar instrucciones al usuario
      alert(
        "📧 Cliente de email abierto\n\n" +
        "1. Adjunta el PDF del ticket\n" +
        "2. Revisa el asunto y mensaje\n" +
        "3. Envía el email al cliente\n" +
        "4. El PDF se descargará automáticamente"
      );

      console.log("✅ Email abierto exitosamente");
      return true;
    } catch (err) {
      const errorMessage = err.message || "Error al enviar por email";
      setError(errorMessage);
      console.error("❌ Error enviando por email:", err);
      throw new Error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const downloadAndSendTicket = async (orderData, sendMethod, contactInfo = null) => {
    try {
      console.log("📄 Generando PDF para envío...");

      // Generar el PDF usando el hook existente
      const { generateTicket } = await import('./useTicketGenerator');
      
      // Crear una versión temporal del hook para generar el PDF
      const tempTicketGenerator = {
        generateTicket: async (data) => {
          const response = await fetch("/api/tickets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              restaurantId: localStorage.getItem("restauranteId"),
              orderData: data,
            }),
          });

          if (!response.ok) {
            throw new Error("Error generando ticket");
          }

          const result = await response.json();
          return result.ticketContent;
        }
      };

      const ticketContent = await tempTicketGenerator.generateTicket(orderData);

      // Convertir el contenido HTML a PDF
      const { jsPDF } = await import('jspdf');
      const html2canvas = await import('html2canvas');

      // Crear elemento temporal
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = ticketContent;
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.width = "219px";
      tempDiv.style.backgroundColor = "white";
      tempDiv.style.padding = "10px";
      tempDiv.style.fontFamily = "monospace";
      tempDiv.style.fontSize = "10px";

      document.body.appendChild(tempDiv);

      // Convertir a canvas
      const canvas = await html2canvas.default(tempDiv, {
        width: 219,
        height: tempDiv.scrollHeight,
        scale: 1,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
      });

      document.body.removeChild(tempDiv);

      // Crear PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [58, canvas.height * 0.264583],
      });

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, 58, canvas.height * 0.264583);

      // Convertir PDF a Blob
      const pdfBlob = pdf.output('blob');

      // Enviar según el método seleccionado
      if (sendMethod === 'whatsapp') {
        if (!contactInfo) {
          throw new Error("Se requiere número de WhatsApp para envío por WhatsApp");
        }
        return await sendTicketWhatsApp(orderData, pdfBlob, contactInfo);
      } else if (sendMethod === 'email') {
        if (!contactInfo) {
          throw new Error("Se requiere dirección de email para envío por email");
        }
        return await sendTicketEmail(orderData, pdfBlob, contactInfo);
      } else {
        throw new Error("Método de envío no válido");
      }
    } catch (err) {
      const errorMessage = err.message || "Error al generar y enviar ticket";
      setError(errorMessage);
      console.error("❌ Error en downloadAndSendTicket:", err);
      throw new Error(errorMessage);
    }
  };

  return {
    sendTicketWhatsApp,
    sendTicketEmail,
    downloadAndSendTicket,
    isSending,
    error,
  };
};
