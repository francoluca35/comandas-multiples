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

      {/* Status Text */}
      <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50 mb-6">
        <div className="flex items-center justify-center">
          <span className="text-slate-400 text-sm">No hay ingresos</span>
        </div>
      </div>

      {/* Primary Action Button */}
      <button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 px-4 rounded-xl mb-4 hover:from-teal-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Ingresar</span>
      </button>

      {/* Secondary Action Buttons - First Row */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <button className="bg-blue-600 text-white font-medium py-2 px-3 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="text-sm">Remito de compra</span>
        </button>
        <button className="bg-blue-600 text-white font-medium py-2 px-3 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span className="text-sm">Recibir transferencia</span>
        </button>
      </div>

      {/* View/Report Buttons - First Row */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <button className="bg-slate-600 text-white font-medium py-2 px-3 rounded-lg hover:bg-slate-700 transition-all duration-300 flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-sm">Ver ingresos por tipo</span>
        </button>
        <button className="bg-slate-600 text-white font-medium py-2 px-3 rounded-lg hover:bg-slate-700 transition-all duration-300 flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="text-sm">Ver ingresos por producto</span>
        </button>
      </div>

      {/* History Button */}
      <button className="w-full bg-slate-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-slate-700 transition-all duration-300 flex items-center justify-center space-x-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Historial de ingresos</span>
      </button>
    </div>
  );
}

export default Ingresos; 