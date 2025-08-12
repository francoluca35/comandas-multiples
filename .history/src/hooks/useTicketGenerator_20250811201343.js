import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Función para obtener el restaurantId desde localStorage
const getRestaurantId = () => {
  if (typeof window !== "undefined") {
    const restaurantId = localStorage.getItem("restauranteId");
    if (!restaurantId) {
      throw new Error("No se encontró el ID del restaurante");
    }
    return restaurantId;
  }
  return null;
};

export const useTicketGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [ticketContent, setTicketContent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const generateTicket = async (orderData) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Validar que orderData existe y tiene los datos necesarios
      if (!orderData) {
        throw new Error("No se proporcionaron datos del pedido");
      }

      if (!orderData.mesa) {
        throw new Error("No se encontró información de la mesa");
      }

      const restaurantId = getRestaurantId();

      if (!restaurantId) {
        throw new Error("No se pudo obtener el ID del restaurante");
      }

      console.log("Generando ticket para:", { restaurantId, orderData });

      // Llamar a la API para generar el contenido del ticket
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId,
          orderData,
        }),
      });

      console.log("Respuesta de la API:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error en la respuesta de la API:", errorText);
        throw new Error(
          `Error al generar el ticket: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Datos recibidos de la API:", data);

      if (!data.success) {
        throw new Error(data.error || "Error al generar el ticket");
      }

      if (!data.ticketContent) {
        throw new Error("No se recibió contenido del ticket");
      }

      setTicketContent(data.ticketContent);
      return data.ticketContent;
    } catch (err) {
      const errorMessage =
        err.message || "Error desconocido al generar el ticket";
      setError(errorMessage);
      console.error("Error generando ticket:", err);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const printTicket = async (orderData) => {
    try {
      console.log("Iniciando impresión de ticket...");
      const ticketContent = await generateTicket(orderData);

      if (!ticketContent) {
        throw new Error("No se pudo generar el contenido del ticket");
      }

      // Crear un elemento temporal para renderizar el ticket
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = ticketContent;
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "0";
      tempDiv.style.width = "219px"; // Ancho del ticket térmico (58mm)
      tempDiv.style.backgroundColor = "white";
      tempDiv.style.padding = "10px";
      tempDiv.style.fontFamily = "monospace";
      tempDiv.style.fontSize = "10px";
      tempDiv.style.lineHeight = "1.2";

      document.body.appendChild(tempDiv);

      // Convertir a canvas
      const canvas = await html2canvas(tempDiv, {
        width: 219,
        height: tempDiv.scrollHeight,
        scale: 1,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
      });

      // Remover el elemento temporal
      document.body.removeChild(tempDiv);

      // Crear PDF con las dimensiones del ticket térmico
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [58, canvas.height * 0.264583], // 58mm de ancho, altura calculada
      });

      // Agregar la imagen del ticket al PDF
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, 58, canvas.height * 0.264583);

      // Imprimir el PDF
      pdf.autoPrint();
      pdf.output("dataurlnewwindow");

      console.log("Ticket impreso exitosamente");
      return true;
    } catch (err) {
      const errorMessage =
        err.message || "Error desconocido al imprimir el ticket";
      setError(errorMessage);
      console.error("Error imprimiendo ticket:", err);
      throw new Error(errorMessage);
    }
  };

  const downloadTicket = async (orderData) => {
    try {
      const ticketContent = await generateTicket(orderData);

      // Crear un elemento temporal para renderizar el ticket
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = ticketContent;
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "0";
      tempDiv.style.width = "219px";
      tempDiv.style.backgroundColor = "white";
      tempDiv.style.padding = "10px";
      tempDiv.style.fontFamily = "monospace";
      tempDiv.style.fontSize = "10px";
      tempDiv.style.lineHeight = "1.2";

      document.body.appendChild(tempDiv);

      // Convertir a canvas
      const canvas = await html2canvas(tempDiv, {
        width: 219,
        height: tempDiv.scrollHeight,
        scale: 1,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
      });

      // Remover el elemento temporal
      document.body.removeChild(tempDiv);

      // Crear PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [58, canvas.height * 0.264583],
      });

      // Agregar la imagen del ticket al PDF
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, 58, canvas.height * 0.264583);

      // Descargar el PDF
      const fileName = `ticket_mesa_${orderData.mesa}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      pdf.save(fileName);

      return true;
    } catch (err) {
      const errorMessage =
        err.message || "Error desconocido al descargar el ticket";
      setError(errorMessage);
      console.error("Error descargando ticket:", err);
      throw new Error(errorMessage);
    }
  };

  const showTicketPreview = async (orderData) => {
    try {
      await generateTicket(orderData);
      setShowPreview(true);
    } catch (err) {
      const errorMessage =
        err.message || "Error desconocido al generar la vista previa";
      setError(errorMessage);
      console.error("Error generando vista previa:", err);
      throw new Error(errorMessage);
    }
  };

  const hideTicketPreview = () => {
    setShowPreview(false);
    setTicketContent(null);
  };

  return {
    generateTicket,
    printTicket,
    downloadTicket,
    showTicketPreview,
    hideTicketPreview,
    ticketContent,
    showPreview,
    isGenerating,
    error,
  };
};
