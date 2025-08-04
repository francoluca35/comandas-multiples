import React from "react";

function DispositivosCard() {
  return (
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
  );
}

export default DispositivosCard;
