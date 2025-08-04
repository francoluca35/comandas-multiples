import React from "react";
import Sidebar from "./components/Sidebar";

function Home() {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Demo Card */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-6 text-white">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <span className="font-semibold">Demo</span>
            </div>
            <h2 className="text-xl font-bold mb-3">
              Tu tiempo es lo más valioso!
            </h2>
            <p className="text-sm mb-6 opacity-90">
              Sin estrés ni riesgos, sin cablerío ni configuración, sin manuales
              ni complicaciones. Cambió el paradigma: manejá tu negocio con sólo
              dos taps!
            </p>
            <div className="flex space-x-3">
              <button className="flex-1 bg-purple-500 hover:bg-purple-600 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Suscribite
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Visitanos
              </button>
            </div>
          </div>

          {/* Turno Cerrado Card */}
          <div className="bg-gray-800 rounded-lg p-6 text-white">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <span className="font-semibold">Turno Cerrado</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-gray-400 mr-2"
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
                  <span className="text-sm">nadie</span>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-gray-400 mr-2"
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
                  <span className="text-sm">nunca</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="flex-1 bg-teal-600 hover:bg-teal-700 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Abrir
              </button>
              <button className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Informe
              </button>
            </div>
          </div>

          {/* Ventas Card */}
          <div className="bg-gray-800 rounded-lg p-6 text-white">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
              </div>
              <span className="font-semibold">Ventas</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <span className="text-sm">Salón</span>
                  </div>
                  <span className="text-sm font-semibold">$0</span>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <span className="text-sm">Takeaway</span>
                  </div>
                  <span className="text-sm font-semibold">$0</span>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                      />
                    </svg>
                    <span className="text-sm">Delivery</span>
                  </div>
                  <span className="text-sm font-semibold">$0</span>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                    <span className="text-sm">Web</span>
                  </div>
                  <span className="text-sm font-semibold">$0</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Takeaway
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                  />
                </svg>
                Delivery
              </button>
              <button className="bg-white text-gray-800 rounded-lg px-3 py-2 text-sm font-medium border border-gray-300">
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Dinero Card */}
          <div className="bg-gray-800 rounded-lg p-6 text-white">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <span className="font-semibold">Dinero</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="text-sm">Efectivo</span>
                  </div>
                  <span className="text-sm font-semibold">$0</span>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <span className="text-sm">Tarjetas</span>
                  </div>
                  <span className="text-sm font-semibold">$0</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
                Egresar
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Aliviar
              </button>
              <button className="bg-white text-gray-800 rounded-lg px-3 py-2 text-sm font-medium border border-gray-300">
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Stock Card */}
          <div className="bg-gray-800 rounded-lg p-6 text-white">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <span className="font-semibold">Stock</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-red-400 mr-2"
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
                    <span className="text-sm">Sin Stock</span>
                  </div>
                  <span className="text-sm font-semibold">78</span>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-yellow-400 mr-2"
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
                    <span className="text-sm">Stock Bajo</span>
                  </div>
                  <span className="text-sm font-semibold">0</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Destruir
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
                Comprar
              </button>
              <button className="bg-white text-gray-800 rounded-lg px-3 py-2 text-sm font-medium border border-gray-300">
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Dispositivos Card */}
          <div className="bg-gray-800 rounded-lg p-6 text-white">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
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
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="font-semibold">Dispositivos</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-green-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                      />
                    </svg>
                    <span className="text-sm">Conectados</span>
                  </div>
                  <span className="text-sm font-semibold">0</span>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-blue-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="text-sm">Contratados</span>
                  </div>
                  <span className="text-sm font-semibold">0</span>
                </div>
              </div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Mensaje para todos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
