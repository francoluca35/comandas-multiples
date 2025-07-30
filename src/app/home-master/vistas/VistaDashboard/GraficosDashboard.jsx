export default function GraficosDashboard() {
  return (
    <div className="grid md:grid-cols-2 gap-6 p-4">
      {/* Ventas este mes */}
      <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-white text-lg font-semibold text-center mb-4">
          Ventas este mes
        </h3>
        <div className="h-48 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-700/30 flex items-center justify-center text-white">
          {/* Gráfico o Placeholder */}
          <span className="text-sm opacity-70">[gráfico aquí]</span>
        </div>
      </div>

      {/* Crecimiento anual */}
      <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-white text-lg font-semibold text-center mb-4">
          Crecimiento anual
        </h3>
        <div className="h-48 rounded-xl bg-gradient-to-br from-slate-500/30 to-slate-700/30 flex items-center justify-center text-white">
          {/* Gráfico o Placeholder */}
          <span className="text-sm opacity-70">[gráfico aquí]</span>
        </div>
      </div>
    </div>
  );
}
