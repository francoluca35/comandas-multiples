"use client";
import TituloSeccion from "./VistaDashboard/TituloSeccion";
import ResumenCards from "./VistaDashboard/ResumenCard";
import GraficosDashboard from "./VistaDashboard/GraficosDashboard";
import BotonesDashboard from "./VistaDashboard/BotonesDashboard";
import CrearResto from "./VistaDashboard/CrearResto";
import { useState } from "react";

export default function VistaDashboard() {
  const [vistaActual, setVistaActual] = useState("inicio");
  return (
    <div className="text-white p-6">
      <TituloSeccion />
      <div className="mt-6 grid gap-6">
        <ResumenCards />
        <CrearResto onChangeVista={setVistaActual} />

        <GraficosDashboard />
      </div>
    </div>
  );
}
