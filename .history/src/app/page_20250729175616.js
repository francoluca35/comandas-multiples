import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center space-y-6">
      <h1 className="text-4xl font-bold">Bienvenido a la App</h1>
      <p>Selecciona tu acceso:</p>
      <div className="flex flex-col space-y-2">
        <Link
          href="/home-master/login"
          className="bg-blue-600 p-2 rounded text-center"
        >
          Ingresar como SuperAdmin
        </Link>
        <Link href="/comandas" className="bg-green-600 p-2 rounded text-center">
          Ir a Comandas
        </Link>
        <Link
          href="/home-comandas"
          className="bg-yellow-500 p-2 rounded text-center"
        >
          Home Comandas
        </Link>
      </div>
    </div>
  );
}
