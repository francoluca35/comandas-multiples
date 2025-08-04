"use client";
import React, { useState } from "react";

function PedidoView({ mesa, onBack }) {
  const [activeCategory, setActiveCategory] = useState("adicionales");
  const [orderTotal, setOrderTotal] = useState(0);

  const categories = [
    { id: "adicionales", name: "0 Adicionales", count: 0 },
    { id: "bebidas", name: "1 Bebidas", count: 1 },
    { id: "brunch", name: "2 Brunch", count: 2 },
    { id: "cafeteria", name: "3 Cafeteria", count: 3 },
    { id: "empanadas", name: "4 Empanadas", count: 4 },
    { id: "heladeria", name: "5 Heladeria", count: 5 },
    { id: "pizzeria", name: "6 Pizzeria", count: 6 },
    { id: "platos", name: "7 Platos", count: 7 },
    { id: "promos", name: "8 Promos", count: 8 }
  ];

  const adicionales = [
    { id: "a1", name: "A1 Adicional Crema", price: 150 },
    { id: "a2", name: "A2 Adicional Dulce de Leche", price: 120 },
    { id: "a3", name: "A3 Adicional Huevo", price: 200 },
    { id: "a4", name: "A4 Adicional Leche Vegetal", price: 180 },
    { id: "a5", name: "A5 Adicional Morron", price: 100 },
    { id: "a6", name: "A6 Adicional Muzza", price: 250 },
    { id: "a7", name: "A7 Adicional Nutella", price: 300 },
    { id: "a8", name: "A8 Adicional Shot Cafe", price: 80 }
  ];

  const getIcon = (iconName) => {
    switch (iconName) {
      case "utensils":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case "user":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case "document":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "camera":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case "keyboard":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-white hover:text-gray-300 transition-colors"
        >
          ← Volver a Mesas
        </button>
        <h1 className="text-white text-xl font-bold">
          Mesa {mesa?.numero} - Pedido
        </h1>
        <div></div>
      </div>

      <div className="flex-1 flex">
        {/* Left Side */}
        <div className="w-1/3 p-4 space-y-4">
          {/* Order Info */}
          <div className="space-y-2">
            <div className="bg-gray-700 rounded-lg p-3 flex items-center space-x-3">
              {getIcon("utensils")}
              <span className="text-white font-medium">1</span>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 flex items-center space-x-3">
              {getIcon("user")}
              <span className="text-white font-medium">Cliente</span>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 flex items-center space-x-3">
              {getIcon("document")}
              <span className="text-white font-medium">Nota</span>
            </div>
          </div>

          {/* Order Actions */}
          <div className="space-y-2">
            <button className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-full p-3 flex items-center justify-center transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-white text-2xl font-bold">$ {orderTotal}</div>
            </div>
            <button className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-lg p-4 flex items-center justify-center space-x-2 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Terminar</span>
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 p-4">
          {/* Categories */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                    ? "bg-orange-400 text-gray-900"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-4 gap-4">
            {adicionales.map((item) => (
              <button
                key={item.id}
                onClick={() => setOrderTotal(orderTotal + item.price)}
                className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 text-left transition-colors"
              >
                <div className="text-white font-medium text-sm">{item.id}</div>
                <div className="text-gray-300 text-xs">{item.name}</div>
                <div className="text-teal-400 font-semibold mt-2">$ {item.price}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-gray-800 p-4 flex">
        {/* Order Summary */}
        <div className="flex-1 bg-gray-700 rounded-lg p-4 mr-4">
          <div className="text-gray-400 text-center">Pedido vacío</div>
        </div>

        {/* Input Options */}
        <div className="flex space-x-2">
          <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
            {getIcon("camera")}
          </button>
          <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
            {getIcon("keyboard")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PedidoView; 