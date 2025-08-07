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
      const restaurantId = getRestaurantId();

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

      if (!response.ok) {
        throw new Error("Error al generar el ticket");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Error al generar el ticket");
      }

      setTicketContent(data.ticketContent);
      return data.ticketContent;
    } catch (err) {
      setError(err.message);
      console.error("Error generando ticket:", err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const printTicket = async (orderData) => {
    try {
      const ticketContent = await generateTicket(orderData);

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

      return true;
    } catch (err) {
      setError(err.message);
      console.error("Error imprimiendo ticket:", err);
      throw err;
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
      setError(err.message);
      console.error("Error descargando ticket:", err);
      throw err;
    }
  };

  return {
    generateTicket,
    printTicket,
    downloadTicket,
    isGenerating,
    error,
  };
};
