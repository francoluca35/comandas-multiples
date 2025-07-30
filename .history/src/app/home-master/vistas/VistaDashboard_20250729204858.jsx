import TituloSeccion from "./TituloSeccion";
import ResumenCards from "./ResumenCards";
import GraficosDashboard from "./GraficosDashboard";
import BotonesDashboard from "./BotonesDashboard";

export default function VistaDashboard() {
  return (
    <div className="text-white p-6">
      <TituloSeccion />
      <div className="mt-6 grid gap-6">
        <ResumenCards />
        <GraficosDashboard />
        <BotonesDashboard />
      </div>
    </div>
  );
}
