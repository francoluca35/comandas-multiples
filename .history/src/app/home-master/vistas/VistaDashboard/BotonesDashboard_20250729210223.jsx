export default function BotonesDashboard() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <button className="bg-gray-700 hover:bg-red-600 rounded-lg p-4 text-center">
        Generar informe
      </button>
      <button className="bg-gray-700 hover:bg-red-600 rounded-lg p-4 text-center">
        Configurar sistema
      </button>
    </div>
  );
}
