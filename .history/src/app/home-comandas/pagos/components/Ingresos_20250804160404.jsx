import React from "react";

function Ingresos() {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-slate-900/50">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Ingresos</h2>
      </div>

      {/* Summary Cards */}
      <div className="space-y-3 mb-6">
        {/* Varios */}
        <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <span className="text-white font-medium">Varios</span>
            </div>
            <span className="text-2xl font-bold text-teal-400">$ 50.006</span>
          </div>
        </div>

        {/* Diferencias */}
        <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white font-medium">Diferencias</span>
            </div>
            <span className="text-2xl font-bold text-amber-400">$ 15.758.005</span>
          </div>
        </div>

        {/* Ventas */}
        <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-white font-medium">Ventas</span>
            </div>
            <span className="text-2xl font-bold text-emerald-400">$ 2.550</span>
          </div>
        </div>
      </div>

      {/* Admin Total */}
      <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-white font-medium">admin</span>
          </div>
          <span className="text-2xl font-bold text-purple-400">$ 15.810.561</span>
        </div>
      </div>

      {/* Primary Action Button */}
      <button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 px-4 rounded-xl mb-4 hover:from-teal-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Ingresar</span>
      </button>

      {/* Secondary Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button className="bg-blue-500 text-white font-medium py-2 px-3 rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span className="text-sm">Recibir transferencia</span>
        </button>
        <button className="bg-blue-500 text-white font-medium py-2 px-3 rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-sm">Cobrar cliente</span>
        </button>
      </div>

      {/* View/Report Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button className="bg-slate-600 text-white font-medium py-2 px-3 rounded-lg hover:bg-slate-700 transition-all duration-300 flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-sm">Ver ingresos por cuenta</span>
        </button>
        <button className="bg-slate-600 text-white font-medium py-2 px-3 rounded-lg hover:bg-slate-700 transition-all duration-300 flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">Historial de ingresos</span>
        </button>
      </div>
    </div>
  );
}

export default Ingresos; 