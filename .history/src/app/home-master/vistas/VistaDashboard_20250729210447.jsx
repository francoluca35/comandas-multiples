import TituloSeccion from "./VistaDashboard/TituloSeccion";
import ResumenCards from "./VistaDashboard/ResumenCard";
import GraficosDashboard from "./VistaDashboard/GraficosDashboard";
import BotonesDashboard from "./VistaDashboard/BotonesDashboard";

export default function VistaDashboard() {
  return (
    <div className="text-white p-6">
      <TituloSeccion />
      <div className="mt-6 grid gap-6">
        <ResumenCards />
        <GraficosDashboard />
      </div>
    </div>
  );
}
