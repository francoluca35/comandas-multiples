// Aquí puedes usar Recharts, Chart.js o un placeholder visual
export default function GraficosDashboard() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-gray-800 p-4 rounded-lg h-52">
        <h3 className="text-sm text-center font-semibold mb-2">
          Ventas este mes
        </h3>
        {/* Reemplazar por gráfico real */}
        <div className="h-full bg-blue-500/20 rounded-md" />
      </div>
      <div className="bg-gray-800 p-4 rounded-lg h-64">
        <h3 className="text-sm text-center font-semibold mb-2">
          Crecimiento anual
        </h3>
        {/* Reemplazar por gráfico real */}
        <div className="h-full bg-gray-400/20 rounded-md h-50" />
      </div>
    </div>
  );
}
