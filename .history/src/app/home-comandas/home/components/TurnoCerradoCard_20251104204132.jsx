"use client";
import React, { useState, useEffect } from "react";
import { useTurno } from "../../../context/TurnoContext";
import { useHistorialEmpleados } from "../../../../hooks/useHistorialEmpleados";
import { useRole } from "../../../context/RoleContext";

function TurnoCard() {
  const {
    turnoAbierto,
    turnoInfo,
    abrirTurno,
    cerrarTurno,
    obtenerDuracionTurno,
    loading,
  } = useTurno();
  const {
    registrarInicioSesion,
    registrarCierreSesion,
    obtenerHistorial,
    borrarHistorial,
  } = useHistorialEmpleados();
  const { isAdmin } = useRole();

  // Obtener usuario directamente del localStorage para el sistema de restaurantes
  const [usuarioActual, setUsuarioActual] = useState("No identificado");

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    const nombreCompleto = localStorage.getItem("nombreCompleto");

    if (usuario) {
      setUsuarioActual(nombreCompleto || usuario);
    } else {
      setUsuarioActual("No identificado");
    }
  }, []);

  const [duracion, setDuracion] = useState("0 min");

  // Mostrar loading mientras se carga el contexto
  if (loading) {
    return (
      <div className="bg-[#2a2a2a] rounded-xl p-4 sm:p-6 text-white shadow-2xl h-full">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Cargando...</h2>
          <p className="text-gray-300">Verificando estado del turno</p>
        </div>
      </div>
    );
  }

  // Actualizar duración cada minuto cuando el turno esté abierto
  useEffect(() => {
    if (turnoAbierto) {
      setDuracion(obtenerDuracionTurno());
      const interval = setInterval(() => {
        setDuracion(obtenerDuracionTurno());
      }, 60000); // Actualizar cada minuto

      return () => clearInterval(interval);
    }
  }, [turnoAbierto, obtenerDuracionTurno]);

  const handleAbrirTurno = async () => {
    if (abrirTurno()) {
      console.log("Turno abierto exitosamente");
      // Registrar inicio de sesión
      await registrarInicioSesion();
      // Mostrar mensaje de confirmación
      alert(
        "¡Turno abierto exitosamente! Ya puedes usar la aplicación completa."
      );
    } else {
      alert("Error al abrir el turno. Por favor, inténtalo de nuevo.");
    }
  };

  const handleCerrarTurno = async () => {
    if (confirm("¿Estás seguro de que quieres cerrar el turno?")) {
      cerrarTurno();
      // Registrar cierre de sesión
      await registrarCierreSesion();
      console.log("Turno cerrado exitosamente");
    }
  };

  const handleDescargarInforme = async () => {
    try {
      if (
        !confirm(
          "¿Deseas descargar el informe? Los datos se borrarán después de la descarga."
        )
      ) {
        return;
      }

      const historial = await obtenerHistorial();

      if (historial.length === 0) {
        alert("No hay datos para exportar");
        return;
      }

      // Generar colores únicos para cada usuario
      const usuarios = [...new Set(historial.map((h) => h.usuarioId))];
      const colores = [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
        "#FF6384",
        "#C9CBCF",
        "#4BC0C0",
        "#FF6384",
      ];
      const colorMap = {};
      usuarios.forEach((userId, index) => {
        colorMap[userId] = colores[index % colores.length];
      });

      // Crear Excel usando SheetJS (xlsx) con import dinámico
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();

      // Preparar datos para Excel
      console.log('Historial obtenido:', historial); // Para debugging

      const datosExcel = historial.map((registro) => {
        // Convertir el timestamp de Firestore a fecha
        let fecha;
        if (registro.timestamp?.toDate) {
          fecha = registro.timestamp.toDate();
        } else if (registro.timestamp instanceof Date) {
          fecha = registro.timestamp;
        } else if (registro.fecha) {
          fecha = new Date(registro.fecha);
        } else {
          fecha = new Date();
        }

        return {
          Usuario: registro.usuarioNombre || registro.usuarioEmail || "Desconocido",
          Email: registro.usuarioEmail || "",
          Tipo: registro.tipo === "inicio" ? "Inicio de Sesión" : "Cierre de Sesión",
          Fecha: fecha.toLocaleDateString("es-ES"),
          Hora: fecha.toLocaleTimeString("es-ES"),
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(datosExcel);

      // Agregar colores a las filas según el usuario
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      historial.forEach((registro, index) => {
        const rowIndex = index + 2; // +2 porque la fila 1 es el header
        if (rowIndex <= range.e.r + 1) {
          const color = colorMap[registro.usuarioId] || "#FFFFFF";
          // Aplicar color a todas las celdas de la fila
          ["A", "B", "C", "D", "E"].forEach((col) => {
            const cellAddress = XLSX.utils.encode_cell({
              r: rowIndex - 1,
              c: col.charCodeAt(0) - 65,
            });
            if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
            worksheet[cellAddress].s = {
              fill: { fgColor: { rgb: color.replace("#", "") } },
              font: { color: { rgb: "FFFFFF" } },
            };
          });
        }
      });

      // Ajustar ancho de columnas
      worksheet["!cols"] = [
        { wch: 25 }, // Usuario
        { wch: 30 }, // Email
        { wch: 20 }, // Tipo
        { wch: 25 }, // Fecha
        { wch: 15 }, // Hora
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Historial Empleados");

      // Generar nombre del archivo
      const fecha = new Date().toISOString().split("T")[0];
      const nombreArchivo = `Historial_Empleados_${fecha}.xlsx`;

      // Descargar el archivo
      XLSX.writeFile(workbook, nombreArchivo);

      // Borrar los datos después de la exportación exitosa
      await borrarHistorial();
      alert("Informe descargado exitosamente y datos borrados");
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    }
  };

  if (turnoAbierto) {
    // Mostrar turno abierto
    return (
      <div className="bg-[#2a2a2a] rounded-lg p-4 sm:p-6 text-white h-full flex flex-col">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
            <svg
              className="w-4 h-4"
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
          <span className="font-semibold">Turno Abierto</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-green-700 rounded-lg p-3">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-green-300 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-sm">
                {turnoInfo?.usuario || usuarioActual}
              </span>
            </div>
          </div>
          <div className="bg-green-700 rounded-lg p-3">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-green-300 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">
                {turnoInfo?.horaApertura || "Hora"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-green-700 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-300 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">Duración: {duracion}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleCerrarTurno}
            className="flex-1 bg-red-600 hover:bg-red-700 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 mr-2"
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
            Cerrar
          </button>
          {isAdmin && (
            <button
              onClick={handleDescargarInforme}
              className="flex-1 bg-green-700 hover:bg-green-600 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Informe
            </button>
          )}
        </div>
      </div>
    );
  }

  // Mostrar turno cerrado con diseño mejorado
  return (
    <div className="bg-[#2a2a2a] rounded-xl p-4 sm:p-6 text-white shadow-2xl h-full">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Turno Cerrado</h2>
        <p className="text-gray-300">
          Debes abrir un turno para usar la aplicación
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-blue-400 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-300">Usuario actual</p>
              <p className="font-medium">{usuarioActual}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-400 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-300">Hora actual</p>
              <p className="font-medium">
                {new Date().toLocaleString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleAbrirTurno}
          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-lg px-6 py-3 text-lg font-semibold flex items-center justify-center shadow-lg transform transition-all duration-200 hover:scale-105"
        >
          <svg
            className="w-5 h-5 mr-2"
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
          Abrir Turno
        </button>

        <button className="w-full bg-gray-700 hover:bg-gray-600 rounded-lg px-6 py-3 text-lg font-medium flex items-center justify-center transition-colors duration-200">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Ver Informes
        </button>
      </div>
    </div>
  );
}

export default TurnoCard;
