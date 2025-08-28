import { useState } from "react";

export const useTicketSender = () => {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const sendTicketWhatsApp = async (orderData, pdfBlob) => {
    setIsSending(true);
    setError(null);

    try {
      console.log("📱 Enviando ticket por WhatsApp...");

      // Crear un archivo temporal para compartir
      const file = new File([pdfBlob], `ticket_${orderData.mesa || 'takeaway'}_${Date.now()}.pdf`, {
        type: 'application/pdf'
      });

      // Verificar si el navegador soporta la API de Web Share
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Ticket - ${orderData.cliente || 'Cliente'}`,
          text: `Ticket de ${orderData.mesa ? `Mesa ${orderData.mesa}` : 'Takeaway'} - Total: $${orderData.monto?.toLocaleString()}`,
          files: [file]
        });
        console.log("✅ Ticket compartido exitosamente por WhatsApp");
        return true;
      } else {
        // Fallback: abrir WhatsApp Web con mensaje
        const message = encodeURIComponent(
          `Ticket de ${orderData.mesa ? `Mesa ${orderData.mesa}` : 'Takeaway'}\n` +
          `Cliente: ${orderData.cliente || 'Cliente'}\n` +
          `Total: $${orderData.monto?.toLocaleString()}\n` +
          `Fecha: ${new Date().toLocaleString()}\n\n` +
          `Por favor, descarga el PDF adjunto.`
        );
        
        window.open(`https://wa.me/?text=${message}`, '_blank');
        
        // Mostrar instrucciones al usuario
        alert(
          "📱 WhatsApp abierto\n\n" +
          "1. Adjunta el PDF del ticket\n" +
          "2. Envía el mensaje al cliente\n" +
          "3. El PDF se descargará automáticamente"
        );
        
        return true;
      }
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

  const downloadAndSendTicket = async (orderData, sendMethod, emailAddress = null) => {
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
        return await sendTicketWhatsApp(orderData, pdfBlob);
      } else if (sendMethod === 'email') {
        if (!emailAddress) {
          throw new Error("Se requiere dirección de email para envío por email");
        }
        return await sendTicketEmail(orderData, pdfBlob, emailAddress);
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
