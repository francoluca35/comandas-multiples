"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SidebarMaster from "../components/SidebarMaster";
import VistaDashboard from "../vistas/VistaDashboard";
import VistaRestaurantes from "../vistas/VistaRestaurantes";
import VistaPagos from "../vistas/VistaPagos";
import VistaHistorial from "../vistas/VistaHistorial";
import VistaActivacion from "../vistas/VistaActivacion";
export default function DashboardMaster() {
  const { usuario, rol, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!usuario || rol !== "superadmin")) {
      router.push("/home-master/login");
    }
  }, [usuario, rol, loading, router]);
  const [vista, setVista] = useState("inicio");

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
        return <VistaDashboard vistaActual={vista} onChangeVista={setVista} />;
    }
  };
  return (
    <div className="flex min-h-screen bg-black">
      <SidebarMaster onChangeVista={setVista} vistaActual={vista} />
      <main className="flex-1 overflow-auto">{renderVista()}</main>
    </div>
  );
}
