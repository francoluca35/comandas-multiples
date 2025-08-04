"use client";
import React from "react";

function TakeawayView({ onBack }) {
  const takeawayOptions = [
    {
      id: "local",
      name: "Takeaway Local",
      icon: "store",
      description: "Pedidos para retirar en el local",
    },
    {
      id: "web",
      name: "Takeaway Web",
      icon: "phone",
      description: "Pedidos desde la web",
    },
    {
      id: "pedidosya",
      name: "Takeaway PedidosYa",
      icon: "cloud",
      description: "Pedidos desde PedidosYa",
    },
  ];

  const getIcon = (iconName) => {
    switch (iconName) {
      case "store":
        return (
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        );
      case "phone":
        return (
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
      case "cloud":
        return (
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {takeawayOptions.map((option) => (
            <div
              key={option.id}
              className="bg-gray-800 rounded-lg p-6 flex items-center justify-between hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="text-white">{getIcon(option.icon)}</div>
                <div>
                  <h3 className="text-white text-lg font-semibold">
                    {option.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{option.description}</p>
                </div>
              </div>
              <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Nuevo</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TakeawayView;
