"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import VistaDashboard from "../components/VistaDashboard";
import VistaRestaurantes from "../components/VistaRestaurantes";
import VistaPagos from "../components/VistaPagos";
import VistaHistorial from "../components/VistaHistorial";
import VistaActivacion from "../components/VistaActivacion";

export default function DashboardMaster() {
  const { usuario, rol, loading } = useAuth();
  const router = useRouter();
  const [vista, setVista] = useState("inicio");

  useEffect(() => {
    // Solo redirigir si no está cargando y no hay usuario válido
    if (!loading && (!usuario || rol !== "superadmin")) {
      console.log("🔍 DashboardMaster - Redirigiendo a login:", {
        loading,
        hasUsuario: !!usuario,
        rol,
        usuario,
      });
      router.push("/login");
    }
  }, [usuario, rol, loading, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!usuario || rol !== "superadmin") {
    return null;
  }

  const renderVista = () => {
    switch (vista) {
      case "restaurantes":
        return <VistaRestaurantes />;
      case "pagos":
        return <VistaPagos />;
      case "historial":
        return <VistaHistorial />;
      case "activacion":
        return <VistaActivacion />;
      default:
        return <VistaDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar vistaActual={vista} onVistaChange={setVista} />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderVista()}
        </div>
      </main>
    </div>
  );
}
